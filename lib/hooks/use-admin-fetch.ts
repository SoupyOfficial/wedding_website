"use client";

import { useState, useEffect, useCallback } from "react";

interface UseAdminFetchResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
}

/**
 * Hook for fetching admin API data with loading/error state.
 * Reads from `response.data` by default (standard API response shape).
 */
export function useAdminFetch<T>(url: string): UseAdminFetchResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(url);
      const json = await res.json();
      if (json.data) setData(json.data);
    } catch (err) {
      console.error(`Failed to fetch ${url}:`, err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch, setData };
}

interface UseAdminMultiFetchResult<T extends Record<string, unknown[]>> {
  data: T;
  loading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching multiple admin API endpoints in parallel.
 * Pass a map of key → URL, get back a map of key → data[].
 */
export function useAdminMultiFetch<T extends Record<string, unknown[]>>(
  endpoints: Record<keyof T, string>
): UseAdminMultiFetchResult<T> {
  const keys = Object.keys(endpoints) as (keyof T)[];
  const urls = keys.map((k) => endpoints[k]);

  const [data, setData] = useState<T>(() => {
    const initial = {} as T;
    for (const key of keys) {
      (initial as Record<string, unknown[]>)[key as string] = [];
    }
    return initial;
  });
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const responses = await Promise.all(urls.map((url) => fetch(url)));
      const jsons = await Promise.all(responses.map((res) => res.json()));
      const newData = {} as T;
      keys.forEach((key, i) => {
        (newData as Record<string, unknown[]>)[key as string] =
          jsons[i]?.data || jsons[i]?.success ? jsons[i].data : [];
      });
      setData(newData);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(urls)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, refetch };
}
