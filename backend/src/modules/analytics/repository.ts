import { Types } from "mongoose";
import { ErrorEvent } from "../../models/ErrorEvent.js";
import { Issue } from "../../models/Issue.js";
import { Project } from "../../models/Project.js";

export class AnalyticsRepository {
  countIssues(scope: Record<string, unknown>, extra: Record<string, unknown> = {}) {
    return Issue.countDocuments({ ...scope, ...extra });
  }

  countEvents(scope: Record<string, unknown>, extra: Record<string, unknown> = {}) {
    return ErrorEvent.countDocuments({ ...scope, ...extra });
  }

  affectedUsers(scope: Record<string, unknown>) {
    return Issue.aggregate<{ total: number }>([
      { $match: { ...scope, status: "open" } },
      { $group: { _id: null, total: { $sum: "$affectedUserCount" } } },
    ]);
  }

  issuesBySeverity(scope: Record<string, unknown>) {
    return Issue.aggregate<{ _id: string; count: number }>([
      { $match: scope },
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]);
  }

  topIssues(scope: Record<string, unknown>, limit = 5) {
    return Issue.find(scope).sort({ occurrenceCount: -1 }).limit(limit).lean();
  }

  findProjects(organizationIds: string[]) {
    return Project.find({
      organizationId: { $in: organizationIds.map((id) => new Types.ObjectId(id)) },
    }).lean();
  }

  eventsOverTime(scope: Record<string, unknown>, from: Date) {
    return ErrorEvent.aggregate<{ _id: string; count: number }>([
      { $match: { ...scope, receivedAt: { $gte: from } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$receivedAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  eventsByProject(scope: Record<string, unknown>, from: Date) {
    return ErrorEvent.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { ...scope, receivedAt: { $gte: from } } },
      { $group: { _id: "$projectId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);
  }

  eventsByEnvironment(scope: Record<string, unknown>, from: Date) {
    return ErrorEvent.aggregate<{ _id: string; count: number }>([
      { $match: { ...scope, receivedAt: { $gte: from } } },
      { $group: { _id: "$environment", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
  }
}
