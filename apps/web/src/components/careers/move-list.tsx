import Link from "next/link";
import { ArrowRight, ArrowUpRight, GitBranch, Shuffle } from "lucide-react";
import type { Occupation, Transition, TransitionKind } from "@careerproof/career-graph";
import { careerHref, formatYears, kindLabel } from "@/lib/careers";

interface Props {
  id: string;
  title: string;
  moves: { transition: Transition; occupation: Occupation }[];
  location: string;
  empty: string;
  /** Where the content comes from. */
  note?: string;
}

const kindStyle: Record<TransitionKind, { Icon: typeof ArrowUpRight; chip: string; card: string }> = {
  progression: { Icon: ArrowUpRight, chip: "bg-teal-50 text-teal-800", card: "border-solid" },
  specialisation: { Icon: GitBranch, chip: "bg-teal-50 text-teal-800", card: "border-solid" },
  pivot: { Icon: Shuffle, chip: "bg-gold-50 text-gold-800", card: "border-dashed border-gold-400" },
};

/** Career moves as cards. Pivots: dashed gold border; kind is always shown in words and with an icon. */
export function MoveList({ id, title, moves, location, empty, note }: Props) {
  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-3">
      <h2 id={`${id}-heading`} className="text-xl font-extrabold">{title}</h2>
      {note && <p className="text-xs text-ink-muted">{note}</p>}
      {moves.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {moves.map(({ transition: t, occupation }) => {
            const k = kindStyle[t.kind];
            return (
              <li key={`${t.from}-${t.to}`}>
                <Link href={careerHref(location, occupation.slug)}
                  className={`card card-link group flex h-full flex-col gap-2 border-2 p-4 text-ink no-underline hover:text-ink ${k.card}`}>
                  <span className={`chip self-start ${k.chip}`}><k.Icon aria-hidden="true" size={14} /> {kindLabel[t.kind]}</span>
                  <span className="flex items-center justify-between gap-2 font-display text-lg font-bold">
                    {occupation.title}
                    <ArrowRight aria-hidden="true" size={18} className="text-teal-700 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="text-sm text-ink-muted">{t.via} ({formatYears(t.years)})</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-ink-muted">{empty}</p>
      )}
    </section>
  );
}
