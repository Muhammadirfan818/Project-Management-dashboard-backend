import { CalendarRepository } from "../repositories/calendar.repository";
import { EventType } from "@prisma/client";

export class CalendarService {
  private calendarRepository: CalendarRepository;

  constructor() {
    this.calendarRepository = new CalendarRepository();
  }

  async createEvent(data: {
    title: string;
    type: EventType;
    start: Date;
    end?: Date;
    description?: string;
    projectId?: string;
  }) {
    if (!data.title || !data.start || !data.type) {
      throw new Error("Missing required event fields");
    }
    return this.calendarRepository.create(data);
  }

  async getProjectEvents(projectId: string) {
    return this.calendarRepository.findByProjectId(projectId);
  }

  async getEventsForProjects(projectIds: string[]) {
    return this.calendarRepository.findByProjectIds(projectIds);
  }

  async getEventsByDateRange(
    projectId: string,
    startDate: string,
    endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.calendarRepository.findByDateRange(projectId, start, end);
  }

  async getTodayEvents(projectId: string) {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    return this.calendarRepository.findTodayEvents(
      projectId,
      todayStart,
      todayEnd,
    );
  }

  async getEventById(id: string) {
    return this.calendarRepository.findById(id);
  }

  async updateEvent(
    id: string,
    data: {
      title?: string;
      type?: EventType;
      start?: Date;
      end?: Date;
      description?: string;
    },
  ) {
    return this.calendarRepository.update(id, data);
  }

  async deleteEvent(id: string) {
    return this.calendarRepository.delete(id);
  }
}
