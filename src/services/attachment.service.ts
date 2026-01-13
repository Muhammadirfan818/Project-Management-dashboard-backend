import { AttachmentRepository } from "../repositories/attachment.repository";

export class AttachmentService {
  private attachmentRepository: AttachmentRepository;

  constructor() {
    this.attachmentRepository = new AttachmentRepository();
  }

  async createAttachment(data: {
    filename: string;
    url: string;
    size: number;
    mimeType: string;
    taskId: string;
    userId: string;
  }) {
    return this.attachmentRepository.create({
      name: data.filename,
      url: data.url,
      size: data.size,
      mimeType: data.mimeType,
      taskId: data.taskId,
      userId: data.userId,
    });
  }

  async deleteAttachment(id: string) {
    return this.attachmentRepository.delete(id);
  }

  async getTaskAttachments(taskId: string) {
    return this.attachmentRepository.findByTaskId(taskId);
  }
}
