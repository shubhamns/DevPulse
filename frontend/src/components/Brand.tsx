import { Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type BrandProps = {
  className?: string;
  inverted?: boolean;
  to?: string;
};

export function Brand({ className, inverted = false, to = "/" }: BrandProps) {
  return (
    <Link to={to} className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-xl text-sm font-bold",
          inverted ? "bg-white/15 text-white" : "bg-primary text-primary-foreground",
        )}
      >
        <Activity className="size-5" />
      </span>
      <span className="leading-tight">
        <span className={cn("block text-sm font-semibold", inverted ? "text-white" : "text-slate-900")}>
          DevPulse AI
        </span>
        <span className={cn("block text-xs", inverted ? "text-white/70" : "text-slate-500")}>
          Production debugging copilot
        </span>
      </span>
    </Link>
  );
}
