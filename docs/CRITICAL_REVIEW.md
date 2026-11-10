# Critical review: loopholes, next changes and intel gaps

Branch `review/critical-audit`, cut from `main` at `f6d143b` on 2026-11-10. Live site: https://careerproofglobal.vercel.app (CI and Vercel deploy green).

Every finding below was checked against the code, the hosted database (read-only queries) or the live site. Priorities:

- **P0:** fix before the HBS deadline (12 Nov 2026) or before real students use the site.
- **P1:** fix before a pilot.
- **P2:** improvements.

## What is solid

- **Security model:** row-level security is on for all 36 hosted tables. Admin rights come from `app_metadata` (server-set only). Secrets are git-ignored, and a secret scan of the commit was clean. HSTS is on.
- **Provenance:** every official figure carries a source, a date and a licence. Unverified items are labelled ("To be verified", "Illustrative", "Being confirmed"). Sites that block AI crawlers were not crawled.
- **Engineering hygiene:** CI runs lint, typecheck, tests and build on every push. The mobile layout has no horizontal overflow on the 9 key pages tested at 375 px.

## P0: before 12 November / before real users

| # | Loophole | Evidence | Change |
|---|---|---|---|
| 1 | **The HBS draft describes a product that no longer exists, and overclaims** | `docs/HBS_NVC_2027_APPLICATION_DRAFT.md` claims scholarships, verified internships and "Venturers" (none are built) and says it "keeps working offline after the first load" (no service worker or manifest exists). It is still simulator-first and Uganda/Kenya-only. Team, traction and the demo URL are still `[FILL IN]`. | Rewrite around what is live: global career paths, 2,909 ESCO occupations, 30,326 institutions, cited data, verified UCAS calculator, Africa pilot. Remove or relabel unbuilt features as roadmap. Fill in team and traction. |
| 2 | **The 68 guided careers are authored content with weak links to the standards** | 9 have **no ISCO code** (data analyst, data scientist, project manager, UX designer, entrepreneur, quantity surveyor, supply-chain analyst, content creator, agricultural extension officer). 19 titles have no exact ESCO match in their ISCO group. "Aircraft maintenance engineer" is in ISCO 7232 here but ESCO 3153. Summaries, tasks, RIASEC codes, routes and all 130 "years" values were written by us. | Link each career to an ESCO concept URI and inherit ISCO from it. Check RIASEC against O\*NET Interests (already licensed). Get each career reviewed by a practitioner or counsellor. Show "Reviewed by ... on ..." once done. |
| 3 | **Career moves (106 transitions) and their "typical years" have no source** | `transitions-*.json`. The path finder says "typical, based on sample data". | Keep the label. Treat as intel A5: replace with evidence (ESCO related occupations, O\*NET Related Occupations, or Venturer-reported journeys). |
| 4 | **US pay is shown on the global page and on non-US pages** | The Accountant sidebar shows "US$83,680" to a user in Uganda. It is labelled "United States", but readers may still take it as their local pay. | Show US pay only on US pages, or next to a local figure. Add ILOSTAT earnings by occupation (intel A3). |

## P1: before a pilot

| # | Loophole | Evidence | Change |
|---|---|---|---|
| 5 | **About 17,000 near-duplicate country pages (doorway-page SEO risk)** | `/careers/fj/accountant` has the same content as global but a self-referencing canonical. Only 10 locations have local detail. | Set the canonical to `/careers/global/{slug}` (or `noindex`) when a country has no local data; self-canonical only where local data exists. |
| 6 | **No robots.txt, sitemap.xml or metadataBase; canonicals are relative; no Open Graph tags** | Live: `/robots.txt` 404, `/sitemap.xml` 404, `<link rel="canonical" href="/careers/...">`. | Add `app/robots.ts`, `app/sitemap.ts` (split sitemaps), `metadataBase`, OG/Twitter images. |
| 7 | **Brand mismatch in titles** | Every `<title>` ends "\| Career Proof", not "CareerProof Global". | Fix the title template in `layout.tsx`. |
| 8 | **No security headers beyond HSTS** | No CSP, X-Frame-Options/frame-ancestors, Referrer-Policy, X-Content-Type-Options or Permissions-Policy. | Add `headers()` in `next.config.ts`; a strict CSP is feasible because there are no third-party scripts. |
| 9 | **Production database changes ship straight from `main`** | All 5 migrations appeared on the hosted project without a manual `db push`, most likely through the Supabase GitHub integration. There is no staging project. | Confirm the integration settings (intel B1). Add a staging/preview branch database. Require PRs into `main`. Review migrations for destructive statements. |
| 10 | **Anonymous write path with no rate limit** | `page_feedback` allows inserts from `anon` with `check (true)`. The table comment itself says "Add rate limiting at the edge before launch". Free-text `comment` may collect personal data from minors. | Send feedback through a server action with rate limiting and a honeypot. Drop the direct anon grant. Warn users not to enter personal details. |
| 11 | **No privacy notice, terms or cookie statement** | No such pages exist. The audience includes minors. | Publish a privacy notice (Uganda DPPA 2019, Kenya DPA 2019, GDPR for EU visitors), terms, and a data-sources/licences page. Register with Uganda's PDPO before collecting accounts. |
| 12 | **Database is built but unused** | The web app has no Supabase client. All data comes from bundled JSON (up to 3 MB per snapshot). The hosted tables are empty. | Fine for now, but say "data held in versioned snapshots" in the HBS form rather than implying a live database. Plan the move when accounts or saved items ship. |
| 13 | **Reference-data freshness has no schedule** | BLS (annual), ROR (monthly), ESCO (versioned), UCAS (each May), JOIN (stale for some countries, e.g. Kenya 2005). | A scheduled GitHub Action per source that re-runs the ingest scripts and opens a PR with the diffs. |
| 14 | **UCAS reuse terms not checked** | We publish points from UCAS's tables. UCAS's site terms may restrict commercial reuse. | Read the UCAS terms or ask UCAS (intel B3). The values are facts, but confirm. |

