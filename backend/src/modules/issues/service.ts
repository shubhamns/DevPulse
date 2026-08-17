import { Types } from "mongoose";
import { AppError } from "../../utils/errors.js";
import type { IngestEventInput } from "../events/validators.js";
import { EventRepository } from "../events/repository.js";
import { OrganizationService } from "../organizations/service.js";
import { ProjectRepository } from "../projects/repository.js";
import { IssueRepository } from "./repository.js";
import type { IssueSeverity, IssueStatus } from "../../models/Issue.js";

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000;
}

function serializeIssue(issue: {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  projectId: Types.ObjectId;
  fingerprint: string;
  title: string;
  severity: string;
  status: string;
  occurrenceCount: number;
  affectedUserCount: number;
  environment: string;
  release?: string | null;
  errorName?: string | null;
  errorMessage?: string | null;
  stackTrace?: string | null;
  url?: string | null;
  githubIssueUrl?: string | null;
  githubIssueNumber?: number | null;
  firstSeen: Date;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: issue._id.toString(),
    organizationId: issue.organizationId.toString(),
    projectId: issue.projectId.toString(),
    fingerprint: issue.fingerprint,
    title: issue.title,
    severity: issue.severity,
    status: issue.status,
    occurrenceCount: issue.occurrenceCount,
    affectedUserCount: issue.affectedUserCount,
    environment: issue.environment,
    release: issue.release ?? "",
    errorName: issue.errorName ?? "",
    errorMessage: issue.errorMessage ?? "",
    stackTrace: issue.stackTrace ?? "",
    url: issue.url ?? "",
    githubIssueUrl: issue.githubIssueUrl ?? "",
    githubIssueNumber: issue.githubIssueNumber ?? null,
    firstSeen: issue.firstSeen.toISOString(),
    lastSeen: issue.lastSeen.toISOString(),
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
  };
}

export type IssueListFilters = {
  projectId?: string | undefined;
  severity?: IssueSeverity | undefined;
  environment?: string | undefined;
  status?: IssueStatus | undefined;
  search?: string | undefined;
  fromDate?: string | undefined;
  toDate?: string | undefined;
};

