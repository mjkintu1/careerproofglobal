import { describe, expect, it } from "vitest";
import { auPayBenchmark, caPayBenchmark, zaPublicScales, zaSalaryLevels, keMinimumWage, nationalMinimumWage, payBenchmarks, unProfessionalPay, ugPublicScales, ukPayBenchmark, usPayBenchmark, wbgSalaryScale } from "./pay";

describe("pay benchmarks", () => {
  it("US: BLS percentiles for Registered Nurses (May 2025)", () => {
    const b = usPayBenchmark({ soc: "29-1141.00" })!;
    expect(b).toMatchObject({ currency: "USD", period: "year", median: 97550, p10: 68940, p90: 137470, granularity: "occupation" });
  });

  it("UK: ISCO 2512 software developers map to SOC 2020 2134 in ASHE", () => {
    const b = ukPayBenchmark("2512")!;
    expect(b.covers).toContain("2134");
    expect(b).toMatchObject({ currency: "GBP", median: 59862, p10: 33352, p90: 114051 });
  });

  it("Uganda: public entry scales from CSI No. 6 of 2026, transcribed by hand", () => {
    const doctor = ugPublicScales("medical-doctor");
    expect(doctor).toHaveLength(1);
    expect(doctor[0]).toMatchObject({ scaleMin: 5408476, scaleMax: 5408476, isEntry: true, sector: "public" });
    const teacher = ugPublicScales("secondary-teacher").map((s) => s.scaleMin);
    expect(teacher).toEqual([4000000, 1537976, 2200000, 1357964]);
    expect(ugPublicScales("primary-teacher")[0]).toMatchObject({ scaleMin: 700000 });
  });

  it("orders benchmarks most specific first and falls back to the ILOSTAT group", () => {
    // Elsewhere the national minimum (ILOSTAT) comes last, as a floor.
    const ug = payBenchmarks({ country: "UG", isco: "2211", career: "medical-doctor" });
    expect(ug.map((b) => b.granularity)).toEqual(["public-scale", "major-group", "legal-minimum"]);
    const ke = payBenchmarks({ country: "KE", isco: "2211", career: "medical-doctor" });
    // Kenya: the occupation-specific order replaces the ILOSTAT national rate; doctors are not in it.
    expect(ke.map((b) => b.granularity)).toEqual(["major-group"]);
  });

  it("Kenya: Legal Notice 108 of 2026 minimum wages, by area", () => {
    const cleaner = keMinimumWage({ isco: "9112" })!;
    expect(cleaner.areas!.map((a) => a.min)).toEqual([18047.4, 16650.95, 9628.07]);
    const electrician = keMinimumWage({ career: "electrician" })!;
    expect(electrician).toMatchObject({ granularity: "legal-minimum", scaleMin: 24358.79, scaleMax: 40724.23 });
    // The floor is listed after the group average, never first.
    const ke = payBenchmarks({ country: "KE", isco: "7411", career: "electrician" });
    expect(ke.map((b) => b.granularity)).toEqual(["major-group", "legal-minimum"]);
  });

  it("World Bank Group FY27 scales: Kenya and Uganda", () => {
    expect(wbgSalaryScale("KE")!.grades.find((g) => g.grade === "GA")).toEqual({ grade: "GA", min: 1751000, mid: 2501000, max: 3251000 });
    expect(wbgSalaryScale("UG")!.currency).toBe("UGX");
    expect(wbgSalaryScale("US")!.grades).toHaveLength(11);
  });

  it("UN common system (ICSC): Jan 2026 scale with Nairobi post adjustment", () => {
    const ke = unProfessionalPay("KE")!;
    expect(ke).toMatchObject({ dutyStation: "KEN001", multiplier: 40.9 });
    const p2 = ke.grades.find((g) => g.grade === "P-2")!;
    expect(p2).toMatchObject({ baseNetMin: 56046, netMin: Math.round(56046 * 1.409) });
    expect(unProfessionalPay("US")!.dutyStation).toBe("USA001");
  });

  it("ILOSTAT national minimum wage, latest year", () => {
    expect(nationalMinimumWage("UG")).toMatchObject({ currency: "UGX", scaleMin: 130000, year: "2024", granularity: "legal-minimum" });
    // Nigeria: ILOSTAT still reports NGN 65,000; the 2024 Act (NGN 70,000) replaces it.
    expect(nationalMinimumWage("NG")).toMatchObject({ currency: "NGN", scaleMin: 70000, year: "2024 Act" });
    expect(nationalMinimumWage("RW")).toMatchObject({ currency: "RWF" });
  });

  it("Canada: picks the NOC occupation matching the title (Registered nurses, not supervisors)", () => {
    const nurse = caPayBenchmark({ isco: "2221", title: "Registered Nurse" })!;
    expect(nurse.covers).toMatch(/^Registered nurses/);
    expect(nurse).toMatchObject({ currency: "CAD", period: "hour", granularity: "occupation" });
    const gp = caPayBenchmark({ isco: "2211", title: "Medical Doctor" })!;
    expect(gp).toMatchObject({ period: "year", median: 232227 });
  });

  it("Australia: ABS average weekly earnings via the ANZSCO 2021 correspondence", () => {
    const nurse = auPayBenchmark({ isco: "2221", title: "Registered Nurse" })!;
    expect(nurse).toMatchObject({ currency: "AUD", period: "week", mean: 1718.3 });
    expect(nurse.covers).toContain("ANZSCO 2544");
    expect(auPayBenchmark({ isco: "2512", title: "Software Developer" })!.covers).toContain("Software and applications programmers");
  });

  it("South Africa: DPSA 2026/27 entry notches and the 2026 national minimum wage", () => {
    expect(zaPublicScales("medical-doctor").map((b) => [b.covers, b.scaleMin])).toEqual([
      ["Medical Officer (Intern)", 644757], ["Medical Officer (Community Service)", 848967], ["Medical Officer Gr 1", 1041402],
    ]);
    expect(zaPublicScales("nurse").at(-1)).toMatchObject({ covers: "Professional Nurse Grade 1 (General Nursing)", scaleMin: 337359, period: "year" });
    // Level 5 matches the published vacancy circulars: R237 453 to R279 708.
    expect(zaSalaryLevels().find((l) => l.level === 5)).toMatchObject({ min: 237453, max: 279708 });
    expect(nationalMinimumWage("ZA")).toMatchObject({ period: "hour", scaleMin: 30.23 });
  });
});
