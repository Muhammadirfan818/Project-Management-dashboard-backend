import { Request, Response, NextFunction } from "express";
import { CalendarService } from "../services/calendar.service";
import { sendSuccess } from "../utils/response";

const calendarService = new CalendarService();

export class CalendarController {
  async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await calendarService.createEvent(req.body);
      sendSuccess(res, event, "Event created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getProjectEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const events = await calendarService.getProjectEvents(projectId);
      sendSuccess(res, events);
    } catch (error) {
      next(error);
    }
  }

  // Get events by date range for calendar view
  async getEventsByDateRange(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({
            message: "startDate and endDate query parameters are required",
          });
      }

      const events = await calendarService.getEventsByDateRange(
        projectId,
        startDate as string,
        endDate as string
      );
      sendSuccess(res, events);
    } catch (error) {
      next(error);
    }
  }

  // Get today's events for timeline
  async getTodayEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const events = await calendarService.getTodayEvents(projectId);
      sendSuccess(res, events);
    } catch (error) {
      next(error);
    }
  }

  // Get a single event by ID
  async getEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const event = await calendarService.getEventById(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      sendSuccess(res, event);
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const event = await calendarService.updateEvent(id, req.body);
      sendSuccess(res, event, "Event updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await calendarService.deleteEvent(id);
      sendSuccess(res, null, "Event deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
