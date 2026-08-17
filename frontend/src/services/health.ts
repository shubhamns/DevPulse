import { http } from "@/lib/http";

export type HealthResponse = {
  service: string;
  status: "ok" | "degraded";
  database: "connected" | "disconnected";
  timestamp: string;
};

export async function getApiHealth(): Promise<HealthResponse> {
  const response = await http.get<HealthResponse>("/api/v1/health", {
    validateStatus: (status) => status === 200 || status === 503,
  });

  return response.data;
}
