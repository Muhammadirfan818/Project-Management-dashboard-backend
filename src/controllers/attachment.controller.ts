import { Request, Response, NextFunction } from "express";
import { AttachmentService } from "../services/attachment.service";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../utils/response";

const attachmentService = new AttachmentService();
const userService = new UserService();

export class AttachmentController {
  async createAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId, name, url, size, mimeType } = req.body;
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);

      const attachment = await attachmentService.createAttachment({
        filename: name,
        url: url,
        size: size,
        mimeType: mimeType,
        taskId,
        userId: user.id,
      });
      sendSuccess(res, attachment, "Attachment added successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async deleteAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await attachmentService.deleteAttachment(id);
      sendSuccess(res, null, "Attachment deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getTaskAttachments(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const attachments = await attachmentService.getTaskAttachments(taskId);
      sendSuccess(res, attachments);
    } catch (error) {
      next(error);
    }
  }
}
