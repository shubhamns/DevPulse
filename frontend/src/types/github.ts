export type GitHubIntegration = {
  id: string;
  organizationId: string;
  githubUserId: number;
  githubLogin: string;
  githubAvatarUrl: string;
  selectedOwner: string;
  selectedRepo: string;
  repositoryConfigured: boolean;
  scopes: string[];
  connectedAt: string;
  updatedAt: string;
};

export type GitHubRepository = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
};

export type GitHubIssueLink = {
  number: number;
  url: string;
  owner: string;
  repo: string;
};
