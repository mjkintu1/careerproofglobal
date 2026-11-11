"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { parsePrompt } from "@/lib/path-prompt";
import { CountrySearch } from "@/components/country-search";
import { isLong, PathCanvas, type PathDirection } from "./path-canvas";
import { usePathRoutes } from "./use-path-routes";
import { Inspector } from "./inspector";
import { DirectionToggle, Legend, RouteList, START, START_LABEL, yearsText } from "./route-list";

export interface StudioProps {
  /** Every node: guided careers (slug) and O*NET occupations (code). */
  nodes: { code: string; name: string }[];
  countries: { code: string; name: string }[];
  /** Upper-case ISO code, or null for global. */
  country: string | null;
  countryName: string | null;
}

export function PathStudio({ nodes: options, countries, country, countryName }: StudioProps) {
  const router = useRouter();
  const params = useSearchParams();
  const known = useMemo(() => new Set(options.map((o) => o.code)), [options]);
  const valid = (id: string | null, allowStart: boolean): id is string => Boolean(id && ((allowStart && id === START) || known.has(id)));
  const qFrom = params.get("from");
  const qTo = params.get("to");
  const [from, setFrom] = useState(valid(qFrom, true) ? qFrom : START);
  const [to, setTo] = useState(valid(qTo, false) ? qTo : "data-scientist");
  const [sort, setSort] = useState<"fastest" | "fewest">("fastest");
  const [showLong, setShowLong] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [promptNote, setPromptNote] = useState<string | null>(null);
  const [direction, setDirection] = useState<PathDirection>("forward");
  // Links elsewhere on the page (e.g. the careers table) change the query string:
  // adopt the new values during render (React's pattern for state derived from props).
  const [seenQuery, setSeenQuery] = useState(`${qFrom}|${qTo}`);
  if (seenQuery !== `${qFrom}|${qTo}`) {
    setSeenQuery(`${qFrom}|${qTo}`);
    if (valid(qFrom, true) && qFrom !== from) setFrom(qFrom);
    if (valid(qTo, false) && qTo !== to) setTo(qTo);
  }

  useEffect(() => {
    window.history.replaceState(null, "", `${window.location.pathname}?${new URLSearchParams({ from, to })}`);
  }, [from, to]);

  // Routes are computed on the server: the full network (about 1,000 occupations) stays there.
  const { key, routes: allRoutes, cards, loading, error } = usePathRoutes(from, to, country);
  const best = allRoutes[0]?.weight ?? 0;
  const longCount = allRoutes.filter((r) => isLong(r.weight, best)).length;
  const routes = useMemo(() => {
    const r = showLong ? allRoutes : allRoutes.filter((x) => !isLong(x.weight, best));
    return sort === "fewest" ? [...r].sort((a, b) => a.edges.length - b.edges.length || a.weight - b.weight) : r;
  }, [allRoutes, best, showLong, sort]);
  const layoutKey = `${key}:${showLong}:${sort}:${routes.length}`;

  const reset = () => { setActive(null); setSelected(null); setShowLong(false); };
  const goCountry = (code: string, f = from, t = to) => {
    const q = `?${new URLSearchParams({ from: f, to: t })}`;
    router.push(code === "global" ? `/paths${q}` : `/paths/${code.toLowerCase()}${q}`);
  };

  function runPrompt(ev: React.FormEvent) {
    ev.preventDefault();
    const p = parsePrompt(prompt, options.map((c) => ({ slug: c.code, title: c.name })), countries);
    reset();
    if (!p.from && !p.to) {
      setPromptNote("No occupation matched. Name one, for example \"nurse to data scientist\", or use the pickers below.");
      return;
    }
    const name = (id: string) => (id === START ? "starting out" : options.find((o) => o.code === id)?.name);
    const parts = [p.from && `from ${name(p.from)}`, p.to && `to ${name(p.to)}`].filter(Boolean);
    const switching = p.country && p.country !== country ? countries.find((c) => c.code === p.country)?.name : null;
    setPromptNote(`Showing routes ${parts.join(" ")}${switching ? `, with pay figures for ${switching}` : ""}.`);
    // A new country is a new page; the query string carries the start and goal there.
    if (switching) return goCountry(p.country!, p.from ?? from, p.to ?? to);
    if (p.from) setFrom(p.from);
    if (p.to) setTo(p.to);
  }

  const fromOptions = useMemo(() => [{ code: START, name: START_LABEL }, ...options], [options]);
  const picker = (label: string, value: string, onChange: (v: string) => void, opts: { code: string; name: string }[]) => (
    <div className="min-w-0 flex-1">
      <CountrySearch options={opts} current={value} onSelect={(v) => { onChange(v); reset(); }} label={label} noun="occupation" showCodes={false} maxShown={60} />
    </div>
  );
  return (
    <section aria-labelledby="studio-heading" className="space-y-4">
      <h2 id="studio-heading" className="sr-only">Career path planner</h2>
      <form onSubmit={runPrompt} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-end">
        <label className="block flex-1 space-y-1">
          <span className="flex items-center gap-1.5 text-sm font-semibold"><Sparkles aria-hidden className="h-4 w-4 text-teal-700" /> Describe where you are and where you want to go</span>
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} className="field" placeholder="e.g. I'm a nurse in Uganda and want to become a data scientist" />
        </label>
        <button type="submit" className="btn-primary justify-center">Plan my path</button>
      </form>
      {promptNote && <p role="status" className="text-sm text-ink-muted">{promptNote}</p>}

      <div className="card flex flex-col gap-3 p-4 lg:flex-row lg:items-end">
        {picker("Where you are now", from, setFrom, fromOptions)}
        {picker("Where you want to be", to, setTo, options)}
        <div className="min-w-0 flex-1">
          <CountrySearch options={[{ code: "global", name: "Global (no pay figures)" }, ...countries]} current={country ?? "global"} onSelect={(c) => goCountry(c)} label="Pay figures for" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" aria-live="polite">
        {from === to ? <p className="text-ink-muted">Pick two different points.</p>
          : error ? <p className="text-red-700">{error}</p>
          : loading ? <p className="text-ink-muted">Finding routes…</p>
          : routes.length === 0 ? <p className="text-ink-muted">No route found between these two yet.</p>
          : <>
              <span className="text-sm font-semibold">{routes.length} route{routes.length > 1 ? "s" : ""}:</span>
              <button type="button" onClick={() => setActive(null)} className={`chip border border-border ${active === null ? "bg-navy-900 text-white" : "bg-white"}`}>All</button>
              {routes.map((r, i) => (
                <button key={i} type="button" onClick={() => setActive(i)} className={`chip border border-border ${active === i ? "bg-navy-900 text-white" : "bg-white"}`}>
                  {i + 1}: {r.edges.length} move{r.edges.length > 1 ? "s" : ""}{r.knownYears ? `, ${yearsText(r.knownYears)}` : ""}{r.unknownMoves ? " + ?" : ""}
                </button>
              ))}
              {longCount > 0 && (
                <button type="button" onClick={() => { setShowLong(!showLong); setActive(null); }} className="text-sm font-semibold text-teal-800 underline">
                  {showLong ? "Hide longer routes" : `Show ${longCount} longer route${longCount > 1 ? "s" : ""}`}
                </button>
              )}
              <DirectionToggle value={direction} onChange={setDirection} />
              <label className="ml-auto flex items-center gap-2 text-sm">
                Rank by
                <select value={sort} onChange={(e) => { setSort(e.target.value as "fastest" | "fewest"); setActive(null); }} className="field !w-auto !py-1">
                  <option value="fastest">Fastest</option>
                  <option value="fewest">Fewest moves</option>
                </select>
              </label>
            </>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <PathCanvas routes={routes} cards={cards} from={from} to={to} active={active} selected={selected} direction={direction} layoutKey={layoutKey}
          onSelectNode={setSelected} onSelectRoute={setActive} />
        <Inspector card={selected ? cards[selected] ?? null : null} countryName={countryName}
          onPlanFrom={(s) => { setFrom(s); reset(); }} onGoal={(s) => { setTo(s); reset(); }} onClose={() => setSelected(null)} />
      </div>

      <Legend />
      {from !== to && <RouteList routes={routes} cards={cards} direction={direction} />}
    </section>
  );
}
