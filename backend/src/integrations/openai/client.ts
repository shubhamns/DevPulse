import type { Env } from "../../config/env.js";
import { AppError } from "../../utils/errors.js";
import { parseAiAnalysisResponse, type AiAnalysisResult } from "../../modules/issues/aiValidators.js";

export type AnalysisPromptInput = {
  errorMessage: string;
  errorName?: string | undefined;
  stackTrace?: string | undefined;
  environment: string;
  release: string;
  url?: string | undefined;
  breadcrumbs?: Array<{ category: string; message: string; level: string }> | undefined;
  context?: Record<string, unknown> | null | undefined;
};

function buildPrompt(input: AnalysisPromptInput): string {
  return [
    "You are DevPulse AI, an assistant that helps developers understand production incidents.",
    "Analyze the following production error and respond with JSON only.",
    "Do not include markdown fences.",
    "Use this exact JSON shape:",
    JSON.stringify(
      {
        summary: "short incident summary",
        rootCause: "likely root cause",
        severity: "low|medium|high|critical",
        explanation: "why this likely happened",
        suggestedFix: "recommended fix in plain language",
        confidence: 0,
        testSuggestions: ["test idea"],
      },
      null,
      2,
    ),
    "Important:",
    "- confidence must be a number from 0 to 100",
    "- suggestedFix must be guidance only; never tell the user to blindly execute code",
    "- testSuggestions must be an array of strings",
    "",
    "Incident payload:",
    JSON.stringify(input, null, 2),
  ].join("\n");
}

export class OpenAiClient {
  constructor(private readonly env: Env) {}

  isConfigured(): boolean {
    return Boolean(this.env.OPENAI_API_KEY && this.env.OPENAI_MODEL);
  }

  async analyzeIncident(input: AnalysisPromptInput): Promise<AiAnalysisResult> {
    if (!this.isConfigured()) {
      throw new AppError(
        503,
        "AI_UNAVAILABLE",
        "AI analysis is not configured on the server",
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.env.OPENAI_MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You analyze production software incidents and return strict JSON recommendations for developers.",
          },
          {
            role: "user",
            content: buildPrompt(input),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new AppError(502, "AI_REQUEST_FAILED", "Unable to analyze this issue right now");
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };

    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new AppError(502, "AI_REQUEST_FAILED", "AI returned an empty analysis");
    }

    try {
      return parseAiAnalysisResponse(JSON.parse(content));
    } catch {
      throw new AppError(502, "AI_RESPONSE_INVALID", "AI returned an invalid analysis payload");
    }
  }
}
