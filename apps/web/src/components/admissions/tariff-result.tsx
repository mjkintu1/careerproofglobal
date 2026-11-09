"use client";

import { useId, useState } from "react";
import type { PointsLine } from "@careerproof/rules-engine";

/** Total, breakdown and an optional comparison with the points a course asks for (no chance prediction). */
export function TariffResult({ total, lines }: { total: number; lines: PointsLine[] }) {
  const id = useId();
  const [target, setTarget] = useState("");
  const asked = Number(target);
  const hasTarget = target !== "" && Number.isFinite(asked);
  return (
    <section aria-labelledby={`${id}-r`} className="space-y-4">
      <div className="card space-y-3 bg-navy-900 p-5 text-white sm:p-6">
        <h2 id={`${id}-r`} className="text-lg font-bold">Your UCAS Tariff points</h2>
        <p className="font-display text-5xl font-extrabold" aria-live="polite">{total}</p>
        {lines.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {lines.map((l, i) => (
              <li key={i} className="flex justify-between gap-3"><span>{l.label}, grade {l.grade}</span><span className="font-semibold">{l.points}</span></li>
            ))}
          </ul>
        ) : <p className="text-sm">Choose a grade to start.</p>}
      </div>
      <div className="card space-y-3 p-5">
        <label className="block space-y-1">
          <span className="block font-semibold">Points a course asks for (optional)</span>
          <input className="field" inputMode="numeric" value={target} placeholder="For example 120, from the course page"
            onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ""))} />
        </label>
        {hasTarget && (
          <p aria-live="polite" className={`font-semibold ${total >= asked ? "text-teal-800" : "text-ink"}`}>
            {total >= asked
              ? `You have ${total} points, ${total - asked} more than the ${asked} asked for.`
              : `You have ${total} points, ${asked - total} short of the ${asked} asked for.`}
          </p>
        )}
        <p className="text-sm text-ink-muted">Meeting a points requirement does not guarantee an offer. Courses may also ask for particular subjects or grades.</p>
      </div>
    </section>
  );
}
