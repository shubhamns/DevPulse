import { useEffect, useState } from "react";
import { getApiHealth, type HealthResponse } from "@/services/health";

export function useApiHealth() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void getApiHealth()
      .then((response) => {
        if (!cancelled) {
          setData(response);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Health check failed");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, loading };
}
