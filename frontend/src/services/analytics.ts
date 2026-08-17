import type { AnalyticsOverview } from "@/types/analytics";
import { apiRequest } from "@/lib/http";

export async function fetchAnalyticsOverview(projectId?: string): Promise<AnalyticsOverview> {
  const query = projectId ? `?projectId=${projectId}` : "";
  return apiRequest<AnalyticsOverview>(`/api/v1/analytics/overview${query}`);
}
