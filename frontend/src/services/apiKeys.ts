import type { ApiKey, ApiKeyWithSecret } from "@/types/apiKey";
import { apiRequest } from "@/lib/http";

export async function fetchProjectApiKeys(projectId: string): Promise<ApiKey[]> {
  const response = await apiRequest<{ apiKeys: ApiKey[] }>(`/api/v1/projects/${projectId}/api-keys`);
  return response.apiKeys;
}

export async function createProjectApiKey(
  projectId: string,
  label?: string,
): Promise<ApiKeyWithSecret> {
  const response = await apiRequest<{ apiKey: ApiKeyWithSecret }>(
    `/api/v1/projects/${projectId}/api-keys`,
    {
      method: "POST",
      data: label ? { label } : {},
    },
  );
  return response.apiKey;
}

export async function revokeApiKey(apiKeyId: string): Promise<ApiKey> {
  const response = await apiRequest<{ apiKey: ApiKey }>(`/api/v1/api-keys/${apiKeyId}`, {
    method: "DELETE",
  });
  return response.apiKey;
}
