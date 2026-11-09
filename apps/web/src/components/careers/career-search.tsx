"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";

export interface SearchItem {
  slug: string;
  title: string;
  cluster: string;
}

interface Props {
  items: SearchItem[];
  location: string;
  /** Where results link to; defaults to /careers/{location}. */
  basePath?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Visually large variant for hero sections. */
  large?: boolean;
}

/** "I want to become..." search with live suggestions (ARIA combobox pattern). */
export function CareerSearch({ items, location, basePath, placeholder, large }: Props) {
  const router = useRouter();
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items
      .filter((i) => i.title.toLowerCase().includes(q) || i.cluster.toLowerCase().includes(q))
      .sort((a, b) => Number(!a.title.toLowerCase().startsWith(q)) - Number(!b.title.toLowerCase().startsWith(q)))
      .slice(0, 10);
  }, [items, query]);

  const show = open && matches.length > 0;
  const go = (slug: string) => router.push(`${basePath ?? `/careers/${location}`}/${slug}`);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && show) { e.preventDefault(); go(matches[active]!.slug); }
    else if (e.key === "Escape") setOpen(false);
  }

  return (
    <div className="relative w-full">
      <label htmlFor={`${id}-input`} className="sr-only">Search careers</label>
      <div className={`flex items-center gap-2 rounded-full border border-border bg-white px-4 shadow-sm focus-within:border-teal-700 ${large ? "min-h-14" : "min-h-11"}`}>
        <Search aria-hidden="true" size={large ? 22 : 18} className="shrink-0 text-ink-muted" />
        <input
          id={`${id}-input`}
          type="text"
          role="combobox"
          aria-expanded={show}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={show ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          placeholder={placeholder ?? "I want to become... (e.g. nurse, engineer, chef)"}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className={`w-full bg-transparent text-ink outline-none placeholder:text-ink-muted ${large ? "text-lg" : "text-base"}`}
        />
      </div>
      <ul
        id={`${id}-list`}
        role="listbox"
        aria-label="Matching careers"
        className={`card absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-auto p-1 ${show ? "" : "hidden"}`}
      >
        {matches.map((m, i) => (
          <li
            key={m.slug}
            id={`${id}-opt-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => { e.preventDefault(); go(m.slug); }}
            onMouseEnter={() => setActive(i)}
            className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 ${i === active ? "bg-teal-50 text-teal-800" : "text-ink"}`}
          >
            <span className="font-semibold">{m.title}</span>
            <span className="text-sm text-ink-muted">{m.cluster}</span>
          </li>
        ))}
      </ul>
      {open && query.trim() !== "" && matches.length === 0 && (
        <p className="mt-2 text-sm text-ink-muted" role="status">No careers match yet. Try a broader word.</p>
      )}
    </div>
  );
}
