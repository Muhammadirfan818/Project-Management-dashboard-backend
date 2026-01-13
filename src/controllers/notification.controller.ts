import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../utils/response";

const notificationService = new NotificationService();
const userService = new UserService();

export class NotificationController {
  async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      const notifications = await notificationService.getUserNotifications(
        user.id,
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
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      await notificationService.markAllAsRead(user.id);
      sendSuccess(res, null, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  }
}
