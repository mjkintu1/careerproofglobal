import Link from "next/link";
import { BarChart3, GraduationCap, Network } from "lucide-react";
import { importanceLabel, onetEvidenceAttribution, type CareerEvidence } from "@careerproof/reference-data";

function Source({ ev }: { ev: CareerEvidence }) {
  if (ev.match === "self") return <p className="text-xs text-ink-muted">O*NET data describe work in the United States; requirements differ by country. {onetEvidenceAttribution}</p>;
  return (
    <p className="text-xs text-ink-muted">
      Linked to the ESCO occupation <Link href={`/occupations/${ev.esco}`}>{ev.escoTitle}</Link>
      {ev.onet && <> and the O*NET profile <a href={`https://www.onetonline.org/link/summary/${ev.onet.code}`}>{ev.onet.title}</a> through the official ESCO to O*NET crosswalk</>}.
      {" "}O*NET data describe work in the United States; requirements differ by country. {onetEvidenceAttribution}
    </p>
  );
}

/** Subjects whose knowledge the work relies on (O*NET importance), distinct from entry subjects. */
export function EvidenceSubjects({ ev }: { ev: CareerEvidence | null }) {
  if (!ev || !ev.subjects.length) return null;
  return (
    <section aria-labelledby="ev-subjects" className="card space-y-3 p-5">
      <h2 id="ev-subjects" className="flex items-center gap-2 text-xl font-extrabold"><BarChart3 aria-hidden="true" size={20} className="text-teal-700" /> Subjects this work relies on</h2>
      <p className="text-sm text-ink-muted">How important each subject&apos;s knowledge is in the job itself, rated by people doing it (1 to 5).</p>
      <ul className="space-y-2">
        {ev.subjects.slice(0, 8).map(({ subject, importance, alternatives, domain }) => (
          <li key={subject.slug} className="grid grid-cols-[minmax(8rem,14rem)_1fr_auto] items-center gap-3">
            <span className="font-semibold">
              {[subject, ...alternatives].map((x, i) => <span key={x.slug}>{i > 0 && " or "}<Link href={`/subjects/${x.slug}`}>{x.name}</Link></span>)}
              <span className="block text-xs font-normal text-ink-muted">O*NET: {domain}</span>
            </span>
            <span className="h-2 rounded-full bg-surface-muted" aria-hidden="true">
              <span className="block h-2 rounded-full bg-teal-700" style={{ width: `${(importance / 5) * 100}%` }} />
            </span>
            <span className="text-sm text-ink-muted">{importanceLabel(importance)} ({importance.toFixed(1)})</span>
          </li>
        ))}
      </ul>
      <Source ev={ev} />
    </section>
  );
}

/** O*NET Job Zone: the official description of preparation needed. */
export function EvidencePreparation({ ev }: { ev: CareerEvidence | null }) {
  if (!ev?.jobZone) return null;
  const z = ev.jobZone;
  return (
    <section aria-labelledby="ev-prep" className="card space-y-3 p-5">
      <h2 id="ev-prep" className="flex items-center gap-2 text-xl font-extrabold"><GraduationCap aria-hidden="true" size={20} className="text-teal-700" /> Preparation needed</h2>
      <p className="font-semibold">{z.name}</p>
      <dl className="space-y-2 text-sm">
        {ev.onet?.education && <div><dt className="font-semibold">Most common education (US)</dt><dd className="text-ink-muted">{ev.onet.education}</dd></div>}
        <div><dt className="font-semibold">Education</dt><dd className="text-ink-muted">{z.education}</dd></div>
        <div><dt className="font-semibold">Experience</dt><dd className="text-ink-muted">{z.experience}</dd></div>
        <div><dt className="font-semibold">Training</dt><dd className="text-ink-muted">{z.training}</dd></div>
      </dl>
      <Source ev={ev} />
    </section>
  );
}

/** Related occupations from O*NET's Related Occupations data. */
export function EvidenceRelated({ ev }: { ev: CareerEvidence | null }) {
  if (!ev || !ev.related.length) return null;
  return (
    <section aria-labelledby="ev-related" className="space-y-3">
      <h2 id="ev-related" className="flex items-center gap-2 text-xl font-extrabold"><Network aria-hidden="true" size={20} className="text-teal-700" /> Related occupations</h2>
      <p className="text-sm text-ink-muted">Occupations O*NET links to this one by similar work, skills and knowledge.</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {ev.related.map((r) => (
          <li key={r.onet} className="card p-4">
            {r.esco ? <Link href={`/occupations/${r.esco}`} className="font-semibold">{r.title}</Link>
              : <a href={`https://www.onetonline.org/link/summary/${r.onet}`} className="font-semibold">{r.title}</a>}
          </li>
        ))}
      </ul>
      <Source ev={ev} />
    </section>
  );
}
