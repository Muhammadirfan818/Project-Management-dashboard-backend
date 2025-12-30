import { Request, Response, NextFunction } from "express";
import { TimeTrackingService } from "../services/time-tracking.service";
import { sendSuccess } from "../utils/response";

const timeTrackingService = new TimeTrackingService();

export class TimeTrackingController {
  async logTime(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: userId } = req.user!;
      const entry = await timeTrackingService.logTime({
        ...req.body,
        userId,
        date: new Date(req.body.date || Date.now()),
      });
      sendSuccess(res, entry, "Time logged successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getTaskTimeLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const logs = await timeTrackingService.getTaskTimeLogs(taskId);
      sendSuccess(res, logs);
    } catch (error) {
      next(error);
    }
  }

  async getUserTimeLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: userId } = req.user!;
      const logs = await timeTrackingService.getUserTimeLogs(userId);
      sendSuccess(res, logs);
    } catch (error) {
      next(error);
    }
  }

  async updateTimeLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const entry = await timeTrackingService.updateTimeLog(id, req.body);
      sendSuccess(res, entry, "Time log updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteTimeLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await timeTrackingService.deleteTimeLog(id);
      sendSuccess(res, null, "Time log deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
