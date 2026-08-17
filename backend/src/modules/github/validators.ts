import { z } from "zod";

export const githubConnectQuerySchema = z.object({
  organizationId: z.string().min(1),
});

export const githubIntegrationQuerySchema = z.object({
  organizationId: z.string().min(1),
});

export const githubRepositorySchema = z.object({
  organizationId: z.string().min(1),
  owner: z.string().min(1).max(120),
  repo: z.string().min(1).max(120),
});

export const githubCallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});
