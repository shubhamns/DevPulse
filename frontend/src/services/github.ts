import type { GitHubIntegration, GitHubRepository } from "@/types/github";
import { apiRequest } from "@/lib/http";

export async function fetchGitHubStatus(
  organizationId: string,
): Promise<{ configured: boolean; integration: GitHubIntegration | null }> {
  const params = new URLSearchParams({ organizationId });
  return apiRequest<{ configured: boolean; integration: GitHubIntegration | null }>(
    `/api/v1/github/status?${params.toString()}`,
  );
}

export async function startGitHubConnect(organizationId: string): Promise<string> {
  const params = new URLSearchParams({ organizationId });
  const response = await apiRequest<{ authorizeUrl: string }>(
    `/api/v1/github/connect?${params.toString()}`,
  );
  return response.authorizeUrl;
}

export async function fetchGitHubRepositories(
  organizationId: string,
): Promise<GitHubRepository[]> {
  const params = new URLSearchParams({ organizationId });
  const response = await apiRequest<{ repositories: GitHubRepository[] }>(
    `/api/v1/github/repositories?${params.toString()}`,
  );
  return response.repositories;
}

export async function setGitHubRepository(
  organizationId: string,
  owner: string,
  repo: string,
): Promise<GitHubIntegration> {
  const response = await apiRequest<{ integration: GitHubIntegration }>("/api/v1/github/repository", {
    method: "PUT",
    data: { organizationId, owner, repo },
  });
  return response.integration;
}
