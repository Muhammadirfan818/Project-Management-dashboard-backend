import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../utils/response";
import { UpdateUserInput } from "../types/user.types";

const userService = new UserService();

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = req.user?.sub;
      if (!currentUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await userService.findOrCreateUser(
        currentUserId,
        req.user?.email || "",
        req.user?.name,
        req.user?.avatar,
      );

      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      sendSuccess(res, users);
    } catch (error) {
      next(error);
    }
  }

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

  async checkEmailExists(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await userService.findByEmail(email);

      res.json({ exists: !!user });
    } catch (error) {
      next(error);
    }
  }
}
