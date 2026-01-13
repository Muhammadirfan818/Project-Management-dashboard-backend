import { ProjectStatus } from "@prisma/client";

export interface CreateProjectInput {
  name: string;
  key?: string;
  description?: string;
  icon?: string;
  color?: string;
  startDate?: Date;
  endDate?: Date;
  teamIds?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ProjectStatus;
  progress?: number;
  teamIds?: string[];
}
