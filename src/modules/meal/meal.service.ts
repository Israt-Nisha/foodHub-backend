import { Meal } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth";

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


const getMealById = async (id: string) => {
  return prisma.meal.findUnique({
    where: { id },
    include: {
      provider: true,
      category: true,
      reviews: true,
    },
  });
};


const updateMeal = async (id: string, data: Partial<Meal>, userId: string) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  });
  if (!provider) throw new Error("Provider profile not found");

  const meal = await prisma.meal.findUnique({ where: { id } });
  if (!meal) throw new Error("Meal not found");

  if(meal.providerId !== provider.id) {
    throw new Error("You are not allowed to update this meal");
  }

  return prisma.meal.update({
    where: { id : meal.id },
    data
  });
};


const deleteMeal = async (id: string, userId: string, isAdmin: boolean) => {
 
  let providerId: string | null = null;

  if (!isAdmin) {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId },
    });
    if (!provider) throw new Error("Provider profile not found");
    providerId = provider.id;
  }

  const meal = await prisma.meal.findUnique({ where: { id } });
  if (!meal) throw new Error("Meal not found");

  if (!isAdmin && meal.providerId !== providerId) {
    throw new Error("You are not allowed to delete this meal");
  }

  return prisma.meal.delete({ where: { id } });
};

export const mealService = {
    createMeal,
    getAllMeals,
    getMealById,
    updateMeal,
    deleteMeal,
}