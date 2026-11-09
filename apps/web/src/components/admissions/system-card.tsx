import Link from "next/link";
import { Calculator, Info } from "lucide-react";
import type { AdmissionSystem } from "@careerproof/reference-data";
import { StatusChip } from "./status-chip";

export function SystemCard({ s }: { s: AdmissionSystem }) {
  const Icon = s.tier === "points" ? Calculator : Info;
  return (
    <article className="card flex h-full flex-col gap-3 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Icon aria-hidden="true" size={20} className="text-teal-700" />
        <StatusChip status={s.status} />
        {s.cycle && <span className="chip bg-navy-900 px-2 py-0.5 text-xs text-white">{s.cycle}</span>}
      </div>
      <h3 className="text-lg font-extrabold">{s.name}</h3>
      <p className="text-sm text-ink-muted">{s.body}</p>
      <p>{s.summary}</p>
      {s.facts.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {s.facts.map((f) => <li key={f}>{f}</li>)}
        </ul>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
        {s.href && <Link href={s.href} className="btn-primary">{s.tier === "points" ? "Open calculator" : "Open"}</Link>}
        {s.source && <a href={s.source.url} className="text-sm">{s.status === "pending" ? "Official portal" : "Source"}: {s.source.name}</a>}
      </div>
    </article>
  );
}
