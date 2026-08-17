import { Link } from "react-router-dom";
import { Brand } from "@/components/Brand";
import { LandingSectionLink } from "@/components/LandingSectionLink";
import { useAuthStore } from "@/store/authStore";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
];

const appLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Issues", to: "/issues" },
  { label: "Integrations", to: "/integrations" },
];

export function LandingFooter() {
  const token = useAuthStore((state) => state.token);

  return (
    <footer className="relative mt-8 border-t border-white/60 bg-white/50 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Brand />
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              AI-powered production error monitoring and debugging for developers. Capture,
              group, analyze, and resolve incidents faster.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Product</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <LandingSectionLink href={link.href} className="transition hover:text-slate-900">
                    {link.label}
                  </LandingSectionLink>
                </li>
              ))}
              {token ? (
                <li>
                  <Link to="/dashboard" className="transition hover:text-slate-900">
                    Open dashboard
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="transition hover:text-slate-900">
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="transition hover:text-slate-900">
                      Get started
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Workspace</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {appLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition hover:text-slate-900">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200/80 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DevPulse AI. All rights reserved.</p>
          <p>Built for teams who ship fast and debug faster.</p>
        </div>
      </div>
    </footer>
  );
}
