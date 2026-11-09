"use client";

import Link from "next/link";
import { useId, useState } from "react";

interface Props {
  careers: { slug: string; title: string; cluster: string }[];
  subjectsByCareer: Record<string, { name: string; slug: string; required: boolean }[]>;
}

/** "Dream career -> subjects": pick a career, see the school subjects that keep it open. */
export function SubjectSelector({ careers, subjectsByCareer }: Props) {
  const id = useId();
  const [career, setCareer] = useState("medical-doctor");
  const list = subjectsByCareer[career] ?? [];
  const groups = [...new Set(careers.map((c) => c.cluster))];
  const required = list.filter((s) => s.required);
  const options = list.filter((s) => !s.required);

  return (
    <section id="selector" aria-labelledby={`${id}-h`} className="card space-y-5 p-6">
      <div>
        <h2 id={`${id}-h`} className="text-xl font-extrabold">Subject selector</h2>
        <p className="text-ink-muted">Choose your dream career to see the school subjects that keep it open.</p>
      </div>
      <label className="block max-w-md space-y-1">
        <span className="block font-semibold">Dream career</span>
        <select className="field" value={career} onChange={(e) => setCareer(e.target.value)}>
          {groups.map((g) => (
            <optgroup key={g} label={g}>
              {careers.filter((c) => c.cluster === g).map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
      <div aria-live="polite" className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-semibold">Take these</p>
          {required.length ? (
            <ul className="flex flex-wrap gap-2">
              {required.map((s) => <li key={s.slug}><Link href={`/subjects/${s.slug}`} className="chip bg-teal-50 text-teal-800 no-underline">{s.name}</Link></li>)}
            </ul>
          ) : <p className="text-sm text-ink-muted">No single subject is essential.</p>}
        </div>
        <div>
          <p className="mb-2 font-semibold">Plus one of these</p>
          {options.length ? (
            <ul className="flex flex-wrap gap-2">
              {options.map((s) => <li key={s.slug}><Link href={`/subjects/${s.slug}`} className="chip border border-line bg-white text-ink no-underline">{s.name}</Link></li>)}
            </ul>
          ) : <p className="text-sm text-ink-muted">No alternatives listed.</p>}
        </div>
      </div>
      <p className="text-sm">
        <Link href={`/careers/global/${career}`}>See the full career page</Link>
      </p>
    </section>
  );
}
