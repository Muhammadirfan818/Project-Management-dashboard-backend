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

      const user = await userService.getUserBySupabaseId(supabaseId);

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

  async syncProjectTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await teamService.syncProjectTeamRelationships();
      sendSuccess(
        res,
        result,
        "Project-Team relationships synchronized successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async getTeamMemberStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await teamService.getTeamMemberStats(id);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getTeamOverviewStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const projectId = req.query.projectId as string | undefined;

      const stats = await teamService.getTeamOverviewStats(id, projectId);
      sendSuccess(res, stats);
    } catch (error: unknown) {
      next(error);
    }
  }

  async getTopEarningProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { range } = req.query;

      const data = await teamService.getTopEarningProjects(id, range as string);
      sendSuccess(res, data);
    } catch (error: unknown) {
      next(error);
    }
  }

  async getYearlyIncomeOverview(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const { year } = req.query;

      const parsedYear = year
        ? parseInt(year as string)
        : new Date().getFullYear();

      const data = await teamService.getYearlyIncomeOverview(id, parsedYear);
      sendSuccess(res, data);
    } catch (error: unknown) {
      next(error);
    }
  }
}
