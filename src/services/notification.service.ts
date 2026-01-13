import { NotificationRepository } from "../repositories/notification.repository";

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async createNotification(data: {
    type: string;
    title: string;
    message: string;
    userId: string;
    projectId?: string;
    taskId?: string;
    actorId?: string;
  }) {
    return this.notificationRepository.create(data);
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepository.findByUserId(userId);
  }

  async markAsRead(id: string) {
    return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }
}
