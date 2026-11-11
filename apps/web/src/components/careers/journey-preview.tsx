import Link from "next/link";
import { ArrowRight, Flag, MapPin, Shuffle, Target } from "lucide-react";
import type { CareerPath, Occupation, TransitionKind } from "@careerproof/career-graph";
import { careerHref, formatYears, kindLabel } from "@/lib/careers";

type Role = "current" | "step" | "pivot" | "target";

const ROLE: Record<Role, { border: string; badge: string; label: string; Icon: typeof Flag }> = {
  current: { border: "border-emerald-400", badge: "bg-emerald-100 text-emerald-900", label: "You are here", Icon: MapPin },
  step: { border: "border-slate-300", badge: "bg-slate-100 text-slate-800", label: "Step", Icon: Flag },
  pivot: { border: "border-orange-400", badge: "bg-orange-100 text-orange-900", label: "Change field", Icon: Shuffle },
  target: { border: "border-amber-400", badge: "bg-amber-100 text-amber-900", label: "Goal", Icon: Target },
};

const EDGE: Record<TransitionKind, { stroke: string; dash?: string; pill: string }> = {
  progression: { stroke: "#22c55e", pill: "border-emerald-400" },
  specialisation: { stroke: "#22c55e", pill: "border-emerald-400" },
  pivot: { stroke: "#fb923c", dash: "7 6", pill: "border-orange-400" },
};

/* Layout, in px vertically and % horizontally: nodes zigzag between two columns. */
const NODE_H = 84;
const ROW = 158;
const NODE_W = 46; // % of the canvas width
const colLeft = (i: number) => (i % 2 === 0 ? 0 : 100 - NODE_W);
const colMid = (i: number) => colLeft(i) + NODE_W / 2;

function Port({ x, y }: { x: number; y: number }) {
  return <span aria-hidden className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-navy-900 bg-slate-300" style={{ left: `${x}%`, top: y }} />;
}

/**
 * Example journey drawn as a node graph, in the style of the path planner: role-coloured
 * nodes, curved connectors (solid for steps up, dashed for changes of field) and a label
 * on every connector. Static HTML and SVG, no client JavaScript; a text list is kept for
 * screen readers.
 */
export function JourneyPreview({ path, location, caption }: { path: CareerPath; location: string; caption: string }) {
  const first = path.steps[0]?.from;
  if (!first) return null;
  const nodes: { occ: Occupation; role: Role }[] = [
    { occ: first, role: "current" },
    ...path.steps.map((s, i) => ({ occ: s.to, role: (i === path.steps.length - 1 ? "target" : s.transition.kind === "pivot" ? "pivot" : "step") as Role })),
  ];
  const height = (nodes.length - 1) * ROW + NODE_H;
  const planner = `/paths?from=${first.slug}&to=${nodes[nodes.length - 1]!.occ.slug}`;

  return (
    <figure className="rounded-[var(--radius-card)] border border-navy-800 bg-navy-800/60 p-5">
      <figcaption className="mb-4 flex items-center justify-between gap-3 text-sm font-semibold uppercase tracking-wide text-teal-500">
        {caption}
        <span className="normal-case tracking-normal text-slate-400">{path.steps.length} moves, {formatYears(path.totalYears)}</span>
      </figcaption>

      <div aria-hidden className="relative rounded-xl bg-[radial-gradient(circle,rgba(148,163,184,0.18)_1.2px,transparent_1.2px)] [background-size:20px_20px]" style={{ height }}>
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
          {path.steps.map((s, i) => {
            const e = EDGE[s.transition.kind];
            const x1 = colMid(i), y1 = i * ROW + NODE_H, x2 = colMid(i + 1), y2 = (i + 1) * ROW;
            const my = (y1 + y2) / 2;
            return (
              <path key={i} d={`M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`} fill="none"
                stroke={e.stroke} strokeWidth={2.5} strokeDasharray={e.dash} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            );
          })}
        </svg>

        {nodes.map((n, i) => {
          const r = ROLE[n.role];
          return (
            <Link key={n.occ.slug} href={careerHref(location, n.occ.slug)} tabIndex={-1}
              className={`absolute flex flex-col justify-center rounded-2xl border-2 bg-white px-3 py-2 text-ink no-underline shadow-lg shadow-navy-900/40 transition hover:-translate-y-0.5 hover:text-teal-800 ${r.border}`}
              style={{ left: `${colLeft(i)}%`, width: `${NODE_W}%`, top: i * ROW, height: NODE_H }}>
              <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${r.badge}`}>
                <r.Icon className="h-3 w-3" /> {r.label}
              </span>
              <span className="mt-1 line-clamp-2 font-display text-[15px] font-bold leading-tight">{n.occ.title}</span>
            </Link>
          );
        })}

        {nodes.map((_, i) => (
          <span key={`p${i}`}>
            {i > 0 && <Port x={colMid(i)} y={i * ROW} />}
            {i < nodes.length - 1 && <Port x={colMid(i)} y={i * ROW + NODE_H} />}
          </span>
        ))}

        {path.steps.map((s, i) => {
          const y = (i * ROW + NODE_H + (i + 1) * ROW) / 2;
          return (
            <span key={`l${i}`} title={s.transition.via}
              className={`absolute left-1/2 w-max max-w-[78%] sm:max-w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border bg-navy-900 px-3 py-1 text-center text-xs leading-snug text-slate-200 ${EDGE[s.transition.kind].pill}`}
              style={{ top: y }}>
              <span className="whitespace-nowrap"><strong className="text-white">{kindLabel[s.transition.kind]}</strong> · {formatYears(s.transition.years)}</span>
              <span className="block truncate text-[11px] text-slate-400">{s.transition.via}</span>
            </span>
          );
        })}
      </div>

      {/* Same journey as text, for screen readers. */}
      <ol className="sr-only">
        <li><Link href={careerHref(location, first.slug)}>{first.title}</Link></li>
        {path.steps.map((s) => (
          <li key={s.to.slug}>
            {kindLabel[s.transition.kind]}, {formatYears(s.transition.years)}: {s.transition.via}. <Link href={careerHref(location, s.to.slug)}>{s.to.title}</Link>
          </li>
        ))}
      </ol>

      <Link href={planner} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-400 no-underline hover:text-white">
        See every route in the path planner <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </figure>
  );
}
