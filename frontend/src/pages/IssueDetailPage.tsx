import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  analyzeIssue,
  createGitHubIssue,
  fetchIssue,
  fetchIssueEvents,
  ignoreIssue,
  resolveIssue,
} from "@/services/issues";
import { useAuthStore } from "@/store/authStore";
import { formatDateTime } from "@/utils/date";

function confidenceLabel(confidence: number): string {
  if (confidence >= 80) return "High";
  if (confidence >= 50) return "Medium";
  return "Low";
}

export function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const issueQuery = useQuery({
    queryKey: ["issue", id],
    queryFn: () => fetchIssue(id!),
    enabled: Boolean(token && id),
  });

  const eventsQuery = useQuery({
    queryKey: ["issue-events", id],
    queryFn: () => fetchIssueEvents(id!),
    enabled: Boolean(token && id),
  });

  const resolveMutation = useMutation({
    mutationFn: () => resolveIssue(id!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["issue", id] });
      void queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  const ignoreMutation = useMutation({
    mutationFn: () => ignoreIssue(id!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["issue", id] });
      void queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeIssue(id!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["issue", id] });
    },
  });

  const githubIssueMutation = useMutation({
    mutationFn: () => createGitHubIssue(id!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["issue", id] });
    },
  });

  const issue = issueQuery.data?.issue;
  const analysis = issueQuery.data?.analysis;
  const events = eventsQuery.data;

  if (issueQuery.isLoading) {
    return <p className="text-slate-500">Loading issue...</p>;
  }

  if (!issue) {
    return (
      <div className="space-y-4">
        <p className="text-rose-600">Issue not found.</p>
        <Link className="text-primary" to="/issues">
          Back to issues
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm text-primary hover:text-indigo-500" to="/issues">
          ← Back to issues
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">{issue.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <SeverityBadge severity={issue.severity} />
              <StatusBadge status={issue.status} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {issue.githubIssueUrl ? (
              <a
                href={issue.githubIssueUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-primary hover:bg-slate-50"
              >
                View GitHub issue #{issue.githubIssueNumber}
              </a>
            ) : (
              <Button
                variant="secondary"
                disabled={githubIssueMutation.isPending}
                onClick={() => githubIssueMutation.mutate()}
              >
                {githubIssueMutation.isPending ? "Creating..." : "Create GitHub Issue"}
              </Button>
            )}
            <Button
              variant="secondary"
              disabled={resolveMutation.isPending}
              onClick={() => resolveMutation.mutate()}
            >
              Resolve
            </Button>
            <Button
              variant="ghost"
              disabled={ignoreMutation.isPending}
              onClick={() => ignoreMutation.mutate()}
            >
              Ignore
            </Button>
          </div>
        </div>
      </div>

      {githubIssueMutation.isError ? (
        <p className="text-sm text-rose-600">
          {githubIssueMutation.error instanceof Error
            ? githubIssueMutation.error.message
            : "Unable to create GitHub issue."}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Occurrences">
          <p className="text-2xl font-semibold text-slate-950">{issue.occurrenceCount}</p>
        </Card>
        <Card title="Affected users">
          <p className="text-2xl font-semibold text-slate-950">{issue.affectedUserCount}</p>
        </Card>
        <Card title="First seen">
          <p className="text-sm text-slate-600">{formatDateTime(issue.firstSeen)}</p>
        </Card>
        <Card title="Last seen">
          <p className="text-sm text-slate-600">{formatDateTime(issue.lastSeen)}</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Stack trace">
          <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
            {issue.stackTrace || "No stack trace captured yet."}
          </pre>
        </Card>

        <Card title="Environment & release">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Environment</dt>
              <dd className="text-slate-950">{issue.environment}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Release</dt>
              <dd className="text-slate-950">{issue.release || "Unknown"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">URL</dt>
              <dd className="truncate text-primary">{issue.url || "N/A"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Fingerprint</dt>
              <dd className="font-mono text-xs text-slate-600">{issue.fingerprint}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card title="Error context">
        <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
          {JSON.stringify(events?.latestContext ?? {}, null, 2)}
        </pre>
      </Card>

      <Card title="Breadcrumbs">
        {(events?.latestBreadcrumbs ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No breadcrumbs captured.</p>
        ) : (
          <ul className="space-y-3">
            {(events?.latestBreadcrumbs ?? []).map((crumb) => (
              <li
                key={`${crumb.timestamp}-${crumb.message}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-950">{crumb.message}</span>
                  <span className="text-xs text-slate-500">{crumb.category}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{formatDateTime(crumb.timestamp)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title="AI analysis"
        description="Recommendations from DevPulse AI — guidance only, not guaranteed truth."
        action={
          <Button
            variant="secondary"
            disabled={analyzeMutation.isPending}
            onClick={() => analyzeMutation.mutate()}
          >
            {analyzeMutation.isPending
              ? "Analyzing..."
              : analysis
                ? "Re-analyze"
                : "Analyze now"}
          </Button>
        }
      >
        {analyzeMutation.isError ? (
          <p className="text-sm text-rose-600">
            {analyzeMutation.error instanceof Error
              ? analyzeMutation.error.message
              : "Unable to run AI analysis."}
          </p>
        ) : null}

        {!analysis && !analyzeMutation.isPending ? (
          <p className="text-sm text-slate-500">
            New issues are analyzed automatically when AI is configured. You can also trigger
            analysis manually.
          </p>
        ) : null}

        {analyzeMutation.isPending && !analysis ? (
          <p className="text-sm text-slate-500">Running AI analysis...</p>
        ) : null}

        {analysis ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              AI-generated recommendation — verify before applying in production.
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500">Summary</h3>
              <p className="mt-2 text-slate-950">{analysis.summary}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-slate-500">Root cause</h3>
                <p className="mt-2 text-slate-700">{analysis.rootCause}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500">Suggested severity</h3>
                <div className="mt-2">
                  <SeverityBadge severity={analysis.severity} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500">Explanation</h3>
              <p className="mt-2 whitespace-pre-wrap text-slate-700">{analysis.explanation}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500">Suggested fix</h3>
              <pre className="mt-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                {analysis.suggestedFix}
              </pre>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-slate-500">
                Confidence:{" "}
                <span className="text-slate-950">
                  {analysis.confidence}% ({confidenceLabel(analysis.confidence)})
                </span>
              </span>
              <span className="text-slate-500">Model: {analysis.model}</span>
              <span className="text-slate-500">
                Updated: {formatDateTime(analysis.updatedAt)}
              </span>
            </div>

            {analysis.testSuggestions.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium text-slate-500">Test suggestions</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
                  {analysis.testSuggestions.map((suggestion) => (
                    <li key={suggestion}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>

      <Card title="Timeline">
        {(events?.events ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No events recorded for this issue yet.</p>
        ) : (
          <ul className="space-y-3">
            {(events?.events ?? []).map((event) => (
              <li
                key={event.id}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-slate-950">{event.message}</p>
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {event.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDateTime(event.receivedAt)} · {event.environment} ·{" "}
                  {event.release || "no release"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
