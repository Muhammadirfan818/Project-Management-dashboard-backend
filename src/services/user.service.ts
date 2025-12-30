import { AppError } from "../middlewares/error.middleware";
import { UserRepository } from "../repositories/user.repository";
import { CreateUserInput, UpdateUserInput } from "../types/user.types";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Find user by Supabase ID or create if not exists
  async findOrCreateUser(
    supabaseId: string,
    email: string,
    name?: string,
    avatar?: string
  ) {
    let user = await this.userRepository.findUnique({ supabaseId });

    if (!user) {
      // Check if user exists by email (to avoid unique constraint violation on email)
      const existingUserByEmail = await this.userRepository.findUnique({
        email,
      });

      if (existingUserByEmail) {
        // User exists but Supabase ID doesn't match/exist. Link the account.
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

  // Get user by Supabase ID
  async getUserBySupabaseId(supabaseId: string) {
    const user = await this.userRepository.findUnique({ supabaseId });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  // Get all users
  async getAllUsers() {
    return this.userRepository.findAll();
  }

  // Update existing user
  async updateUser(supabaseId: string, data: UpdateUserInput) {
    const user = await this.userRepository.findUnique({ supabaseId });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return this.userRepository.update(supabaseId, data);
  }

  // Delete user
  async deleteUser(supabaseId: string) {
    const user = await this.userRepository.findUnique({ supabaseId });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    await this.userRepository.delete(supabaseId);
  }
}
