import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authMiddleware as authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new NotificationController();

router.use(authenticate);

router.get("/", controller.getUserNotifications);
router.patch("/:id/read", controller.markAsRead);
router.patch("/read-all", controller.markAllAsRead);

export default router;
