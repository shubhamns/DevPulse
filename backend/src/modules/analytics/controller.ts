import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import { parseInput } from "../../utils/validation.js";
import type { AnalyticsService } from "./service.js";
import { analyticsQuerySchema } from "./validators.js";

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  overview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const overview = await this.analyticsService.getOverview(
      req.auth.userId,
      parseInput(analyticsQuerySchema, req.query),
    );
    res.json(overview);
  };
}
