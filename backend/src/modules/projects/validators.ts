import { z } from "zod";

export const createProjectSchema = z.object({
  organizationId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(120),
  environment: z.string().trim().min(1).max(64).default("production"),
  release: z.string().trim().max(64).optional(),
});

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    environment: z.string().trim().min(1).max(64).optional(),
    release: z.string().trim().max(64).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
