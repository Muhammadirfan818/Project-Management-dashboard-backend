import { TaskStatus, Priority } from "@prisma/client";

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string;
  assigneeIds?: string[];
  estimatedHours?: number;
  estimatedCost?: number;
  actualCost?: number;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: Date;
  assigneeIds?: string[];
  actualHours?: number;
  actualCost?: number;
  tags?: string[];
}

export interface AttachmentMetadata {
  name: string;
  filePath: string;
  size: number;
  mimeType: string;
}

export interface TaskForProgress {
  status: TaskStatus | string;
  assigneeIds: string[];
}
