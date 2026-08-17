import type { IssueSeverity } from "@/types/issue";

export type AiAnalysis = {
  id: string;
  issueId: string;
  summary: string;
  rootCause: string;
  severity: IssueSeverity;
  explanation: string;
  suggestedFix: string;
  confidence: number;
  testSuggestions: string[];
  model: string;
  createdAt: string;
  updatedAt: string;
};
