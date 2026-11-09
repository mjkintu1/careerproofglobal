"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { sumQualificationPoints } from "@careerproof/rules-engine";
import type { TariffQualification } from "@careerproof/reference-data";
import { TariffResult } from "./tariff-result";

interface Row { key: number; qualification: string; grade: string }

const START: Row[] = [
  { key: 1, qualification: "a-level", grade: "" },
  { key: 2, qualification: "a-level", grade: "" },
  { key: 3, qualification: "a-level", grade: "" },
];

export function TariffCalculator({ qualifications }: { qualifications: TariffQualification[] }) {
  const id = useId();
  const [rows, setRows] = useState<Row[]>(START);
  const [nextKey, setNextKey] = useState(START.length + 1);

  const groups = useMemo(() => {
    const m = new Map<string, TariffQualification[]>();
    for (const q of qualifications) m.set(q.group, [...(m.get(q.group) ?? []), q]);
    return [...m.entries()];
  }, [qualifications]);
  const byId = useMemo(() => new Map(qualifications.map((q) => [q.id, q])), [qualifications]);

  const result = useMemo(
    () => sumQualificationPoints(qualifications, rows.filter((r) => r.grade).map(({ qualification, grade }) => ({ qualification, grade }))),
    [qualifications, rows],
  );

  const update = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const add = () => { setRows((rs) => [...rs, { key: nextKey, qualification: "a-level", grade: "" }]); setNextKey((k) => k + 1); };
  const remove = (key: number) => setRows((rs) => rs.filter((r) => r.key !== key));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section aria-labelledby={`${id}-q`} className="card space-y-4 p-5 sm:p-6">
        <h2 id={`${id}-q`} className="text-xl font-extrabold">Your qualifications</h2>
        <ol className="space-y-3">
          {rows.map((r, i) => {
            const q = byId.get(r.qualification);
            return (
              <li key={r.key} className="grid gap-2 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
                <label className="block space-y-1">
                  <span className="block text-sm font-semibold">Qualification {i + 1}</span>
                  <select className="field" value={r.qualification} onChange={(e) => update(r.key, { qualification: e.target.value, grade: "" })}>
                    {groups.map(([g, qs]) => (
                      <optgroup key={g} label={g}>{qs.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</optgroup>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="block text-sm font-semibold">Grade</span>
                  <select className="field" value={r.grade} onChange={(e) => update(r.key, { grade: e.target.value })}>
                    <option value="">Choose</option>
                    {q?.grades.map((g) => <option key={g.grade} value={g.grade}>{g.grade} ({g.points} points)</option>)}
                  </select>
                </label>
                <button type="button" onClick={() => remove(r.key)} aria-label={`Remove qualification ${i + 1}`}
                  className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full px-3 text-sm font-semibold text-ink-muted hover:bg-surface-muted hover:text-ink">
                  <Trash2 aria-hidden="true" size={16} />
                </button>
              </li>
            );
          })}
        </ol>
        <button type="button" onClick={add} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-teal-700 px-4 font-semibold text-teal-800 hover:bg-teal-50">
          <Plus aria-hidden="true" size={18} /> Add a qualification
        </button>
      </section>
      <TariffResult total={result.total} lines={result.lines} />
    </div>
  );
}