## P2: improvements

- **Bundle size:** `path-finder.tsx` and `simulator.tsx` ship the whole sample career graph and demo datasets to the browser (79 KB chunk). Pass only the slugs and titles the client needs.
- **Error pages:** no custom `not-found.tsx` or `error.tsx`. Users get the default 404.
- **No usage data:** privacy-friendly analytics are needed to show traction.
- **Tests:** only the packages have tests. Add Playwright smoke tests and automated accessibility checks (axe) for the key pages in CI.
- **Search:** the header search covers the 68 guided careers only. Extend it to the 2,909 ESCO occupations.
- **Language:** English only. ESCO is available in 28 languages; French, Swahili, Arabic and Portuguese matter for an Africa pilot.
- **Data errors:** 4 ESCO occupations failed (API 500s). Retry, or use the ESCO bulk download. Re-check the JOIN outlier (Nigeria, 26.6% professionals).

## Intel needed

Facts we cannot get from code or open data. Each item says who can provide it.

**A. Data and evidence**

| # | Question | Why | Source / route |
|---|---|---|---|
| A1 | Official admission rules for Uganda (PUJAB weighting) and Kenya (KUCCPS cluster formula and subject clusters) | The two "illustrative" calculators can't be verified without them | PUJAB and KUCCPS published guides; an admissions-office contact |
| A2 | Past cut-off lists (3 to 5 years) per programme | Needed for "your points vs last year's cut-off" | University admission lists (often PDFs); a data-sharing request |
| A3 | Local pay by occupation | Replaces US-only pay | ILOSTAT earnings by ISCO group (CC BY 4.0), check coverage per country; national labour-force surveys |
| A4 | Which careers, subjects and exams matter to students in the pilot countries | Choosing the next 100 careers | A survey or interviews with careers teachers and S5/S6 students in 3 to 5 schools |
| A5 | Real career journeys (for transitions and years) | Replaces invented transitions | Venturer interviews; O\*NET Related Occupations; a LinkedIn Economic Graph partnership (not scraping) |
| A6 | Ghana WASSCE aggregate, South Africa APS per university, Nigeria post-UTME aggregates | Next calculators for the Africa pilot | Official university and exam-board documents |
| A7 | IB 45-point rules; Parcoursup; US admissions | Pending explainers; their sites block automated access | Read in a browser yourself, or email the IB and EducationUSA |
| A8 | WHED institution data (licence) | Accreditation status beyond ROR listings | IAU request (draft ready in `docs/IAU_WHED_DATA_REQUEST.md`; not yet sent) |
| A9 | The 5 pending certifications (CIMA, CPA boards, CIPS, PRINCE2, CEH) | Issuer-confirmed facts only | Issuer pages read by a person, or the issuers' partnership teams |

**B. Business, legal and operations**

| # | Question | Why | Who |
|---|---|---|---|
| B1 | Is the Supabase GitHub integration set to deploy migrations to production? | Explains how migrations reached hosted (finding 9) | You, in Supabase Dashboard: Project Settings, Integrations |
| B2 | Data protection: registration and children's data | Required before accounts | Uganda PDPO, Kenya ODPC; a local lawyer |
| B3 | UCAS, ESCO, World Bank and O\*NET reuse terms for a commercial or donor-funded product | Licence certainty | Each publisher's terms page; email where unclear |
| B4 | "CareerProof" name and trademark availability (UG, KE, international) | Brand risk | URSB (Uganda), KIPI (Kenya), WIPO Global Brand Database |
| B5 | Team, advisers, traction, school letters of support | HBS form fields still `[FILL IN]` | You |
| B6 | Sustainability model (schools, governments, NGOs, sponsors?) | HBS judges ask; it also shapes the data roadmap | You and your advisers |

## Suggested order

1. **HBS rewrite (P0-1)** by 12 Nov.
2. **SEO and brand fixes (5 to 8):** about a day of code, on this branch.
3. **Career-to-ESCO linking and US-pay scoping (2, 4):** partly automatable.
4. **Privacy, feedback hardening and database safety (9 to 11)**, before any pilot or accounts.
5. **Intel A1, A2, A4 and B1, B2** in parallel; these unblock the Africa pilot.
