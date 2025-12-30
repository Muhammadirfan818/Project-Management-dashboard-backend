import { TeamRepository } from "../repositories/team.repository";

export class TeamService {
  private teamRepository: TeamRepository;

  constructor() {
    this.teamRepository = new TeamRepository();
  }

  async createTeam(name: string, projectIds: string[], memberIds: string[]) {
    // Validate inputs
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
    data: { name?: string; memberIds?: string[]; projectIds?: string[] }
  ) {
    return this.teamRepository.update(id, data);
  }

  async deleteTeam(id: string) {
    return this.teamRepository.delete(id);
  }

  /**
   * Synchronize project-team bidirectional relationships.
   * Finds all projects with teamIds and ensures those teams have the project in their projectIds.
   */
  async syncProjectTeamRelationships() {
    return this.teamRepository.syncProjectTeamRelationships();
  }
}
