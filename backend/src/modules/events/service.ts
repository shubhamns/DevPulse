import { Types } from "mongoose";
import type { Env } from "../../config/env.js";
import type { ApiKeyContext } from "../../middleware/apiKey.js";
import { buildFingerprint, buildMessageFingerprint } from "../../utils/fingerprint.js";
import { AiAnalysisService } from "../issues/aiService.js";
import { IssueService } from "../issues/service.js";
import { OrganizationService } from "../organizations/service.js";
import { EventRepository } from "./repository.js";
import type { IngestEventInput } from "./validators.js";

export class EventService {
  constructor(
    env: Env,
    private readonly events = new EventRepository(),
    private readonly issueService = new IssueService(new OrganizationService()),
    private readonly aiAnalysisService = new AiAnalysisService(env, new OrganizationService()),
  ) {}

  async ingest(context: ApiKeyContext, input: IngestEventInput) {
    const receivedAt = new Date();
    const fingerprint = this.resolveFingerprint(input);
    let issueId: Types.ObjectId | null = null;
    let isNewIssue = false;

    if (fingerprint) {
      const result = await this.issueService.upsertFromEvent(
        {
          organizationId: context.organizationId,
          projectId: context.projectId,
        },
        input,
        fingerprint,
        receivedAt,
      );

      issueId = result.issue._id;
      isNewIssue = result.isNewIssue;

      if (isNewIssue && input.type === "exception") {
        this.aiAnalysisService.scheduleAnalysisForNewIssue(issueId.toString());
      }
    }

    const event = await this.events.create({
      organizationId: context.organizationId,
      projectId: context.projectId,
      apiKeyId: context.apiKeyId,
      issueId,
      fingerprint,
      input,
      receivedAt,
    });

    return {
      id: event._id.toString(),
      type: event.type,
      message: event.message,
      issueId: event.issueId?.toString() ?? null,
      fingerprint: event.fingerprint ?? null,
      receivedAt: event.receivedAt.toISOString(),
      isNewIssue,
    };
  }

  private resolveFingerprint(input: IngestEventInput): string | null {
    if (input.type === "test") {
      return null;
    }

    if (input.type === "exception") {
      return buildFingerprint({
        errorName: input.error?.name,
        errorMessage: input.error?.message ?? input.message,
        stackTrace: input.error?.stack,
      });
    }

    return buildMessageFingerprint(input.message);
  }
}
