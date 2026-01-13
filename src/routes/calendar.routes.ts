import { Router } from "express";
import { CalendarController } from "../controllers/calendar.controller";
import { authMiddleware as authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new CalendarController();

router.use(authenticate);

router.post("/", controller.createEvent);
router.get("/", controller.getAllEvents);
router.get("/project/:projectId", controller.getProjectEvents);
router.get("/project/:projectId/range", controller.getEventsByDateRange);
router.get("/project/:projectId/today", controller.getTodayEvents);
router.get("/:id", controller.getEvent);
router.patch("/:id", controller.updateEvent);
router.delete("/:id", controller.deleteEvent);

export default router;
