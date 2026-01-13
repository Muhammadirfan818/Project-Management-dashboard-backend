import { prisma } from "../config/prisma";

export class AttachmentRepository {
  async create(data: {
    name: string;
    url: string;
    size?: number;
    mimeType?: string;
    taskId: string;
    userId: string;
  }) {
    return prisma.attachment.create({
      data,
    });
  }

  async findByTaskId(taskId: string) {
    return prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
    });
  }

  async delete(id: string) {
    return prisma.attachment.delete({
      where: { id },
    });
  }
}
