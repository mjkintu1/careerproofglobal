"use client";

import { useMemo, useState } from "react";
import { evaluateAll, suggestAlternatives, type Applicant } from "@careerproof/rules-engine";
import { datasets } from "@careerproof/sample-data";
import { presets } from "./presets";
import { ResultCard } from "./result-card";
import { ResultsForm } from "./results-form";

export function Simulator() {
  const [region, setRegion] = useState("UG");
  const [applicant, setApplicant] = useState<Applicant>(presets.UG![0]!.applicant);

  const dataset = datasets.find((d) => d.region === region)!;
  const { ruleSet, programmes } = dataset;

  const results = useMemo(
    () => evaluateAll(ruleSet, programmes, applicant),
    [ruleSet, programmes, applicant],
  );
  const open = results.filter((r) => r.eligible);
  const closed = results.filter((r) => !r.eligible);

  function switchRegion(next: string) {
    setRegion(next);
    setApplicant(presets[next]?.[0]?.applicant ?? { results: {} });
  }

  return (
    <div className="space-y-8">
      <div role="note" className="rounded-[var(--radius-card)] border border-gold-400/60 bg-gold-50 p-4">
        <p className="font-bold">Demo with sample data</p>
        <p className="text-ink-muted">
          The scoring follows the structure of each national system, but the rule
          values are not yet verified and every cut-off shown is made up. Do not
          use these results to make real decisions.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-lg font-bold">Country</legend>
        <p className="text-ink-muted">One engine, configured per country by data.</p>
        <div className="flex flex-wrap gap-3">
          {datasets.map((d) => (
            <label key={d.region} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 has-[:checked]:border-teal-700 has-[:checked]:bg-teal-50">
              <input
                type="radio"
                name="region"
                value={d.region}
                checked={region === d.region}
                onChange={() => switchRegion(d.region)}
                className="size-5 accent-teal-700"
              />
              <span className="font-semibold">{d.name}</span>
              <span className="text-sm text-ink-muted">{d.ruleSet.framework}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <ResultsForm
        key={region}
        ruleSet={ruleSet}
        applicant={applicant}
        presets={presets[region] ?? []}
        onChange={setApplicant}
      />

      <section aria-labelledby="results-heading" className="space-y-4">
        <h2 id="results-heading" className="text-xl font-bold">Your options</h2>
        <p aria-live="polite" className="text-ink-muted">
          {open.length} of {results.length} sample programmes are open to you.
          Scored with {ruleSet.label}, rule set {ruleSet.version}.
        </p>
        <ul className="space-y-4">
          {open.map((r) => (
            <ResultCard
              key={r.programme.id}
              result={r}
              pointsLabel={ruleSet.pointsLabel}
              alternatives={r.zone === "danger" ? suggestAlternatives(r, results) : []}
            />
          ))}
        </ul>
      </section>

      {closed.length > 0 && (
        <section aria-labelledby="closed-heading" className="space-y-3">
          <h2 id="closed-heading" className="text-xl font-bold">Closed with your current subjects</h2>
          <p className="text-ink-muted">Change your subjects or grades above to see what opens up.</p>
          <ul className="space-y-2">
            {closed.map((r) => (
              <li key={r.programme.id} className="border-l-4 border-border bg-surface-muted p-3">
                <p className="font-semibold">
                  {r.programme.title}, {r.programme.institution}
                </p>
                <ul className="list-disc pl-5 text-ink-muted">
                  {r.blockedBy.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
