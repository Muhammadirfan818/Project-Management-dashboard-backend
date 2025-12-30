import { boolean } from "zod";
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
}
