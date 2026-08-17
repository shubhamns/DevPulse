import { Link, Outlet, useLocation } from "react-router-dom";
import { Brand } from "@/components/Brand";
import { ArrowLeft } from "lucide-react";

const stats = [
  { value: "12ms", label: "Grouping" },
  { value: "99.9%", label: "Capture" },
  { value: "AI", label: "Root cause" },
];

export function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.startsWith("/register");

  return (
    <div className="grid min-h-svh bg-slate-50 lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-[#5b4dff] p-10 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-0 size-80 rounded-full bg-cyan-300/20 blur-3xl" />
        <Brand inverted className="relative" />
        <div className="relative my-auto max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight xl:text-5xl">
            {isRegister ? "Start resolving incidents with AI." : "Take control of your production future."}
          </h1>
          <p className="mt-5 text-base leading-7 text-white/80">
            Capture crashes, group them with deterministic fingerprints, and let
            DevPulse AI explain the likely root cause.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/20 bg-white/15 px-4 py-4 backdrop-blur-md"
            >
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-white/75">{stat.label}</p>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex min-h-svh flex-col px-6 py-8 sm:px-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <Outlet />
        </div>
      </section>
    </div>
  );
}
