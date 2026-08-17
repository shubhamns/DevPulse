import type { Organization } from "@/types/organization";
import { apiRequest } from "@/lib/http";

export async function fetchOrganizations(): Promise<Organization[]> {
  const response = await apiRequest<{ organizations: Organization[] }>("/api/v1/organizations");
  return response.organizations;
}

export async function createOrganization(name: string): Promise<Organization> {
  const response = await apiRequest<{ organization: Organization }>("/api/v1/organizations", {
    method: "POST",
    data: { name },
  });
  return response.organization;
}
