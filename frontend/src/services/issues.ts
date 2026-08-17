import type { GitHubIssueLink } from "@/types/github";
import type { AiAnalysis } from "@/types/aiAnalysis";
import type { Issue, IssueEventsResponse, IssueFilters } from "@/types/issue";
import { apiRequest } from "@/lib/http";

function toQuery(filters: IssueFilters = {}): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchIssues(filters?: IssueFilters): Promise<Issue[]> {
  const response = await apiRequest<{ issues: Issue[] }>(`/api/v1/issues${toQuery(filters)}`);
  return response.issues;
}

export async function fetchIssue(
  issueId: string,
): Promise<{ issue: Issue; analysis: AiAnalysis | null }> {
  return apiRequest<{ issue: Issue; analysis: AiAnalysis | null }>(`/api/v1/issues/${issueId}`);
}

export async function fetchIssueEvents(issueId: string): Promise<IssueEventsResponse> {
  return apiRequest<IssueEventsResponse>(`/api/v1/issues/${issueId}/events`);
}

export async function resolveIssue(issueId: string): Promise<Issue> {
  const response = await apiRequest<{ issue: Issue }>(`/api/v1/issues/${issueId}/resolve`, {
    method: "POST",
  });
  return response.issue;
}

export async function createGitHubIssue(issueId: string): Promise<GitHubIssueLink> {
  const response = await apiRequest<{ githubIssue: GitHubIssueLink }>(
    `/api/v1/issues/${issueId}/github-issue`,
    { method: "POST" },
  );
  return response.githubIssue;
}

export async function analyzeIssue(issueId: string): Promise<AiAnalysis> {
  const response = await apiRequest<{ analysis: AiAnalysis }>(`/api/v1/issues/${issueId}/analyze`, {
    method: "POST",
  });
  return response.analysis;
}

export async function ignoreIssue(issueId: string): Promise<Issue> {
  const response = await apiRequest<{ issue: Issue }>(`/api/v1/issues/${issueId}/ignore`, {
    method: "POST",
  });
  return response.issue;
}
