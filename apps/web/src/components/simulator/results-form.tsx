"use client";

import type { Applicant, RuleSet } from "@careerproof/rules-engine";
import type { Preset } from "./presets";

interface Props {
  ruleSet: RuleSet;
  applicant: Applicant;
  presets: Preset[];
  onChange: (next: Applicant) => void;
}

const scaleTitles: Record<string, string> = {
  principal: "Principal subjects",
  subsidiary: "Subsidiary subjects",
  kcse: "KCSE subjects",
};

const inputClass =
  "field";

export function ResultsForm({ ruleSet, applicant, presets, onChange }: Props) {
  const scales = Object.keys(ruleSet.grades);
  const bonus = ruleSet.scoring.method === "weighted_categories" ? ruleSet.scoring.secondaryBonus : undefined;
  const asksSex = ruleSet.adjustments.some((a) => a.when.sex !== undefined);

  function setGrade(code: string, grade: string) {
    const results = { ...applicant.results };
    if (grade === "") delete results[code];
    else results[code] = grade;
    onChange({ ...applicant, results });
  }

  function setBand(id: string, value: string) {
    const n = Math.max(0, Math.min(20, Number.parseInt(value, 10) || 0));
    onChange({ ...applicant, secondaryBands: { ...applicant.secondaryBands, [id]: n } });
  }

  return (
    <section aria-labelledby="form-heading" className="space-y-6">
      <h2 id="form-heading" className="text-xl font-bold">Your results</h2>

      {presets.length > 0 && (
        <div className="space-y-2">
          <p className="font-semibold">Try an example student</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange(p.applicant)}
                className="min-h-11 rounded-full border border-teal-700 px-4 font-semibold text-teal-700 hover:bg-teal-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {scales.map((scale) => {
        const subjects = Object.entries(ruleSet.subjects).filter(([, s]) => s.scale === scale);
        const grades = Object.entries(ruleSet.grades[scale] ?? {}).sort((a, b) => b[1] - a[1]);
        return (
          <fieldset key={scale} className="space-y-3">
            <legend className="font-bold">{scaleTitles[scale] ?? scale}</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {subjects.map(([code, s]) => (
                <label key={code} className="block space-y-1">
                  <span className="block text-sm font-semibold">{s.name}</span>
                  <select
                    value={applicant.results[code] ?? ""}
                    onChange={(e) => setGrade(code, e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Not taken</option>
                    {grades.map(([g]) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}

      {bonus && (
        <fieldset className="space-y-3">
          <legend className="font-bold">{bonus.label}</legend>
          <p className="text-sm text-ink-muted">How many subjects at each level. Up to {bonus.maxSubjects} count.</p>
          <div className="grid grid-cols-3 gap-3 sm:max-w-md">
            {bonus.bands.map((band) => (
              <label key={band.id} className="block space-y-1">
                <span className="block text-sm font-semibold">{band.label}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={20}
                  value={applicant.secondaryBands?.[band.id] ?? 0}
                  onChange={(e) => setBand(band.id, e.target.value)}
                  className={inputClass}
                />
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {asksSex && (
        <label className="block max-w-xs space-y-1">
          <span className="block font-bold">Sex (affects some bonuses)</span>
          <select
            value={applicant.sex ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onChange({ ...applicant, sex: v === "F" || v === "M" ? v : undefined });
            }}
            className={inputClass}
          >
            <option value="">Prefer not to say</option>
            <option value="F">Female</option>
            <option value="M">Male</option>
          </select>
        </label>
      )}
    </section>
  );
}
