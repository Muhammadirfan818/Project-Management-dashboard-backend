import { Router } from "express";
import { CustomFieldController } from "../controllers/customField.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const controller = new CustomFieldController();

// All routes require authentication
router.use(authMiddleware);

// Custom field CRUD
router.post("/", controller.createField);
router.get("/project/:projectId", controller.getProjectFields);
router.put("/:id", controller.updateField);
router.delete("/:id", controller.deleteField);

// Custom field values for tasks
router.put("/:fieldId/task/:taskId", controller.setFieldValue);
router.get("/task/:taskId", controller.getTaskFieldValues);
router.delete("/:fieldId/task/:taskId", controller.clearFieldValue);

export default router;
