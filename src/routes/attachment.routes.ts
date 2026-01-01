import { Router } from "express";
import { AttachmentController } from "../controllers/attachment.controller";
import { authMiddleware as authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new AttachmentController();

router.use(authenticate);

router.post("/", controller.createAttachment);
router.delete("/:id", controller.deleteAttachment);
router.get("/task/:taskId", controller.getTaskAttachments);

export default router;
