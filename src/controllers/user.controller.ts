import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../utils/response";
import { UpdateUserInput } from "../types/user.types";

const userService = new UserService();

export class UserController {
  // Get user profile (create user if not exists)
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = req.user?.sub;
      if (!currentUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Ensure user exists, create if not
      const user = await userService.findOrCreateUser(
        currentUserId,
        req.user?.email || "",
        req.user?.name,
        req.user?.avatar
      );

      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  // Get all users
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      sendSuccess(res, users);
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = req.user?.sub;
      if (!currentUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const updateData: UpdateUserInput = req.body;
      const user = await userService.updateUser(currentUserId, updateData);

      sendSuccess(res, user, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  }

  // Delete user account
  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = req.user?.sub;
      if (!currentUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await userService.deleteUser(currentUserId);
      sendSuccess(res, null, "Account deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
