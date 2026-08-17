import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  fetchGitHubRepositories,
  fetchGitHubStatus,
  setGitHubRepository,
  startGitHubConnect,
} from "@/services/github";
import { fetchOrganizations } from "@/services/organizations";
import { useAuthStore } from "@/store/authStore";
import type { GitHubRepository } from "@/types/github";
import type { Organization } from "@/types/organization";

export function IntegrationsPage() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedRepository, setSelectedRepository] = useState("");
  const [connectError, setConnectError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    void fetchOrganizations()
      .then((items) => {
        setOrganizations(items);
        if (items.length > 0) {
          const callbackOrgId = searchParams.get("organizationId");
          setSelectedOrganizationId(callbackOrgId ?? items[0]!.id);
        }
      })
      .catch(() => setConnectError("Unable to load organizations"));
  }, [token, searchParams]);

  useEffect(() => {
    if (searchParams.get("github") === "connected") {
      setSaveMessage("GitHub connected successfully. Select a repository below.");
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("github");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const statusQuery = useQuery({
    queryKey: ["github-status", selectedOrganizationId],
    queryFn: () => fetchGitHubStatus(selectedOrganizationId),
    enabled: Boolean(token && selectedOrganizationId),
  });

  const repositoriesQuery = useQuery({
    queryKey: ["github-repositories", selectedOrganizationId],
    queryFn: () => fetchGitHubRepositories(selectedOrganizationId),
    enabled: Boolean(token && selectedOrganizationId && statusQuery.data?.integration),
  });

  const connectMutation = useMutation({
    mutationFn: () => startGitHubConnect(selectedOrganizationId),
    onSuccess: (authorizeUrl) => {
      window.location.href = authorizeUrl;
    },
    onError: (error: Error) => {
      setConnectError(error.message);
    },
  });

  const saveRepositoryMutation = useMutation({
    mutationFn: (repository: GitHubRepository) =>
      setGitHubRepository(
        selectedOrganizationId,
        repository.owner,
        repository.name,
      ),
    onSuccess: () => {
      setSaveMessage("Repository saved for GitHub issue creation.");
      void queryClient.invalidateQueries({ queryKey: ["github-status", selectedOrganizationId] });
    },
    onError: (error: Error) => {
      setConnectError(error.message);
    },
  });

  const integration = statusQuery.data?.integration;
  const canManage = useMemo(() => {
    const organization = organizations.find((item) => item.id === selectedOrganizationId);
    return organization?.role === "owner" || organization?.role === "admin";
  }, [organizations, selectedOrganizationId]);

  useEffect(() => {
    if (integration?.selectedOwner && integration.selectedRepo) {
      setSelectedRepository(`${integration.selectedOwner}/${integration.selectedRepo}`);
    } else {
      setSelectedRepository("");
    }
  }, [integration?.selectedOwner, integration?.selectedRepo]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Integrations</h1>
        <p className="mt-2 text-slate-600">
          Connect GitHub to create issues from DevPulse incidents with error details and AI
          recommendations.
        </p>
      </div>

      <Card title="Organization">
        <label className="block text-sm font-medium text-slate-600" htmlFor="organization">
          Workspace
        </label>
        <select
          id="organization"
          className="field-input mt-2"
          value={selectedOrganizationId}
          onChange={(event) => {
            setSelectedOrganizationId(event.target.value);
            setConnectError(null);
            setSaveMessage(null);
          }}
        >
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </Card>

      <Card
        title="GitHub"
        description="OAuth connection is stored per organization. Tokens never leave the backend."
      >
        {statusQuery.isLoading ? (
          <p className="text-sm text-slate-500">Loading GitHub status...</p>
        ) : null}

        {!statusQuery.data?.configured ? (
          <p className="text-sm text-amber-700">
            GitHub OAuth is not configured on the server. Set `GITHUB_CLIENT_ID` and
            `GITHUB_CLIENT_SECRET` in the backend environment.
          </p>
        ) : null}

        {connectError ? <p className="text-sm text-rose-600">{connectError}</p> : null}
        {saveMessage ? <p className="text-sm text-emerald-700">{saveMessage}</p> : null}

        {integration ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              {integration.githubAvatarUrl ? (
                <img
                  src={integration.githubAvatarUrl}
                  alt=""
                  className="h-10 w-10 rounded-full"
                />
              ) : null}
              <div>
                <p className="font-medium text-slate-950">Connected as {integration.githubLogin}</p>
                <p className="text-xs text-slate-500">
                  Connected {new Date(integration.connectedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {repositoriesQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading repositories...</p>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-600" htmlFor="repository">
                  Target repository
                </label>
                <select
                  id="repository"
                  className="field-input"
                  value={selectedRepository}
                  disabled={!canManage || saveRepositoryMutation.isPending}
                  onChange={(event) => setSelectedRepository(event.target.value)}
                >
                  <option value="">Select a repository</option>
                  {(repositoriesQuery.data ?? []).map((repository) => (
                    <option key={repository.fullName} value={repository.fullName}>
                      {repository.fullName}
                      {repository.private ? " (private)" : ""}
                    </option>
                  ))}
                </select>

                {canManage ? (
                  <Button
                    variant="secondary"
                    disabled={
                      !selectedRepository ||
                      saveRepositoryMutation.isPending ||
                      repositoriesQuery.isLoading
                    }
                    onClick={() => {
                      const repository = (repositoriesQuery.data ?? []).find(
                        (item) => item.fullName === selectedRepository,
                      );

                      if (repository) {
                        saveRepositoryMutation.mutate(repository);
                      }
                    }}
                  >
                    {saveRepositoryMutation.isPending ? "Saving..." : "Save repository"}
                  </Button>
                ) : (
                  <p className="text-sm text-slate-500">
                    Only organization owners and admins can update the GitHub repository.
                  </p>
                )}

                {integration.repositoryConfigured ? (
                  <p className="text-sm text-slate-500">
                    Current target:{" "}
                    <span className="text-slate-950">
                      {integration.selectedOwner}/{integration.selectedRepo}
                    </span>
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Connect GitHub to enable &quot;Create GitHub Issue&quot; from issue details.
            </p>
            {canManage ? (
              <Button
                disabled={!statusQuery.data?.configured || connectMutation.isPending}
                onClick={() => {
                  setConnectError(null);
                  connectMutation.mutate();
                }}
              >
                {connectMutation.isPending ? "Redirecting..." : "Connect GitHub"}
              </Button>
            ) : (
              <p className="text-sm text-slate-500">
                Only organization owners and admins can connect GitHub.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
