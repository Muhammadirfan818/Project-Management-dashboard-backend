import { prisma } from "../config/prisma";

export class TimeTrackingRepository {
  async create(data: {
    taskId: string;
    userId: string;
    hours: number;
    date: Date;
    note?: string;
  }) {
    return prisma.timeTracking.create({
      data,
    });
  }

  async findByTaskId(taskId: string) {
    return prisma.timeTracking.findMany({
      where: { taskId },
      orderBy: { date: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.timeTracking.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: { hours?: number; date?: Date; note?: string }
  ) {
    return prisma.timeTracking.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.timeTracking.delete({
      where: { id },
    });
  }
}
