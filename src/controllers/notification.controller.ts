import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";
import { sendSuccess } from "../utils/response";

const notificationService = new NotificationService();

export class NotificationController {
  async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: userId } = req.user!;
      const notifications = await notificationService.getUserNotifications(
        userId
      );
      sendSuccess(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notification = await notificationService.markAsRead(id);
      sendSuccess(res, notification);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: userId } = req.user!;
      await notificationService.markAllAsRead(userId);
      sendSuccess(res, null, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  }
}
