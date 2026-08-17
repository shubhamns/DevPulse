import { z } from "zod";
import { issueSeverities } from "../../models/Issue.js";

export const aiAnalysisResponseSchema = z.object({
  summary: z.string().min(1),
  rootCause: z.string().min(1),
  severity: z.enum(issueSeverities),
  explanation: z.string().min(1),
  suggestedFix: z.string().min(1),
  confidence: z.number().min(0).max(100),
  testSuggestions: z.array(z.string()),
});

export type AiAnalysisResult = z.infer<typeof aiAnalysisResponseSchema>;

export function parseAiAnalysisResponse(raw: unknown): AiAnalysisResult {
  const parsed = aiAnalysisResponseSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((issue) => issue.message).join(", ") || "Invalid AI response",
    );
  }

  return parsed.data;
}
