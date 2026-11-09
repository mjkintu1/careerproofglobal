import Link from "next/link";
import type { CareerPath } from "@careerproof/career-graph";
import { careerHref, formatYears, kindLabel } from "@/lib/careers";

/** Compact journey for dark hero bands. Pivots dashed, other moves solid, kind always in words. */
export function JourneyPreview({ path, location, caption }: { path: CareerPath; location: string; caption: string }) {
  const first = path.steps[0]?.from;
  if (!first) return null;
  return (
    <figure className="rounded-[var(--radius-card)] border border-navy-800 bg-navy-800/60 p-5">
      <figcaption className="mb-4 text-sm font-semibold uppercase tracking-wide text-teal-500">{caption}</figcaption>
      <ol>
        <li>
          <Link href={careerHref(location, first.slug)} className="block rounded-xl bg-white px-4 py-3 font-bold text-ink no-underline hover:text-teal-800">
            {first.title}
          </Link>
        </li>
        {path.steps.map((s) => {
          const pivot = s.transition.kind === "pivot";
          return (
            <li key={s.to.slug}>
              <div className={`ml-5 border-l-2 py-3 pl-4 text-sm ${pivot ? "border-dashed border-gold-400" : "border-solid border-teal-500"}`}>
                <span className="font-semibold text-white">{kindLabel[s.transition.kind]}</span>
                <span className="text-slate-300">, {formatYears(s.transition.years)}: {s.transition.via}</span>
              </div>
              <Link href={careerHref(location, s.to.slug)} className="block rounded-xl bg-white px-4 py-3 font-bold text-ink no-underline hover:text-teal-800">
                {s.to.title}
              </Link>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
