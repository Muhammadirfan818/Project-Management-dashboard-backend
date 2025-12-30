import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export class ActivityLogRepository {
  async create(data: {
    action: string;
    message: string;
    userId: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.activityLog.create({
      data: {
        ...data,
        metadata: data.metadata ?? null,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findRecent(limit: number = 20) {
    return prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
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
}
