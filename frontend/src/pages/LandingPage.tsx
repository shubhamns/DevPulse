import { ArrowRight, Activity, Fingerprint, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Brand } from "@/components/Brand";
import { GlassBackdrop } from "@/components/GlassBackdrop";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingSectionLink } from "@/components/LandingSectionLink";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

const features = [
  {
    icon: Fingerprint,
    title: "Deterministic grouping",
    body: "Fingerprint stack traces so the same crash becomes one issue, not a flood of noise.",
  },
  {
    icon: Sparkles,
    title: "AI root-cause analysis",
    body: "Get a probable cause, a suggested fix, and next test ideas without leaving the incident.",
  },
  {
    icon: Activity,
    title: "Live production pulse",
    body: "Watch error rate, severity mix, and affected users as soon as events hit your project.",
  },
];

export function LandingPage() {
  const token = useAuthStore((state) => state.token);

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      <GlassBackdrop />
      <div className="relative">
        <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Brand />
            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
              <LandingSectionLink href="#features" className="hover:text-slate-900">
                Features
              </LandingSectionLink>
              <LandingSectionLink href="#how-it-works" className="hover:text-slate-900">
                How it works
              </LandingSectionLink>
            </nav>
            <div className="flex items-center gap-3">
              {token ? (
                <Button asChild className="rounded-full px-5">
                  <Link to="/dashboard">Open dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" className="text-slate-700">
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button asChild className="rounded-full px-5">
                    <Link to="/register">Get started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 pb-20">
          <section className="grid items-center gap-12 py-10 lg:grid-cols-2 lg:py-16">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                AI incident workspace
              </p>
              <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Take control of production with{" "}
                <span className="bg-linear-to-r from-cyan-500 to-teal-400 bg-clip-text text-transparent">
                  AI-powered insights
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
                DevPulse AI helps you capture errors, group incidents, and resolve
                outages — powered by a Node + MongoDB backend and OpenAI.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="rounded-full px-6">
                  <Link to={token ? "/dashboard" : "/register"}>
                    {token ? "Go to dashboard" : "Start free"}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
              <div className="glass-panel mt-8 max-w-lg rounded-2xl p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900">Production-ready loop</p>
                <p className="mt-1">
                  SDK ingest, fingerprinting, GitHub issues, and AI analysis in one workspace.
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-5 shadow-[0_30px_80px_rgb(91_77_255_/_12%)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">AI incident assistant</p>
                  <p className="text-xs text-slate-500">Root cause in under a minute</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>
              <div className="space-y-3">
                <div className="ml-8 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                  Why did checkout start failing after the 1.4.2 release?
                </div>
                <div className="mr-4 rounded-2xl bg-primary px-4 py-3 text-sm text-white">
                  Null `customer.id` in `PaymentService.charge`. It started with release 1.4.2 and is hitting 38 users.
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span>Suggested severity: Critical</span>
                <span>Confidence 86%</span>
              </div>
            </div>
          </section>

          <section id="features" className="scroll-mt-24 grid gap-4 py-8 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="glass-panel rounded-3xl p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p>
              </article>
            ))}
          </section>

          <section id="how-it-works" className="glass-panel scroll-mt-24 mt-6 rounded-[28px] p-8">
            <h2 className="text-2xl font-bold text-slate-950">How it works</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {[
                ["1", "Install the SDK", "Drop in one init call and start capturing production errors."],
                ["2", "Group automatically", "DevPulse fingerprints events into durable issues."],
                ["3", "Resolve with AI", "Open an issue, run analysis, and ship the fix faster."],
              ].map(([step, title, body]) => (
                <div key={step}>
                  <p className="text-sm font-semibold text-primary">Step {step}</p>
                  <h3 className="mt-2 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}
