// src/hooks/useFetch.ts
import { useEffect, useState } from "react";
import axios from "axios";

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface UseFetchResult<T> {
  data: T | null;
  message: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T = unknown, R = T>(
  url: string,
  enabled = true,
  transform?: (rawBody: any) => R,
): UseFetchResult<R> {
  const [data, setData] = useState<R | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setError(null);

    axios
      .get(url)
      .then((response) => {
        if (!alive) return;
        const raw = response.data;

        // 1) Custom transform, OR
        // 2) unwrap .data if present, OR
        // 3) fall back to the raw body (for endpoints without a wrapper)
        const value: R = transform
          ? transform(raw)
          : ((raw && typeof raw === "object" && "data" in raw
              ? raw.data
              : raw) as unknown as R);

        setData(value);
        setMessage(raw?.message ?? null);
      })
      .catch((err) => {
        if (!alive) return;
        setError(
          err.response?.data?.message || err.message || "Something went wrong",
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, trigger, enabled]);

  const refetch = () => {
    setTrigger((current) => current + 1);
  };

  return { data, message, loading, error, refetch };
}
