import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { IssueFilters } from "@/features/issues/IssueFilters";
import { fetchIssues } from "@/services/issues";
import { fetchProjects } from "@/services/projects";
import { useAuthStore } from "@/store/authStore";
import type { IssueFilters as IssueFiltersState } from "@/types/issue";
import { formatDateTime } from "@/utils/date";

export function IssuesPage() {
  const token = useAuthStore((state) => state.token);
  const [filters, setFilters] = useState<IssueFiltersState>({ status: "open" });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchProjects(),
    enabled: Boolean(token),
  });

  const issuesQuery = useQuery({
    queryKey: ["issues", filters],
    queryFn: () => fetchIssues(filters),
    enabled: Boolean(token),
  });

  const environments = useMemo(() => {
    const values = new Set((issuesQuery.data ?? []).map((issue) => issue.environment));
    return Array.from(values);
  }, [issuesQuery.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Issues</h1>
          <p className="mt-2 text-slate-600">
            AI-grouped production incidents with deterministic fingerprinting.
          </p>
        </div>
        {environments.length > 0 ? (
          <p className="text-sm text-slate-500">
            Environments seen: {environments.join(", ")}
          </p>
        ) : null}
      </div>

      <IssueFilters
        filters={filters}
        projects={projectsQuery.data ?? []}
        onChange={setFilters}
      />

      <div className="glass-panel overflow-hidden rounded-3xl">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Issue</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Occurrences</th>
              <th className="px-4 py-3 font-medium">Affected Users</th>
              <th className="px-4 py-3 font-medium">Environment</th>
              <th className="px-4 py-3 font-medium">First Seen</th>
              <th className="px-4 py-3 font-medium">Last Seen</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {issuesQuery.isLoading ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={8}>
                  Loading issues...
                </td>
              </tr>
            ) : (issuesQuery.data ?? []).length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={8}>
                  No issues match your filters yet.
                </td>
              </tr>
            ) : (
              (issuesQuery.data ?? []).map((issue) => (
                <tr key={issue.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-4">
                    <Link
                      className="font-medium text-primary hover:text-indigo-500"
                      to={`/issues/${issue.id}`}
                    >
                      {issue.title}
                    </Link>
                    <p className="mt-1 font-mono text-xs text-slate-500">
                      {issue.fingerprint.slice(0, 12)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <SeverityBadge severity={issue.severity} />
                  </td>
                  <td className="px-4 py-4 text-slate-700">{issue.occurrenceCount}</td>
                  <td className="px-4 py-4 text-slate-700">{issue.affectedUserCount}</td>
                  <td className="px-4 py-4 text-slate-600">{issue.environment}</td>
                  <td className="px-4 py-4 text-slate-500">{formatDateTime(issue.firstSeen)}</td>
                  <td className="px-4 py-4 text-slate-500">{formatDateTime(issue.lastSeen)}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={issue.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
