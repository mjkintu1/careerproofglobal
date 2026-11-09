"use client";

import { Check, MapPin, Search } from "lucide-react";
import { useId, useMemo, useState } from "react";

export interface CountryOption {
  code: string;
  name: string;
}

interface Props {
  options: CountryOption[];
  onSelect: (code: string) => void;
  /** Currently selected code, shown as the placeholder and ticked in the list. */
  current?: string;
  label?: string;
  /** Hide the visible label (it stays available to screen readers). */
  hideLabel?: boolean;
  placeholder?: string;
  /** "dark" for navy hero bands. */
  tone?: "light" | "dark";
  /** "inline" puts the label beside the field so it lines up with other inputs in a row. */
  labelPosition?: "above" | "inline";
  className?: string;
}

/** Normalise for matching: lower case, accents removed, so "cote" finds Cote d'Ivoire. */
export const normCountry = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Shared matcher for filtered lists: name contains the query, or the ISO code equals it. */
export function matchesCountry(o: CountryOption, query: string) {
  const q = normCountry(query.trim());
  return !q || normCountry(o.name).includes(q) || o.code.toLowerCase() === q;
}

/** Searchable country picker (ARIA combobox). Matches on name or ISO code. */
export function CountrySearch({ options, onSelect, current, label = "Country", hideLabel, placeholder, tone = "light", labelPosition = "above", className }: Props) {
  const id = useId();
  
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const currentName = options.find((o) => o.code === current)?.name;

  const matches = useMemo(() => {
    const q = normCountry(query.trim());
    if (!q) return options;
    const rank = (o: CountryOption) => (o.code.toLowerCase() === q ? 0 : normCountry(o.name).startsWith(q) ? 1 : 2);
    return options.filter((o) => matchesCountry(o, q)).sort((a, b) => rank(a) - rank(b));
  }, [options, query]);

  const show = open && matches.length > 0;

  function choose(code: string) {
    setQuery("");
    setOpen(false);
    onSelect(code);
  }

  function move(next: number) {
    setActive(next);
    document.getElementById(`${id}-opt-${next}`)?.scrollIntoView({ block: "nearest" });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); move(Math.min(active + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(Math.max(active - 1, 0)); }
    else if (e.key === "Enter" && show) { e.preventDefault(); choose(matches[active]!.code); }
    else if (e.key === "Escape") { setOpen(false); setQuery(""); }
  }

  const dark = tone === "dark";
  const inline = labelPosition === "inline";
  return (
    <div className={`${inline ? "flex items-center gap-3" : ""} ${className ?? "w-full max-w-sm"}`}>
      <label htmlFor={`${id}-input`} className={hideLabel ? "sr-only" : `flex shrink-0 items-center gap-1 font-semibold ${inline ? "" : "mb-1"} ${dark ? "text-white" : "text-ink"}`}>
        {!hideLabel && <MapPin aria-hidden="true" size={18} className={dark ? "text-teal-500" : "text-teal-700"} />}
        {label}
      </label>
      <div className="relative min-w-0 flex-1">
        <div className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 shadow-sm focus-within:border-teal-700">
          <Search aria-hidden="true" size={18} className="shrink-0 text-ink-muted" />
          <input
            id={`${id}-input`}
            type="text"
            role="combobox"
            aria-expanded={show}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={show ? `${id}-opt-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder ?? (currentName ? `${currentName} (type to change)` : "Search countries")}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={onKeyDown}
            className="w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
        <ul id={`${id}-list`} role="listbox" aria-label="Countries"
          className={`card absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-auto p-1 ${show ? "" : "hidden"}`}>
          {matches.map((m, i) => (
            <li key={m.code} id={`${id}-opt-${i}`} role="option" aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); choose(m.code); }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 ${i === active ? "bg-teal-50 text-teal-800" : "text-ink"}`}>
              <span className="font-semibold">{m.name}</span>
              {m.code === current ? <Check aria-label="Selected" size={16} className="text-teal-700" /> : <span className="text-xs uppercase text-ink-muted">{m.code === "global" ? "" : m.code}</span>}
            </li>
          ))}
        </ul>
        {open && query.trim() !== "" && matches.length === 0 && (
          <p className="card absolute inset-x-0 top-full z-30 mt-2 px-4 py-3 text-sm text-ink-muted" role="status">No country matches that search.</p>
        )}
      </div>
    </div>
  );
}

/** Text filter for long country lists and tables. */
export function CountryFilterInput({ value, onChange, label, count, total }: { value: string; onChange: (v: string) => void; label: string; count: number; total: number }) {
  const id = useId();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="w-full max-w-sm">
        <label htmlFor={id} className="mb-1 block font-semibold">{label}</label>
        <div className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 shadow-sm focus-within:border-teal-700">
          <Search aria-hidden="true" size={18} className="shrink-0 text-ink-muted" />
          <input id={id} type="search" autoComplete="off" spellCheck={false} placeholder="Type a country name or code"
            value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-ink outline-none placeholder:text-ink-muted" />
        </div>
      </div>
      <p className="text-sm text-ink-muted" role="status" aria-live="polite">Showing {count.toLocaleString("en")} of {total.toLocaleString("en")}</p>
    </div>
  );
}
