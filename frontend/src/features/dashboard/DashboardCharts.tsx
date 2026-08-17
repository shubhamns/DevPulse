import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { AnalyticsOverview } from "@/types/analytics";

const chartColors = ["#5B4DFF", "#06B6D4", "#22C55E", "#F59E0B", "#F43F5E"];

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid rgb(15 23 42 / 10%)",
  borderRadius: 12,
  color: "#0f172a",
  boxShadow: "0 12px 32px rgb(15 23 42 / 10%)",
};

type DashboardChartsProps = {
  charts: AnalyticsOverview["charts"];
};

export function DashboardCharts({ charts }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="Errors over time" description="Last 7 days of ingested events.">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.errorsOverTime}>
              <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke={chartColors[0]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Issues by severity" description="Distribution across all incidents.">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.issuesBySeverity}>
              <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
              <XAxis dataKey="severity" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill={chartColors[0]} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Top error fingerprints" description="Most frequent grouped incidents.">
        <div className="space-y-3">
          {charts.topFingerprints.length === 0 ? (
            <p className="text-sm text-slate-500">No fingerprint data yet.</p>
          ) : (
            charts.topFingerprints.map((item) => (
              <div
                key={item.fingerprint}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-950">{item.title}</p>
                  <p className="font-mono text-xs text-slate-500">{item.fingerprint}</p>
                </div>
                <span className="text-sm font-medium text-primary">{item.count} hits</span>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card title="Errors by environment" description="Where incidents are happening.">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.errorsByEnvironment}>
              <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
              <XAxis dataKey="environment" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill={chartColors[1]} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Errors by project" description="Project-level event volume." className="xl:col-span-2">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.errorsByProject}>
              <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
              <XAxis dataKey="projectName" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill={chartColors[4]} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
