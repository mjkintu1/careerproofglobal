import { icscMeta, unProfessionalPay, wbgMeta, wbgSalaryScale } from "@careerproof/reference-data";

const f = (v: number) => v.toLocaleString("en");
const th = "px-3 py-2 text-right";
const monthName = (ym: string) => new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** World Bank Group FY27 scale for one country, local currency or USD as published. */
function WbgTable({ country, countryName }: { country: string; countryName: string }) {
  const s = wbgSalaryScale(country);
  if (!s) return null;
  return (
    <div className="space-y-2">
      <h3 className="font-display text-lg font-bold">World Bank Group</h3>
      <p className="text-sm text-ink-muted">Salary range by grade for staff based in {countryName}, per year ({s.currency}). G1 or GA is the lowest grade.</p>
      <div className="card relative overflow-x-auto p-0">
        <table className="w-full min-w-[440px] text-sm">
          <thead className="bg-slate-50"><tr><th scope="col" className="px-3 py-2 text-left">Grade</th><th scope="col" className={th}>Minimum</th><th scope="col" className={th}>Midpoint</th><th scope="col" className={th}>Maximum</th></tr></thead>
          <tbody>
            {[...s.grades].reverse().map((g) => (
              <tr key={g.grade} className="border-t border-border"><th scope="row" className="px-3 py-2 text-left font-semibold">{g.grade}</th><td className={th}>{f(g.min)}</td><td className={`${th} font-semibold`}>{f(g.mid)}</td><td className={th}>{f(g.max)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-muted"><a href={wbgMeta.url} rel="noopener">{wbgMeta.attribution}</a></p>
    </div>
  );
}

/** UN common system Professional and higher pay at the country's main duty station. */
function UnTable({ country, countryName }: { country: string; countryName: string }) {
  const u = unProfessionalPay(country);
  if (!u) return null;
  return (
    <div className="space-y-2">
      <h3 className="font-display text-lg font-bold">United Nations (Professional and higher staff)</h3>
      <p className="text-sm text-ink-muted">
        Net pay per year in US dollars at the main UN duty station in {countryName}: the worldwide base salary (scale from {monthName(u.scaleEffective)}) plus post adjustment
        of {u.multiplier}% (as of {u.asOf}), using ICSC&rsquo;s formula. Ranges run from step 1 to the top regular step. General Service staff, hired locally, have separate local scales.
      </p>
      <div className="card relative overflow-x-auto p-0">
        <table className="w-full min-w-[440px] text-sm">
          <thead className="bg-slate-50"><tr><th scope="col" className="px-3 py-2 text-left">Grade</th><th scope="col" className={th}>Net pay here, USD</th><th scope="col" className={th}>Base salary, USD</th></tr></thead>
          <tbody>
            {u.grades.map((g) => (
              <tr key={g.grade} className="border-t border-border">
                <th scope="row" className="px-3 py-2 text-left font-semibold">{g.grade}</th>
                <td className={`${th} font-semibold`}>{g.netMin === g.netMax ? f(g.netMin) : `${f(g.netMin)}–${f(g.netMax)}`}</td>
                <td className={`${th} text-ink-muted`}>{g.baseNetMin === g.baseNetMax ? f(g.baseNetMin) : `${f(g.baseNetMin)}–${f(g.baseNetMax)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-muted"><a href={icscMeta.url} rel="noopener">{icscMeta.attribution}</a> Post adjustment: <a href={icscMeta.postAdjustmentUrl} rel="noopener">ICSC post adjustment classifications</a>.</p>
    </div>
  );
}

/** Official pay scales of international employers in one country. Grades are not tied to occupations. */
export function WbgScaleTable({ country, countryName }: { country: string; countryName: string }) {
  if (!wbgSalaryScale(country) && !unProfessionalPay(country)) return null;
  return (
    <section aria-labelledby="intl-heading" className="space-y-4">
      <h2 id="intl-heading" className="font-display text-xl font-extrabold">International employer pay in {countryName}</h2>
      <p className="text-sm text-ink-muted">
        Official pay scales of two large international employers with staff in {countryName}, useful for comparing local pay. Their grades are not tied to particular occupations.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <WbgTable country={country} countryName={countryName} />
        <UnTable country={country} countryName={countryName} />
      </div>
    </section>
  );
}
