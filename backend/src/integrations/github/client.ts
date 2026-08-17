import type { Env } from "../../config/env.js";
import { AppError } from "../../utils/errors.js";

type GitHubTokenResponse = {
  access_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GitHubUser = {
  id: number;
  login: string;
  avatar_url: string;
};

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  private: boolean;
};

type GitHubOrg = {
  login: string;
};

type GitHubIssue = {
  number: number;
  html_url: string;
  title: string;
};

export type GitHubRepositoryOption = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
};

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_API_BASE = "https://api.github.com";

export class GitHubClient {
  constructor(private readonly env: Env) {}

  isConfigured(): boolean {
    return Boolean(this.env.GITHUB_CLIENT_ID && this.env.GITHUB_CLIENT_SECRET);
  }

  buildAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.env.GITHUB_CLIENT_ID,
      redirect_uri: this.env.GITHUB_CALLBACK_URL,
      scope: "repo",
      state,
    });

    return `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string; scopes: string[] }> {
    const response = await fetch(GITHUB_TOKEN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: this.env.GITHUB_CLIENT_ID,
        client_secret: this.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: this.env.GITHUB_CALLBACK_URL,
      }),
    });

    const payload = (await response.json()) as GitHubTokenResponse;

    if (!response.ok || payload.error || !payload.access_token) {
      throw new AppError(
        502,
        "GITHUB_OAUTH_FAILED",
        payload.error_description ?? payload.error ?? "Unable to complete GitHub OAuth",
      );
    }

    return {
      accessToken: payload.access_token,
      scopes: payload.scope?.split(",").map((scope) => scope.trim()).filter(Boolean) ?? [],
    };
  }

  async getAuthenticatedUser(accessToken: string): Promise<GitHubUser> {
    return this.request<GitHubUser>(accessToken, "/user");
  }

  async listRepositories(accessToken: string): Promise<GitHubRepositoryOption[]> {
    const [userRepos, orgs] = await Promise.all([
      this.request<GitHubRepo[]>(accessToken, "/user/repos?per_page=100&sort=updated"),
      this.request<GitHubOrg[]>(accessToken, "/user/orgs?per_page=100"),
    ]);

    const repoMap = new Map<string, GitHubRepositoryOption>();

    for (const repo of userRepos) {
      repoMap.set(repo.full_name, {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        private: repo.private,
      });
    }

    for (const org of orgs) {
      const orgRepos = await this.request<GitHubRepo[]>(
        accessToken,
        `/orgs/${encodeURIComponent(org.login)}/repos?per_page=100&sort=updated`,
      );

      for (const repo of orgRepos) {
        repoMap.set(repo.full_name, {
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          owner: repo.owner.login,
          private: repo.private,
        });
      }
    }

    return Array.from(repoMap.values()).sort((left, right) =>
      left.fullName.localeCompare(right.fullName),
    );
  }

  async createIssue(
    accessToken: string,
    owner: string,
    repo: string,
    title: string,
    body: string,
  ): Promise<{ number: number; url: string }> {
    const issue = await this.request<GitHubIssue>(
      accessToken,
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`,
      {
        method: "POST",
        body: JSON.stringify({ title, body }),
      },
    );

    return {
      number: issue.number,
      url: issue.html_url,
    };
  }

  private async request<T>(
    accessToken: string,
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${GITHUB_API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      throw new AppError(
        response.status === 404 ? 404 : 502,
        "GITHUB_API_ERROR",
        payload.message ?? "GitHub API request failed",
      );
    }

    return (await response.json()) as T;
  }
}
