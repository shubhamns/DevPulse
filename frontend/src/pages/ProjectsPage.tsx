import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createProject,
  deleteProject,
  fetchProjects,
} from "@/services/projects";
import { useAuthStore } from "@/store/authStore";
import type { Project } from "@/types/project";

export function ProjectsPage() {
  const { token, organizations } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (organizations.length > 0 && !organizationId) {
      setOrganizationId(organizations[0]?.id ?? "");
    }
  }, [organizations, organizationId]);

  useEffect(() => {
    if (!token) {
      return;
    }

    void fetchProjects()
      .then(setProjects)
      .catch(() => setError("Unable to load projects"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !organizationId || !name.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const project = await createProject({
        organizationId,
        name: name.trim(),
        environment,
      });
      setProjects((current) => [project, ...current]);
      setName("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create project");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(projectId: string) {
    if (!token) {
      return;
    }

    await deleteProject(projectId);
    setProjects((current) => current.filter((project) => project.id !== projectId));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Projects</h1>
        <p className="mt-2 text-slate-600">
          Manage projects and open onboarding to install the SDK with project API keys.
        </p>
      </div>

      <Card title="Create project">
        {organizations.length === 0 ? (
          <p className="text-sm text-slate-500">
            Create an organization first before adding projects.
          </p>
        ) : (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-600">Organization</span>
              <select
                className="field-input"
                value={organizationId}
                onChange={(event) => setOrganizationId(event.target.value)}
              >
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Project name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Production Web"
            />
            <Input
              label="Environment"
              value={environment}
              onChange={(event) => setEnvironment(event.target.value)}
              placeholder="production"
            />
            <div className="flex items-end">
              <Button type="submit" disabled={submitting || !name.trim()}>
                {submitting ? "Creating..." : "Create project"}
              </Button>
            </div>
          </form>
        )}
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </Card>

      <Card title="Your projects">
        {loading ? (
          <p className="text-sm text-slate-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-slate-500">No projects yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {projects.map((project) => (
              <li
                key={project.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-slate-950">{project.name}</p>
                  <p className="text-sm text-slate-500">
                    {project.slug} · {project.environment}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                    to={`/projects/${project.id}`}
                  >
                    Open onboarding
                  </Link>
                  <Button variant="danger" onClick={() => void handleDelete(project.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
