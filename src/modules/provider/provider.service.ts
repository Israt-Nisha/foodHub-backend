import { OrderStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllProviders = async () => {
  return prisma.providerProfile.findMany({
    include: {
      meals: true,
    },
  });
};

const getProviderById = async (id: string) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { id },
    include: {
      meals: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!provider) {
    const error = new Error("Provider not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return provider;
};

const createProviderProfile = async (
  userId: string,
  payload: {
    restaurantName: string;
    address: string;
    phone: string;
    logo?: string;
  },
) => {
  const exists = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (exists) {
    const error = new Error("Provider profile already exists");
    (error as any).statusCode = 409;
    throw error;
  }

  return prisma.providerProfile.create({
    data: {
      ...payload,
      userId,
    },
  });
};

const updateProviderProfile = async (
  providerId: string,
  userId: string,
  payload: {
    restaurantName?: string;
    address?: string;
    phone?: string;
    logo?: string;
  },
) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    const error = new Error("Provider profile not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (provider.userId !== userId) {
    const error = new Error("You are not allowed to update this profile");
    (error as any).statusCode = 403;
    throw error;
  }

  return prisma.providerProfile.update({
    where: { id: providerId },
    data: payload,
  });
};

const deleteProviderProfile = async (providerId: string, userId: string, isAdmin: boolean) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    const error = new Error("Provider profile not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (!isAdmin && (provider.userId !== userId)) {
    const error = new Error("You are not allowed to delete this profile");
    (error as any).statusCode = 403;
    throw error;
  }

  await prisma.meal.deleteMany({
    where: { providerId },
  });

  await prisma.providerProfile.delete({
    where: { id: providerId },
  });
};



const getProviderStats = async (userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const providerProfile = await tx.providerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        restaurantName: true,
        logo: true,
        userId: true,
      },
    });

    if (!providerProfile) {
      throw new Error("Provider profile not found");
    }

    const user = await tx.user.findUnique({
      where: { id: providerProfile.userId },
      select: { name: true },
    });

    const providerId = providerProfile.id;

    const [
      totalMeals,
      totalCategoriesUsed,
      totalOrders,

      placedOrders,
      preparingOrders,
      readyOrders,
      deliveredOrders,
      cancelledOrders,

      revenueResult,
    ] = await Promise.all([
      
      tx.meal.count({ where: { providerId } }),

      tx.meal
        .findMany({
          where: { providerId },
          distinct: ["categoryId"],
          select: { categoryId: true },
        })
        .then((res) => res.length),

      tx.order.count({ where: { providerId } }),

      tx.order.count({ where: { providerId, status: OrderStatus.PLACED } }),
      tx.order.count({ where: { providerId, status: OrderStatus.PREPARING } }),
      tx.order.count({ where: { providerId, status: OrderStatus.READY } }),
      tx.order.count({ where: { providerId, status: OrderStatus.DELIVERED } }),
      tx.order.count({ where: { providerId, status: OrderStatus.CANCELLED } }),

     
      tx.order.aggregate({
        where: { providerId, status: OrderStatus.DELIVERED },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      providerName: user?.name || "Provider",
      restaurantName: providerProfile.restaurantName,
      logo: providerProfile.logo || null,

      totalMeals,
      totalCategoriesUsed,
      totalOrders,

      placedOrders,
      preparingOrders,
      readyOrders,
      deliveredOrders,
      cancelledOrders,

      totalRevenue: revenueResult._sum.totalAmount || 0,
    };
  });
};



export const providerService = {
  getAllProviders,
  getProviderById,
  createProviderProfile,
  updateProviderProfile,
  deleteProviderProfile,
  getProviderStats,
};