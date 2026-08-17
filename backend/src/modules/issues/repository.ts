import { Types } from "mongoose";
import { AiAnalysis } from "../../models/AiAnalysis.js";
import { Issue, type IssueSeverity, type IssueStatus } from "../../models/Issue.js";
import type { IngestEventInput } from "../events/validators.js";

export class IssueRepository {
  find(query: Record<string, unknown>, limit = 200) {
    return Issue.find(query).sort({ lastSeen: -1 }).limit(limit).lean();
  }

  findById(id: string) {
    return Issue.findById(id);
  }

  findByIdLean(id: string) {
    return Issue.findById(id).lean();
  }

  findByProjectAndFingerprint(projectId: Types.ObjectId, fingerprint: string) {
    return Issue.findOne({ projectId, fingerprint });
  }

  createFromEvent(
    context: { organizationId: Types.ObjectId; projectId: Types.ObjectId },
    input: IngestEventInput,
    fingerprint: string,
    receivedAt: Date,
  ) {
    const userId = input.user?.id;

    return Issue.create({
      organizationId: context.organizationId,
      projectId: context.projectId,
      fingerprint,
      title: input.message,
      severity: "medium",
      status: "open",
      occurrenceCount: 1,
      affectedUserCount: userId ? 1 : 0,
      affectedUserIds: userId ? [userId] : [],
      environment: input.environment,
      release: input.release ?? "",
      errorName: input.error?.name,
      errorMessage: input.error?.message ?? input.message,
      stackTrace: input.error?.stack,
      url: input.url,
      firstSeen: receivedAt,
      lastSeen: receivedAt,
    });
  }

  findAnalysisByIssue(issueId: Types.ObjectId) {
    return AiAnalysis.findOne({ issueId }).lean();
  }

  upsertAnalysis(issue: {
    _id: Types.ObjectId;
    organizationId: Types.ObjectId;
    projectId: Types.ObjectId;
  }, data: {
    summary: string;
    rootCause: string;
    severity: IssueSeverity;
    explanation: string;
    suggestedFix: string;
    confidence: number;
    testSuggestions: string[];
    model: string;
  }) {
    return AiAnalysis.findOneAndUpdate(
      { issueId: issue._id },
      {
        issueId: issue._id,
        organizationId: issue.organizationId,
        projectId: issue.projectId,
        ...data,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
  }
}

export type { IssueSeverity, IssueStatus };
