import { z } from "zod";

export const analyticsQuerySchema = z.object({
  projectId: z.string().optional(),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
