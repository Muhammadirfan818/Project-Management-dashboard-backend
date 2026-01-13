import { TaskStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import {
  CreateTaskInput,
  UpdateTaskInput,
  AttachmentMetadata,
} from "../types/task.types";

export class TaskRepository {
  async findManyByUserId(userId: string) {
    const tasks = await prisma.task.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        assignees: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
            subtasks: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const allTagIds = Array.from(new Set(tasks.flatMap((task) => task.tagIds)));

    const allTags = await prisma.tag.findMany({
      where: {
        id: { in: allTagIds },
      },
    });

    const tagMap = new Map(allTags.map((tag) => [tag.id, tag]));

    return tasks.map((task) => {
      const tags = task.tagIds
        .map((tagId) => tagMap.get(tagId))
        .filter((tag) => tag !== undefined);

      return {
        ...task,
        tags,
        comments: task._count.comments,
        attachments: task._count.attachments,
        subtasks: task._count.subtasks,
      };
    });
  }

  async findByIdAndUserId(taskId: string, userId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        isDeleted: false,
      },
      include: {
        assignees: true,
        creator: true,
        project: true,
        subtasks: {
          include: {
            createdBy: {
              select: { id: true, name: true, avatar: true },
            },
            assignees: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        attachments: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!task) return null;

    const tags = await prisma.tag.findMany({
      where: {
        id: { in: task.tagIds },
      },
    });

    return {
      ...task,
      tags,
    };
  }

  async findByIdAndProjectAccess(taskId: string, userId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        isDeleted: false,
      },
      include: {
        project: {
          select: {
            id: true,
            memberIds: true,
            ownerId: true,
            teamIds: true,
          },
        },
      },
    });

    if (!task) return null;

    const isOwner = task.project.ownerId === userId;
    const isDirectMember = task.project.memberIds.includes(userId);
    const isCreator = task.creatorId === userId;
    const isAssignee = task.assigneeIds.includes(userId);

    if (isOwner || isDirectMember || isCreator || isAssignee) {
      return task;
    }

    if (task.project.teamIds.length > 0) {
      const teamWithUser = await prisma.team.findFirst({
        where: {
          id: { in: task.project.teamIds },
          memberIds: { has: userId },
        },
      });

      if (teamWithUser) {
        return task;
      }
    }

    return null;
  }

  async create(
    data: CreateTaskInput,
    creatorId: string,
    projectId: string,
    files?: AttachmentMetadata[],
  ) {
    const processedTagIds: string[] = [];
    if (data.tags && Array.isArray(data.tags)) {
      for (const tagText of data.tags) {
        let tag = await prisma.tag.findFirst({ where: { text: tagText } });
        if (!tag) {
          tag = await prisma.tag.create({
            data: { text: tagText, color: "blue", bg: "bg-blue-100" },
          });
        }
        processedTagIds.push(tag.id);
      }
    }

    const createdTask = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        actualCost: data.actualCost ?? 0,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assigneeIds: data.assigneeIds || [],
        projectId: projectId,
        creatorId: creatorId,
        tagIds: processedTagIds,
        attachments: {
          create:
            files?.map((file) => ({
              name: file.name,
              url: file.filePath,
              size: file.size,
              mimeType: file.mimeType,
              userId: creatorId,
            })) || [],
        },
      },
      include: {
        assignees: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        attachments: true,
      },
    });

    const tags = await prisma.tag.findMany({
      where: { id: { in: processedTagIds } },
    });

    return { ...createdTask, tags };
  }

  async update(taskId: string, data: UpdateTaskInput, userId: string) {
    const { tags, dueDate, ...rest } = data;

    const updateData: Prisma.TaskUpdateInput = {
      title: rest.title,
      description: rest.description,
      priority: rest.priority,
      status: rest.status,
    };

    if (rest.actualHours !== undefined)
      updateData.actualHours = rest.actualHours;
    if (rest.actualCost !== undefined) updateData.actualCost = rest.actualCost;

    Object.keys(updateData).forEach(
      (key) =>
        updateData[key as keyof Prisma.TaskUpdateInput] === undefined &&
        delete updateData[key as keyof Prisma.TaskUpdateInput],
    );

    if (rest.assigneeIds) {
      updateData.assignees = {
        set: rest.assigneeIds.map((id) => ({ id })),
      };
    }

    if (tags && Array.isArray(tags)) {
      const processedTagIds: string[] = [];
      for (const tagText of tags) {
        let tag = await prisma.tag.findFirst({ where: { text: tagText } });
        if (!tag) {
          tag = await prisma.tag.create({
            data: { text: tagText, color: "blue", bg: "bg-blue-100" },
          });
        }
        processedTagIds.push(tag.id);
      }
      updateData.tagIds = processedTagIds;
    }

    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
    }

    await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    return this.findByIdAndUserId(taskId, userId);
  }

  async softDelete(taskId: string) {
    return prisma.task.update({
      where: { id: taskId },
      data: { isDeleted: true },
    });
  }

  async hardDelete(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        attachments: {
          select: { url: true },
        },
      },
    });

    await prisma.task.delete({
      where: { id: taskId },
    });

    return task?.attachments.map((a) => a.url) || [];
  }
  async createSubtask(taskId: string, title: string, createdById: string) {
    return prisma.subTask.create({
      data: {
        title,
        taskId,
        completed: false,
        createdById,
        assigneeIds: [],
      },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        assignees: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async deleteSubtask(subtaskId: string) {
    return prisma.subTask.delete({
      where: { id: subtaskId },
    });
  }

  async assignSubtask(
    subtaskId: string,
    assigneeId: string,
    action: "add" | "remove",
  ) {
    const subtask = await prisma.subTask.findUnique({
      where: { id: subtaskId },
      select: { assigneeIds: true },
    });

    if (!subtask) throw new Error("Subtask not found");

    let newAssigneeIds: string[];
    if (action === "add") {
      newAssigneeIds = subtask.assigneeIds.includes(assigneeId)
        ? subtask.assigneeIds
        : [...subtask.assigneeIds, assigneeId];
    } else {
      newAssigneeIds = subtask.assigneeIds.filter((id) => id !== assigneeId);
    }

    return prisma.subTask.update({
      where: { id: subtaskId },
      data: { assigneeIds: newAssigneeIds },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        assignees: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async toggleSubtaskCompleted(subtaskId: string, completed: boolean) {
    return prisma.subTask.update({
      where: { id: subtaskId },
      data: { completed },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        assignees: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async updateStatus(taskId: string, status: string, userId: string) {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: status as TaskStatus },
    });

    if (status === "COMPLETED") {
      await prisma.subTask.updateMany({
        where: { taskId: taskId },
        data: { completed: true },
      });
    }

    return this.findByIdAndUserId(taskId, userId);
  }
}
