import express, {Router} from "express";
import { mealController } from "./meal.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.get("/", mealController.getAllMeals);

router.post("/", auth(UserRole.PROVIDER), mealController.createMeal);

export const mealRouter: Router = router;
