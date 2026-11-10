import type { HeRegulator } from "@careerproof/reference-data";

/** Regulators and QA agencies with who lists them. Listing is not proof of legal status. */
export function RegulatorList({ regulators, sources, emptyText = "Not yet recorded." }: {
  regulators: HeRegulator[];
  sources: { name: string; url: string }[];
  emptyText?: string;
}) {
  if (!regulators.length) return <p className="text-ink-muted">{emptyText}</p>;
  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {regulators.map((g) => (
          <li key={`${g.listedBy.name}-${g.name}`}>
            {g.website ? <a href={g.website}>{g.name}</a> : <span>{g.name}</span>}
            <span className="ml-2 text-xs text-ink-muted">
              {g.status === "official-site-checked" ? "Official site checked" : `Listed by ${g.listedBy.name}`}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-muted">
        From {sources.map((s, i) => <span key={s.url}>{i > 0 ? " and " : ""}<a href={s.url}>{s.name}</a></span>)}. Network membership is not
        government recognition: confirm a body&apos;s role with the education ministry.
      </p>
    </div>
  );
}
