import { Types } from "mongoose";
import { Project } from "../../models/Project.js";

export class ProjectRepository {
  findByOrganizationIds(organizationIds: string[]) {
    return Project.find({
      organizationId: { $in: organizationIds.map((id) => new Types.ObjectId(id)) },
    })
      .sort({ updatedAt: -1 })
      .lean();
  }

  findById(id: string) {
    return Project.findById(id);
  }

  findByIdLean(id: string) {
    return Project.findById(id).lean();
  }

  findByOrgAndSlug(organizationId: Types.ObjectId, slug: string, excludeId?: Types.ObjectId) {
    return Project.findOne({
      organizationId,
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).lean();
  }

  create(data: {
    organizationId: Types.ObjectId;
    name: string;
    slug: string;
    environment: string;
    release: string;
  }) {
    return Project.create(data);
  }
}
