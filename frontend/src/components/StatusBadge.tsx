import type { IssueStatus } from "@/types/issue";

const styles: Record<IssueStatus, string> = {
  open: "border-indigo-200 bg-indigo-50 text-indigo-700",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ignored: "border-slate-200 bg-slate-100 text-slate-600",
};

export function StatusBadge({ status }: { status: IssueStatus | string }) {
  const key = (status in styles ? status : "open") as IssueStatus;

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${styles[key]}`}
    >
      {status}
    </span>
  );
}
