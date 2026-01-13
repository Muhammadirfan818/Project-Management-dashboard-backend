import { prisma } from "../config/prisma";
import { CreateProjectInput, UpdateProjectInput } from "../types/project.types";
import { calculateTeamProgress } from "../utils/taskProgress";

export class ProjectRepository {
  async findManyByUserId(userId: string) {
    const userTeams = await prisma.team.findMany({
      where: { memberIds: { has: userId } },
      select: { id: true },
    });
    const teamIds = userTeams.map((t) => t.id);

    return prisma.project.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        teams: {
          select: {
            id: true,
            name: true,
            memberIds: true,
            status: true,
            priority: true,
            startDate: true,
            endDate: true,
            progress: true,
            members: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async findAll() {
    return prisma.project.findMany({
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        members: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        teams: {
          select: {
            id: true,
            name: true,
            memberIds: true,
            status: true,
            priority: true,
            startDate: true,
            endDate: true,
            progress: true,
            members: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: { select: { tasks: true } },
      },
    });
  }

  async findByIdAndUserId(projectId: string, userId: string) {
    const userTeams = await prisma.team.findMany({
      where: { memberIds: { has: userId } },
      select: { id: true },
    });
    const teamIds = userTeams.map((t) => t.id);

    return prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { id: userId } } },
          { teamIds: { hasSome: teamIds } },
        ],
      },
      include: {
        owner: true,
        members: true,
        teams: {
          select: {
            id: true,
            name: true,
            memberIds: true,
            status: true,
            priority: true,
            startDate: true,
            endDate: true,
            progress: true,
            members: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        tasks: {
          where: { isDeleted: false },
        },
        budget: true,
      },
    });
  }

  async create(data: CreateProjectInput, ownerId: string) {
    const prefix = data.name
      ? data.name
          .replace(/[^a-zA-Z0-9]/g, "")
          .substring(0, 3)
          .toUpperCase()
      : "PRJ";
    const key = `${prefix}-${Date.now().toString(36).toUpperCase()}`;

    const { teamIds, ...restData } = data;

    const project = await prisma.project.create({
      data: {
        ...restData,
        ownerId,
        key,
        teamIds: teamIds || [],
      },
    });

    if (teamIds && teamIds.length > 0) {
      for (const teamId of teamIds) {
        await prisma.team.update({
          where: { id: teamId },
          data: {
            projectIds: {
              push: project.id,
            },
          },
        });
      }
    }

    return project;
  }

  async findByIdAndOwnerId(projectId: string, ownerId: string) {
    return prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId,
      },
    });
  }

  async update(projectId: string, data: UpdateProjectInput) {
    return prisma.project.update({
      where: { id: projectId },
      data,
    });
  }

  async delete(projectId: string) {
    await prisma.task.deleteMany({
      where: { projectId },
    });

    await prisma.projectSnapshot.deleteMany({
      where: { projectId },
    });
    await prisma.calendarEvent.deleteMany({
      where: { projectId },
    });

    await prisma.budget.deleteMany({
      where: { projectId },
    });

    return prisma.project.delete({
      where: { id: projectId },
    });
  }
  async findAttachments(projectId: string) {
    const attachments = await prisma.attachment.findMany({
      where: {
        task: {
          projectId: projectId,
          isDeleted: false,
        },
      },
      select: {
        id: true,
        name: true,
        url: true,
        size: true,
        mimeType: true,
        createdAt: true,
        taskId: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return attachments;
  }

  async enrichProjectsWithTeamProgress<
    TTeam extends { memberIds: string[]; progress?: number | null },
    TProject extends { id: string; teams: TTeam[] },
  >(projects: TProject[]): Promise<TProject[]> {
    const projectIds = projects.map((p) => p.id);

    const allTasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        isDeleted: false,
      },
      select: {
        projectId: true,
        status: true,
        assigneeIds: true,
      },
    });

    const tasksByProject: Record<string, typeof allTasks> = {};
    allTasks.forEach((task) => {
      if (!tasksByProject[task.projectId]) {
        tasksByProject[task.projectId] = [];
      }
      tasksByProject[task.projectId].push(task);
    });

    return projects.map((project) => ({
      ...project,
      teams: project.teams.map((team) => {
        const projectTasks = tasksByProject[project.id] || [];
        const progress = calculateTeamProgress(projectTasks, team.memberIds);
        return {
          ...team,
          progress,
        };
      }),
    }));
  }
}
