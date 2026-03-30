import { OrderStatus, PaymentMethod, PaymentStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../types/user.role";


import Stripe from "stripe";
import { stripe } from "../../config/stripe.config";



interface OrderItemPayload {
  mealId: string; // ✅ Required
  quantity: number;
  price: number;
}

interface CreateOrderPayload {
  providerId: string;
  address: string;
  totalAmount: number;
  items: OrderItemPayload[];
  paymentMethod: "COD" | "ONLINE";
}

const createOrder = async (payload: CreateOrderPayload, userId: string) => {
  // 1️⃣ Validate provider
  const provider = await prisma.providerProfile.findUnique({
    where: { id: payload.providerId },
  });
  if (!provider) throw new Error("Provider not found");

  // 2️⃣ CASH ON DELIVERY Flow
  if (payload.paymentMethod === "COD") {
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          customerId: userId,
          providerId: payload.providerId,
          address: payload.address,
          totalAmount: payload.totalAmount,
          paymentMethod: PaymentMethod.COD,
          paymentStatus: PaymentStatus.PENDING,
          items: {
            create: payload.items.map((item) => ({
              quantity: item.quantity,
              price: item.price,
              meal: { connect: { id: item.mealId } }, // ✅ Connect existing meal
            })),
          },
        },
        include: { items: true },
      });

      // Create Payment entry
      await tx.payment.create({
        data: {
          orderId: createdOrder.id,
          amount: payload.totalAmount,
          method: PaymentMethod.COD,
          status: PaymentStatus.PENDING,
        },
      });

      return createdOrder;
    });

    return {
      type: "COD",
      order,
    };
  }

  // 3️⃣ ONLINE Payment (Stripe) Flow
  if (payload.paymentMethod === "ONLINE") {
    const payment = await prisma.payment.create({
      data: {
        amount: payload.totalAmount,
        method: PaymentMethod.ONLINE,
        status: PaymentStatus.PENDING,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: payload.items.map((item) => ({
        price_data: {
          currency: "bdt",
          product_data: { name: `Meal ${item.mealId}` }, // you can customize
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.APP_URL}/success?paymentId=${payment.id}`,
      cancel_url: `${process.env.APP_URL}/cancel?paymentId=${payment.id}`,
      metadata: {
        paymentId: payment.id,
        customerId: userId,
        providerId: payload.providerId,
        address: payload.address, // 🔥 ADD THIS
        items: JSON.stringify(payload.items),
      }
    });

    return {
      type: "ONLINE",
      paymentId: payment.id,
      clientSecret: session.payment_intent,
      checkoutUrl: session.url,
    };
  }

  throw new Error("Invalid payment method");
};


const getAllOrders = async (user: any) => {
  const where: any = {};
  if (user.role === "CUSTOMER") where.customerId = user.id;

  if (user.role === "PROVIDER") {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!providerProfile) {
      throw new Error("Provider profile not found");
    }
    where.providerId = providerProfile.id;
  }

  return prisma.order.findMany({
    where,
    include: {
      items: { include: { meal: true } },
      provider: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getOrderById = async (id: string, user: any) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { meal: true } } },
  });
  if (!order) return null;

  if (user.role === "PROVIDER") {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!providerProfile || order.providerId !== providerProfile.id) {
      throw new Error("Not authorized");
    }
  }

  return order;
};

const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
  user: any,
) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error("Order not found");

  if (user.role === UserRole.PROVIDER) {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!providerProfile || order.providerId !== providerProfile.id) {
      throw new Error("Not authorized");
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PLACED: ["PREPARING"],
      PREPARING: ["READY"],
      READY: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new Error(
        `Invalid status transition from ${order.status} to ${status}`,
      );
    }
  }

  if (user.role === UserRole.CUSTOMER) {
    if (order.customerId !== user.id) {
      throw new Error("Not authorized");
    }

    if (!(order.status === "PLACED" && status === "CANCELLED")) {
      throw new Error("Customer can only cancel a placed order");
    }
  }

  return prisma.order.update({
    where: { id },
    data: { status },
  });
};

const deleteOrder = async (id: string, user: any) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error("Order not found");

  if (user.role === "CUSTOMER" && order.customerId !== user.id)
    throw new Error("Not authorized");

  return prisma.order.delete({ where: { id } });
};

export const orderService = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};