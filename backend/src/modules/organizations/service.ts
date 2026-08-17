import { Types } from "mongoose";
import { AppError } from "../../utils/errors.js";
import { uniqueSlug } from "../../utils/slug.js";
import { OrganizationRepository } from "./repository.js";
import type { CreateOrganizationInput } from "./validators.js";

function serializeOrganization(
  organization: {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  },
  role: string,
) {
  return {
    id: organization._id.toString(),
    name: organization.name,
    slug: organization.slug,
    role,
    createdAt: organization.createdAt.toISOString(),
    updatedAt: organization.updatedAt.toISOString(),
  };
}

export class OrganizationService {
  constructor(private readonly organizations = new OrganizationRepository()) {}

  async listForUser(userId: string) {
    const memberships = await this.organizations.findMembershipsByUser(userId);

    return memberships
      .filter((membership) => membership.organizationId)
      .map((membership) => {
        const organization = membership.organizationId as unknown as {
          _id: Types.ObjectId;
          name: string;
          slug: string;
          createdAt: Date;
          updatedAt: Date;
        };

        return serializeOrganization(organization, membership.role);
      });
  }

  async createForUser(userId: string, input: CreateOrganizationInput) {
    const slug = await uniqueSlug(input.name, async (candidate) =>
      Boolean(await this.organizations.findBySlug(candidate)),
    );

    const organization = await this.organizations.create({
      name: input.name,
      slug,
    });

    await this.organizations.createMembership({
      organizationId: organization._id,
      userId,
      role: "owner",
    });

    return serializeOrganization(organization, "owner");
  }

  async requireMembership(userId: string, organizationId: string) {
    if (!Types.ObjectId.isValid(organizationId)) {
      throw new AppError(404, "ORGANIZATION_NOT_FOUND", "Organization not found");
    }

    const membership = await this.organizations.findMembership(userId, organizationId);

    if (!membership) {
      throw new AppError(403, "FORBIDDEN", "You do not have access to this organization");
    }

    return membership;
  }

  async requireWriteAccess(userId: string, organizationId: string) {
    const membership = await this.requireMembership(userId, organizationId);

    if (membership.role === "member") {
      throw new AppError(403, "FORBIDDEN", "Insufficient permissions for this action");
    }

    return membership;
  }
}
