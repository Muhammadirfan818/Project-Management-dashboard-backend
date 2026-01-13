import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/task.service";
import { sendSuccess } from "../utils/response";

import { UserService } from "../services/user.service";

const taskService = new TaskService();
const userService = new UserService();

export class TaskController {
  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      const tasks = await taskService.getUserTasks(user.id);
      sendSuccess(res, tasks);
    } catch (error: unknown) {
      next(error);
    }
  }

  async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      const task = await taskService.getTaskById(id, user.id);
      sendSuccess(res, task);
    } catch (error: unknown) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);

      const data = { ...req.body };

      if (typeof data.tags === "string") {
        try {
          data.tags = JSON.parse(data.tags);
        } catch (e) {
          data.tags = data.tags.split(",").map((t: string) => t.trim());
        }
      }

      if (typeof data.assigneeIds === "string") {
        try {
          data.assigneeIds = JSON.parse(data.assigneeIds);
        } catch (e) {
          data.assigneeIds = [data.assigneeIds];
        }
      }

      const files = data.attachments || [];

      const task = await taskService.createTask(
        data,
        user.id,
        data.projectId,
        files,
      );
      sendSuccess(res, task, "Task created successfully", 201);
    } catch (error: unknown) {
      console.error("Error creating task:", error);
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      const task = await taskService.updateTask(id, user.id, req.body);
      sendSuccess(res, task, "Task updated successfully");
    } catch (error: unknown) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      await taskService.deleteTask(id, user.id);
      sendSuccess(res, null, "Task deleted successfully");
    } catch (error: unknown) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);

      const task = await taskService.updateTaskStatus(id, user.id, status);
      sendSuccess(res, task, "Task status updated successfully");
    } catch (error: unknown) {
      next(error);
    }
  }

  async addSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      const subtask = await taskService.addSubtask(id, user.id, title);
      sendSuccess(res, subtask, "Subtask added successfully");
    } catch (error: unknown) {
      next(error);
    }
  }

  async deleteSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: taskId, subtaskId } = req.params;
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      await taskService.deleteSubtask(taskId, subtaskId, user.id);
      sendSuccess(res, null, "Subtask deleted successfully");
    } catch (error: unknown) {
      next(error);
    }
  }

  async assignSubtask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: taskId, subtaskId } = req.params;
      const { assigneeId, action } = req.body;
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      const subtask = await taskService.assignSubtask(
        taskId,
        subtaskId,
        user.id,
        assigneeId,
        action || "add",
      );
      sendSuccess(
        res,
        subtask,
        action === "remove"
          ? "Assignee removed from subtask"
          : "Assignee added to subtask",
      );
    } catch (error: unknown) {
      next(error);
    }
  }

  async toggleSubtaskCompleted(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id: taskId, subtaskId } = req.params;
      const { completed } = req.body;
      const { sub: supabaseId } = req.user!;
      const user = await userService.getUserBySupabaseId(supabaseId);
      const subtask = await taskService.toggleSubtaskCompleted(
        taskId,
        subtaskId,
        user.id,
        completed,
      );
      sendSuccess(res, subtask, "Subtask updated successfully");
    } catch (error: unknown) {
      next(error);
    }
  }
}
