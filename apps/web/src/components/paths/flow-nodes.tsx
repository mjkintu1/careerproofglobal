"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Flag, GraduationCap, MapPin, Shuffle, Target } from "lucide-react";
import type { CountryEarnings } from "@careerproof/reference-data";
import { money } from "./money";

export type CareerNodeRole = "current" | "target" | "step" | "pivot";
/** Backward view mirrors the canvas: inputs on the right, outputs on the left. */
const sides = (dir?: string) => (dir === "backward" ? { in: Position.Right, out: Position.Left } : { in: Position.Left, out: Position.Right });

export type CareerNodeData = {
  dir?: "forward" | "backward";
  title: string;
  role: CareerNodeRole;
  earnings: CountryEarnings | null;
  subtitle?: string;
  dimmed?: boolean;
  selected?: boolean;
};
export type CredentialNodeData = { title: string; years: number | null; type: string; dimmed?: boolean; dir?: "forward" | "backward" };

const ROLE: Record<CareerNodeRole, { ring: string; badge: string; label: string; Icon: typeof Flag }> = {
  current: { ring: "border-emerald-500", badge: "bg-emerald-100 text-emerald-900", label: "You are here", Icon: MapPin },
  target: { ring: "border-amber-500", badge: "bg-amber-100 text-amber-900", label: "Goal", Icon: Target },
  step: { ring: "border-slate-300", badge: "bg-slate-100 text-slate-800", label: "Step", Icon: Flag },
  pivot: { ring: "border-orange-500", badge: "bg-orange-100 text-orange-900", label: "Change field", Icon: Shuffle },
};

const handle = "!h-2.5 !w-2.5 !border-2 !border-white !bg-slate-400";

export function CareerNode({ data }: NodeProps<Node<CareerNodeData>>) {
  const r = ROLE[data.role];
  return (
    <div className={`w-[220px] rounded-2xl border-2 bg-white p-3 shadow-sm transition ${r.ring} ${data.dimmed ? "opacity-30" : ""} ${data.selected ? "ring-4 ring-teal-300" : ""}`}>
      <Handle type="target" position={sides(data.dir).in} className={handle} />
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${r.badge}`}>
        <r.Icon aria-hidden className="h-3 w-3" /> {r.label}
      </span>
      <p className="mt-1.5 font-display text-[15px] font-bold leading-tight text-ink">{data.title}</p>
      {data.subtitle && <p className="text-xs text-ink-muted">{data.subtitle}</p>}
      {data.earnings ? (
        <p className="mt-1.5 rounded-lg bg-teal-50 px-2 py-1 text-xs text-teal-900" title={`${data.earnings.groupTitle}, ${data.earnings.year}. ${data.earnings.attribution}`}>
          <strong>{money(data.earnings.monthly, data.earnings.currency)}</strong>/month <span className="text-teal-800/80">group avg, {data.earnings.year}</span>
        </p>
      ) : null}
      <Handle type="source" position={sides(data.dir).out} className={handle} />
    </div>
  );
}

export function CredentialNode({ data }: NodeProps<Node<CredentialNodeData>>) {
  return (
    <div className={`w-[190px] rounded-xl border-2 border-violet-400 bg-violet-50 p-2.5 shadow-sm ${data.dimmed ? "opacity-30" : ""}`}>
      <Handle type="target" position={sides(data.dir).in} className={handle} />
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-200 px-2 py-0.5 text-[11px] font-bold text-violet-900">
        <GraduationCap aria-hidden className="h-3 w-3" /> {data.type}
      </span>
      <p className="mt-1 line-clamp-4 text-[13px] font-semibold leading-tight text-violet-950" title={data.title}>{data.title}</p>
      <p className="text-xs text-violet-800">{data.years === null ? "Time varies" : `${data.years} yr${data.years === 1 ? "" : "s"}`}</p>
      <Handle type="source" position={sides(data.dir).out} className={handle} />
    </div>
  );
}

export function StartNode({ data }: NodeProps<Node<{ title: string; dimmed?: boolean; dir?: "forward" | "backward" }>>) {
  return (
    <div className={`w-[180px] rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-3 shadow-sm ${data.dimmed ? "opacity-30" : ""}`}>
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-900">
        <MapPin aria-hidden className="h-3 w-3" /> You are here
      </span>
      <p className="mt-1.5 font-display text-[15px] font-bold leading-tight text-ink">{data.title}</p>
      <Handle type="source" position={sides(data.dir).out} className={handle} />
    </div>
  );
}

export const nodeTypes = { career: CareerNode, credential: CredentialNode, start: StartNode };
