import { Request, Response } from "express";
import { mealService } from "./meal.service";

const createMeal = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized!",
          data: null,
          error: "User not authenticated",
        });

    const meal = await mealService.createMeal(req.body, req.user.id);

    res
      .status(201)
      .json({
        success: true,
        message: "Meal created successfully",
        data: meal,
        error: null,
      });
  } catch (err: any) {
    res
      .status(400)
      .json({
        success: false,
        message: err.message || "Failed to create meal",
        data: null,
        error: err.message || "Unknown error",
      });
  }
};


const getAllMeals = async (req: Request, res: Response) => {
  try {
    const meals = await mealService.getAllMeals(req.user?.id);
    res
      .status(200)
      .json({
        success: true,
        message: "Meals fetched successfully",
        data: meals,
        error: null,
      });
  } catch (err: any) {
    res
      .status(500)
      .json({
        success: false,
        message: err.message || "Failed to fetch meals",
        data: null,
        error: err.message || "Unknown error",
      });
  }
};


export const mealController = {
    createMeal,
    getAllMeals
}