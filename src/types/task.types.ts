import { TaskStatus, Priority } from "@prisma/client";

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string; // Changed from Date to string
  assigneeIds?: string[]; // Added this line
  estimatedHours?: number;
  estimatedCost?: number;
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
