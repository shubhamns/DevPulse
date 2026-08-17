import { useQuery } from "@tanstack/react-query";
import { DashboardCharts } from "@/features/dashboard/DashboardCharts";
import { fetchAnalyticsOverview } from "@/services/analytics";
import { useAuthStore } from "@/store/authStore";

export function AnalyticsPage() {
  const token = useAuthStore((state) => state.token);

  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics-overview", "analytics-page"],
    queryFn: () => fetchAnalyticsOverview(),
    enabled: Boolean(token),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Analytics</h1>
        <p className="mt-2 text-slate-600">
          Deep dive into error volume, severity mix, and project hotspots.
        </p>
      </div>

      {isLoading ? <p className="text-slate-500">Loading analytics...</p> : null}
      {error ? <p className="text-rose-600">Unable to load analytics.</p> : null}
      {data ? <DashboardCharts charts={data.charts} /> : null}
    </div>
  );
}
