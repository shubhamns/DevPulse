import { Types } from "mongoose";
import { ErrorEvent } from "../../models/ErrorEvent.js";
import type { IngestEventInput } from "./validators.js";

export class EventRepository {
  create(data: {
    organizationId: string;
    projectId: string;
    apiKeyId: string;
    issueId: Types.ObjectId | null;
    fingerprint: string | null;
    input: IngestEventInput;
    receivedAt: Date;
  }) {
    return ErrorEvent.create({
      organizationId: new Types.ObjectId(data.organizationId),
      projectId: new Types.ObjectId(data.projectId),
      apiKeyId: new Types.ObjectId(data.apiKeyId),
      issueId: data.issueId,
      fingerprint: data.fingerprint,
      type: data.input.type,
      message: data.input.message,
      level: data.input.level ?? (data.input.type === "exception" ? "error" : "info"),
      errorName: data.input.error?.name,
      errorMessage: data.input.error?.message,
      stackTrace: data.input.error?.stack,
      environment: data.input.environment,
      release: data.input.release ?? "",
      url: data.input.url,
      browser: data.input.browser,
      os: data.input.os,
      user: data.input.user,
      context: data.input.context,
      breadcrumbs: data.input.breadcrumbs ?? [],
      sdkName: data.input.sdk.name,
      sdkVersion: data.input.sdk.version,
      clientTimestamp: new Date(data.input.timestamp),
      receivedAt: data.receivedAt,
    });
  }

  findByIssue(issueId: string, limit = 50) {
    return ErrorEvent.find({ issueId: new Types.ObjectId(issueId) })
      .sort({ receivedAt: -1 })
      .limit(limit)
      .lean();
  }

  findLatestByIssue(issueId: Types.ObjectId) {
    return ErrorEvent.findOne({ issueId }).sort({ receivedAt: -1 }).lean();
  }
}
