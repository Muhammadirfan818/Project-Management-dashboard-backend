import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware as authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new UserController();

// Public route - no auth required (for password reset flow)
router.post("/check-email", controller.checkEmailExists.bind(controller));

// Protected routes
router.use(authenticate);

router.post("/profile", controller.getProfile.bind(controller));
router.get("/profile", controller.getProfile.bind(controller));
router.patch("/profile", controller.updateProfile);
router.delete("/profile", controller.deleteAccount);
router.get("/", controller.getAllUsers.bind(controller));

export default router;
