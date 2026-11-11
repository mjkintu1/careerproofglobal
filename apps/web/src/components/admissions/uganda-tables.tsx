"use client";

import { Search } from "lucide-react";
import { useId, useMemo, useState } from "react";

function Filter({ label, value, onChange, count, total, placeholder }: { label: string; value: string; onChange: (v: string) => void; count: number; total: number; placeholder: string }) {
  const id = useId();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="w-full max-w-md">
        <label htmlFor={id} className="mb-1 block font-semibold">{label}</label>
        <div className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 shadow-sm focus-within:border-teal-700">
          <Search aria-hidden="true" size={18} className="shrink-0 text-ink-muted" />
          <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            autoComplete="off" className="w-full bg-transparent text-ink outline-none placeholder:text-ink-muted" />
        </div>
      </div>
      <p className="text-sm text-ink-muted" role="status" aria-live="polite">Showing {count} of {total}</p>
    </div>
  );
}

const has = (q: string, ...fields: (string | null | undefined)[]) => {
  const t = q.trim().toLowerCase();
  return !t || fields.some((f) => f?.toLowerCase().includes(t));
};

export interface CutoffRow {
  university: string;
  programme: string;
  code?: string | null;
  cutoffs: { year: string; all?: number | null; female?: number | null; male?: number | null }[];
}

const cell = (c?: CutoffRow["cutoffs"][number]) => {
  if (!c) return "-";
  if ("all" in c) return c.all ?? "-";
  return `F ${c.female ?? "-"} / M ${c.male ?? "-"}`;
};

export function CutoffTable({ rows }: { rows: CutoffRow[] }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => rows.filter((r) => has(q, r.programme, r.university, r.code)), [rows, q]);
  const years = rows[0]?.cutoffs.map((c) => c.year) ?? [];
  return (
    <div className="space-y-4">
      <Filter label="Find a programme or university" value={q} onChange={setQ} count={shown.length} total={rows.length} placeholder="e.g. medicine, Kyambogo, CSC" />
      <div className="card relative overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Government-sponsorship cut-off points by programme</caption>
          <thead className="bg-surface-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Programme</th>
              <th scope="col" className="px-4 py-3">University</th>
              {years.map((y) => <th key={y} scope="col" className="whitespace-nowrap px-4 py-3">{y}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((r) => (
              <tr key={`${r.university}-${r.programme}-${rows.indexOf(r)}`}>
                <th scope="row" className="px-4 py-2 font-semibold">{r.programme}{r.code ? <span className="ml-1 text-xs font-normal text-ink-muted">({r.code})</span> : null}</th>
                <td className="px-4 py-2">{r.university}</td>
                {years.map((y) => <td key={y} className="whitespace-nowrap px-4 py-2">{cell(r.cutoffs.find((c) => c.year === y))}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface InstitutionRow { name: string; category: string; status: string; district: string; programmes: number }

export function InstitutionTable({ rows }: { rows: InstitutionRow[] }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => rows.filter((r) => has(q, r.name, r.district, r.status, r.category)), [rows, q]);
  return (
    <div className="space-y-4">
      <Filter label="Find an institution" value={q} onChange={setQ} count={shown.length} total={rows.length} placeholder="Name, district or status" />
      <div className="card max-h-[32rem] overflow-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Higher education institutions registered by NCHE</caption>
          <thead className="sticky top-0 bg-surface-muted">
            <tr><th scope="col" className="px-4 py-3">Institution</th><th scope="col" className="px-4 py-3">Status</th><th scope="col" className="px-4 py-3">District</th><th scope="col" className="px-4 py-3">Programmes</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((r) => (
              <tr key={`${r.name}-${rows.indexOf(r)}`}>
                <th scope="row" className="px-4 py-2 font-semibold">{r.name}</th>
                <td className="px-4 py-2">{r.status}</td>
                <td className="px-4 py-2">{r.district}</td>
                <td className="px-4 py-2">{r.programmes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
