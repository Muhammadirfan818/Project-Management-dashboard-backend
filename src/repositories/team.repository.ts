import { prisma } from "../config/prisma";
import { calculateTeamProgress } from "../utils/taskProgress";
import { TaskStatus } from "@prisma/client";

export class TeamRepository {
  async create(data: {
    name: string;
    projectIds: string[];
    memberIds: string[];
  }) {
    const { name, projectIds, memberIds } = data;

    const team = await prisma.team.create({
      data: {
        name,
        projects: {
          connect: projectIds.map((id) => ({ id })),
        },
        members: {
          connect: memberIds.map((id) => ({ id })),
        },
      },
    });

    if (projectIds.length > 0) {
      await Promise.all(
        projectIds.map((projectId) =>
          prisma.project.update({
            where: { id: projectId },
            data: {
              teams: {
                connect: { id: team.id },
              },
            },
          }),
        ),
      );
    }

    return team;
  }

  async findById(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });
  }

  async findByProjectId(projectId: string) {
    return prisma.team.findMany({
      where: {
        projectIds: {
          has: projectId,
        },
      },
    });
  }

  async findByMemberId(userId: string) {
    return prisma.team.findMany({
      where: {
        memberIds: {
          has: userId,
        },
      },
    });
  }

  async findAll() {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
            progress: true,
            priority: true,
            tasks: {
              select: {
                status: true,
              },
            },
            members: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return teams.map((team) => ({
      ...team,
      projects: team.projects.map((project) => {
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(
          (t) => t.status === TaskStatus.COMPLETED,
        ).length;

        const { tasks, ...projectData } = project;
        return {
          ...projectData,
          totalTasks,
          completedTasks,
        };
      }),
    }));
  }

  async update(
    id: string,
    data: { name?: string; memberIds?: string[]; projectIds?: string[] },
  ) {
    const { name, memberIds, projectIds } = data;
    const updateData: {
      name?: string;
      members?: { set: { id: string }[] };
      projects?: { set: { id: string }[] };
    } = {};

    if (name !== undefined) updateData.name = name;
    if (memberIds !== undefined) {
      updateData.members = {
        set: memberIds.map((mid) => ({ id: mid })),
      };
    }
    if (projectIds !== undefined) {
      updateData.projects = {
        set: projectIds.map((pid) => ({ id: pid })),
      };
    }

    return prisma.team.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return prisma.team.delete({
      where: { id },
    });
  }

  async calculateTeamProgressForProject(
    teamId: string,
    projectId: string,
  ): Promise<number> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { memberIds: true },
    });

    if (!team || team.memberIds.length === 0) {
      return 0;
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        isDeleted: false,
      },
      select: {
        status: true,
        assigneeIds: true,
      },
    });

    return calculateTeamProgress(tasks, team.memberIds);
  }

  async findByProjectIdWithProgress(projectId: string) {
    const teams = await prisma.team.findMany({
      where: {
        projectIds: {
          has: projectId,
        },
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        isDeleted: false,
      },
      select: {
        status: true,
        assigneeIds: true,
      },
    });

    const teamsWithProgress = teams.map((team) => {
      const progress = calculateTeamProgress(tasks, team.memberIds);
      return {
        ...team,
        progress,
      };
    });

    return teamsWithProgress;
  }

  async getTeamMemberStats(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        memberIds: true,
        projectIds: true,
      },
    });

    if (!team) return [];

    const members = await prisma.user.findMany({
      where: {
        id: { in: team.memberIds },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        jobTitle: true,
      },
    });

    const completedTasks = await prisma.task.findMany({
      where: {
        projectId: { in: team.projectIds },
        status: TaskStatus.COMPLETED,
        isDeleted: false,
      },
      select: {
        assigneeIds: true,
      },
    });

    return members
      .map((member) => {
        const count = completedTasks.filter((task) =>
          task.assigneeIds.includes(member.id),
        ).length;

        return {
          id: member.id,
          name: member.name || "Unknown",
          role: member.jobTitle || "Member",
          avatar: member.avatar,
          tasksCompleted: count,
        };
      })
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted);
  }

  async getTeamOverviewStats(teamId: string, projectId?: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        projectIds: true,
      },
    });

    if (!team) {
      return {
        completedTasks: 0,
        incompletedTasks: 0,
        overdueTasks: 0,
        totalIncome: 0,
      };
    }

    let projectFilter: string | string[] = team.projectIds;
    if (projectId && team.projectIds.includes(projectId)) {
      projectFilter = projectId;
    } else if (projectId) {
      return {
        completedTasks: 0,
        incompletedTasks: 0,
        overdueTasks: 0,
        totalIncome: 0,
      };
    }

    const whereClause = {
      projectId: Array.isArray(projectFilter)
        ? { in: projectFilter }
        : projectFilter,
      isDeleted: false,
    };

    const now = new Date();

    const [completed, incompleted, overdue, income] = await Promise.all([
      prisma.task.count({
        where: {
          ...whereClause,
          status: TaskStatus.COMPLETED,
        },
      }),
      prisma.task.count({
        where: {
          ...whereClause,
          status: { not: TaskStatus.COMPLETED },
        },
      }),
      prisma.task.count({
        where: {
          ...whereClause,
          status: { not: TaskStatus.COMPLETED },
          dueDate: {
            lt: now,
            not: null,
          },
        },
      }),
      prisma.task.aggregate({
        where: {
          ...whereClause,
          status: TaskStatus.COMPLETED,
        },
        _sum: {
          actualCost: true,
        },
      }),
    ]);

    return {
      completedTasks: completed,
      incompletedTasks: incompleted,
      overdueTasks: overdue,
      totalIncome: income._sum.actualCost || 0,
    };
  }

  async syncProjectTeamRelationships() {
    const projects = await prisma.project.findMany({
      where: {
        teamIds: { isEmpty: false },
      },
      select: {
        id: true,
        teamIds: true,
      },
    });

    let synchronized = 0;

    for (const project of projects) {
      for (const teamId of project.teamIds) {
        const team = await prisma.team.findUnique({
          where: { id: teamId },
          select: { projectIds: true },
        });

        if (team && !team.projectIds.includes(project.id)) {
          await prisma.team.update({
            where: { id: teamId },
            data: {
              projectIds: {
                push: project.id,
              },
            },
          });
          synchronized++;
        }
      }
    }

    return {
      projectsScanned: projects.length,
      relationshipsFixed: synchronized,
    };
  }

  async getTopEarningProjects(teamId: string, range: string = "this_month") {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { projectIds: true },
    });

    if (!team || team.projectIds.length === 0) {
      return [];
    }

    const now = new Date();
    let startDate = new Date();

    if (range === "this_month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === "last_month") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else if (range === "this_year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(0);
    }
    const earnings = await prisma.task.groupBy({
      by: ["projectId"],
      where: {
        projectId: { in: team.projectIds },
        status: TaskStatus.COMPLETED,
        updatedAt: { gte: startDate },
        isDeleted: false,
      },
      _sum: {
        actualCost: true,
      },
      _count: {
        id: true,
      },
    });

    const projectIdsWithEarnings = earnings.map((e) => e.projectId);
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIdsWithEarnings } },
      select: { id: true, name: true },
    });

    const projectMap = new Map(projects.map((p) => [p.id, p]));

    const result = earnings.map((item) => {
      const project = projectMap.get(item.projectId);
      return {
        id: item.projectId,
        name: project ? project.name : "Unknown Project",
        completedTasks: item._count.id,
        earning: item._sum.actualCost || 0,
        iconColor: "blue",
      };
    });

    return result.sort((a, b) => b.earning - a.earning);
  }

  async getYearlyIncomeOverview(teamId: string, year: number) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { projectIds: true },
    });

    if (!team || team.projectIds.length === 0) {
      return Array(12)
        .fill(0)
        .map((_, i) => ({
          month: new Date(0, i).toLocaleString("en-US", { month: "short" }),
          value: 0,
        }));
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: team.projectIds },
        updatedAt: {
          gte: startDate,
          lt: endDate,
        },
        isDeleted: false,
      },
      select: {
        actualCost: true,
        updatedAt: true,
        status: true,
      },
    });

    const monthlyData = Array(12)
      .fill(0)
      .map((_, i) => ({
        month: new Date(0, i).toLocaleString("en-US", { month: "short" }),
        billable: 0,
        nonBillable: 0,
        monthIndex: i,
      }));

    tasks.forEach((task) => {
      const monthIndex = new Date(task.updatedAt).getMonth();
      const cost = task.actualCost || 0;

      if (task.status === TaskStatus.COMPLETED) {
        monthlyData[monthIndex].billable += cost;
      } else {
        monthlyData[monthIndex].nonBillable += cost;
      }
    });

    return monthlyData.map(({ month, billable, nonBillable }) => ({
      month,
      value: billable,
      billable,
      nonBillable,
    }));
  }
}
