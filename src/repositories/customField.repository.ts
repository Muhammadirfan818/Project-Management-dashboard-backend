import { prisma } from "../config/prisma";

export class CustomFieldRepository {
  async create(data: {
    name: string;
    type: string;
    options?: string[];
    projectId: string;
  }) {
    return prisma.customField.create({
      data: {
        name: data.name,
        type: data.type,
        options: data.options || [],
        projectId: data.projectId,
      },
    });
  }

  async findByProjectId(projectId: string) {
    return prisma.customField.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.customField.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: { name?: string; options?: string[] }) {
    return prisma.customField.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.customField.delete({
      where: { id },
    });
  }

  async upsertValue(customFieldId: string, taskId: string, value: string) {
    return prisma.customFieldValue.upsert({
      where: {
        customFieldId_taskId: {
          customFieldId,
          taskId,
        },
      },
      update: { value },
      create: {
        customFieldId,
        taskId,
        value,
      },
    });
  }

  async findValuesByTaskId(taskId: string) {
    return prisma.customFieldValue.findMany({
      where: { taskId },
      include: {
        customField: true,
      },
    });
  }

  async deleteValue(customFieldId: string, taskId: string) {
    return prisma.customFieldValue.delete({
      where: {
        customFieldId_taskId: {
          customFieldId,
          taskId,
        },
      },
    });
  }
}
