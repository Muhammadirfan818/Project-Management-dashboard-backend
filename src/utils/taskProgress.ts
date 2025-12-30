// Utility functions for task progress calculation

import { TaskStatus } from "@prisma/client";

/**
 * Maps task status to progress percentage
 * @param status - The task status
 * @returns Progress percentage (0-100)
 */
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

/**
 * Calculates average progress from an array of progress values
 * @param progressValues - Array of progress percentages
 * @returns Average progress (0-100), 0 if no values
 */
export const calculateAverageProgress = (progressValues: number[]): number => {
  if (progressValues.length === 0) {
    return 0;
  }
  const total = progressValues.reduce((sum, progress) => sum + progress, 0);
  return Math.round(total / progressValues.length);
};

/**
 * Task interface for progress calculation
 */
export interface TaskForProgress {
  status: TaskStatus | string;
  assigneeIds: string[];
}

/**
 * Calculates team progress based on tasks assigned to team members
 * @param tasks - Array of tasks in the project
 * @param teamMemberIds - Array of user IDs who are members of the team
 * @returns Team progress percentage (0-100)
 */
export const calculateTeamProgress = (
  tasks: TaskForProgress[],
  teamMemberIds: string[]
): number => {
  // Normalize team member IDs to strings for safe comparison
  const safeTeamMemberIds = teamMemberIds.map((id) => String(id));

  // Filter tasks that are assigned to at least one team member
  const teamTasks = tasks.filter((task) =>
    task.assigneeIds.some((assigneeId) =>
      safeTeamMemberIds.includes(String(assigneeId))
    )
  );

  if (teamTasks.length === 0) {
    return 0;
  }

  // Calculate progress for each task and get average
  const progressValues = teamTasks.map((task) => getTaskProgress(task.status));
  return calculateAverageProgress(progressValues);
};
