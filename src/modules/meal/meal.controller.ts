import { Request, Response } from "express";
import { mealService } from "./meal.service";
import { UserRole } from "../../middlewares/auth";
import paginationSortingHelper from "../../helper/paginationSortingHelper";
import { CuisineType, DietaryType } from "../../../prisma/generated/prisma/enums";

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
    
    const { search } = req.query;
    const searchString =
      typeof search === "string" ? search : undefined;

    const cuisine = req.query.cuisine as CuisineType | undefined;

   
    const dietary = req.query.dietary as DietaryType | undefined;

 
    const minPrice = req.query.minPrice
      ? Number(req.query.minPrice)
      : undefined;

    const maxPrice = req.query.maxPrice
      ? Number(req.query.maxPrice)
      : undefined;

    const isAvailable = req.query.isAvailable
      ? req.query.isAvailable === "true"
        ? true
        : req.query.isAvailable === "false"
          ? false
          : undefined
      : undefined;


    const providerId = req.query.providerId as string | undefined;

    
    const { page, limit, skip, sortBy, sortOrder } =
      paginationSortingHelper(req.query);

    const result = await mealService.getAllMeals({
      search: searchString,
      cuisine,
      dietary,
      minPrice,
      maxPrice,
      isAvailable,
      providerId,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      error: "All meals getting failed",
      details: e,
    });
  }
};



const getMealById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({
          success: false,
          message: "Meal id is required",
          data: null,
          error: "Missing id",
        });

    const meal = await mealService.getMealById(id as string);
    if (!meal)
      return res
        .status(404)
        .json({
          success: false,
          message: "Meal not found",
          data: null,
          error: "Meal not found",
        });

    res
      .status(200)
      .json({
        success: true,
        message: "Meal fetched successfully",
        data: meal,
        error: null,
      });
  } catch (err: any) {
    res
      .status(500)
      .json({
        success: false,
        message: err.message || "Failed to fetch meal",
        data: null,
        error: err.message || "Unknown error",
      });
  }
};

const updateMeal = async (req: Request, res: Response) => {
  try {
    const user = req.user
    if (!user)
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized!",
          data: null,
          error: "User not authenticated",
        });

    const { id } = req.params;
    const userId = user.id;
    const updatedMeal = await mealService.updateMeal(
      id as string,
      req.body,
      userId,
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Meal updated successfully",
        data: updatedMeal,
        error: null,
      });
  } catch (err: any) {
    res
      .status(400)
      .json({
        success: false,
        message: err.message || "Failed to update meal",
        data: null,
        error: err.message || "Unknown error",
      });
  }
};

const deleteMeal = async (req: Request, res: Response) => {
  try {
    const user = req.user
    if (!user)
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized!",
          data: null,
          error: "User not authenticated",
        });

    const { id } = req.params;
    const userId = user.id;
    const isAdmin = user.role === UserRole.ADMIN
    await mealService.deleteMeal(id as string, userId, isAdmin);

    res
      .status(200)
      .json({
        success: true,
        message: "Meal deleted successfully",
        data: null,
        error: null,
      });
  } catch (err: any) {
    res
      .status(400)
      .json({
        success: false,
        message: err.message || "Failed to delete meal",
        data: null,
        error: err.message || "Unknown error",
      });
  }
};

export const mealController = {
  createMeal,
  getAllMeals,
  getMealById,
  updateMeal,
  deleteMeal,
}