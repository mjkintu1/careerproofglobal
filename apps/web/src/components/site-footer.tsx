import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { Container } from "./container";
import { audiences, mainNav } from "@/lib/site-nav";

export function SiteFooter() {
  const columns = [
    ...mainNav.map((g) => ({ title: g.label, links: g.links })),
    { title: "Getting started", links: audiences.slice(0, 4).map((a) => ({ href: a.href, label: a.label })) },
  ];
  return (
    <footer className="mt-16 bg-navy-900 text-slate-300">
      <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <BrandLogo dark className="h-11 w-auto" />
          <p className="text-sm">Map your path. Prove your future.</p>
          <p className="text-sm">
            Official classifications and statistics are cited where they appear. Career routes and typical durations
            are CareerProof Global guidance. Admission figures come only from official published lists. Official decisions are made by the
            relevant institutions and licensing bodies.
          </p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={`Footer: ${c.title}`}>
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-white">{c.title}</h2>
            <ul className="space-y-2 text-sm">
              {c.links.map((l) => (<li key={l.href + l.label}><Link href={l.href} className="text-slate-300 hover:text-white">{l.label}</Link></li>))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-navy-800">
        <Container className="py-4 text-sm">© 2026 CareerProof Global</Container>
      </div>
    </footer>
  );
}
