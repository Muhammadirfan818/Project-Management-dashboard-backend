import { prisma } from "../config/prisma";
import { EventType } from "@prisma/client";

export class CalendarRepository {
  async create(data: {
    title: string;
    type: EventType;
    start: Date;
    end?: Date;
    description?: string;
    projectId?: string;
  }) {
    return prisma.calendarEvent.create({
      data,
    });
  }

  async findByProjectId(projectId: string) {
    return prisma.calendarEvent.findMany({
      where: { projectId },
      orderBy: { start: "asc" },
    });
  }

  async findByProjectIds(projectIds: string[]) {
    return prisma.calendarEvent.findMany({
      where: {
        projectId: {
          in: projectIds,
        },
      },
      orderBy: { start: "asc" },
    });
  }

  async findByDateRange(projectId: string, startDate: Date, endDate: Date) {
    return prisma.calendarEvent.findMany({
      where: {
        projectId,
        start: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { start: "asc" },
    });
  }

  async findTodayEvents(projectId: string, todayStart: Date, todayEnd: Date) {
    return prisma.calendarEvent.findMany({
      where: {
        projectId,
        start: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: { start: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.calendarEvent.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      type?: EventType;
      start?: Date;
      end?: Date;
      description?: string;
    },
  ) {
    return prisma.calendarEvent.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.calendarEvent.delete({
      where: { id },
    });
  }
}
