import { Request, Response, NextFunction } from "express";
import { TeamService } from "../services/team.service";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../utils/response";

const teamService = new TeamService();
const userService = new UserService();

export class TeamController {
  async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, projectIds = [], memberIds = [] } = req.body;
      const { sub: supabaseId } = req.user!;

      // Get the internal user ID from Supabase ID
      const user = await userService.getUserBySupabaseId(supabaseId);

      // Ensure the creator is always included in the team's memberIds
      const allMemberIds = memberIds.includes(user.id)
        ? memberIds
        : [...memberIds, user.id];

      const team = await teamService.createTeam(name, projectIds, allMemberIds);
      sendSuccess(res, team, "Team created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const team = await teamService.getTeamById(id);
      sendSuccess(res, team);
    } catch (error) {
      next(error);
    }
  }

  async getProjectTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const teams = await teamService.getProjectTeams(projectId);
      sendSuccess(res, teams);
    } catch (error) {
      next(error);
    }
  }

  async getUserTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub: userId } = req.user!;

      // Get internal user ID from Supabase ID
      const user = await userService.getUserBySupabaseId(userId);

      const teams = await teamService.getUserTeams(user.id);
      sendSuccess(res, teams);
    } catch (error) {
      next(error);
    }
  }

  async getAllTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const teams = await teamService.getAllTeams();
      sendSuccess(res, teams);
    } catch (error) {
      next(error);
    }
  }

  async updateTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const team = await teamService.updateTeam(id, req.body);
      sendSuccess(res, team, "Team updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await teamService.deleteTeam(id);
      sendSuccess(res, null, "Team deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * One-time sync endpoint to fix existing project-team relationships.
   * This repairs the bidirectional many-to-many link for projects created before the fix.
   */
  async syncProjectTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await teamService.syncProjectTeamRelationships();
      sendSuccess(
        res,
        result,
        "Project-Team relationships synchronized successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}
