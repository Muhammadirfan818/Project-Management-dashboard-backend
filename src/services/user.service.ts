import { AppError } from "../middlewares/error.middleware";
import { UserRepository } from "../repositories/user.repository";
import { UpdateUserInput } from "../types/user.types";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async findOrCreateUser(
    supabaseId: string,
    email: string,
    name?: string,
    avatar?: string,
  ) {
    let user = await this.userRepository.findUnique({ supabaseId });

    if (!user) {
      const existingUserByEmail = await this.userRepository.findUnique({
        email,
      });

      if (existingUserByEmail) {
        user = await this.userRepository.updateById(existingUserByEmail.id, {
          supabaseId,
          name: name || undefined,
          avatar: avatar || undefined,
        });
      } else {
        user = await this.userRepository.create({
          supabaseId,
          email,
          name,
          avatar,
        });
      }
    }

    return user;
  }

  async getUserBySupabaseId(supabaseId: string) {
    const user = await this.userRepository.findUnique({ supabaseId });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async findByEmail(email: string) {
    return this.userRepository.findUnique({ email });
  }

  async updateUser(supabaseId: string, data: UpdateUserInput) {
    const user = await this.userRepository.findUnique({ supabaseId });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return this.userRepository.update(supabaseId, data);
  }

  async deleteUser(supabaseId: string) {
    const { supabaseAdmin } = await import("../lib/supabase");

    const user = await this.userRepository.findUnique({ supabaseId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    await this.userRepository.delete(supabaseId);

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(supabaseId);
      if (error) {
        console.error(
          `Failed to delete user ${supabaseId} from Supabase Auth:`,
          error,
        );
      }
    } else {
      console.warn("Supabase Admin not configured. Skipping Auth deletion.");
    }
  }
}
