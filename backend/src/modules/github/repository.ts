import { Types } from "mongoose";
import { GithubIntegration } from "../../models/GithubIntegration.js";

export class GitHubRepository {
  upsert(organizationId: string, data: {
    connectedByUserId: string;
    githubUserId: number;
    githubLogin: string;
    githubAvatarUrl?: string;
    accessTokenEncrypted: string;
    scopes: string[];
  }) {
    return GithubIntegration.findOneAndUpdate(
      { organizationId: new Types.ObjectId(organizationId) },
      {
        organizationId: new Types.ObjectId(organizationId),
        connectedByUserId: new Types.ObjectId(data.connectedByUserId),
        githubUserId: data.githubUserId,
        githubLogin: data.githubLogin,
        githubAvatarUrl: data.githubAvatarUrl,
        accessTokenEncrypted: data.accessTokenEncrypted,
        scopes: data.scopes,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  findByOrganization(organizationId: string) {
    return GithubIntegration.findOne({
      organizationId: new Types.ObjectId(organizationId),
    }).lean();
  }

  setRepository(organizationId: string, owner: string, repo: string) {
    return GithubIntegration.findOneAndUpdate(
      { organizationId: new Types.ObjectId(organizationId) },
      { selectedOwner: owner, selectedRepo: repo },
      { new: true },
    ).lean();
  }
}
