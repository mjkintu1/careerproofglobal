import type { ProgrammeResult } from "@careerproof/rules-engine";
import { ZoneBadge } from "./zone-badge";

interface Props {
  result: ProgrammeResult;
  pointsLabel: string;
  alternatives: ProgrammeResult[];
  sex?: "F" | "M";
}

/** 2025 -> "2025/26" (Ugandan intakes span two years). */
const intake = (y: number) => `${y}/${String((y + 1) % 100).padStart(2, "0")}`;

const fmt = (n: number) => n.toFixed(n % 1 === 0 ? 0 : 1);

export function ResultCard({ result, pointsLabel, alternatives, sex }: Props) {
  const { programme, points, zone, cutoffRange, breakdown } = result;
  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold leading-snug">{programme.title}</h3>
          <p className="text-ink-muted">{programme.institution}{programme.code && !programme.code.startsWith("DEMO") ? ` · code ${programme.code}` : ""}</p>
        </div>
        {zone && <ZoneBadge zone={zone} />}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 sm:max-w-md">
        <dt className="text-ink-muted">Your {pointsLabel}</dt>
        <dd className="font-bold">{points !== null ? fmt(points) : "-"}</dd>
        <dt className="text-ink-muted">Past cut-offs{sex && programme.cutoffs.some((c) => c.sex === sex) ? ` (${sex === "F" ? "female" : "male"})` : ""}</dt>
        <dd className="font-bold">
          {cutoffRange
            ? `${fmt(cutoffRange.min)} to ${fmt(cutoffRange.max)} (${intake(Math.min(...cutoffRange.years))} to ${intake(Math.max(...cutoffRange.years))})`
            : "Not enough years published"}
        </dd>
      </dl>

      <details className="mt-3">
        <summary className="cursor-pointer font-semibold text-teal-700 underline">
          How we calculated this
        </summary>
        <table className="mt-2 w-full text-sm">
          <caption className="sr-only">Points breakdown for {programme.title}</caption>
          <tbody>
            {breakdown.map((line, i) => (
              <tr key={i} className="border-b border-surface-muted">
                <th scope="row" className="py-1 pr-2 text-left font-normal">{line.label}</th>
                <td className="py-1 pr-2 text-ink-muted">{line.detail}</td>
                <td className="py-1 text-right font-semibold">{fmt(line.points)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      {programme.notes && programme.notes.length > 0 && (
        <ul className="mt-3 list-disc pl-5 text-sm text-ink-muted">
          {programme.notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      )}
      {programme.source && (
        <p className="mt-2 text-xs text-ink-muted">Subject rules: <a href={programme.source.url}>{programme.source.name}</a></p>
      )}

      {zone === "danger" && (
        <div className="mt-3 border-l-4 border-teal-700 bg-surface-muted p-3">
          <p className="font-semibold">Backup options in the same field</p>
          {alternatives.length > 0 ? (
            <ul className="mt-1 list-disc pl-5">
              {alternatives.map((a) => (
                <li key={a.programme.id}>
                  {a.programme.title}, {a.programme.institution}
                  {a.zone === "safe" ? " (above recent cut-offs)" : " (within recent cut-offs)"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-ink-muted">No programme in this field where your points are higher than past cut-offs.</p>
          )}
        </div>
      )}
    </li>
  );
}
