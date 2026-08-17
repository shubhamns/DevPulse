import type { IssueSeverity } from "@/types/issue";

const styles: Record<IssueSeverity, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-slate-200 bg-slate-100 text-slate-600",
};

export function SeverityBadge({ severity }: { severity: IssueSeverity | string }) {
  const key = (severity in styles ? severity : "medium") as IssueSeverity;

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${styles[key]}`}
    >
      {severity}
    </span>
  );
}
