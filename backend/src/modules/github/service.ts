import { Types } from "mongoose";
import type { Env } from "../../config/env.js";
import { GitHubClient } from "../../integrations/github/client.js";
import { buildGitHubIssueBody, buildGitHubIssueTitle } from "../../integrations/github/issueBody.js";
import { AppError } from "../../utils/errors.js";
import { signGitHubOAuthState, verifyGitHubOAuthState } from "../../utils/githubOAuthState.js";
import { decryptSecret, encryptSecret } from "../../utils/secretBox.js";
import { IssueRepository } from "../issues/repository.js";
import { OrganizationService } from "../organizations/service.js";
import { GitHubRepository } from "./repository.js";

function serializeIntegration(integration: {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  githubUserId: number;
  githubLogin: string;
  githubAvatarUrl?: string | null;
  selectedOwner?: string | null;
  selectedRepo?: string | null;
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: integration._id.toString(),
    organizationId: integration.organizationId.toString(),
    githubUserId: integration.githubUserId,
    githubLogin: integration.githubLogin,
    githubAvatarUrl: integration.githubAvatarUrl ?? "",
    selectedOwner: integration.selectedOwner ?? "",
    selectedRepo: integration.selectedRepo ?? "",
    repositoryConfigured: Boolean(integration.selectedOwner && integration.selectedRepo),
    scopes: integration.scopes,
    connectedAt: integration.createdAt.toISOString(),
    updatedAt: integration.updatedAt.toISOString(),
  };
}

export class GitHubService {
  private readonly github: GitHubClient;

  constructor(
    private readonly env: Env,
    private readonly organizationService: OrganizationService,
    private readonly githubRepository = new GitHubRepository(),
    private readonly issues = new IssueRepository(),
  ) {
    this.github = new GitHubClient(env);
  }

  isConfigured(): boolean {
    return this.github.isConfigured();
  }

  async getConnectUrl(userId: string, organizationId: string): Promise<string> {
    this.ensureConfigured();
    await this.organizationService.requireWriteAccess(userId, organizationId);
    return this.github.buildAuthorizeUrl(signGitHubOAuthState(userId, organizationId, this.env));
  }

  async handleCallback(code: string, state: string): Promise<string> {
    this.ensureConfigured();
    const payload = verifyGitHubOAuthState(state, this.env);
    await this.organizationService.requireWriteAccess(payload.userId, payload.organizationId);

    const tokenResult = await this.github.exchangeCodeForToken(code);
    const githubUser = await this.github.getAuthenticatedUser(tokenResult.accessToken);

    await this.githubRepository.upsert(payload.organizationId, {
      connectedByUserId: payload.userId,
      githubUserId: githubUser.id,
      githubLogin: githubUser.login,
      githubAvatarUrl: githubUser.avatar_url,
      accessTokenEncrypted: encryptSecret(tokenResult.accessToken, this.env.JWT_SECRET),
      scopes: tokenResult.scopes,
    });

    const redirectUrl = new URL("/integrations", this.env.FRONTEND_URL);
    redirectUrl.searchParams.set("github", "connected");
    redirectUrl.searchParams.set("organizationId", payload.organizationId);
    return redirectUrl.toString();
  }

  async getIntegration(userId: string, organizationId: string) {
    await this.organizationService.requireMembership(userId, organizationId);
    const integration = await this.githubRepository.findByOrganization(organizationId);
    return integration ? serializeIntegration(integration) : null;
  }

  async listRepositories(userId: string, organizationId: string) {
    const integration = await this.requireIntegration(userId, organizationId);
    const accessToken = decryptSecret(integration.accessTokenEncrypted, this.env.JWT_SECRET);
    return { repositories: await this.github.listRepositories(accessToken) };
  }

  async setRepository(userId: string, organizationId: string, owner: string, repo: string) {
    await this.organizationService.requireWriteAccess(userId, organizationId);
    const integration = await this.githubRepository.setRepository(organizationId, owner, repo);

    if (!integration) {
      throw new AppError(404, "GITHUB_NOT_CONNECTED", "Connect GitHub before selecting a repository");
    }

    return serializeIntegration(integration);
  }

  async createIssueFromDevPulseIssue(userId: string, issueId: string) {
    const issue = await this.issues.findById(issueId);

    if (!issue) {
      throw new AppError(404, "ISSUE_NOT_FOUND", "Issue not found");
    }

    await this.organizationService.requireMembership(userId, issue.organizationId.toString());

    if (issue.githubIssueUrl) {
      throw new AppError(
        409,
        "GITHUB_ISSUE_EXISTS",
        "A GitHub issue has already been created for this DevPulse issue",
      );
    }

    const integration = await this.requireIntegration(userId, issue.organizationId.toString());

    if (!integration.selectedOwner || !integration.selectedRepo) {
      throw new AppError(
        400,
        "GITHUB_REPO_NOT_CONFIGURED",
        "Select a GitHub repository in Integrations before creating issues",
      );
    }

    const accessToken = decryptSecret(integration.accessTokenEncrypted, this.env.JWT_SECRET);
    const analysis = await this.issues.findAnalysisByIssue(issue._id);
    const devpulseIssueUrl = new URL(`/issues/${issue._id.toString()}`, this.env.FRONTEND_URL).toString();

    const githubIssue = await this.github.createIssue(
      accessToken,
      integration.selectedOwner,
      integration.selectedRepo,
      buildGitHubIssueTitle(issue.title, issue.environment),
      buildGitHubIssueBody({
        issueId: issue._id.toString(),
        title: issue.title,
        errorName: issue.errorName ?? "",
        errorMessage: issue.errorMessage ?? issue.title,
        stackTrace: issue.stackTrace ?? "",
        occurrenceCount: issue.occurrenceCount,
        affectedUserCount: issue.affectedUserCount,
        environment: issue.environment,
        release: issue.release ?? "",
        url: issue.url ?? "",
        devpulseIssueUrl,
        analysis: analysis
          ? {
              rootCause: analysis.rootCause,
              explanation: analysis.explanation,
              suggestedFix: analysis.suggestedFix,
              confidence: analysis.confidence,
              testSuggestions: analysis.testSuggestions,
            }
          : null,
      }),
    );

    issue.githubIssueUrl = githubIssue.url;
    issue.githubIssueNumber = githubIssue.number;
    await issue.save();

    return {
      githubIssue: {
        number: githubIssue.number,
        url: githubIssue.url,
        owner: integration.selectedOwner,
        repo: integration.selectedRepo,
      },
    };
  }

  private async requireIntegration(userId: string, organizationId: string) {
    await this.organizationService.requireMembership(userId, organizationId);
    const integration = await this.githubRepository.findByOrganization(organizationId);

    if (!integration) {
      throw new AppError(404, "GITHUB_NOT_CONNECTED", "Connect GitHub for this organization first");
    }

    return integration;
  }

  private ensureConfigured(): void {
    if (!this.isConfigured()) {
      throw new AppError(503, "GITHUB_UNAVAILABLE", "GitHub integration is not configured on the server");
    }
  }
}
