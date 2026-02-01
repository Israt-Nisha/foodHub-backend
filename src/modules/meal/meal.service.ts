import { prisma } from "../../lib/prisma";

const createMeal = async (payload: any, userId: string) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  });
  if (!provider) throw new Error("Provider profile not found");

  return prisma.meal.create({
    data: {
      ...payload,
      providerId: provider.id,
      userId,
    },
  });
};


const getAllMeals = async (userId?: string) => {
  const whereClause = userId ? { userId } : {};

  return prisma.meal.findMany({
    where: whereClause,
    include: {
      provider: true,
      category: true,
      reviews: true,
    },
  });
};


export const mealService = {
    createMeal,
    getAllMeals,
}