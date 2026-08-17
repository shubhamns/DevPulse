import { Types } from "mongoose";
import { AppError } from "../../utils/errors.js";
import { uniqueSlug } from "../../utils/slug.js";
import { ApiKeyRepository } from "../apiKeys/repository.js";
import { OrganizationService } from "../organizations/service.js";
import { ProjectRepository } from "./repository.js";
import type { CreateProjectInput, UpdateProjectInput } from "./validators.js";

function serializeProject(project: {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  name: string;
  slug: string;
  environment: string;
  release?: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: project._id.toString(),
    organizationId: project.organizationId.toString(),
    name: project.name,
    slug: project.slug,
    environment: project.environment,
    release: project.release ?? "",
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export class ProjectService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly projects = new ProjectRepository(),
    private readonly apiKeys = new ApiKeyRepository(),
  ) {}

  async listForUser(userId: string, organizationId?: string) {
    const memberships = await this.organizationService.listForUser(userId);
    const organizationIds = organizationId
      ? memberships.filter((membership) => membership.id === organizationId).map((membership) => membership.id)
      : memberships.map((membership) => membership.id);

    if (organizationId && organizationIds.length === 0) {
      throw new AppError(403, "FORBIDDEN", "You do not have access to this organization");
    }

    const projects = await this.projects.findByOrganizationIds(organizationIds);
    return projects.map((project) => serializeProject(project));
  }

  async getByIdForUser(userId: string, projectId: string) {
    const project = await this.requireProject(projectId);
    await this.organizationService.requireMembership(userId, project.organizationId.toString());
    return serializeProject(project);
  }

  async createForUser(userId: string, input: CreateProjectInput) {
    await this.organizationService.requireWriteAccess(userId, input.organizationId);
    const organizationId = new Types.ObjectId(input.organizationId);

    const slug = await uniqueSlug(input.name, async (candidate) =>
      Boolean(await this.projects.findByOrgAndSlug(organizationId, candidate)),
    );

    const project = await this.projects.create({
      organizationId,
      name: input.name,
      slug,
      environment: input.environment,
      release: input.release ?? "",
    });

    return serializeProject(project);
  }

  async updateForUser(userId: string, projectId: string, input: UpdateProjectInput) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    const project = await this.projects.findById(projectId);

    if (!project) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    await this.organizationService.requireWriteAccess(userId, project.organizationId.toString());

    if (input.name !== undefined) {
      project.name = input.name;
      project.slug = await uniqueSlug(input.name, async (candidate) =>
        Boolean(await this.projects.findByOrgAndSlug(project.organizationId, candidate, project._id)),
      );
    }

    if (input.environment !== undefined) {
      project.environment = input.environment;
    }

    if (input.release !== undefined) {
      project.release = input.release;
    }

    await project.save();
    return serializeProject(project);
  }

  async deleteForUser(userId: string, projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    const project = await this.projects.findById(projectId);

    if (!project) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    await this.organizationService.requireWriteAccess(userId, project.organizationId.toString());
    await this.apiKeys.revokeAllForProject(project._id);
    await project.deleteOne();
    return { deleted: true };
  }

  private async requireProject(projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    const project = await this.projects.findByIdLean(projectId);

    if (!project) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    return project;
  }
}
