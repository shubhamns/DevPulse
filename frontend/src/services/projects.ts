import type { Project } from "@/types/project";
import { apiRequest } from "@/lib/http";

export async function fetchProjects(organizationId?: string): Promise<Project[]> {
  const query = organizationId ? `?organizationId=${organizationId}` : "";
  const response = await apiRequest<{ projects: Project[] }>(`/api/v1/projects${query}`);
  return response.projects;
}

export async function fetchProject(projectId: string): Promise<Project> {
  const response = await apiRequest<{ project: Project }>(`/api/v1/projects/${projectId}`);
  return response.project;
}

export async function createProject(input: {
  organizationId: string;
  name: string;
  environment: string;
  release?: string;
}): Promise<Project> {
  const response = await apiRequest<{ project: Project }>("/api/v1/projects", {
    method: "POST",
    data: input,
  });
  return response.project;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiRequest(`/api/v1/projects/${projectId}`, {
    method: "DELETE",
  });
}
