import { Router } from "express";
import { TimeTrackingController } from "../controllers/time-tracking.controller";
import { authMiddleware as authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new TimeTrackingController();

router.use(authenticate);

router.post("/", controller.logTime);
router.patch("/:id", controller.updateTimeLog);
router.delete("/:id", controller.deleteTimeLog);
router.get("/task/:taskId", controller.getTaskTimeLogs);
router.get("/user", controller.getUserTimeLogs);

export default router;
