"use client";

import { Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";

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

type Kind = "guide" | "occupation" | "route" | "ai";
interface Option { key: string; title: string; href: string; kind: Kind; note: string | null }

const KIND_LABEL: Record<Exclude<Kind, "ai">, string> = { guide: "Career guide", occupation: "Occupation", route: "Route map" };

/** "a systems engineer" / "an accountant", without repeating "I want to become". */
function goalPhrase(q: string) {
  const g = q.trim().replace(/^(i\s+want\s+to\s+(be|become)|how\s+to\s+become|become)\s+/i, "").replace(/^(an?|the)\s+/i, "");
  return `${/^[aeiou]/i.test(g) ? "an" : "a"} ${g}`;
}

/**
 * "I want to become..." search with live suggestions (ARIA combobox pattern).
 * Guided careers match instantly; the server then adds every occupation we hold (ESCO and
 * O*NET titles and their other names, typo-tolerant). "Ask AI" is always the last option,
 * so a search never ends without an answer.
 */
export function CareerSearch({ items, location, basePath, placeholder, large }: Props) {
  const router = useRouter();
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [remote, setRemote] = useState<{ q: string; results: Option[] }>({ q: "", results: [] });
  const wide = !basePath; // the occupation directory keeps its own list

  const local = useMemo<Option[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items
      .filter((i) => i.title.toLowerCase().includes(q) || i.cluster.toLowerCase().includes(q))
      .sort((a, b) => Number(!a.title.toLowerCase().startsWith(q)) - Number(!b.title.toLowerCase().startsWith(q)))
      .slice(0, 10)
      .map((i) => ({ key: i.slug, title: i.title, href: `${basePath ?? `/careers/${location}`}/${i.slug}`, kind: wide ? "guide" : "occupation", note: i.cluster }));
  }, [items, query, basePath, location, wide]);

  useEffect(() => {
    const q = query.trim();
    if (!wide || q.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?${new URLSearchParams({ q, location })}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((d: { results: Omit<Option, "key">[] }) => setRemote({ q, results: d.results.map((r) => ({ ...r, key: r.href })) }))
        .catch(() => {});
    }, 180);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [query, location, wide]);

  const matches = useMemo<Option[]>(() => {
    const q = query.trim();
    const extra = remote.q === q ? remote.results : [];
    const seen = new Set<string>();
    const merged = [...local, ...extra].filter((o) => (seen.has(o.href) ? false : (seen.add(o.href), true))).slice(0, 10);
    if (q.length >= 3) {
      const ask = /^i\s+want|^how\s+to/i.test(q) ? q : `I want to become ${goalPhrase(q)}`;
      const base = location === "global" ? "/paths" : `/paths/${location}`;
      merged.push({ key: "ai", title: `Ask AI: how to become ${goalPhrase(q)}`, href: `${base}?${new URLSearchParams({ ask })}`, kind: "ai", note: "Step-by-step path with years, study and pay" });
    }
    return merged;
  }, [local, remote, query, location]);

  const show = open && matches.length > 0;
  const go = (href: string) => router.push(href);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && matches.length) { e.preventDefault(); go(matches[Math.min(active, matches.length - 1)]!.href); }
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
            key={m.key}
            id={`${id}-opt-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => { e.preventDefault(); go(m.href); }}
            onMouseEnter={() => setActive(i)}
            className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 ${m.kind === "ai" ? "mt-1 border-t border-line" : ""} ${i === active ? "bg-teal-50 text-teal-800" : "text-ink"}`}
          >
            <span className="min-w-0">
              <span className={`flex items-center gap-1.5 font-semibold ${m.kind === "ai" ? "text-teal-800" : ""}`}>
                {m.kind === "ai" && <Sparkles aria-hidden size={16} className="shrink-0" />}{m.title}
              </span>
              {m.note && <span className="block truncate text-sm text-ink-muted">{m.note}</span>}
            </span>
            {m.kind !== "ai" && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-ink-muted">{KIND_LABEL[m.kind]}</span>}
          </li>
        ))}
      </ul>
      {open && query.trim().length > 0 && query.trim().length < 3 && matches.length === 0 && (
        <p className="mt-2 text-sm text-ink-muted" role="status">Keep typing a job title…</p>
      )}
    </div>
  );
}
