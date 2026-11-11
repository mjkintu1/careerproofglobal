"use client";

import { useEffect, useState } from "react";
import type { NetworkRoute } from "@careerproof/career-graph";
import type { CareerCard } from "@/lib/path-network";

/** Routes and node cards from /api/paths for one start, goal and country. */
export function usePathRoutes(from: string, to: string, country: string | null) {
  const key = `${from}>${to}>${country ?? ""}`;
  const [data, setData] = useState<{ key: string; routes: NetworkRoute[]; cards: Record<string, CareerCard> } | null>(null);
  const [error, setError] = useState<{ key: string; message: string } | null>(null);
  useEffect(() => {
    if (from === to) return;
    const ctrl = new AbortController();
    fetch(`/api/paths?${new URLSearchParams({ from, to, ...(country ? { country } : {}) })}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { routes: NetworkRoute[]; cards: Record<string, CareerCard> }) => setData({ key, ...d }))
      .catch((e: Error) => { if (e.name !== "AbortError") setError({ key, message: "Couldn't load routes. Try again." }); });
    return () => ctrl.abort();
  }, [key, from, to, country]);
  const current = data?.key === key ? data : null;
  return {
    key,
    routes: current?.routes ?? [],
    cards: current?.cards ?? data?.cards ?? {},
    loading: from !== to && !current && error?.key !== key,
    error: error?.key === key ? error.message : null,
  };
}
