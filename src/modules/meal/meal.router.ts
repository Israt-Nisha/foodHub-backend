import express, {Router} from "express";
import { MealController } from "./meal.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.post("/", auth(UserRole.PROVIDER), MealController.createMeal);

export const mealRouter: Router = router;
