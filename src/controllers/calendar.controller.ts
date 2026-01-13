import { Request, Response, NextFunction } from "express";
import { CalendarService } from "../services/calendar.service";
import { ProjectService } from "../services/project.service";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../utils/response";

const calendarService = new CalendarService();
const projectService = new ProjectService();
const userService = new UserService();

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

  async getAllEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      const projects = await projectService.getUserProjects(user.id);
      const projectIds = projects.map((p) => p.id);

      const events = await calendarService.getEventsForProjects(projectIds);
      sendSuccess(res, events);
    } catch (error) {
      next(error);
    }
  }

  async getEventsByDateRange(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          message: "startDate and endDate query parameters are required",
        });
      }

      const events = await calendarService.getEventsByDateRange(
        projectId,
        startDate as string,
        endDate as string,
      );
      sendSuccess(res, events);
    } catch (error) {
      next(error);
    }
  }

  async getTodayEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const events = await calendarService.getTodayEvents(projectId);
      sendSuccess(res, events);
    } catch (error) {
      next(error);
    }
  }

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