export class IssueService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly issues = new IssueRepository(),
    private readonly events = new EventRepository(),
    private readonly projects = new ProjectRepository(),
  ) {}

  async listForUser(userId: string, filters: IssueListFilters = {}) {
    const memberships = await this.organizationService.listForUser(userId);
    const organizationIds = memberships.map((membership) => membership.id);

    if (organizationIds.length === 0) {
      return [];
    }

    const query: Record<string, unknown> = {
      organizationId: { $in: organizationIds.map((id) => new Types.ObjectId(id)) },
    };

    if (filters.projectId) {
      if (!Types.ObjectId.isValid(filters.projectId)) {
        return [];
      }

      const project = await this.projects.findByIdLean(filters.projectId);

      if (!project) {
        return [];
      }

      await this.organizationService.requireMembership(userId, project.organizationId.toString());
      query.projectId = new Types.ObjectId(filters.projectId);
    }

    if (filters.severity) query.severity = filters.severity;
    if (filters.environment) query.environment = filters.environment;
    if (filters.status) query.status = filters.status;
    if (filters.search) query.title = { $regex: filters.search, $options: "i" };

    if (filters.fromDate || filters.toDate) {
      const lastSeen: Record<string, Date> = {};
      if (filters.fromDate) lastSeen.$gte = new Date(filters.fromDate);
      if (filters.toDate) lastSeen.$lte = new Date(filters.toDate);
      query.lastSeen = lastSeen;
    }

    const issues = await this.issues.find(query);
    return issues.map((issue) => serializeIssue(issue));
  }

  async getByIdForUser(userId: string, issueId: string) {
    const issue = await this.requireIssue(issueId, true);
    await this.organizationService.requireMembership(userId, issue.organizationId.toString());
    return serializeIssue(issue);
  }

  async getEventsForUser(userId: string, issueId: string) {
    const issue = await this.requireIssue(issueId, true);
    await this.organizationService.requireMembership(userId, issue.organizationId.toString());
    const events = await this.events.findByIssue(issueId);
    const latestEvent = events[0] ?? null;

    return {
      events: events.map((event) => ({
        id: event._id.toString(),
        type: event.type,
        message: event.message,
        level: event.level,
        environment: event.environment,
        release: event.release ?? "",
        url: event.url ?? "",
        browser: event.browser ?? "",
        os: event.os ?? "",
        user: event.user ?? null,
        context: event.context ?? null,
        breadcrumbs: event.breadcrumbs ?? [],
        receivedAt: event.receivedAt.toISOString(),
      })),
      latestContext: latestEvent?.context ?? null,
      latestBreadcrumbs: latestEvent?.breadcrumbs ?? [],
    };
  }

  async updateForUser(
    userId: string,
    issueId: string,
    input: { status?: IssueStatus | undefined; severity?: IssueSeverity | undefined },
  ) {
    const issue = await this.requireIssue(issueId, false);
    await this.organizationService.requireMembership(userId, issue.organizationId.toString());

    if (input.status !== undefined) issue.status = input.status;
    if (input.severity !== undefined) issue.severity = input.severity;

    await issue.save();
    return serializeIssue(issue);
  }

  async resolveForUser(userId: string, issueId: string) {
    return this.updateForUser(userId, issueId, { status: "resolved" });
  }

  async ignoreForUser(userId: string, issueId: string) {
    return this.updateForUser(userId, issueId, { status: "ignored" });
  }

  async upsertFromEvent(
    context: { organizationId: string; projectId: string },
    input: IngestEventInput,
    fingerprint: string,
    receivedAt: Date,
  ) {
    const projectId = new Types.ObjectId(context.projectId);
    const organizationId = new Types.ObjectId(context.organizationId);
    const existing = await this.issues.findByProjectAndFingerprint(projectId, fingerprint);

    if (existing) {
      await this.incrementExistingIssue(existing, input, receivedAt, input.user?.id);
      return { issue: existing, isNewIssue: false };
    }

    try {
      const issue = await this.issues.createFromEvent(
        { organizationId, projectId },
        input,
        fingerprint,
        receivedAt,
      );
      return { issue, isNewIssue: true };
    } catch (error) {
      if (!isDuplicateKeyError(error)) {
        throw error;
      }

      const issue = await this.issues.findByProjectAndFingerprint(projectId, fingerprint);

      if (!issue) {
        throw error;
      }

      await this.incrementExistingIssue(issue, input, receivedAt, input.user?.id);
      return { issue, isNewIssue: false };
    }
  }

  private async requireIssue(issueId: string, lean: true): Promise<NonNullable<Awaited<ReturnType<IssueRepository["findByIdLean"]>>>>;
  private async requireIssue(issueId: string, lean: false): Promise<NonNullable<Awaited<ReturnType<IssueRepository["findById"]>>>>;
  private async requireIssue(issueId: string, lean: boolean) {
    if (!Types.ObjectId.isValid(issueId)) {
      throw new AppError(404, "ISSUE_NOT_FOUND", "Issue not found");
    }

    const issue = lean ? await this.issues.findByIdLean(issueId) : await this.issues.findById(issueId);

    if (!issue) {
      throw new AppError(404, "ISSUE_NOT_FOUND", "Issue not found");
    }

    return issue;
  }

  private async incrementExistingIssue(
    issue: {
      occurrenceCount: number;
      affectedUserCount: number;
      affectedUserIds: string[];
      status: string;
      release?: string | null;
      errorName?: string | null;
      errorMessage?: string | null;
      stackTrace?: string | null;
      url?: string | null;
      lastSeen: Date;
      save: () => Promise<unknown>;
    },
    input: IngestEventInput,
    receivedAt: Date,
    userId?: string,
  ) {
    issue.occurrenceCount += 1;
    issue.lastSeen = receivedAt;
    issue.release = input.release ?? issue.release ?? "";
    if (input.error?.name) issue.errorName = input.error.name;
    issue.errorMessage = input.error?.message ?? input.message;
    if (input.error?.stack) issue.stackTrace = input.error.stack;
    if (input.url) issue.url = input.url;
    if (issue.status !== "open") issue.status = "open";

    if (userId && !issue.affectedUserIds.includes(userId)) {
      issue.affectedUserIds.push(userId);
      issue.affectedUserCount += 1;
    }

    await issue.save();
  }
}
