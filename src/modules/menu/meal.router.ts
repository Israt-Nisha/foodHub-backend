import express, {Router} from "express";
import { MealController } from "./meal.controller";

const router = express.Router();

router.post(
    "/", 
    MealController.createMeal
)

export const mealRouter: Router = router;
