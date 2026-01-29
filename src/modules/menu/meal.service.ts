import { Meal, Prisma } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createMeal = async (data: Prisma.MealCreateInput) => {
    const result = await prisma.meal.create({
        data
    })
    return result;
}


export const mealService = {
    createMeal
}