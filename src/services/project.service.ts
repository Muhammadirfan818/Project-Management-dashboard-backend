import { AppError } from "../middlewares/error.middleware";

import { ProjectRepository } from "../repositories/project.repository";
import { TeamService } from "./team.service";
import { CreateProjectInput, UpdateProjectInput } from "../types/project.types";

export class ProjectService {
  private projectRepository: ProjectRepository;
  private teamService: TeamService;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.teamService = new TeamService();
  }

  async getUserProjects(userId: string) {
    const projects = await this.projectRepository.findManyByUserId(userId);
    return this.projectRepository.enrichProjectsWithTeamProgress(projects);
  }

  async getAllProjects() {
    const projects = await this.projectRepository.findAll();
    return this.projectRepository.enrichProjectsWithTeamProgress(projects);
  }

  async getProjectById(projectId: string, userId: string) {
    const project = await this.projectRepository.findByIdAndUserId(
      projectId,
      userId,
    );

    if (!project) {
      throw new AppError("Project not found or access denied", 404);
    }

    const [enrichedProject] =
      await this.projectRepository.enrichProjectsWithTeamProgress([project]);
    return enrichedProject;
  }

  async createProject(data: CreateProjectInput, ownerId: string) {
    const project = await this.projectRepository.create(data, ownerId);

    const hasTeamIds = Array.isArray(data.teamIds) && data.teamIds.length > 0;
    if (!hasTeamIds) {
      const team = await this.teamService.createTeam(
        "Development",
        [project.id],
        [ownerId],
      );

      await this.projectRepository.update(project.id, {
        teamIds: [team.id],
      });
    }
    return this.projectRepository.findByIdAndUserId(project.id, ownerId);
  }

  async updateProject(
    projectId: string,
    userId: string,
    data: UpdateProjectInput,
  ) {
    const project = await this.projectRepository.findByIdAndOwnerId(
      projectId,
      userId,
    );

    if (!project) {
      throw new AppError("Only project owner can update project", 403);
    }

    const updated = await this.projectRepository.update(projectId, data);

    return updated;
  }

  async deleteProject(projectId: string, userId: string) {
    const project = await this.projectRepository.findByIdAndOwnerId(
      projectId,
      userId,
    );

    if (!project) {
      throw new AppError("Only project owner can delete project", 403);
    }

    await this.projectRepository.delete(projectId);
  }

  async getAttachments(projectId: string, userId: string) {
    const project = await this.projectRepository.findByIdAndUserId(
      projectId,
      userId,
    );

    if (!project) {
      throw new AppError("Project not found or access denied", 404);
    }

    return this.projectRepository.findAttachments(projectId);
  }
}
