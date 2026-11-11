"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { careerGraphData } from "@careerproof/sample-data";
import { clusterName, graph } from "@/lib/careers";
import { isLong, PathCanvas, type PathDirection } from "@/components/paths/path-canvas";
import { DirectionToggle, Legend, RouteList, START, START_LABEL, yearsText } from "@/components/paths/route-list";
import { usePathRoutes } from "@/components/paths/use-path-routes";

interface Props {
  location: string;
  initialFrom?: string;
  initialTo?: string;
}

function CareerSelect({ label, value, onChange, withStart }: { label: string; value: string; onChange: (v: string) => void; withStart?: boolean }) {
  return (
    <label className="block space-y-1">
      <span className="block font-semibold">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field">
        {withStart && <option value={START}>{START_LABEL}</option>}
        {careerGraphData.clusters.map((c) => (
          <optgroup key={c.slug} label={clusterName(c.slug)}>
            {graph.inCluster(c.slug).map((o) => <option key={o.slug} value={o.slug}>{o.title}</option>)}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

/** Compact route planner for career pages: the same node canvas and routes as /paths. */
export function PathFinder({ location, initialFrom = "it-support-technician", initialTo = "data-scientist" }: Props) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [direction, setDirection] = useState<PathDirection>("forward");
  const [active, setActive] = useState<number | null>(null);
  const country = location === "global" ? null : location.toUpperCase();
  const { key, routes: all, cards, loading, error } = usePathRoutes(from, to, country);
  const routes = useMemo(() => all.filter((r) => !isLong(r.weight, all[0]?.weight ?? 0)).slice(0, 6), [all]);
  const planner = `/paths${country ? `/${location.toLowerCase()}` : ""}?${new URLSearchParams({ from, to })}`;

  return (
    <section aria-labelledby="path-finder-heading" className="card space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="path-finder-heading" className="text-xl font-extrabold">Plan a path between two careers</h2>
          <p className="text-ink-muted">Every route, as a map you can read from the start or work back from the goal. No limit on moves.</p>
        </div>
        <Link href={planner} className="btn-primary">Open the full planner</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CareerSelect label="Where you are now" value={from} onChange={(v) => { setFrom(v); setActive(null); }} withStart />
        <CareerSelect label="Where you want to be" value={to} onChange={(v) => { setTo(v); setActive(null); }} />
      </div>
      <div className="flex flex-wrap items-center gap-2" aria-live="polite">
        {from === to ? <p className="text-ink-muted">Pick two different careers.</p>
          : error ? <p className="text-red-700">{error}</p>
          : loading ? <p className="text-ink-muted">Finding routes…</p>
          : routes.length === 0 ? <p className="text-ink-muted">No route found between these two yet.</p>
          : <>
              <button type="button" onClick={() => setActive(null)} className={`chip border border-border ${active === null ? "bg-navy-900 text-white" : "bg-white"}`}>All {routes.length}</button>
              {routes.map((r, i) => (
                <button key={i} type="button" onClick={() => setActive(i)} className={`chip border border-border ${active === i ? "bg-navy-900 text-white" : "bg-white"}`}>
                  {i + 1}: {r.edges.length} move{r.edges.length > 1 ? "s" : ""}{r.knownYears ? `, ${yearsText(r.knownYears)}` : ""}{r.unknownMoves ? " + ?" : ""}
                </button>
              ))}
              <span className="ml-auto"><DirectionToggle value={direction} onChange={setDirection} /></span>
            </>}
      </div>
      {from !== to && routes.length > 0 && (
        <>
          <PathCanvas routes={routes} cards={cards} from={from} to={to} active={active} selected={null} direction={direction}
            layoutKey={`${key}:${routes.length}`} onSelectRoute={setActive} className="h-[460px]" />
          <Legend />
          <details>
            <summary className="cursor-pointer font-semibold">Routes as text</summary>
            <div className="mt-3"><RouteList routes={routes} cards={cards} direction={direction} /></div>
          </details>
        </>
      )}
    </section>
  );
}
