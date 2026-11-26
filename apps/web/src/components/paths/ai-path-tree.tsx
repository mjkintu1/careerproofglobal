"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import type { AiPathResult } from "@/lib/ai-path";
import { PayBenchmarks } from "@/components/pay/pay-benchmarks";

const span = (a: number, b: number) => {
  const f = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(1));
  return a === b ? `${f(a)} year${a === 1 ? "" : "s"}` : `${f(a)}–${f(b)} years`;
};

function List({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{items.map((x) => <li key={x}>{x}</li>)}</ul>
    </div>
  );
}

/** An AI-written career path drawn as a top-down tree: the main line of stages, with ways in and ways out branching off. */
export function AiPathTree({ result, onPlanRoutes }: { result: AiPathResult; onPlanRoutes?: (slug: string) => void }) {
  const { path, official, matched } = result;
  if (!path.recognised) {
    return <div role="status" className="card p-4 text-ink-muted">{path.message || "Ask about a career, for example \"I want to become a pilot\"."}</div>;
  }
  // Running totals: years from the start to the end of each stage.
  const totals = path.stages.reduce<{ lo: number; hi: number }[]>(
    (acc, s) => [...acc, { lo: (acc.at(-1)?.lo ?? 0) + s.yearsMin, hi: (acc.at(-1)?.hi ?? 0) + s.yearsMax }], []);
  return (
    <section aria-labelledby="ai-path-heading" className="card space-y-5 p-5">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          <Sparkles aria-hidden size={14} /> Written by AI: check with the official bodies listed below before you decide
        </p>
        <h3 id="ai-path-heading" className="text-xl font-extrabold">How to become {/^[aeiou]/i.test(path.career) ? "an" : "a"} {path.career}{path.country && path.country !== "Global" ? ` in ${path.country}` : ""}</h3>
        <p className="text-ink-muted">{path.summary}</p>
      </div>

      {path.stages.some((s) => s.payEstimate) && (
        <p className="text-sm text-ink-muted">Pay ranges are typical estimates for this country{official ? "; official figures are below" : ""}.</p>
      )}
      <ol className="relative space-y-4 border-l-2 border-teal-100 pl-6">
        {path.stages.map((s, i) => {
          const ins = path.branches.filter((b) => b.afterStage === i && b.kind === "alternative-entry");
          const outs = path.branches.filter((b) => b.afterStage === i && b.kind === "exit");
          return (
            <li key={`${i}-${s.title}`} className="relative">
              <span aria-hidden className="absolute -left-[35px] top-4 flex size-5 items-center justify-center rounded-full border-4 border-white bg-teal-600 text-[10px] font-bold text-white shadow">{i + 1}</span>
              <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-lg font-bold">{s.title}</p>
                  <p className="text-sm font-semibold text-teal-800">{span(s.yearsMin, s.yearsMax)} <span className="font-normal text-ink-muted">· {span(totals[i]!.lo, totals[i]!.hi)} in total</span></p>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <List label="Study" items={s.study} />
                  <List label="Experience" items={s.experience} />
                  <List label="Certifications" items={s.certifications} />
                </div>
                {s.payEstimate && <p className="mt-3 text-sm"><span className="font-semibold">Pay:</span> {s.payEstimate}</p>}
              </div>
              {(ins.length > 0 || outs.length > 0) && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {ins.map((b) => <li key={b.title} className="inline-flex items-start gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-sm"><ArrowDownRight aria-hidden size={16} className="mt-0.5 shrink-0 text-teal-700" /><span><b>Another way in:</b> {b.title}. {b.detail}</span></li>)}
                  {outs.map((b) => <li key={b.title} className="inline-flex items-start gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm"><ArrowUpRight aria-hidden size={16} className="mt-0.5 shrink-0 text-slate-600" /><span><b>Common move out:</b> {b.title}. {b.detail}</span></li>)}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      {official && (
        <div className="space-y-2 rounded-xl border border-teal-200 bg-teal-50/50 p-4">
          <p className="font-semibold">Official pay figures <span className="font-normal text-ink-muted">(for {official.basis}, from the publishers named)</span></p>
          {official.regulator && <p className="text-sm"><span className="font-semibold">Licensing body:</span> {official.regulator}</p>}
          <PayBenchmarks items={official.pay} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <List label="Confirm requirements with" items={path.bodiesToCheck} />
        <List label="Good to know" items={path.caveats} />
      </div>

      {matched && (
        <div className="flex flex-wrap gap-3">
          <Link href={`/careers/global/${matched.slug}`} className="btn-primary">Read the {matched.title} guide</Link>
          {onPlanRoutes && <button type="button" onClick={() => onPlanRoutes(matched.slug)} className="inline-flex min-h-11 items-center rounded-xl px-4 font-semibold text-teal-800 hover:bg-teal-50">See every route on the map</button>}
        </div>
      )}
      <p className="text-xs text-ink-muted">AI-written by {result.model}. Stages, years and pay estimates are general guidance and can be wrong; official figures above come from the sources named.</p>
    </section>
  );
}
