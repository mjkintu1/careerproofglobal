import Link from "next/link";
import type { CareerPath } from "@careerproof/career-graph";
import { careerHref, formatYears, kindLabel } from "@/lib/careers";

/**
 * A career path as a vertical journey. Pivots (change of field) use a dashed
 * gold connector, moves within a field a solid teal one. Each step also says
 * its kind in words, so meaning never depends on line style or colour alone.
 */
export function PathView({ path, location }: { path: CareerPath; location: string }) {
  const first = path.steps[0]?.from;
  if (!first) return null;
  const node = "block rounded-xl border border-line bg-white px-4 py-3 font-display font-bold text-ink no-underline shadow-sm hover:border-teal-100 hover:text-teal-800";
  return (
    <ol>
      <li><Link href={careerHref(location, first.slug)} className={node}>{first.title}</Link></li>
      {path.steps.map((step) => {
        const pivot = step.transition.kind === "pivot";
        return (
          <li key={`${step.from.slug}-${step.to.slug}`}>
            <div className={`ml-6 border-l-[3px] py-3 pl-5 ${pivot ? "border-dashed border-gold-400" : "border-solid border-teal-500"}`}>
              <span className={`chip ${pivot ? "bg-gold-50 text-gold-800" : "bg-teal-50 text-teal-800"}`}>
                {kindLabel[step.transition.kind]}, {formatYears(step.transition.years)}
              </span>
              <p className="mt-1 text-sm text-ink-muted">{step.transition.via}</p>
            </div>
            <Link href={careerHref(location, step.to.slug)} className={node}>{step.to.title}</Link>
          </li>
        );
      })}
    </ol>
  );
}
