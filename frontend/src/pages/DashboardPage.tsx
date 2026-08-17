import { useQuery } from "@tanstack/react-query";
import { DashboardCharts } from "@/features/dashboard/DashboardCharts";
import { StatCard } from "@/components/StatCard";
import { fetchAnalyticsOverview } from "@/services/analytics";
import { useAuthStore } from "@/store/authStore";

export function DashboardPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => fetchAnalyticsOverview(),
    enabled: Boolean(token),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Production incident overview for {user?.name ?? "your workspace"}.
        </p>
      </div>

      {isLoading ? <p className="text-slate-500">Loading analytics...</p> : null}
      {error ? <p className="text-rose-600">Unable to load dashboard analytics.</p> : null}

      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total Issues" value={data.cards.totalIssues} />
            <StatCard label="Critical Issues" value={data.cards.criticalIssues} />
            <StatCard label="Errors Today" value={data.cards.errorsToday} />
            <StatCard label="Error Rate" value={`${data.cards.errorRate}/hr`} hint="Last 24 hours" />
            <StatCard label="Affected Users" value={data.cards.affectedUsers} />
            <StatCard label="New Issues" value={data.cards.newIssues} hint="Created today" />
          </div>

          <DashboardCharts charts={data.charts} />
        </>
      ) : null}
    </div>
  );
}
