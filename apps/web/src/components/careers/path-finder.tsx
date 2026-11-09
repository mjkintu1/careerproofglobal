"use client";

import { useMemo, useState } from "react";
import { careerGraphData } from "@careerproof/sample-data";
import { clusterName, formatYears, graph } from "@/lib/careers";
import { PathView } from "./path-view";

interface Props {
  location: string;
  initialFrom?: string;
  initialTo?: string;
}

const selectClass = "field";

function CareerSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1">
      <span className="block font-semibold">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {careerGraphData.clusters.map((c) => (
          <optgroup key={c.slug} label={clusterName(c.slug)}>
            {graph.inCluster(c.slug).map((o) => (
              <option key={o.slug} value={o.slug}>{o.title}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

export function PathFinder({ location, initialFrom = "it-support-technician", initialTo = "data-scientist" }: Props) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const path = useMemo(() => graph.findPath(from, to), [from, to]);

  return (
    <section aria-labelledby="path-finder-heading" className="card space-y-5 p-5 sm:p-6">
      <div>
        <h2 id="path-finder-heading" className="text-xl font-extrabold">Find a path between two careers</h2>
        <p className="text-ink-muted">The quickest known route, using moves people make.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CareerSelect label="Where you are now" value={from} onChange={setFrom} />
        <CareerSelect label="Where you want to be" value={to} onChange={setTo} />
      </div>
      <div aria-live="polite">
        {from === to ? (
          <p className="text-ink-muted">Pick two different careers.</p>
        ) : path ? (
          <div className="space-y-3">
            <p className="chip bg-navy-900 text-white">
              {path.steps.length} move{path.steps.length > 1 ? "s" : ""}, {formatYears(path.totalYears)} in total (typical, based on sample data)
            </p>
            <PathView path={path} location={location} />
          </div>
        ) : (
          <p className="text-ink-muted">
            No known path yet within 4 moves. As more people share their journeys, new paths appear.
          </p>
        )}
      </div>
    </section>
  );
}
