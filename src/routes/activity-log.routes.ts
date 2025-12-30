import { Router } from "express";
import { ActivityLogController } from "../controllers/activity-log.controller";
import { authMiddleware as authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new ActivityLogController();

router.use(authenticate);

router.get("/user", controller.getUserActivity);
router.get("/recent", controller.getRecentActivity);

export default router;
