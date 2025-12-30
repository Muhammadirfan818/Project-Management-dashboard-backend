import { Request, Response, NextFunction } from "express";
import { ActivityLogService } from "../services/activity-log.service";
import { sendSuccess } from "../utils/response";

const activityLogService = new ActivityLogService();

export class ActivityLogController {
  async getUserActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: userId } = req.user!;
      const activities = await activityLogService.getUserActivity(userId);
      sendSuccess(res, activities);
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const activities = await activityLogService.getRecentActivity();
      sendSuccess(res, activities);
    } catch (error) {
      next(error);
    }
  }
}
