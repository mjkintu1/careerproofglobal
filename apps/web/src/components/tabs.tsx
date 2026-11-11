"use client";

import { useId, useRef, useState } from "react";

interface Props {
  label: string;
  tabs: { id: string; label: string }[];
  /** One panel per tab, rendered on the server; inactive panels stay in the HTML (good for search engines). */
  panels: React.ReactNode[];
}

/** WAI-ARIA tabs: arrow keys, Home and End move between tabs; only the active tab is in the tab order. */
export function Tabs({ label, tabs, panels }: Props) {
  const [active, setActive] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function focusTab(i: number) {
    const n = (i + tabs.length) % tabs.length;
    setActive(n);
    refs.current[n]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") { e.preventDefault(); focusTab(active + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); focusTab(active - 1); }
    else if (e.key === "Home") { e.preventDefault(); focusTab(0); }
    else if (e.key === "End") { e.preventDefault(); focusTab(tabs.length - 1); }
  }

  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown}
        className="relative flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-1 shadow-sm">
        {tabs.map((t, i) => (
          <button key={t.id} ref={(el) => { refs.current[i] = el; }} type="button" role="tab"
            id={`${base}-tab-${t.id}`} aria-selected={i === active} aria-controls={`${base}-panel-${t.id}`}
            tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)}
            className={`min-h-11 shrink-0 rounded-xl px-4 font-semibold transition-colors ${i === active ? "bg-navy-900 text-white" : "text-ink hover:bg-teal-50 hover:text-teal-800"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`${base}-panel-${t.id}`} aria-labelledby={`${base}-tab-${t.id}`}
          hidden={i !== active} tabIndex={0} className="mt-6 space-y-8 focus-visible:outline-offset-4">
          {panels[i]}
        </div>
      ))}
    </div>
  );
}
