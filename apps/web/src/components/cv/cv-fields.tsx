"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId } from "react";

export function TextField({ label, value, onChange, placeholder, type = "text", hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hint?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
      <input id={id} type={type} className="field w-full" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export function AreaField({ label, value, onChange, placeholder, hint, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; rows?: number;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
      <textarea id={id} rows={rows} className="field w-full" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

/** A repeatable group of entries (jobs, qualifications) with add and remove buttons. */
export function Repeater<T>({ items, onChange, blank, render, noun }: {
  items: T[]; onChange: (items: T[]) => void; blank: T; noun: string;
  render: (item: T, set: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <fieldset key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
          <legend className="px-1 text-sm font-semibold text-ink-muted">{noun} {i + 1}</legend>
          {render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))))}
          {items.length > 1 && (
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
              <Trash2 aria-hidden size={14} /> Remove {noun.toLowerCase()} {i + 1}
            </button>
          )}
        </fieldset>
      ))}
      <button type="button" onClick={() => onChange([...items, blank])} className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline">
        <Plus aria-hidden size={14} /> Add {noun.toLowerCase()}
      </button>
    </div>
  );
}
