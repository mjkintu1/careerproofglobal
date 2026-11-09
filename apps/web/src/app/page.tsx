import Link from "next/link";
import { Route } from "lucide-react";
import { catalogueCounts } from "@careerproof/reference-data";
import { careerGraphData } from "@careerproof/sample-data";
import { Container } from "@/components/container";
import { Community, Stages } from "@/components/home/community-stages";
import { Fields, Popular } from "@/components/home/fields-popular";
import { Hero } from "@/components/home/hero";
import { GLOBAL } from "@/lib/careers";

const popular = ["nurse", "software-developer", "civil-engineer", "accountant", "electrician", "journalist"];

export default function HomePage() {
  const { occupations, transitions } = careerGraphData;
  const stats: [number, string][] = [
    [catalogueCounts.escoOccupations, "occupations in the directory"], [catalogueCounts.unitGroups, "ISCO-08 occupation groups"],
    [occupations.length, "guided career paths"], [transitions.length, "career moves"],
  ];
  return (
    <>
      <Hero />
      <Container className="space-y-16 py-14">
        <Community />
        <Stages />
        <Fields />
      </Container>

      <section aria-label="Career Proof in numbers" className="bg-navy-900 text-white">
        <Container className="py-10">
          <dl className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {stats.map(([n, label]) => (
              <div key={label} className="flex flex-col">
                <dt className="text-sm text-slate-300">{label}</dt>
                <dd className="order-first font-display text-4xl font-extrabold text-gold-400">{n.toLocaleString("en")}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Container className="space-y-16 py-14">
        <Popular slugs={popular} />
        <section aria-labelledby="cta-heading" className="overflow-hidden rounded-[var(--radius-card)] bg-teal-800 p-8 text-white sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h2 id="cta-heading" className="text-2xl font-extrabold sm:text-3xl">Don&apos;t let your career dreams wait</h2>
              <p className="mt-2 text-teal-50">Pick where you are and where you want to be. We&apos;ll show the quickest known path.</p>
            </div>
            <Link href={`/careers/${GLOBAL}#path-finder-heading`}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold-400 px-6 font-bold text-ink no-underline hover:bg-white hover:text-ink">
              <Route aria-hidden="true" size={20} /> Plan my path
            </Link>
          </div>
        </section>
      </Container>
    </>
  );
}
