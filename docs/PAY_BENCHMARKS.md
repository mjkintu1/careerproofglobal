# Pay benchmarks and entry levels by country

Code: `packages/reference-data/src/pay.ts` (`payBenchmarks`), shown by
`apps/web/src/components/pay/pay-benchmarks.tsx` on career pages, in the path-planner inspector and in
the planner's careers table.

## Order of precedence (most specific first)

| Kind | Countries | Source | What it is |
|---|---|---|---|
| Public-sector entry pay | South Africa | DPSA Circular 15 of 2026, Annexures A-H spreadsheet (`npm run ingest:za-dpsa`) | Entry notch of each post for 19 careers (intern and community-service years included where the scale lists them); general salary levels 1-12 with full ranges. The OSD sheets are translation keys where posts share notch ladders, so only entry notches are used from them |
| Public-sector entry pay | Uganda | Ministry of Public Service, CSI No. 6 of 2026 (FY 2026/27) | Published pay on entry to a grade, with the entry requirement |
| This occupation | United States | BLS OEWS, May 2025 (`npm run ingest:bls`) | Median, mean, 10th/25th/75th/90th percentiles, ~800 occupations |
| This occupation | Canada | Job Bank wages, 2025 release (`npm run ingest:canada`) | Low (10th pct), quartiles, median, high (90th pct), mean; hourly or annual as published. Linked to ISCO-08 by chaining StatCan's NOC 2021 to 2016 and NOC 2011 to ISCO 2008 tables (StatCan's own NOC 2021 to ISCO-08 table is not yet published); the NOC title best matching the career is chosen |
| Close occupation group | Australia | ABS Employee Earnings and Hours, May 2025, table 11 (`npm run ingest:australia`) | Average weekly cash earnings by ANZSCO 4-digit, all employees including part-time; estimates with relative standard error above 25% dropped; linked via the ABS ANZSCO 2021 to ISCO-08 correspondence |
| Close occupation group | United Kingdom | ONS ASHE 2026 provisional, Table 14.7a (`npm run ingest:ashe`) | Same statistics for full-time employees, SOC 2020 4-digit |
| Broad group average | 151 countries | ILOSTAT (`npm run ingest:ilostat`) | Average monthly earnings for the ISCO-08 major group |
| National minimum wage | 170 countries | ILOSTAT monthly minimum wage, latest year (`npm run ingest:minwage`) | One reference rate per country, with its type (single national, occupational, sectoral). Shown once above the careers table, never per career; replaced by an occupation-specific order where we hold one (Kenya) |
| Legal minimum pay | Kenya | Regulation of Wages (General) (Amendment) Order, 2026, Legal Notice 108 (`npm run ingest:ke-wages`) | Statutory minimum monthly wage by occupation and area; listed after averages, never as typical pay |

Country-level references (not per career), shown as "International employer pay" on each country's planner page:
- **World Bank Group FY27 salary scales** (`npm run ingest:wbg`): annual minimum, midpoint and maximum by
  grade for staff in 142 countries, local currency or USD.
- **UN common system, Professional and higher staff** (ICSC; `npm run ingest:icsc`): the worldwide base
  salary scale (January 2026, net of staff assessment, step 1 to the top regular step) plus post adjustment
  for each country's main duty station (205 countries, as of October 2026), using ICSC's formula
  net pay = net base x (1 + multiplier / 100). Source files: `sal202601.xml` and `pac_DSID_xml.xml` from
  icsc.un.org (robots.txt absent). Special "PP" steps are left out of the ranges. General Service
  (locally recruited) scales are on onehr.un.org and are not included yet.

Rules:
- Percentiles describe current pay across everyone in the job. They are never labelled starting pay;
  only published entry scales are.
- Every figure says what it covers, the year, and the source; nothing is estimated or blended.
- UK figures reach ISCO-08 through the ONS SOC 2020 coding index: the SOC unit group holding most of
  the ISCO group's job titles, with the share shown.
