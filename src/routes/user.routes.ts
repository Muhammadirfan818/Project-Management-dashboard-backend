import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware as authenticate } from "../middlewares/auth.middleware";
import {
  authLimiter,
  strictLimiter,
} from "../middlewares/rateLimiter.middleware";

const router = Router();
const controller = new UserController();

router.post(
  "/check-email",
  authLimiter,
  controller.checkEmailExists.bind(controller),
);

router.use(authenticate);

router.post("/profile", controller.getProfile.bind(controller));
router.get("/profile", controller.getProfile.bind(controller));
router.patch("/profile", controller.updateProfile);
router.delete("/profile", strictLimiter, controller.deleteAccount);
router.get("/", controller.getAllUsers.bind(controller));

export default router;
