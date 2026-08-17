import { Types } from "mongoose";
import { Organization } from "../../models/Organization.js";
import { OrganizationMember } from "../../models/OrganizationMember.js";

export class OrganizationRepository {
  findMembershipsByUser(userId: string) {
    return OrganizationMember.find({ userId: new Types.ObjectId(userId) })
      .populate("organizationId")
      .lean();
  }

  findBySlug(slug: string) {
    return Organization.findOne({ slug }).lean();
  }

  create(data: { name: string; slug: string }) {
    return Organization.create(data);
  }

  createMembership(data: { organizationId: Types.ObjectId; userId: string; role: "owner" | "admin" | "member" }) {
    return OrganizationMember.create({
      organizationId: data.organizationId,
      userId: new Types.ObjectId(data.userId),
      role: data.role,
    });
  }

  findMembership(userId: string, organizationId: string) {
    return OrganizationMember.findOne({
      userId: new Types.ObjectId(userId),
      organizationId: new Types.ObjectId(organizationId),
    }).lean();
  }
}
