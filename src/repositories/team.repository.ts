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

    // 1. Create the team
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

    // 2. Explicitly update the projects to include this team
    // (Required because the relations are defined separately in the schema)
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
          })
        )
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
              // Fetch project members for the UI
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

    // Transform and calculate task counts
    return teams.map((team) => ({
      ...team,
      projects: team.projects.map((project) => {
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(
          (t) => t.status === TaskStatus.COMPLETED
        ).length;

        // Remove the raw tasks array from the output if desired, or keep it.
        // We'll return a clean object matching the expected specific structure + new fields
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
    data: { name?: string; memberIds?: string[]; projectIds?: string[] }
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

  /**
   * Calculate team progress for a specific project
   * Progress = average of task progress for tasks assigned to team members
   */
  async calculateTeamProgressForProject(
    teamId: string,
    projectId: string
  ): Promise<number> {
    // Get the team with its members
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { memberIds: true },
    });

    if (!team || team.memberIds.length === 0) {
      return 0;
    }

    // Get all tasks in the project that are not deleted
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

    // Calculate team progress using the utility
    return calculateTeamProgress(tasks, team.memberIds);
  }

  /**
   * Get teams for a project with calculated progress
   */
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

    // Get all tasks for the project once (more efficient than querying per team)
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

    // Calculate progress for each team
    const teamsWithProgress = teams.map((team) => {
      const progress = calculateTeamProgress(tasks, team.memberIds);
      return {
        ...team,
        progress, // Override the static progress with calculated value
      };
    });

    return teamsWithProgress;
  }

  async getTeamMemberStats(teamId: string) {
    // 1. Get team with member IDs and project IDs
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        memberIds: true,
        projectIds: true,
      },
    });

    if (!team) return [];

    // 2. Fetch all members details
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

    // 3. Get all completed tasks for these projects
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

    // 4. Calculate stats per member
    return members
      .map((member) => {
        // Count how many completed tasks this member is assigned to
        const count = completedTasks.filter((task) =>
          task.assigneeIds.includes(member.id)
        ).length;

        return {
          id: member.id,
          name: member.name || "Unknown",
          role: member.jobTitle || "Member",
          avatar: member.avatar,
          tasksCompleted: count,
        };
      })
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted); // Sort by completed tasks desc
  }

  async getTeamOverviewStats(teamId: string, projectId?: string) {
    // 1. Get team with project IDs
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

    // Determine the project filter
    // If projectId is provided, use it (only if it belongs to the team)
    // If not, use all projectIds from the team
    let projectFilter: string | string[] = team.projectIds;
    if (projectId && team.projectIds.includes(projectId)) {
      projectFilter = projectId;
    } else if (projectId) {
      // If a specific project was requested but it's not in the team, return 0 stats
      // Or we could ignore the filter. Returing 0 seems safer for data isolation.
      return {
        completedTasks: 0,
        incompletedTasks: 0,
        overdueTasks: 0,
        totalIncome: 0,
      };
    }

    // Helper to build the where clause
    const whereClause = {
      projectId: Array.isArray(projectFilter)
        ? { in: projectFilter }
        : projectFilter,
      isDeleted: false,
    };

    const now = new Date();

    const [completed, incompleted, overdue, income] = await Promise.all([
      // Completed Tasks
      prisma.task.count({
        where: {
          ...whereClause,
          status: TaskStatus.COMPLETED,
        },
      }),
      // Incompleted Tasks (Not Completed)
      prisma.task.count({
        where: {
          ...whereClause,
          status: { not: TaskStatus.COMPLETED },
        },
      }),
      // Overdue Tasks
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
      // Total Income (Sum of actualCost for Completed tasks)
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

  /**
   * Synchronize project-team bidirectional relationships.
   * Finds all projects with non-empty teamIds and ensures those teams have the project in their projectIds.
   */
  async syncProjectTeamRelationships() {
    // Find all projects that have teamIds
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
        // Check if team exists and if projectId is already in team's projectIds
        const team = await prisma.team.findUnique({
          where: { id: teamId },
          select: { projectIds: true },
        });

        if (team && !team.projectIds.includes(project.id)) {
          // Add project to tea
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
    // 1. Get team with project IDs
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { projectIds: true },
    });

    if (!team || team.projectIds.length === 0) {
      return [];
    }

    // 2. Determine Date Range
    const now = new Date();
    let startDate = new Date(); // default to now

    if (range === "this_month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === "last_month") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else if (range === "this_year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      // 'all_time' or unknown
      startDate = new Date(0); // Beginning of time
    }

    // 3. Aggregate earnings per project
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

    // 4. Fetch Project Details (Name)
    // We only need details for projects that have earnings
    const projectIdsWithEarnings = earnings.map((e) => e.projectId);
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIdsWithEarnings } },
      select: { id: true, name: true },
    });

    // 5. Enhance and Format Data
    const projectMap = new Map(projects.map((p) => [p.id, p]));

    const result = earnings.map((item) => {
      const project = projectMap.get(item.projectId);
      return {
        id: item.projectId,
        name: project ? project.name : "Unknown Project",
        completedTasks: item._count.id,
        earning: item._sum.actualCost || 0,
        // Simple color assignment logic or could be stored in DB
        iconColor: "blue",
      };
    });

    // 6. Sort by Earning Descending
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

    // Initialize 12 months
    const monthlyData = Array(12)
      .fill(0)
      .map((_, i) => ({
        month: new Date(0, i).toLocaleString("en-US", { month: "short" }),
        billable: 0,
        nonBillable: 0,
        monthIndex: i,
      }));

    // Aggregate
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
