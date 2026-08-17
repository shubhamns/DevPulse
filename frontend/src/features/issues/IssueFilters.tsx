import type { IssueFilters as IssueFiltersState, IssueSeverity, IssueStatus } from "@/types/issue";
import type { Project } from "@/types/project";

type IssueFiltersProps = {
  filters: IssueFiltersState;
  projects: Project[];
  onChange: (filters: IssueFiltersState) => void;
};

const severities: IssueSeverity[] = ["critical", "high", "medium", "low"];
const statuses: IssueStatus[] = ["open", "resolved", "ignored"];

export function IssueFilters({ filters, projects, onChange }: IssueFiltersProps) {
  function update(partial: Partial<IssueFiltersState>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="glass-panel grid gap-4 rounded-3xl p-4 md:grid-cols-2 xl:grid-cols-6">
      <label className="block space-y-2 xl:col-span-2">
        <span className="text-sm font-medium text-slate-600">Search</span>
        <input
          className="field-input"
          placeholder="Search issues"
          value={filters.search ?? ""}
          onChange={(event) => update({ search: event.target.value || undefined })}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-600">Project</span>
        <select
          className="field-input"
          value={filters.projectId ?? ""}
          onChange={(event) => update({ projectId: event.target.value || undefined })}
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-600">Severity</span>
        <select
          className="field-input"
          value={filters.severity ?? ""}
          onChange={(event) =>
            update({ severity: (event.target.value as IssueSeverity) || undefined })
          }
        >
          <option value="">All severities</option>
          {severities.map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-600">Status</span>
        <select
          className="field-input"
          value={filters.status ?? ""}
          onChange={(event) =>
            update({ status: (event.target.value as IssueStatus) || undefined })
          }
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-600">Environment</span>
        <input
          className="field-input"
          placeholder="production"
          value={filters.environment ?? ""}
          onChange={(event) => update({ environment: event.target.value || undefined })}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-600">From date</span>
        <input
          type="date"
          className="field-input"
          value={filters.fromDate ? filters.fromDate.slice(0, 10) : ""}
          onChange={(event) =>
            update({
              fromDate: event.target.value
                ? new Date(`${event.target.value}T00:00:00.000Z`).toISOString()
                : undefined,
            })
          }
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-600">To date</span>
        <input
          type="date"
          className="field-input"
          value={filters.toDate ? filters.toDate.slice(0, 10) : ""}
          onChange={(event) =>
            update({
              toDate: event.target.value
                ? new Date(`${event.target.value}T23:59:59.999Z`).toISOString()
                : undefined,
            })
          }
        />
      </label>
    </div>
  );
}
