import { useApiHealth } from "@/hooks/useApiHealth";

export function StatusBanner() {
  const { data, error, loading } = useApiHealth();

  if (loading) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
        Checking API health...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        Frontend is running. API is not reachable yet. Start the backend with
        `npm run dev:backend`.
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
      API status: {data.status}. Database: {data.database}.
    </div>
  );
}
