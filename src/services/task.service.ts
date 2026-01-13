import { AppError } from "../middlewares/error.middleware";

import { TaskRepository } from "../repositories/task.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { NotificationService } from "./notification.service";
import {
  CreateTaskInput,
  UpdateTaskInput,
  AttachmentMetadata,
} from "../types/task.types";

export class TaskService {
  private taskRepository: TaskRepository;
  private projectRepository: ProjectRepository;
  private notificationService: NotificationService;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.projectRepository = new ProjectRepository();
    this.notificationService = new NotificationService();
  }

  async getUserTasks(userId: string) {
    return this.taskRepository.findManyByUserId(userId);
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await this.taskRepository.findByIdAndUserId(taskId, userId);

    if (!task) {
      throw new AppError("Task not found or access denied", 404);
    }

    return task;
  }

  async createTask(
    data: CreateTaskInput,
    userId: string,
    projectId: string,
    files?: AttachmentMetadata[],
  ) {
    const targetProjectId = data.projectId || projectId;

    const project = await this.projectRepository.findByIdAndUserId(
      targetProjectId,
      userId,
    );

    if (!project) {
      throw new AppError("Access denied to this project", 403);
    }

    const task = await this.taskRepository.create(
      data,
      userId,
      targetProjectId,
      files,
    );

    try {
      const assigneeIds = data.assigneeIds || [];
      const notificationPromises = assigneeIds
        .filter((id) => id !== userId)
        .map((assigneeId) =>
          this.notificationService.createNotification({
            type: "TASK_ASSIGNED",
            title: "New Task Assigned",
            message: `assigned you a new task: ${task.title}`,
            userId: assigneeId,
            projectId: targetProjectId,
            taskId: task.id,
            actorId: userId,
          }),
        );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error("Failed to send task assignment notifications:", error);
    }

    return task;
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskInput) {
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId,
    );

    if (!task) {
      throw new AppError("Access denied to this task", 403);
    }

    const updated = await this.taskRepository.update(taskId, data, userId);

    return updated;
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId,
    );

    if (!task) {
      throw new AppError("Access denied to this task", 403);
    }

    const attachmentUrls = await this.taskRepository.hardDelete(taskId);
  }

  async updateTaskStatus(taskId: string, userId: string, status: string) {
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId,
    );
    if (!task) {
      throw new AppError("Access denied to this task", 403);
    }
    return this.taskRepository.updateStatus(taskId, status, userId);
  }

  async addSubtask(taskId: string, userId: string, title: string) {
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId,
    );
    if (!task) {
      throw new AppError("Access denied to this task", 403);
    }

    return this.taskRepository.createSubtask(taskId, title, userId);
  }

  async deleteSubtask(taskId: string, subtaskId: string, userId: string) {
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId,
    );
    if (!task) {
      throw new AppError("Access denied to this task", 403);
    }

    return this.taskRepository.deleteSubtask(subtaskId);
  }

  async assignSubtask(
    taskId: string,
    subtaskId: string,
    userId: string,
    assigneeId: string,
    action: "add" | "remove",
  ) {
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId,
    );
    if (!task) {
      throw new AppError("Access denied to this task", 403);
    }

    return this.taskRepository.assignSubtask(subtaskId, assigneeId, action);
  }

  async toggleSubtaskCompleted(
    taskId: string,
    subtaskId: string,
    userId: string,
    completed: boolean,
  ) {
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId,
    );
    if (!task) {
      throw new AppError("Access denied to this task", 403);
    }

    return this.taskRepository.toggleSubtaskCompleted(subtaskId, completed);
  }
}
