import { TaskStatus } from "@prisma/client";
import { TaskForProgress } from "../types/task.types";

export const getTaskProgress = (status: TaskStatus | string): number => {
  const normalizedStatus = status?.toString().toUpperCase();

  switch (normalizedStatus) {
    case "BACKLOG":
    case "TODO":
      return 0;
    case "IN_PROGRESS":
      return 50;
    case "IN_REVIEW":
      return 80;
    case "QA":
      return 90;
    case "COMPLETED":
      return 100;
    case "CANCELED":
    case "POSTPONE":
      return 0;
    default:
      return 0;
  }
};

export const calculateAverageProgress = (progressValues: number[]): number => {
  if (progressValues.length === 0) {
    return 0;
  }
  const total = progressValues.reduce((sum, progress) => sum + progress, 0);
  return Math.round(total / progressValues.length);
};

export const calculateTeamProgress = (
  tasks: TaskForProgress[],
  teamMemberIds: string[],
): number => {
  const safeTeamMemberIds = teamMemberIds.map((id) => String(id));

  const teamTasks = tasks.filter((task) =>
    task.assigneeIds.some((assigneeId) =>
      safeTeamMemberIds.includes(String(assigneeId)),
    ),
  );

  if (teamTasks.length === 0) {
    return 0;
  }

  const progressValues = teamTasks.map((task) => getTaskProgress(task.status));
  return calculateAverageProgress(progressValues);
};
