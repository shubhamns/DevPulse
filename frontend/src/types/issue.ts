export type IssueSeverity = "low" | "medium" | "high" | "critical";
export type IssueStatus = "open" | "resolved" | "ignored";

export type Issue = {
  id: string;
  organizationId: string;
  projectId: string;
  fingerprint: string;
  title: string;
  severity: IssueSeverity;
  status: IssueStatus;
  occurrenceCount: number;
  affectedUserCount: number;
  environment: string;
  release: string;
  errorName: string;
  errorMessage: string;
  stackTrace: string;
  url: string;
  githubIssueUrl: string;
  githubIssueNumber: number | null;
  firstSeen: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
};

export type IssueEvent = {
  id: string;
  type: string;
  message: string;
  level: string;
  environment: string;
  release: string;
  url: string;
  browser: string;
  os: string;
  user: Record<string, unknown> | null;
  context: Record<string, unknown> | null;
  breadcrumbs: Array<{
    timestamp: string;
    category: string;
    message: string;
    level: string;
  }>;
  receivedAt: string;
};

export type IssueEventsResponse = {
  events: IssueEvent[];
  latestContext: Record<string, unknown> | null;
  latestBreadcrumbs: IssueEvent["breadcrumbs"];
};

export type IssueFilters = {
  projectId?: string;
  severity?: IssueSeverity;
  environment?: string;
  status?: IssueStatus;
  search?: string;
  fromDate?: string;
  toDate?: string;
};
