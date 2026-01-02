import { TeamRepository } from "../repositories/team.repository";

export class TeamService {
  private teamRepository: TeamRepository;

  constructor() {
    this.teamRepository = new TeamRepository();
  }

  async createTeam(name: string, projectIds: string[], memberIds: string[]) {
    if (!name) {
      throw new Error("Team name is required");
    }

    return this.teamRepository.create({
      name,
      projectIds,
      memberIds,
    });
  }

  async getTeamById(id: string) {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new Error("Team not found");
    }
    return team;
  }

  async getProjectTeams(projectId: string) {
    return this.teamRepository.findByProjectId(projectId);
  }

  async getUserTeams(userId: string) {
    return this.teamRepository.findByMemberId(userId);
  }

  async getAllTeams() {
    return this.teamRepository.findAll();
  }

  async updateTeam(
    id: string,
    data: { name?: string; memberIds?: string[]; projectIds?: string[] },
  ) {
    return this.teamRepository.update(id, data);
  }

  async deleteTeam(id: string) {
    return this.teamRepository.delete(id);
  }

  async syncProjectTeamRelationships() {
    return this.teamRepository.syncProjectTeamRelationships();
  }

  async getTeamOverviewStats(teamId: string, projectId?: string) {
    return this.teamRepository.getTeamOverviewStats(teamId, projectId);
  }

  async getTeamMemberStats(teamId: string) {
    return this.teamRepository.getTeamMemberStats(teamId);
  }
  async getTopEarningProjects(teamId: string, range?: string) {
    return this.teamRepository.getTopEarningProjects(teamId, range);
  }

  async getYearlyIncomeOverview(teamId: string, year: number) {
    return this.teamRepository.getYearlyIncomeOverview(teamId, year);
  }
}
