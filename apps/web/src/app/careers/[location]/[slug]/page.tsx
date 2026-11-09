import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment, Suspense } from "react";
import { careerGraphData } from "@careerproof/sample-data";
import { CareerJsonLd } from "@/components/careers/career-jsonld";
import { CareerHero } from "@/components/careers/career-hero";
import { RelatedCareers, TagList, WaysIn } from "@/components/careers/career-sections";
import { CareerSidebar } from "@/components/careers/career-sidebar";
import { MoveList } from "@/components/careers/move-list";
import { PathFinder } from "@/components/careers/path-finder";
import { GUIDANCE_NOTE, OfficialDefinition } from "@/components/careers/provenance";
import { Container } from "@/components/container";
import { Tabs } from "@/components/tabs";
import { careerHref, careerPageTitle, GLOBAL, graph, isLocationCode } from "@/lib/careers";

/** Global pages are prerendered; each country version renders on first visit and is then cached. */
export function generateStaticParams() {
  return careerGraphData.occupations.map((o) => ({ location: GLOBAL, slug: o.slug }));
}

export async function generateMetadata({ params }: PageProps<"/careers/[location]/[slug]">): Promise<Metadata> {
  const { location, slug } = await params;
  const o = graph.get(slug);
  if (!o || !isLocationCode(location)) return {};
  return {
    title: careerPageTitle(o, location),
    description: o.summary,
    alternates: { canonical: careerHref(location, slug) },
  };
}

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "how", label: "How to get there" },
  { id: "leads", label: "Where it leads" },
  { id: "similar", label: "Similar careers" },
  { id: "plan", label: "Plan a path" },
];

async function CareerContent({ params }: Pick<PageProps<"/careers/[location]/[slug]">, "params">) {
  const { location, slug } = await params;
  const o = graph.get(slug);
  if (!o || !isLocationCode(location)) notFound();

  const local = graph.localise(slug, location);
  const next = graph.nextMoves(slug);
  const previous = graph.previousMoves(slug);

  const panels = [
    <Fragment key="overview">
      <OfficialDefinition isco={o.isco} />
      <section aria-labelledby="work-heading" className="space-y-3">
        <h2 id="work-heading" className="text-xl font-extrabold">What the work involves</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {o.tasks.map((t) => <li key={t} className="card p-4 font-medium">{t}</li>)}
        </ul>
      </section>
      <TagList id="skills" title="Key skills" items={o.skills.map((s) => graph.skillName(s))} />
      <MoveList id="next-overview" title="Where this career can lead" moves={next.slice(0, 2)} location={location} empty="No onward moves recorded yet." note={GUIDANCE_NOTE} />
    </Fragment>,
    <Fragment key="how">
      <WaysIn o={o} note={GUIDANCE_NOTE} />
      <TagList id="subjects" title="School subjects that keep this path open" items={o.subjects} tone="plain" />
    </Fragment>,
    <Fragment key="leads">
      <MoveList id="next" title="Where this career can lead" moves={next} location={location} empty="No onward moves recorded yet." note={GUIDANCE_NOTE} />
      <MoveList id="previous" title="Careers people move in from" moves={previous} location={location}
        empty="No moves into this career recorded yet. Most people start through the ways in." />
    </Fragment>,
    <RelatedCareers key="similar" related={graph.related(slug)} location={location} />,
    <PathFinder key="plan" location={location} initialTo={slug}
      initialFrom={previous[0]?.occupation.slug ?? (slug === "secondary-teacher" ? "primary-teacher" : "secondary-teacher")} />,
  ];

  return (
    <article>
      <CareerJsonLd o={o} location={location} local={local} />
      <CareerHero o={o} location={location} />
      <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Tabs label={`About ${o.title}`} tabs={tabs} panels={panels} />
        </div>
        <CareerSidebar location={location} local={local} current={slug} isco={o.isco} />
      </Container>
    </article>
  );
}

/** The params read lives inside Suspense so the shared App Shell stays URL-independent. */
export default function CareerPage({ params }: PageProps<"/careers/[location]/[slug]">) {
  return (
    <Suspense fallback={<Container className="py-10"><p className="text-ink-muted">Loading career...</p></Container>}>
      <CareerContent params={params} />
    </Suspense>
  );
}
