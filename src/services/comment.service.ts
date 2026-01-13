import { CommentRepository } from "../repositories/comment.repository";
import { UserRepository } from "../repositories/user.repository";
import { AppError } from "../middlewares/error.middleware";

export class CommentService {
  private commentRepository: CommentRepository;
  private userRepository: UserRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
    this.userRepository = new UserRepository();
  }

  async createComment(data: {
    content: string;
    taskId: string;
    authorId: string;
  }) {
    if (!data.content) {
      throw new Error("Comment content is required");
    }

    const user = await this.userRepository.findUnique({
      supabaseId: data.authorId,
    });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return this.commentRepository.create({
      content: data.content,
      taskId: data.taskId,
      authorId: user.id,
    });
  }

  async getTaskComments(taskId: string) {
    return this.commentRepository.findByTaskId(taskId);
  }

  async updateComment(id: string, content: string, userId: string) {
    return this.commentRepository.update(id, content);
  }

  async deleteComment(id: string, userId: string) {
    return this.commentRepository.delete(id);
  }
}
