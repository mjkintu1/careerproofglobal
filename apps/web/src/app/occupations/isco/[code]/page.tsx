import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BadgeCheck, Route } from "lucide-react";
import { escoCountUnder, escoInUnitGroup, iscoAncestors, iscoChildren, iscoGroup, iscoGroups } from "@careerproof/reference-data";
import { CatalogueAttribution } from "@/components/catalogue/attribution";
import { IscoBreadcrumb } from "@/components/catalogue/isco-breadcrumb";
import { Container } from "@/components/container";
import { careerHref, GLOBAL, graph } from "@/lib/careers";

const levelName = ["", "Major group", "Sub-major group", "Minor group", "Unit group"];

export function generateStaticParams() {
  return iscoGroups.map((g) => ({ code: g.code }));
}

export async function generateMetadata({ params }: PageProps<"/occupations/isco/[code]">): Promise<Metadata> {
  const g = iscoGroup((await params).code);
  return g ? { title: `${g.title} (ISCO-08 ${g.code})`, description: g.description.slice(0, 160) } : {};
}

async function GroupContent({ params }: Pick<PageProps<"/occupations/isco/[code]">, "params">) {
  const g = iscoGroup((await params).code);
  if (!g) notFound();
  const children = iscoChildren(g.code);
  const occupations = g.level === 4 ? escoInUnitGroup(g.code) : [];
  const curated = graph.occupations().filter((o) => o.isco?.startsWith(g.code));

  return (
    <>
      <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white">
        <Container className="space-y-4 py-10">
          <IscoBreadcrumb trail={iscoAncestors(g.code)} />
          <p className="chip bg-navy-800 text-teal-500">ISCO-08 {levelName[g.level]} {g.code}</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{g.title}</h1>
          <p className="text-slate-300">{escoCountUnder(g.code).toLocaleString("en")} occupations in this group</p>
        </Container>
      </section>
      <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          {g.description && (
            <section aria-labelledby="def" className="card space-y-2 p-5">
              <h2 id="def" className="text-xl font-extrabold">Definition</h2>
              <p className="whitespace-pre-line text-ink">{g.description}</p>
            </section>
          )}
          {children.length > 0 && (
            <section aria-labelledby="sub" className="space-y-3">
              <h2 id="sub" className="text-xl font-extrabold">{levelName[g.level + 1]}s</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {children.map((c) => (
                  <li key={c.code}>
                    <Link href={`/occupations/isco/${c.code}`} className="card card-link block h-full p-4 text-ink no-underline hover:text-ink">
                      <span className="text-sm font-semibold text-teal-800">{c.code}</span>
                      <span className="block font-display font-bold">{c.title}</span>
                      <span className="text-sm text-ink-muted">{escoCountUnder(c.code)} occupations</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {occupations.length > 0 && (
            <section aria-labelledby="occ" className="space-y-3">
              <h2 id="occ" className="text-xl font-extrabold">Occupations ({occupations.length})</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {occupations.map((o) => (
                  <li key={o.code}>
                    <Link href={`/occupations/${o.code}`} className="card card-link flex h-full items-start justify-between gap-2 p-4 text-ink no-underline hover:text-ink">
                      <span>
                        <span className="block font-display font-bold first-letter:uppercase">{o.title}</span>
                        <span className="text-xs text-ink-muted">ESCO {o.code}{o.broader ? " · specialisation" : ""}</span>
                      </span>
                      {o.regulated && <span className="chip shrink-0 bg-teal-50 text-teal-800"><BadgeCheck aria-hidden="true" size={14} /> Regulated</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <aside className="space-y-5" aria-label="Career paths in this group">
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><Route aria-hidden="true" size={18} className="text-teal-700" /> Career paths</h2>
            {curated.length > 0 ? (
              <ul className="space-y-1">
                {curated.map((o) => <li key={o.slug}><Link href={careerHref(GLOBAL, o.slug)}>{o.title}</Link></li>)}
              </ul>
            ) : <p className="text-sm text-ink-muted">No guided career path for this group yet.</p>}
          </div>
          <CatalogueAttribution onet={false} />
        </aside>
      </Container>
    </>
  );
}

export default function IscoGroupPage({ params }: PageProps<"/occupations/isco/[code]">) {
  return (
    <Suspense fallback={<Container className="py-10"><p className="text-ink-muted">Loading group...</p></Container>}>
      <GroupContent params={params} />
    </Suspense>
  );
}
