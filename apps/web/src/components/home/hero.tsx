import Link from "next/link";
import { CareerSearch } from "@/components/careers/career-search";
import { JourneyPreview } from "@/components/careers/journey-preview";
import { Container } from "@/components/container";
import { careerHref, GLOBAL, graph, searchItems } from "@/lib/careers";

const popular = ["nurse", "software-developer", "civil-engineer", "accountant", "pilot"];

export function Hero() {
  const example = graph.findPath("it-support-technician", "data-scientist");
  return (
    <section className="bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800 text-white">
      <Container className="grid gap-10 py-14 lg:grid-cols-[1.3fr_1fr] lg:py-20">
        <div className="space-y-6">
          <p className="chip bg-navy-800 text-teal-500">Your one-stop career guide</p>
          <h1 className="text-4xl font-extrabold sm:text-[3.4rem]">
            Find a career that fits you, and the <span className="text-gold-400">path</span> to get there
          </h1>
          <p className="max-w-xl text-lg text-slate-300">
            Explore careers, the subjects and courses that lead to them, and the moves people make along the way.
          </p>
          <CareerSearch items={searchItems} location={GLOBAL} large />
          <p className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            Popular:
            {popular.map((slug) => (
              <Link key={slug} href={careerHref(GLOBAL, slug)} className="chip bg-navy-800 text-white no-underline hover:bg-teal-800 hover:text-white">
                {graph.get(slug)?.title}
              </Link>
            ))}
          </p>
        </div>
        {example && <JourneyPreview path={example} location={GLOBAL} caption="Example career journey" />}
      </Container>
    </section>
  );
}
