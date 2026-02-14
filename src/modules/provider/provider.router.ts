import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { providerController } from "./provider.controller";

const router = express.Router();

router.get("/", providerController.getAllProviders);


router.get("/stats",auth(UserRole.PROVIDER), providerController.getProviderStats);



router.get("/:id", providerController.getProviderById);

router.post(
  "/profile",
  auth(UserRole.PROVIDER),
  providerController.createProviderProfile,
);

router.patch(
  "/:id",
  auth(UserRole.PROVIDER),
  providerController.updateProviderProfile,
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.PROVIDER),
  providerController.deleteProviderProfile,
);

export const providerRouter = router;