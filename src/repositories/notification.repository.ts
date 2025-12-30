import { prisma } from "../config/prisma";

export class NotificationRepository {
  async create(data: {
    type: string;
    title: string;
    message: string;
    userId: string;
    projectId?: string;
    taskId?: string;
    actorId?: string;
  }) {
    return prisma.notification.create({
      data,
    });
  }

  async findByUserId(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string) {
    return prisma.notification.delete({
      where: { id },
    });
  }
}
