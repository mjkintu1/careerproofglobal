import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BadgeCheck, GraduationCap, ListChecks, Route, Sparkles } from "lucide-react";
import { escoNarrower, escoOccupation, escoOccupations, iscoAncestors, iscoGroup, onetFor, usPayForSoc } from "@careerproof/reference-data";
import { CatalogueAttribution } from "@/components/catalogue/attribution";
import { IscoBreadcrumb } from "@/components/catalogue/isco-breadcrumb";
import { Container } from "@/components/container";
import { careerHref, GLOBAL, graph } from "@/lib/careers";

const RIASEC: Record<string, string> = { R: "Realistic", I: "Investigative", A: "Artistic", S: "Social", E: "Enterprising", C: "Conventional" };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** One sample is prerendered; the other ~3,000 occupation pages render on first visit and are cached. */
export function generateStaticParams() {
  return escoOccupations.slice(0, 1).map((o) => ({ code: o.code }));
}

export async function generateMetadata({ params }: PageProps<"/occupations/[code]">): Promise<Metadata> {
  const o = escoOccupation(decodeURIComponent((await params).code));
  return o ? { title: `${cap(o.title)}: skills and career information`, description: o.description.slice(0, 160) } : {};
}

async function OccupationContent({ params }: Pick<PageProps<"/occupations/[code]">, "params">) {
  const o = escoOccupation(decodeURIComponent((await params).code));
  if (!o) notFound();
  const unit = iscoGroup(o.isco);
  const onet = onetFor(o.code)[0] ?? onetFor(o.isco)[0];
  const narrower = escoNarrower(o.code);
  const broader = o.broader ? escoOccupation(o.broader) : undefined;
  const curated = graph.occupations().filter((c) => c.isco === o.isco);
  const pay = onet ? usPayForSoc(onet.code) : null;

  return (
    <article>
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white">
        <Container className="space-y-4 py-10">
          <IscoBreadcrumb trail={[...iscoAncestors(o.isco), ...(unit ? [unit] : [])]} current={cap(o.title)} />
          <div className="flex flex-wrap gap-2">
            <span className="chip bg-navy-800 text-teal-500">ESCO {o.code}</span>
            {unit && <span className="chip bg-navy-800 text-white">ISCO-08 {unit.code}</span>}
            {o.regulated && <span className="chip bg-gold-400 text-ink"><BadgeCheck aria-hidden="true" size={14} /> Regulated profession in some countries</span>}
          </div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{cap(o.title)}</h1>
          {o.altLabels.length > 0 && <p className="text-slate-300">Also known as: {o.altLabels.join(", ")}</p>}
        </Container>
      </section>
      <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <section aria-labelledby="about" className="card space-y-2 p-5">
            <h2 id="about" className="text-xl font-extrabold">About this occupation</h2>
            <p>{o.description}</p>
            {broader && <p className="text-sm text-ink-muted">A specialisation of <Link href={`/occupations/${broader.code}`}>{broader.title}</Link>.</p>}
          </section>
          {o.skills.length > 0 && (
            <section aria-labelledby="skills" className="space-y-3">
              <h2 id="skills" className="flex items-center gap-2 text-xl font-extrabold"><Sparkles aria-hidden="true" size={20} className="text-teal-700" /> Essential skills and knowledge</h2>
              <ul className="flex flex-wrap gap-2">{o.skills.map((s) => <li key={s} className="chip bg-teal-50 text-teal-800">{s}</li>)}</ul>
            </section>
          )}
          {onet && (
            <section aria-labelledby="onet" className="card space-y-4 p-5">
              <div>
                <h2 id="onet" className="text-xl font-extrabold">Typical tasks and preparation</h2>
                <p className="text-sm text-ink-muted">From the related US occupation profile <span className="font-semibold">{onet.title}</span> (O*NET {onet.code}). Linked by an official crosswalk: related, not identical; details vary by country.</p>
              </div>
              <ul className="list-disc space-y-1 pl-5">{onet.tasks.slice(0, 6).map((t) => <li key={t}>{t}</li>)}</ul>
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                {onet.education && <div><dt className="flex items-center gap-1 font-semibold"><GraduationCap aria-hidden="true" size={16} /> Typical education (US)</dt><dd className="text-ink-muted">{onet.education}</dd></div>}
                {onet.jobZone && <div><dt className="flex items-center gap-1 font-semibold"><ListChecks aria-hidden="true" size={16} /> Preparation</dt><dd className="text-ink-muted">Job Zone {onet.jobZone} of 5</dd></div>}
                {onet.riasec && <div><dt className="font-semibold">Interests</dt><dd className="text-ink-muted">{onet.riasec.split("").map((l) => RIASEC[l]).join(", ")}</dd></div>}
              </dl>
              {onet.skills.length > 0 && <p className="text-sm"><span className="font-semibold">Top skills:</span> {onet.skills.slice(0, 6).join(", ")}</p>}
              {pay?.medianAnnual && (
                <p className="rounded-xl bg-teal-50 p-3 text-sm text-teal-800">
                  <span className="font-semibold">US median pay: US${pay.medianAnnual.toLocaleString("en")} a year</span> ({pay.year}){pay.employment ? `, ${pay.employment.toLocaleString("en")} employed` : ""}. <a href={pay.sourceUrl} className="text-teal-800">{pay.attribution}</a>
                </p>
              )}
            </section>
          )}
          {narrower.length > 0 && (
            <section aria-labelledby="spec" className="space-y-3">
              <h2 id="spec" className="text-xl font-extrabold">Specialisations</h2>
              <ul className="grid gap-3 sm:grid-cols-2">{narrower.map((n) => <li key={n.code}><Link href={`/occupations/${n.code}`} className="card card-link block p-4 font-semibold text-ink no-underline first-letter:uppercase hover:text-ink">{n.title}</Link></li>)}</ul>
            </section>
          )}
        </div>
        <aside className="space-y-5" aria-label="Related">
          {unit && (
            <div className="card p-5">
              <h2 className="mb-2 font-display text-lg font-bold">ISCO-08 group</h2>
              <Link href={`/occupations/isco/${unit.code}`}>{unit.code} {unit.title}</Link>
            </div>
          )}
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><Route aria-hidden="true" size={18} className="text-teal-700" /> Career paths</h2>
            {curated.length > 0 ? (
              <ul className="space-y-1">{curated.map((c) => <li key={c.slug}><Link href={careerHref(GLOBAL, c.slug)}>{c.title}: ways in and next moves</Link></li>)}</ul>
            ) : <p className="text-sm text-ink-muted">A guided career path for this occupation is coming.</p>}
          </div>
          <CatalogueAttribution onet={Boolean(onet)} />
        </aside>
      </Container>
    </article>
  );
}

export default function OccupationPage({ params }: PageProps<"/occupations/[code]">) {
  return (
    <Suspense fallback={<Container className="py-10"><p className="text-ink-muted">Loading occupation...</p></Container>}>
      <OccupationContent params={params} />
    </Suspense>
  );
}
