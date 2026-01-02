import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const taskController = new TaskController();

router.get("/", authMiddleware, taskController.getTasks);
router.post("/", authMiddleware, taskController.createTask);
router.get("/:id", authMiddleware, taskController.getTask);
router.patch("/:id", authMiddleware, taskController.updateTask);
router.patch("/:id/status", authMiddleware, taskController.updateStatus);
router.delete("/:id", authMiddleware, taskController.deleteTask);

router.post("/:id/subtasks", authMiddleware, taskController.addSubtask);
router.delete(
  "/:id/subtasks/:subtaskId",
  authMiddleware,
  taskController.deleteSubtask,
);
router.patch(
  "/:id/subtasks/:subtaskId/assign",
  authMiddleware,
  taskController.assignSubtask,
);
router.patch(
  "/:id/subtasks/:subtaskId/toggle",
  authMiddleware,
  taskController.toggleSubtaskCompleted,
);

export default router;
