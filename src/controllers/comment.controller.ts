import { Request, Response, NextFunction } from "express";
import { CommentService } from "../services/comment.service";
import { sendSuccess } from "../utils/response";

const commentService = new CommentService();

export class CommentController {
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: userId } = req.user!;
      const comment = await commentService.createComment({
        ...req.body,
        authorId: userId,
      });
      sendSuccess(res, comment, "Comment created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getTaskComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const comments = await commentService.getTaskComments(taskId);
      sendSuccess(res, comments);
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const { sub: userId } = req.user!;
      const comment = await commentService.updateComment(id, content, userId);
      sendSuccess(res, comment, "Comment updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { sub: userId } = req.user!;
      await commentService.deleteComment(id, userId);
      sendSuccess(res, null, "Comment deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
