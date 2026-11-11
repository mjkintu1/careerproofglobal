"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { CareerCard } from "@/lib/path-network";
import { PayBenchmarks } from "@/components/pay/pay-benchmarks";

interface Props {
  card: CareerCard | null;
  countryName: string | null;
  onPlanFrom: (slug: string) => void;
  onGoal: (slug: string) => void;
  onClose: () => void;
}

/** Side panel for the career node the user clicked. */
export function Inspector({ card, countryName, onPlanFrom, onGoal, onClose }: Props) {
  if (!card) {
    return (
      <aside className="card p-5 text-sm text-ink-muted">
        <p className="font-display text-base font-bold text-ink">Click any career on the canvas</p>
        <p className="mt-1">You&rsquo;ll see what it involves, how people get in, and pay{countryName ? ` in ${countryName}` : " once you pick a country"}.</p>
        <p className="mt-3">Click a line to highlight its route. Drag to pan, scroll to zoom.</p>
      </aside>
    );
  }
  return (
    <aside className="card space-y-4 p-5" aria-label={`${card.title} details`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-bold leading-tight">{card.title}</h3>
        <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100" aria-label="Close details"><X className="h-4 w-4" /></button>
      </div>
      <p className="text-sm text-ink-muted">{card.summary}</p>

      <section className="space-y-2">
        <h4 className="text-sm font-bold">{countryName ? `Pay in ${countryName}` : "Pay benchmarks (US and UK)"}</h4>
        <PayBenchmarks items={card.pay} empty={countryName ? `No official pay figure for this occupation in ${countryName} yet.` : "Pick a country above for local pay."} />
      </section>

      <section className="space-y-1">
        <h4 className="text-sm font-bold">Entry level</h4>
        {card.entryEducation && <p className="text-sm">Usually: {card.entryEducation}{card.kind === "guided" && <span className="text-ink-muted"> (ISCO-08 skill level)</span>}</p>}
        <ul className="space-y-1 text-sm">
          {card.routes.map((r) => <li key={r.title} className="rounded-lg bg-violet-50 px-2 py-1">{r.title} <span className="text-ink-muted">· {r.years} yr{r.years === 1 ? "" : "s"}</span></li>)}
        </ul>
        {card.regulator && <p className="text-sm">Licensing: {card.regulator}</p>}
      </section>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary justify-center" onClick={() => onPlanFrom(card.slug)}>Plan from here</button>
        <button type="button" className="inline-flex min-h-11 items-center rounded-full border border-border px-5 font-bold hover:bg-slate-50" onClick={() => onGoal(card.slug)}>Make this my goal</button>
      </div>
      {card.kind === "guided"
        ? <Link href={`/careers/global/${card.slug}`} className="block text-sm font-semibold">Full career guide</Link>
        : <a href={`https://www.onetonline.org/link/summary/${card.onet}`} className="block text-sm font-semibold" rel="noopener">Details on O*NET OnLine</a>}
    </aside>
  );
}
