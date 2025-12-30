import { prisma } from "../config/prisma";

export class CommentRepository {
  async create(data: { content: string; taskId: string; authorId: string }) {
    return prisma.comment.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findByTaskId(taskId: string) {
    return prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, content: string) {
    return prisma.comment.update({
      where: { id },
      data: { content },
    });
  }

  async delete(id: string) {
    return prisma.comment.delete({
      where: { id },
    });
  }
}
