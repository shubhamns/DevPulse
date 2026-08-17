import type { ReactNode } from "react";
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GlassBackdrop } from "@/components/GlassBackdrop";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { IssueDetailPage } from "@/pages/IssueDetailPage";
import { IssuesPage } from "@/pages/IssuesPage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { OrganizationsPage } from "@/pages/OrganizationsPage";
import { IntegrationsPage } from "@/pages/IntegrationsPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { useAuthStore } from "@/store/authStore";

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function FallbackRoute() {
  const token = useAuthStore((state) => state.token);
  return <Navigate to={token ? "/dashboard" : "/"} replace />;
}

export default function App() {
  const initialized = useAuthStore((state) => state.initialized);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <div className="relative flex h-svh items-center justify-center text-slate-600">
        <GlassBackdrop />
        <p className="relative">Loading session...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/issues/:id" element={<IssueDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route
            path="/releases"
            element={
              <PlaceholderPage
                title="Releases"
                description="Release health tracking and regression insights will land in a future milestone."
              />
            }
          />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/settings" element={<OrganizationsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<FallbackRoute />} />
    </Routes>
  );
}