- Uganda scales were hand-transcribed from a scanned circular (schedule and page recorded in
  `ug-public-pay.json`). Which scale a career enters on is our reading of the designations; the page
  says the actual grade depends on the post. Science posts are paid far more than non-science posts
  at the same level (e.g. graduate teacher UGX 4,000,000 science vs 1,537,976 non-science a month).
- Where a career has several Uganda scales, the careers table shows the span and sorts by the lower figure.

## Entry levels

- Qualification: each career's ways in (licences, internships and supervised practice excluded as
  ways in), ISCO-08 skill level, and for O*NET occupations O*NET's education and Job Zone.
- Uganda public scales add the requirement stated with the grade.

## Coverage page

`/pay-coverage` lists every country with the tiers it has and their dates (`payCoverage()` in `pay.ts`),
with a filter for countries with two sources or fewer. As of Nov 2026 (after tier 3): pay by occupation 4, public entry scales 2 (UG, ZA), public entry
scales 1, legal minimum 170, ILOSTAT group averages 151, World Bank 142, UN 205.

## Kenya notes

- The minimum-wage order was supplied as the official PDF (Kenya Law sets `ai-input=no`). It settles a
  conflict in news reports: general clerks and receptionists are KSh 27,796.51 in the main cities.
- Where the ILOSTAT 2019 survey average is below today's legal minimum (e.g. craft workers KSh 8,422 against
  an artisan floor from KSh 18,583), the page says why: household surveys count all employees,
  including informal and part-time jobs, and predate later wage orders.

## Tier 3 notes (Nov 2026)

- National minimum wages from the countries' own sources replace ILOSTAT's where newer:
  South Africa R30.23 an hour from 1 March 2026 (Government Gazette No. 54075), Nigeria NGN 70,000 a month
  (National Minimum Wage Act 2024, confirmed in the President's broadcast of 4 August 2024; ILOSTAT still shows 65,000).
- **Ghana pending:** the Fair Wages and Salaries Commission site (fairwages.gov.gh) did not respond to automated
  requests or a browser visit. Its 2026 base-pay agreement (+9%) and daily minimum wage could not be opened to verify.
- **Nigeria public scales pending:** NSIWC publishes CONPSS, CONHESS, CONMESS and other structures, but the
  newest reachable files date from 2019, before the 2024 minimum-wage adjustments; publishing them as current
  entry pay would mislead. The 2024 consequential-adjustment tables are needed.
- Tanzania and Rwanda: not started.

## Tier 2 notes (Nov 2026)

- Hourly figures (most of Canada) are shown as published and never converted to a month, because hours
  worked vary. The careers table ranks monthly-comparable figures first, then hourly ones by value.
- Australia: Jobs and Skills Australia's site did not respond to automated requests, so the same ABS
  survey is used directly. ABS publishes medians only for broad groups; occupation figures are averages.
- EU: Eurostat's Structure of Earnings Survey 2022 publishes medians and deciles only for three broad
  bands (non-manual, skilled manual, manual), and single occupation groups only as means, which ILOSTAT
  already holds for these countries (often for later years). Not added, to avoid a duplicate source.

## Sites reviewed and not used (Nov 2026)

| Site | Why not |
|---|---|
| payscale.com, unjobnet.org | robots.txt disallows all automated access |
| playroll.com | Requests blocked by its CDN |
| africa-salary.com, kazinest.co.ke, thecareerbuddy.com | Own estimates with no published method we could read; fails the official-sources rule |
| wage.is | Compiles official statistics; useful cross-check, but we use the originals (ILOSTAT, BLS, ONS) directly |
| fke-kenya.org downloads | Latest wage notice there is 2022, superseded by Legal Notice 108 of 2026 |

UN pay comes from the International Civil Service Commission (icsc.un.org), the official source behind
unjobnet's tables.

## Pending

- **Kenya TSC teacher scales** (2025-2029 CBA): implementation circular not located on tsc.go.ke.
- **Stage 2:** survey microdata (UBOS, KNBS, Stats SA via DataFirst, NBS, GSS) for occupation-level
  pay ranges in African countries; needs the project owner to register with each office.
- Canada Job Bank wages, Eurostat Structure of Earnings Survey, public pay scales for Nigeria, Ghana, South Africa.
