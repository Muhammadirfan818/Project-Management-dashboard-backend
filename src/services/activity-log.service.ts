import { ActivityLogRepository } from "../repositories/activity-log.repository";

export class ActivityLogService {
  private activityLogRepository: ActivityLogRepository;

  constructor() {
    this.activityLogRepository = new ActivityLogRepository();
  }

  async logActivity(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    message?: string;
    metadata?: Record<string, unknown>;
    projectId?: string;
  }) {
    const {
      userId,
      action,
      message,
      entityType,
      entityId,
      metadata,
      projectId,
    } = data;

    return this.activityLogRepository.create({
      userId,
      action,
      message: message || `${action} on ${entityType}`,
      metadata: {
        ...metadata,
        entityType,
        entityId,
        projectId,
      },
    });
  }

  async getUserActivity(userId: string, limit?: number) {
    return this.activityLogRepository.findByUserId(userId);
  }

  async getRecentActivity(limit?: number) {
    return this.activityLogRepository.findRecent(limit);
  }
}
