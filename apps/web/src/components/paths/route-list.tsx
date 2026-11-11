import type { NetworkEdge, NetworkRoute } from "@careerproof/career-graph";
import type { CareerCard } from "@/lib/path-network";

export const START = "start";
export const START_LABEL = "Starting out (school or new graduate)";
export const yearsText = (n: number) => `${n} yr${n === 1 ? "" : "s"}`;

const EVIDENCE_LABEL: Record<NetworkEdge["evidence"], string> = {
  curated: "Known move",
  "onet-related": "O*NET related occupation",
  "shared-skills": "Shared skills",
  "entry-route": "Entry route",
};

/** Text version of the canvas, for screen readers, small screens and printing. */
export function RouteList({ routes, cards, direction = "forward" }: { routes: NetworkRoute[]; cards: Record<string, CareerCard>; direction?: "forward" | "backward" }) {
  if (!routes.length) return null;
  const name = (slug: string) => (slug === START ? START_LABEL : cards[slug]?.title ?? slug);
  const back = direction === "backward";
  return (
    <section aria-labelledby="route-list-heading" className="space-y-3">
      <h3 id="route-list-heading" className="font-display text-lg font-bold">{back ? "Every route, working back from the goal" : "Every route, step by step"}</h3>
      <ol className="space-y-3">
        {routes.map((r, i) => (
          <li key={i} className="card p-4">
            <p className="font-display font-bold">
              Route {i + 1}: {r.edges.length} move{r.edges.length > 1 ? "s" : ""}
              {r.knownYears ? `, ${yearsText(r.knownYears)} of published time` : ""}
              {r.unknownMoves ? `, plus ${r.unknownMoves} move${r.unknownMoves > 1 ? "s" : ""} with no published time` : ""}
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {(back ? [...r.edges].reverse() : r.edges).map((e, j) => (
                <li key={j}>
                  {back
                    ? <>Before <span className="font-semibold">{name(e.to)}</span>: <span className="font-semibold">{name(e.from)}</span></>
                    : <><span className="font-semibold">{name(e.from)}</span> to <span className="font-semibold">{name(e.to)}</span></>}
                  <span className="text-ink-muted">: {e.via}. {e.years !== null ? `About ${yearsText(e.years)}.` : `Time not published; ranked as ${yearsText(e.weight)}, the length of the main qualification for ${name(e.to)}.`} ({EVIDENCE_LABEL[e.evidence]})</span>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Legend() {
  const item = (color: string, dash: string | undefined, label: string) => (
    <li className="flex items-center gap-2">
      <svg width="34" height="8" aria-hidden><line x1="0" y1="4" x2="34" y2="4" stroke={color} strokeWidth="3" strokeDasharray={dash} /></svg>{label}
    </li>
  );
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted" aria-label="Legend">
      {item("#16a34a", undefined, "Step up or specialise (known move)")}
      {item("#ea580c", "6 5", "Change field: shared skills")}
      {item("#ea580c", "2 5", "Change field: O*NET related occupation")}
      {item("#7c3aed", undefined, "Qualification or training")}
      <li>&ldquo;N yrs?&rdquo;: time not published, ranked as the main qualification&rsquo;s length</li>
    </ul>
  );
}

/** Read routes from the start to the goal, or work back from the goal to the start. */
export function DirectionToggle({ value, onChange }: { value: "forward" | "backward"; onChange: (v: "forward" | "backward") => void }) {
  const btn = (v: "forward" | "backward", label: string) => (
    <button type="button" aria-pressed={value === v} onClick={() => onChange(v)}
      className={`px-3 py-1 text-sm font-semibold ${value === v ? "bg-navy-900 text-white" : "bg-white text-ink hover:bg-slate-50"}`}>{label}</button>
  );
  return (
    <div role="group" aria-label="Direction" className="inline-flex overflow-hidden rounded-full border border-border">
      {btn("forward", "Start → Goal")}
      {btn("backward", "Goal → Start")}
    </div>
  );
}
