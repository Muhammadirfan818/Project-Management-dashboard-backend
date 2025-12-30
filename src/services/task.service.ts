import { AppError } from "../middlewares/error.middleware";

import { TaskRepository } from "../repositories/task.repository";
import { ProjectRepository } from "../repositories/project.repository";
import {
  CreateTaskInput,
  UpdateTaskInput,
  AttachmentMetadata,
} from "../types/task.types";

export class TaskService {
  private taskRepository: TaskRepository;
  private projectRepository: ProjectRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.projectRepository = new ProjectRepository();
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
    files?: AttachmentMetadata[]
  ) {
    const targetProjectId = data.projectId || projectId;

    // Verify user has access to project
    const project = await this.projectRepository.findByIdAndUserId(
      targetProjectId,
      userId
    );

    if (!project) {
      throw new AppError("Access denied to this project", 403);
    }

    const task = await this.taskRepository.create(
      data,
      userId,
      targetProjectId,
      files
    );

    return task;
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskInput) {
    // Verify access
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId
    );

    if (!task) {
      throw new AppError("Access denied to this task", 403);
    }

    const updated = await this.taskRepository.update(taskId, data, userId);

    return updated;
  }

  async deleteTask(taskId: string, userId: string) {
    // Verify access
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId
    );

    if (!task) {
      throw new AppError("Access denied to this task", 403);
    }

    // Hard delete - removes task and cascades to delete:
    // - attachments, comments, subtasks, time tracking, history
    const attachmentUrls = await this.taskRepository.hardDelete(taskId);

    // Note: To also delete files from Supabase storage, you would need to:
    // 1. Import supabase client in backend
    // 2. Call: await supabase.storage.from('attachments').remove(attachmentUrls)
    // For now, database records are cleaned up. Storage cleanup can be added later.
    console.log(
      `[TaskService] Deleted task ${taskId} with ${attachmentUrls.length} attachments`
    );
  }

  async updateTaskStatus(taskId: string, userId: string, status: string) {
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId
    );
    if (!task) {
      throw new AppError("Access denied to this task", 403);
    }
    return this.taskRepository.updateStatus(taskId, status, userId);
  }

  async addSubtask(taskId: string, userId: string, title: string) {
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId
    );
    if (!task) {
      throw new AppError("Access denied to this task", 403);
    }

    return this.taskRepository.createSubtask(taskId, title, userId);
  }

  async deleteSubtask(taskId: string, subtaskId: string, userId: string) {
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId
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
    action: "add" | "remove"
  ) {
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId
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
    completed: boolean
  ) {
    const task = await this.taskRepository.findByIdAndProjectAccess(
      taskId,
      userId
    );
    if (!task) {
      throw new AppError("Access denied to this task", 403);
    }

    return this.taskRepository.toggleSubtaskCompleted(subtaskId, completed);
  }
}
