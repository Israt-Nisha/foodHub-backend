import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentMethod, PaymentStatus } from "../../../prisma/generated/prisma/enums";

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
    // 🔐 Prevent duplicate processing
    const existingPayment = await prisma.payment.findFirst({
        where: {
            stripeEventId: event.id,
        },
    });

    if (existingPayment) {
        console.log(`Event ${event.id} already processed. Skipping`);
        return { message: `Event ${event.id} already processed. Skipping` };
    }

    switch (event.type) {
        // ✅ SUCCESS PAYMENT
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;

            const paymentId = session.metadata?.paymentId;
            const customerId = session.metadata?.customerId;
            const providerId = session.metadata?.providerId;
            const address = session.metadata?.address;
            const items = JSON.parse(session.metadata?.items || "[]");

            if (!paymentId || !customerId || !providerId || !address || !items) {
                console.error("Missing metadata");
                return { message: "Missing metadata" };
            }

            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
            });

            if (!payment) {
                console.error(`Payment not found: ${paymentId}`);
                return { message: `Payment not found` };
            }

            // 🔥 prevent duplicate success handling
            if (payment.status === "PAID") {
                return { message: "Already processed" };
            }

            await prisma.$transaction(async (tx) => {
                // 🔥 CREATE ORDER AFTER PAYMENT SUCCESS
                const order = await tx.order.create({
                    data: {
                        customerId,
                        providerId,
                        address,
                        totalAmount: payment.amount,
                        paymentMethod: PaymentMethod.ONLINE,
                        paymentStatus: PaymentStatus.PAID,

                        items: {
                            create: items.map((item: any) => ({
                                quantity: item.quantity,
                                price: item.price,
                                meal: {
                                    connect: { id: item.mealId },
                                },
                            })),
                        },
                    },
                });

                // 🔥 UPDATE PAYMENT
                await tx.payment.update({
                    where: { id: paymentId },
                    data: {
                        orderId: order.id,
                        status: PaymentStatus.PAID,
                        stripeEventId: event.id,
                        paymentGatewayData: session as any,
                    },
                });
            });

            console.log(`Payment success → Order created for payment ${paymentId}`);
            break;
        }

        // ❌ EXPIRED SESSION
        case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;

            const paymentId = session.metadata?.paymentId;

            if (paymentId) {
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: "FAILED",
                        stripeEventId: event.id,
                    },
                });
            }

            console.log(`Checkout expired → Payment failed`);
            break;
        }

        // ❌ PAYMENT FAILED
        case "payment_intent.payment_failed": {
            const intent = event.data.object as Stripe.PaymentIntent;

            const payment = await prisma.payment.findFirst({
                where: {
                    transactionId: intent.id,
                },
            });

            if (payment) {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: "FAILED",
                        stripeEventId: event.id,
                    },
                });
            }

            console.log(`Payment failed → updated DB`);
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return { message: `Webhook Event ${event.id} processed successfully` };
};

export const PaymentService = {
    handlerStripeWebhookEvent,
};