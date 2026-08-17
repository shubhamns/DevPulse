import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import { parseInput } from "../../utils/validation.js";
import type { OrganizationService } from "./service.js";
import { createOrganizationSchema } from "./validators.js";

export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  list = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const organizations = await this.organizationService.listForUser(req.auth.userId);
    res.json({ organizations });
  };

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const organization = await this.organizationService.createForUser(
      req.auth.userId,
      parseInput(createOrganizationSchema, req.body),
    );
    res.status(201).json({ organization });
  };
}
