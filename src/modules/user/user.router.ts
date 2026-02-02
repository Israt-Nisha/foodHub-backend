import express from "express";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../../types/user.role";
const router = express.Router();


router.get("/users", auth(UserRole.ADMIN), userController.getAllUsers);

router.patch(
  "/users/:id",
  auth(UserRole.ADMIN),
  userController.updateUserStatus,
);

export const userRouter = router;