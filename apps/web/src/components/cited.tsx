import { dataSources } from "@careerproof/reference-data";

/** Look up a registered data source; throws at build time if a citation points at an unknown slug. */
export function sourceBySlug(slug: string) {
  const s = dataSources.find((d) => d.slug === slug);
  if (!s) throw new Error(`Unknown data source "${slug}"`);
  return s;
}

/** A fact with a small source link after it. */
export function CitedFact({ text, source }: { text: string; source: string }) {
  const s = sourceBySlug(source);
  return (
    <li>
      {text}{" "}
      <span className="text-xs text-ink-muted">
        (Source: {s.url ? <a href={s.url} className="underline hover:text-ink">{s.publisher}</a> : s.publisher})
      </span>
    </li>
  );
}

/** Our own advice, labelled apart from sourced facts. */
export function Guidance({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">CareerProof guidance</p>
      <p className="mt-1 text-ink">{children}</p>
    </div>
  );
}
