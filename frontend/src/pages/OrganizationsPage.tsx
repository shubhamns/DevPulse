import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createOrganization, fetchOrganizations } from "@/services/organizations";
import { useAuthStore } from "@/store/authStore";
import type { Organization } from "@/types/organization";

export function OrganizationsPage() {
  const token = useAuthStore((state) => state.token);
  const refreshMe = useAuthStore((state) => state.refreshMe);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    void fetchOrganizations()
      .then(setOrganizations)
      .catch(() => setError("Unable to load organizations"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !name.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const organization = await createOrganization(name.trim());
      setOrganizations((current) => [organization, ...current]);
      setName("");
      await refreshMe();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create organization");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Organizations</h1>
        <p className="mt-2 text-slate-600">
          Create the team workspace that owns your projects and incidents.
        </p>
      </div>

      <Card title="Create organization">
        <form className="flex flex-col gap-4 md:flex-row" onSubmit={handleCreate}>
          <Input
            label="Organization name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Acme Engineering"
          />
          <div className="flex items-end">
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? "Creating..." : "Create organization"}
            </Button>
          </div>
        </form>
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </Card>

      <Card title="Your organizations">
        {loading ? (
          <p className="text-sm text-slate-500">Loading organizations...</p>
        ) : organizations.length === 0 ? (
          <p className="text-sm text-slate-500">
            No organizations yet. Create one to start adding projects.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {organizations.map((organization) => (
              <li
                key={organization.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-slate-950">{organization.name}</p>
                  <p className="text-sm text-slate-500">{organization.slug}</p>
                </div>
                <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {organization.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
