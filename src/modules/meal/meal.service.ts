import { CuisineType, DietaryType, Meal } from "../../../prisma/generated/prisma/client";
import { FloatFilter, MealWhereInput } from "../../../prisma/generated/prisma/models";
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


const getAllMeals = async ({
  search,
  cuisine,
  dietary,
  minPrice,
  maxPrice,
  isAvailable,
  providerId,
  page,
  limit,
  sortBy,
  sortOrder,
}: {
  search: string | undefined;
  cuisine: CuisineType | undefined;
  dietary: DietaryType | undefined;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  isAvailable: boolean | undefined;
  providerId: string | undefined;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) => {
  const andConditions: MealWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (cuisine) {
    andConditions.push({
      cuisine,
    });
  }

  if (dietary) {
    andConditions.push({
      dietary,
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    andConditions.push({
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    });
  }

  if (typeof isAvailable === "boolean") {
    andConditions.push({
      isAvailable,
    });
  }


  if (providerId) {
    andConditions.push({
      providerId,
    });
  }
  const skip = (page - 1) * limit;
  const allMeals = await prisma.meal.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      provider: true,
      category: true,
      reviews: true,
    },
  });

  const total = await prisma.meal.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: allMeals,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
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

  if (meal.providerId !== provider.id) {
    throw new Error("You are not allowed to update this meal");
  }

  return prisma.meal.update({
    where: { id: meal.id },
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