import { Types } from "mongoose";
import { OrganizationService } from "../organizations/service.js";
import { ProjectRepository } from "../projects/repository.js";
import { AnalyticsRepository } from "./repository.js";

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

export type AnalyticsFilters = {
  projectId?: string | undefined;
};

export class AnalyticsService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly analytics = new AnalyticsRepository(),
    private readonly projects = new ProjectRepository(),
  ) {}

  async getOverview(userId: string, filters: AnalyticsFilters = {}) {
    const organizationIds = await this.getScopedOrganizationIds(userId, filters.projectId);

    if (organizationIds.length === 0) {
      return this.emptyOverview();
    }

    const scope = this.buildScopeQuery(organizationIds, filters.projectId);
    const today = startOfToday();
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = daysAgo(6);

    const [
      totalIssues,
      criticalIssues,
      errorsToday,
      errorsLast24Hours,
      affectedUsersAgg,
      newIssues,
      issuesBySeverity,
      topIssues,
      projects,
    ] = await Promise.all([
      this.analytics.countIssues(scope),
      this.analytics.countIssues(scope, { severity: { $in: ["critical", "high"] }, status: "open" }),
      this.analytics.countEvents(scope, { receivedAt: { $gte: today } }),
      this.analytics.countEvents(scope, { receivedAt: { $gte: last24Hours } }),
      this.analytics.affectedUsers(scope),
      this.analytics.countIssues(scope, { firstSeen: { $gte: today } }),
      this.analytics.issuesBySeverity(scope),
      this.analytics.topIssues(scope),
      this.analytics.findProjects(organizationIds),
    ]);

    const [errorsOverTime, errorsByProject, errorsByEnvironment] = await Promise.all([
      this.analytics.eventsOverTime(scope, sevenDaysAgo),
      this.analytics.eventsByProject(scope, sevenDaysAgo),
      this.analytics.eventsByEnvironment(scope, sevenDaysAgo),
    ]);

    const projectNameById = new Map(projects.map((project) => [project._id.toString(), project.name]));

    return {
      cards: {
        totalIssues,
        criticalIssues,
        errorsToday,
        errorRate: Number((errorsLast24Hours / 24).toFixed(2)),
        affectedUsers: affectedUsersAgg[0]?.total ?? 0,
        newIssues,
      },
      charts: {
        errorsOverTime: errorsOverTime.map((item) => ({ date: item._id, count: item.count })),
        issuesBySeverity: issuesBySeverity.map((item) => ({ severity: item._id, count: item.count })),
        topFingerprints: topIssues.map((issue) => ({
          fingerprint: issue.fingerprint.slice(0, 12),
          title: issue.title,
          count: issue.occurrenceCount,
        })),
        errorsByProject: errorsByProject.map((item) => ({
          projectId: item._id.toString(),
          projectName: projectNameById.get(item._id.toString()) ?? "Unknown",
          count: item.count,
        })),
        errorsByEnvironment: errorsByEnvironment.map((item) => ({
          environment: item._id,
          count: item.count,
        })),
      },
    };
  }

  private async getScopedOrganizationIds(userId: string, projectId?: string) {
    const memberships = await this.organizationService.listForUser(userId);
    let organizationIds = memberships.map((membership) => membership.id);

    if (projectId) {
      if (!Types.ObjectId.isValid(projectId)) {
        return [];
      }

      const project = await this.projects.findByIdLean(projectId);

      if (!project) {
        return [];
      }

      await this.organizationService.requireMembership(userId, project.organizationId.toString());
      organizationIds = organizationIds.filter((id) => id === project.organizationId.toString());
    }

    return organizationIds;
  }

  private buildScopeQuery(organizationIds: string[], projectId?: string) {
    const query: Record<string, unknown> = {
      organizationId: { $in: organizationIds.map((id) => new Types.ObjectId(id)) },
    };

    if (projectId && Types.ObjectId.isValid(projectId)) {
      query.projectId = new Types.ObjectId(projectId);
    }

    return query;
  }

  private emptyOverview() {
    return {
      cards: {
        totalIssues: 0,
        criticalIssues: 0,
        errorsToday: 0,
        errorRate: 0,
        affectedUsers: 0,
        newIssues: 0,
      },
      charts: {
        errorsOverTime: [],
        issuesBySeverity: [],
        topFingerprints: [],
        errorsByProject: [],
        errorsByEnvironment: [],
      },
    };
  }
}
