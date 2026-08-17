import { z } from "zod";

export const createApiKeySchema = z.object({
  label: z.string().trim().min(1).max(120).optional(),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
