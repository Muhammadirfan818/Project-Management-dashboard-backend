import { prisma } from "../config/prisma";

export class CustomFieldRepository {
  // Create a custom field for a project
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

  // Get all custom fields for a project
  async findByProjectId(projectId: string) {
    return prisma.customField.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });
  }

  // Get a custom field by ID
  async findById(id: string) {
    return prisma.customField.findUnique({
      where: { id },
    });
  }

  // Update a custom field
  async update(id: string, data: { name?: string; options?: string[] }) {
    return prisma.customField.update({
      where: { id },
      data,
    });
  }

  // Delete a custom field
  async delete(id: string) {
    return prisma.customField.delete({
      where: { id },
    });
  }

  // Upsert a custom field value for a task
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

  // Get all custom field values for a task
  async findValuesByTaskId(taskId: string) {
    return prisma.customFieldValue.findMany({
      where: { taskId },
      include: {
        customField: true,
      },
    });
  }

  // Delete a custom field value
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
