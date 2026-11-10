import type { IscedEntry, IscedProgramme } from "@careerproof/reference-data";

const years = (p: IscedProgramme) => [p.y ? `${p.y} years` : null, p.age ? `from age ${p.age}` : null].filter(Boolean).join(", ");

function Row({ p }: { p: IscedProgramme }) {
  return (
    <li className="space-y-1 py-3">
      <p className="font-semibold">{p.n}{years(p) && <span className="ml-2 text-sm font-normal text-ink-muted">{years(p)}</span>}</p>
      {p.q && p.q.toLowerCase() !== "na" && <p><span className="text-ink-muted">Minimum entry: </span>{p.q}</p>}
      {p.a && p.a.toLowerCase() !== "na" && <p className="text-sm"><span className="text-ink-muted">Awards: </span>{p.a}</p>}
    </li>
  );
}

/** Official route into higher education, from the country's UNESCO ISCED 2011 mapping. */
export function IscedEntryCard({ entry, meta }: { entry: IscedEntry | null; meta: { source: string; url: string; licence: string; licenceUrl: string; downloadBase: string } }) {
  if (!entry) return null;
  const groups: [string, IscedProgramme[]][] = [
    ["School-leaving qualification (upper secondary)", entry.upperSecondary],
    ["Bachelor's or equivalent (first degree)", entry.firstDegree],
    ["Short-cycle tertiary (diplomas)", entry.shortCycle],
  ];
  return (
    <div className="card space-y-4 p-5">
      <div>
        <h3 className="text-lg font-bold">Official entry requirements</h3>
        <p className="text-sm text-ink-muted">
          As classified by the country with UNESCO (ISCED 2011){entry.year ? `, reference year ${entry.year}` : ""}. Universities may set higher requirements.
          {!entry.english && " Shown in the language of the national mapping."}
        </p>
      </div>
      {groups.filter(([, ps]) => ps.length).map(([title, ps]) => (
        <div key={title}>
          <h4 className="font-bold">{title}</h4>
          <ul className="divide-y divide-line">{ps.map((p, i) => <Row key={`${p.c}-${i}`} p={p} />)}</ul>
        </div>
      ))}
      <p className="text-xs text-ink-muted">
        Source: <a href={meta.url}>{meta.source}</a> (<a href={`${meta.downloadBase}${encodeURIComponent(entry.file)}`}>country file</a>). <a href={meta.licenceUrl}>{meta.licence}</a>.
      </p>
    </div>
  );
}
