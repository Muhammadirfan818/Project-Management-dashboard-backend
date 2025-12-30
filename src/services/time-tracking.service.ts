import { TimeTrackingRepository } from "../repositories/time-tracking.repository";

export class TimeTrackingService {
  private timeTrackingRepository: TimeTrackingRepository;

  constructor() {
    this.timeTrackingRepository = new TimeTrackingRepository();
  }

  async logTime(data: {
    userId: string;
    taskId: string;
    hours: number;
    date: Date;
    note?: string;
  }) {
    return this.timeTrackingRepository.create(data);
  }

  async getTaskTimeLogs(taskId: string) {
    return this.timeTrackingRepository.findByTaskId(taskId);
  }

  async getUserTimeLogs(userId: string) {
    return this.timeTrackingRepository.findByUserId(userId);
  }

  async updateTimeLog(
    id: string,
    data: { hours?: number; date?: Date; note?: string }
  ) {
    return this.timeTrackingRepository.update(id, data);
  }

  async deleteTimeLog(id: string) {
    return this.timeTrackingRepository.delete(id);
  }
}
