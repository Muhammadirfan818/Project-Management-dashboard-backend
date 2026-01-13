import { Router } from "express";
import { CommentController } from "../controllers/comment.controller";
import { authMiddleware as authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new CommentController();

router.use(authenticate);

router.post("/", controller.createComment);
router.get("/task/:taskId", controller.getTaskComments);
router.patch("/:id", controller.updateComment);
router.delete("/:id", controller.deleteComment);

export default router;
