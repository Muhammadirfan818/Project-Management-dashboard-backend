import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const projectController = new ProjectController();

router.get("/", authMiddleware, projectController.getProjects);
router.post("/", authMiddleware, projectController.createProject);
router.get("/:id", authMiddleware, projectController.getProject);
router.get(
  "/:id/attachments",
  authMiddleware,
  projectController.getAttachments,
);
router.patch("/:id", authMiddleware, projectController.updateProject);
router.delete("/:id", authMiddleware, projectController.deleteProject);

export default router;
