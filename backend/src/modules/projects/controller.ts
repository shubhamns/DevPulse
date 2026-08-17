import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import { routeParam } from "../../utils/asyncHandler.js";
import { parseInput } from "../../utils/validation.js";
import type { ProjectService } from "./service.js";
import { createProjectSchema, updateProjectSchema } from "./validators.js";

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  list = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const organizationId =
      typeof req.query.organizationId === "string" ? req.query.organizationId : undefined;
    const projects = await this.projectService.listForUser(req.auth.userId, organizationId);
    res.json({ projects });
  };

  getById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const project = await this.projectService.getByIdForUser(req.auth.userId, routeParam(req, "id"));
    res.json({ project });
  };

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const project = await this.projectService.createForUser(
      req.auth.userId,
      parseInput(createProjectSchema, req.body),
    );
    res.status(201).json({ project });
  };

  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const project = await this.projectService.updateForUser(
      req.auth.userId,
      routeParam(req, "id"),
      parseInput(updateProjectSchema, req.body),
    );
    res.json({ project });
  };

  remove = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.projectService.deleteForUser(req.auth.userId, routeParam(req, "id"));
    res.json(result);
  };
}
