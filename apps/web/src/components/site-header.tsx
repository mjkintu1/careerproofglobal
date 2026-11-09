import Link from "next/link";
import { Route } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { Container } from "./container";
import { MainNav } from "./main-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-navy-900 text-sm text-slate-300">
        <Container className="flex min-h-9 flex-wrap items-center justify-between gap-2 py-1">
          <p className="font-medium">Map your path. Prove your future.</p>
          <p className="hidden sm:block">Career guidance for every country, aligned to <span className="font-semibold text-white">ILO ISCO-08</span></p>
        </Container>
      </div>
      <div className="border-b border-line bg-white/95 backdrop-blur">
        <Container className="flex min-h-[4.5rem] items-center justify-between gap-3 py-2">
          <Link href="/" className="shrink-0 no-underline" aria-label="CareerProof Global home">
            <BrandLogo className="h-10 w-auto sm:h-11" />
          </Link>
          <div className="flex items-center gap-2">
            <MainNav />
            <Link href="/careers/global#path-finder-heading" className="btn-primary hidden sm:inline-flex">
              <Route aria-hidden="true" size={18} /> Plan my path
            </Link>
          </div>
        </Container>
      </div>
    </header>
  );
}
