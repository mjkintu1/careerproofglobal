"use client";

import Link from "next/link";
import { ArrowRight, Flag, LogIn, LogOut, Sparkles } from "lucide-react";
import type { AiPathResult } from "@/lib/ai-path";
import type { AiPath } from "@/lib/ai-path-schema";
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

type Branch = AiPath["branches"][number];

/**
 * A side route on the diagram. On wide screens ways in sit left of the main line with an arrow into the stage
 * they join; moves out sit right with an arrow leaving the stage. On phones both indent off the main line.
 */
function BranchCard({ b, stage }: { b: Branch; stage: number }) {
  const into = b.kind === "alternative-entry";
  return (
    <div className={`relative ml-10 rounded-xl border p-3 text-sm lg:ml-0 ${into ? "border-teal-200 bg-teal-50" : "border-dashed border-slate-300 bg-slate-50"}`}>
      {/* connector: from the main line on phones; across the gutter to the stage card on wide screens */}
      <span aria-hidden className={`absolute top-1/2 -left-6 h-0.5 w-6 lg:w-10 ${into ? "bg-teal-400 lg:left-full" : "bg-slate-300 lg:-left-10"}`} />
      <ArrowRight aria-hidden size={14} className={`absolute top-1/2 hidden -translate-y-1/2 lg:block ${into ? "text-teal-500 lg:left-[calc(100%+1.6rem)]" : "text-slate-400 lg:-left-3.5"}`} />
      <p className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${into ? "text-teal-800" : "text-slate-600"}`}>
        {into ? <LogIn aria-hidden size={13} /> : <LogOut aria-hidden size={13} />}
        {into ? `Another way in · joins at stage ${stage + 1}` : `Common move out · after stage ${stage + 1}`}
      </p>
      <p className="mt-1 font-semibold">{b.title}</p>
      {b.detail && <p className="mt-0.5 text-ink-muted">{b.detail}</p>}
    </div>
  );
}

const COLS = "lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] lg:gap-x-10";

/** The main line. `phone` draws it down the left of the whole row; otherwise down the middle of the centre column. */
function Spine({ phone, first, last }: { phone?: boolean; first?: boolean; last?: boolean }) {
  return (
    <span aria-hidden className={`absolute w-0.5 -translate-x-1/2 bg-teal-200 ${phone ? "left-4 lg:hidden" : "left-1/2 hidden lg:block"} ${first ? "top-1/2" : "top-0"} ${last ? "bottom-1/2" : "bottom-0"}`} />
  );
}

/** A labelled pill on the main line (start and goal). */
function Node({ wide, first, last, children }: { wide: boolean; first?: boolean; last?: boolean; children: React.ReactNode }) {
  return (
    <li className={`relative grid ${wide ? COLS : ""}`}>
      <Spine phone first={first} last={last} />
      <div className="relative flex py-2 lg:col-start-2 lg:justify-center">
        <Spine first={first} last={last} />
        <span className="relative z-10 ml-10 inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white shadow-sm lg:ml-0">{children}</span>
      </div>
    </li>
  );
}

/** An AI-written career path drawn as a diagram: the main line of stages, with ways in joining from the left and moves out leaving to the right. */
export function AiPathTree({ result, onPlanRoutes }: { result: AiPathResult; onPlanRoutes?: (slug: string) => void }) {
  const { path, official, matched } = result;
  if (!path.recognised) {
    return <div role="status" className="card p-4 text-ink-muted">{path.message || "Ask about a career, for example \"I want to become a pilot\"."}</div>;
  }
  const last = Math.max(0, path.stages.length - 1);
  // Running totals: years from the start to the end of each stage.
  const totals = path.stages.reduce<{ lo: number; hi: number }[]>(
    (acc, s) => [...acc, { lo: (acc.at(-1)?.lo ?? 0) + s.yearsMin, hi: (acc.at(-1)?.hi ?? 0) + s.yearsMax }], []);
  // Keep every branch: one pointing past either end attaches to the nearest stage.
  const at = (b: Branch) => Math.min(last, Math.max(0, Math.round(b.afterStage)));
  const wide = path.branches.length > 0;
  const ins = path.branches.some((b) => b.kind === "alternative-entry");
  const outs = path.branches.some((b) => b.kind === "exit");
  const goal = totals.at(-1);
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

      {wide && (
        <div aria-hidden className={`hidden text-center text-xs font-semibold uppercase tracking-wide text-ink-muted lg:grid ${COLS}`}>
          <p>{ins ? "Other ways in" : ""}</p><p>Main route</p><p>{outs ? "Common moves out" : ""}</p>
        </div>
      )}

      <ol aria-label={`Career path diagram: ${path.stages.length} stages`} className={wide ? "" : "mx-auto max-w-3xl"}>
        <Node wide={wide} first><Flag aria-hidden size={14} /> Start: from school or at any point in your career</Node>
        {path.stages.map((s, i) => {
          const into = path.branches.filter((b) => at(b) === i && b.kind === "alternative-entry");
          const away = path.branches.filter((b) => at(b) === i && b.kind === "exit");
          return (
            <li key={`${i}-${s.title}`} className={`relative grid gap-y-2 py-3 lg:py-0 ${wide ? `${COLS} lg:items-center` : ""}`}>
              <Spine phone />
              {wide && <div className={`space-y-2 lg:col-start-1 lg:row-start-1 ${into.length ? "" : "hidden lg:block"}`}>{into.map((b) => <BranchCard key={b.title} b={b} stage={i} />)}</div>}
              <div className="relative lg:col-start-2 lg:row-start-1 lg:self-stretch lg:py-3">
                <Spine />
                <div className="relative z-10 ml-10 rounded-xl border border-line bg-white p-4 shadow-sm lg:ml-0">
                  <span aria-hidden className="absolute top-4 -left-6 flex size-7 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-teal-600 text-xs font-bold text-white shadow lg:-top-3.5 lg:left-1/2">{i + 1}</span>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-lg font-bold"><span className="sr-only">Stage {i + 1}: </span>{s.title}</p>
                    <p className="text-sm font-semibold text-teal-800">{span(s.yearsMin, s.yearsMax)} <span className="font-normal text-ink-muted">· {span(totals[i]!.lo, totals[i]!.hi)} in total</span></p>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <List label="Study" items={s.study} />
                    <List label="Experience" items={s.experience} />
                    <List label="Certifications" items={s.certifications} />
                  </div>
                  {s.payEstimate && <p className="mt-3 text-sm"><span className="font-semibold">Pay:</span> {s.payEstimate}</p>}
                </div>
              </div>
              {wide && <div className={`space-y-2 lg:col-start-3 lg:row-start-1 ${away.length ? "" : "hidden lg:block"}`}>{away.map((b) => <BranchCard key={b.title} b={b} stage={i} />)}</div>}
            </li>
          );
        })}
        <Node wide={wide} last><Flag aria-hidden size={14} /> {path.career}{goal ? ` · about ${span(goal.lo, goal.hi)} from the start` : ""}</Node>
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
