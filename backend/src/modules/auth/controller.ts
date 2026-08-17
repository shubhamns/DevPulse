import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import { parseInput } from "../../utils/validation.js";
import type { AuthService } from "./service.js";
import {
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
} from "./validators.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const session = await this.authService.register(parseInput(registerSchema, req.body));
    res.status(201).json(session);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const session = await this.authService.login(parseInput(loginSchema, req.body));
    res.json(session);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = parseInput(refreshTokenSchema, req.body, 401);
    const session = await this.authService.refresh(refreshToken);
    res.json(session);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const parsed = logoutSchema.safeParse(req.body ?? {});
    await this.authService.logout(parsed.success ? parsed.data.refreshToken : undefined);
    res.status(204).send();
  };

  me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.authService.getMe(req.auth.userId);
    res.json(result);
  };
}
