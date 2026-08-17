import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/CodeBlock";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { CopyButton } from "@/components/CopyButton";
import {
  createProjectApiKey,
  fetchProjectApiKeys,
  revokeApiKey,
} from "@/services/apiKeys";
import { fetchProject } from "@/services/projects";
import { useAuthStore } from "@/store/authStore";
import type { ApiKey, ApiKeyWithSecret } from "@/types/apiKey";
import type { Project } from "@/types/project";

function buildInstallSnippet() {
  return `npm install @devpulse/sdk`;
}

function buildInitSnippet(project: Project, apiKey?: string) {
  const key = apiKey ?? "dp_live_your_api_key";
  return `import { DevPulse } from "@devpulse/sdk";

DevPulse.init({
  apiKey: "${key}",
  environment: "${project.environment}",
  release: "${project.release || "1.0.0"}"
});`;
}

function buildEnvSnippet(apiKey?: string) {
  const key = apiKey ?? "dp_live_your_api_key";
  return `DEVPULSE_API_KEY=${key}
DEVPULSE_ENVIRONMENT=production`;
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const token = useAuthStore((state) => state.token);
  const [project, setProject] = useState<Project | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [revealedKey, setRevealedKey] = useState<ApiKeyWithSecret | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [apiKeyToRevoke, setApiKeyToRevoke] = useState<ApiKey | null>(null);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    if (!token || !id) {
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([fetchProject(id), fetchProjectApiKeys(id)])
      .then(([loadedProject, loadedKeys]) => {
        setProject(loadedProject);
        setApiKeys(loadedKeys);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "Unable to load project");
      })
      .finally(() => setLoading(false));
  }, [token, id]);

  const activeKey = revealedKey?.key ?? apiKeys[0]?.maskedKey;

  const initSnippet = useMemo(
    () => (project ? buildInitSnippet(project, revealedKey?.key) : ""),
    [project, revealedKey],
  );

  async function handleGenerateKey() {
    if (!token || !id) {
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const apiKey = await createProjectApiKey(id);
      setRevealedKey(apiKey);
      setApiKeys((current) => [
        {
          id: apiKey.id,
          projectId: apiKey.projectId,
          organizationId: apiKey.organizationId,
          label: apiKey.label,
          keyPrefix: apiKey.keyPrefix,
          lastFour: apiKey.lastFour,
          maskedKey: apiKey.maskedKey,
          revokedAt: apiKey.revokedAt,
          createdAt: apiKey.createdAt,
          updatedAt: apiKey.updatedAt,
        },
        ...current,
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to generate API key");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevoke(apiKeyId: string) {
    if (!token) {
      return;
    }

    setRevoking(true);
    setError(null);

    try {
      await revokeApiKey(apiKeyId);
      setApiKeys((current) => current.filter((key) => key.id !== apiKeyId));

      if (revealedKey?.id === apiKeyId) {
        setRevealedKey(null);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to revoke API key");
      throw caught;
    } finally {
      setRevoking(false);
    }
  }

  async function handleTestError() {
    if (!project) {
      return;
    }

    if (!revealedKey?.key) {
      setTestMessage("Generate an API key first, then send a test event.");
      return;
    }

    setTestMessage("Sending test event...");

    try {
      const response = await fetch("/api/v1/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${revealedKey.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "test",
          timestamp: new Date().toISOString(),
          environment: project.environment,
          release: project.release || "1.0.0",
          message: "DevPulse test event",
          level: "info",
          sdk: {
            name: "@devpulse/sdk",
            version: "0.1.0",
          },
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        setTestMessage(payload.error?.message ?? "Test event could not be delivered.");
        return;
      }

      const payload = (await response.json()) as { eventId?: string };
      setTestMessage(
        payload.eventId
          ? `Test event accepted (${payload.eventId}).`
          : "Test event sent successfully.",
      );
    } catch {
      setTestMessage("Unable to reach the events API yet. Error ingestion is coming next.");
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading project...</p>;
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <p className="text-rose-600">{error ?? "Project not found"}</p>
        <Link className="text-primary hover:text-indigo-500" to="/projects">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="text-sm text-primary hover:text-indigo-500" to="/projects">
            ← Back to projects
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{project.name}</h1>
          <p className="mt-2 text-slate-500">
            {project.slug} · {project.environment}
            {project.release ? ` · release ${project.release}` : ""}
          </p>
        </div>
        <Button onClick={() => void handleGenerateKey()} disabled={generating}>
          {generating ? "Generating..." : "Generate API key"}
        </Button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {revealedKey ? (
        <Card
          title="Save your API key"
          description="This is the only time the full key will be shown. Store it securely."
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <code className="break-all rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {revealedKey.key}
            </code>
            <CopyButton value={revealedKey.key} label="Copy key" />
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Install the SDK" description="Add DevPulse to your application.">
          <div className="space-y-4">
            <CodeBlock code={buildInstallSnippet()} copyLabel="Copy" />
            <CodeBlock code={initSnippet} copyLabel="Copy init" />
          </div>
        </Card>

        <Card title="Environment setup" description="Configure secrets outside the browser.">
          <CodeBlock code={buildEnvSnippet(revealedKey?.key)} copyLabel="Copy env" />
          <p className="mt-4 text-sm text-slate-500">
            Never expose your API key in frontend bundles or public repositories.
          </p>
        </Card>
      </div>

      <Card title="API keys" description="Active keys for this project.">
        {apiKeys.length === 0 ? (
          <p className="text-sm text-slate-500">
            No active API keys yet. Generate one to start SDK onboarding.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {apiKeys.map((apiKey) => (
              <li
                key={apiKey.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-slate-950">{apiKey.label}</p>
                  <p className="font-mono text-sm text-slate-500">{apiKey.maskedKey}</p>
                </div>
                <Button variant="danger" onClick={() => setApiKeyToRevoke(apiKey)}>
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title="Send a test event"
        description="Verify connectivity once error ingestion is enabled."
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary" onClick={() => void handleTestError()}>
            Send test event
          </Button>
          <p className="text-sm text-slate-500">
            Current key: <span className="font-mono text-slate-700">{activeKey}</span>
          </p>
        </div>
        {testMessage ? <p className="mt-4 text-sm text-slate-600">{testMessage}</p> : null}
      </Card>

      <ConfirmDeleteDialog
        open={Boolean(apiKeyToRevoke)}
        onOpenChange={(open) => {
          if (!open && !revoking) {
            setApiKeyToRevoke(null);
          }
        }}
        title="Revoke API key?"
        description={
          apiKeyToRevoke
            ? `This will revoke "${apiKeyToRevoke.label}" (${apiKeyToRevoke.maskedKey}). Applications using this key will stop sending events.`
            : ""
        }
        confirmLabel="Revoke"
        loading={revoking}
        onConfirm={async () => {
          if (apiKeyToRevoke) {
            await handleRevoke(apiKeyToRevoke.id);
          }
        }}
      />
    </div>
  );
}
