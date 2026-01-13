import { Request, Response, NextFunction } from "express";
import { ProjectService } from "../services/project.service";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../utils/response";

const projectService = new ProjectService();
const userService = new UserService();

export class ProjectController {
  async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: supabaseId } = req.user!;
      try {
        const user = await userService.getUserBySupabaseId(supabaseId);
        const projects = await projectService.getUserProjects(user.id);
        return sendSuccess(res, projects);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          const projects = await projectService.getAllProjects();
          return sendSuccess(res, projects);
        }
        throw err;
      }
    } catch (error) {
      next(error);
    }
  }

  async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      const project = await projectService.getProjectById(id, user.id);
      sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  }

  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);

      const { name, description, dueDate, startDate, teamId, icon, color } =
        req.body;

      const payload = {
        name,
        description,
        icon,
        color,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: dueDate ? new Date(dueDate) : undefined,
        teamIds: teamId ? [teamId] : [],
      };

      const project = await projectService.createProject(payload, user.id);
      sendSuccess(res, project, "Project created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      const project = await projectService.updateProject(id, user.id, req.body);
      sendSuccess(res, project, "Project updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      await projectService.deleteProject(id, user.id);
      sendSuccess(res, null, "Project deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAttachments(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);

      const attachments = await projectService.getAttachments(id, user.id);
      sendSuccess(res, attachments);
    } catch (error: unknown) {
      console.error("[ProjectController] Error fetching attachments:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      res.status(400).json({
        status: "error",
        message: errorMessage,
        details: error,
      });
    }
  }
}
