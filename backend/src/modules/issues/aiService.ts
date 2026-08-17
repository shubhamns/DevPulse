import type { Env } from "../../config/env.js";
import { OpenAiClient } from "../../integrations/openai/client.js";
import type { IssueSeverity } from "../../models/Issue.js";
import { AppError } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";
import { EventRepository } from "../events/repository.js";
import { OrganizationService } from "../organizations/service.js";
import { IssueRepository } from "./repository.js";

function serializeAnalysis(analysis: {
  _id: { toString(): string };
  issueId: { toString(): string };
  summary: string;
  rootCause: string;
  severity: string;
  explanation: string;
  suggestedFix: string;
  confidence: number;
  testSuggestions: string[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: analysis._id.toString(),
    issueId: analysis.issueId.toString(),
    summary: analysis.summary,
    rootCause: analysis.rootCause,
    severity: analysis.severity,
    explanation: analysis.explanation,
    suggestedFix: analysis.suggestedFix,
    confidence: analysis.confidence,
    testSuggestions: analysis.testSuggestions,
    model: analysis.model,
    createdAt: analysis.createdAt.toISOString(),
    updatedAt: analysis.updatedAt.toISOString(),
  };
}

export class AiAnalysisService {
  private readonly openAi: OpenAiClient;

  constructor(
    private readonly env: Env,
    private readonly organizationService: OrganizationService,
    private readonly issues = new IssueRepository(),
    private readonly events = new EventRepository(),
  ) {
    this.openAi = new OpenAiClient(env);
  }

  async getForIssue(userId: string, issueId: string) {
    const issue = await this.requireIssue(userId, issueId);
    const analysis = await this.issues.findAnalysisByIssue(issue._id);
    return analysis ? serializeAnalysis(analysis) : null;
  }

  async analyzeIssue(userId: string | null, issueId: string, force = false) {
    const issue = await this.requireIssue(userId, issueId);

    if (!force) {
      const existing = await this.issues.findAnalysisByIssue(issue._id);
      if (existing) {
        return serializeAnalysis(existing);
      }
    }

    if (!this.openAi.isConfigured()) {
      throw new AppError(503, "AI_UNAVAILABLE", "AI analysis is not configured on the server");
    }

    const latestEvent = await this.events.findLatestByIssue(issue._id);
    const result = await this.openAi.analyzeIncident({
      errorMessage: issue.errorMessage ?? issue.title,
      errorName: issue.errorName ?? undefined,
      stackTrace: issue.stackTrace ?? undefined,
      environment: issue.environment,
      release: issue.release ?? "",
      url: issue.url ?? undefined,
      breadcrumbs: (latestEvent?.breadcrumbs ?? []).map((crumb) => ({
        category: crumb.category,
        message: crumb.message,
        level: crumb.level,
      })),
      context:
        latestEvent?.context && typeof latestEvent.context === "object"
          ? (latestEvent.context as Record<string, unknown>)
          : null,
    });

    issue.severity = result.severity as IssueSeverity;
    await issue.save();

    const analysis = await this.issues.upsertAnalysis(issue, {
      summary: result.summary,
      rootCause: result.rootCause,
      severity: result.severity,
      explanation: result.explanation,
      suggestedFix: result.suggestedFix,
      confidence: result.confidence,
      testSuggestions: result.testSuggestions,
      model: this.env.OPENAI_MODEL,
    });

    if (!analysis) {
      throw new AppError(500, "INTERNAL_ERROR", "Unable to store AI analysis");
    }

    return serializeAnalysis(analysis);
  }

  scheduleAnalysisForNewIssue(issueId: string): void {
    if (!this.openAi.isConfigured()) {
      return;
    }

    void this.analyzeIssue(null, issueId, false).catch((error: unknown) => {
      logger.error("Background AI analysis failed", {
        issueId,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }

  private async requireIssue(userId: string | null, issueId: string) {
    const issue = await this.issues.findById(issueId);

    if (!issue) {
      throw new AppError(404, "ISSUE_NOT_FOUND", "Issue not found");
    }

    if (userId) {
      await this.organizationService.requireMembership(userId, issue.organizationId.toString());
    }

    return issue;
  }
}
