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


export const mealService = {
    createMeal
}