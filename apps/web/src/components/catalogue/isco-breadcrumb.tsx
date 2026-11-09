import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { IscoGroup } from "@careerproof/reference-data";

export function IscoBreadcrumb({ trail, current }: { trail: IscoGroup[]; current?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-slate-300">
        <li><Link href="/occupations" className="text-slate-300 hover:text-white">Occupations</Link></li>
        {trail.map((g) => (
          <li key={g.code} className="flex items-center gap-1">
            <ChevronRight aria-hidden="true" size={14} />
            <Link href={`/occupations/isco/${g.code}`} className="text-slate-300 hover:text-white">{g.code} {g.title}</Link>
          </li>
        ))}
        {current && (<li className="flex items-center gap-1"><ChevronRight aria-hidden="true" size={14} /><span className="text-white">{current}</span></li>)}
      </ol>
    </nav>
  );
}
