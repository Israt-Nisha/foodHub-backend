import express from "express";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../../types/user.role";
const router = express.Router();


router.get("/users", auth(UserRole.ADMIN), userController.getAllUsers);


router.get("/stats", auth(UserRole.ADMIN), userController.getStats);



router.get(
  "/users/:id",  userController.getUserById
)

router.patch(
  "/users/:id/status",
  auth(UserRole.ADMIN),
  userController.updateUserStatus,
);

router.patch(
  "/users/:id",
  auth(UserRole.ADMIN, UserRole.PROVIDER, UserRole.CUSTOMER),
  userController.updateUser,
);

router.delete(
  "/users/:id",
  auth(UserRole.ADMIN),
  userController.deleteUser)

export const userRouter = router;