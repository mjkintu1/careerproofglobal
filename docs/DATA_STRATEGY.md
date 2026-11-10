# Career Proof: global data strategy

**Date:** 2026-11-10. **Goal:** real, current, cited career and labour-market data for every country, built on international standards, collected in bulk and refreshed automatically.

---

## 1. Standards we build on

| Need | Standard | Why |
|---|---|---|
| Occupations (backbone) | **ISCO-08** (ILO) | Used by national statistics offices worldwide; every ILO, World Bank and OECD occupation statistic is coded to it |
| Occupations (detail, skills, languages) | **ESCO** (European Commission), **O\*NET** (US DOL) | About 3,000 ESCO occupations and 13,000 skills mapped to ISCO; O\*NET adds tasks, work context, education and RIASEC interests |
| Education levels | **ISCED 2011** (UNESCO) | Compares a Ugandan diploma, a Kenyan degree and a UK A-level on one scale |
| Countries, currencies, languages | **ISO 3166-1**, **ISO 4217**, **ISO 639** | Every country, not a fixed list |
| Statistics exchange | **SDMX** | The format ILO and OECD publish in; one importer pattern for both |
| Web content | **schema.org** `Occupation`, `JobPosting`, `EducationalOccupationalProgram` | Search engines read career, job and programme facts directly (now live on career pages) |
| Provenance | Source, licence, import run on every row | Anyone can see where a number came from and how old it is |

## 2. The sources you named, assessed

| Source | What it gives | Access (checked 2026-11-10) | Role |
|---|---|---|---|
| **World Bank JOIN** | 746 series: employment by ISCO major group x sex, education, age, urban/rural; wages; informality | Open REST API, source id 86. **Imported: 154 countries.** Last updated by the World Bank in May 2023 | Country workforce profile |
| **ILOSTAT** (ilo.org) | The global reference for employment, earnings and hours by ISCO-08 occupation | SDMX API and bulk files. Its servers refused requests from this environment, so confirm access from a normal network | Main source for occupation-level employment and pay |
| **OECD Data Explorer** (incl. Employment Database) | 1,551 datasets, 135 on labour: e.g. employment by occupation for African countries, earnings by field of study | Open SDMX API (`sdmx.oecd.org/public/rest`) | Pay, education returns, OECD and partner countries |
| **globaljobs.org** | International affairs, development and policy vacancies | RSS feed; paid employer posting; no public API or reuse licence | **Partnership** for a vacancy feed |
| **internationaljobs.com** (AboutJobs.com) | Overseas and international vacancies | No API or feed found; copyrighted | **Partnership** only |
| **careerplanner.com** list | About 1,388 career titles (benchmark for breadth) | No source or licence stated | **Not imported.** We use the open sources the list resembles (O\*NET, ESCO, ISCO) |

All ten sources, with licences and notes, are registered in `packages/reference-data/src/data-sources.json` and the `data_sources` table. **Licences marked "confirm" must be checked on the publisher's terms page before launch.**

## 3. What "real-time" can honestly mean

| Data | Realistic freshness | Method |
|---|---|---|
| Vacancies, internships, scholarships | Hours to days | Partner feeds, verified employer posting, institution notices |
| Career journeys (Venturers) | Continuous | Contributions with verification tiers |
| Admission requirements and cut-offs | Each intake | Institution partners, admissions offices |
| Employment and pay by occupation | Quarterly to annual, often 1-5 years behind | ILOSTAT, OECD, World Bank, national statistics offices |
| Occupation definitions and skills | Each classification release | ISCO-08, ESCO, O\*NET versioned imports |

Official statistics are never real-time anywhere in the world. The site shows the **year of every figure** and warns when it is 10 or more years old.

## 4. Bulk collection methods, in order of priority

1. **Official open APIs, on a schedule.** World Bank REST, ILOSTAT SDMX/bulk, OECD SDMX, UNESCO UIS. One importer per source, run by a scheduler; each run is logged in `ingestion_runs`. *Built: the World Bank JOIN importer (`scripts/ingest/world-bank-join.mjs`).*
2. **Classification bulk downloads, versioned.** ISCO-08, ESCO and O\*NET imported as releases, joined through published crosswalks into `occupation_crosswalks`. This is how the catalogue grows from 68 to thousands of careers (section 6).
3. **Partner feeds for live vacancies.** Signed agreements with job boards (GlobalJobs, InternationalJobs), public employment services and licensed job-data providers; feeds mapped to `job_postings` and schema.org `JobPosting`, with automatic expiry.
4. **Direct contribution.** Verified employers post internships and jobs; institutions publish programmes, requirements and cut-offs; professionals add Venturer journeys. All carry verification status.
5. **Field collection with partners** where no official data exists (local salaries, demand, licensing). Use structured mobile surveys with NGOs, universities and careers counsellors; publish only aggregated bands.
6. **Never:** scraping job boards or copying curated career sites (CareerPlanner, StudentHub). It breaks their terms, invites legal risk and leaves us with data we cannot refresh or cite.

## 5. Pipeline design

```
Scheduler (GitHub Actions cron for bulk/annual, Supabase cron + Edge Functions for daily feeds)
  -> fetch (polite: sequential, retries, User-Agent, respect rate limits)
  -> stage + validate (rules below)
  -> idempotent upsert (unique keys, never duplicate)
  -> log run (rows read/written, status, error)
  -> build snapshot for the website (cited, dated)
```

**Validation rules** (each failure blocks publication of that slice, not the whole run):
- **Totals:** occupation shares for a country sum to 100% +/- 2. *All 154 JOIN countries pass.*
- **Freshness:** flag figures older than 10 years. *Example: Kenya's latest JOIN occupation data is from 2005.*
- **Peer outliers:** compare with countries of similar income and region; hold values far outside the range for review. *Example: Nigeria's JOIN figure of 26.6% professionals is close to the UK's 25.5% and should be reviewed before use.*
- **Codes:** ISCO, ISO country and currency codes must be valid; units normalised (JOIN stores shares as fractions, converted to percent).
- **Licence:** a source with `status` other than active, or an unconfirmed licence, cannot publish.

## 6. Broadening the career catalogue

| Phase | What | Result |
|---|---|---|
| 1 | Import **ISCO-08** structure: 10 major groups, 43 sub-major, 130 minor, 436 unit groups with definitions and tasks | Every occupation in the world has a home |
| 2 | Import **ESCO** occupations (about 3,000) and skills (about 13,000), mapped to ISCO | Detailed careers, skills, many languages |
| 3 | Join **O\*NET** via the SOC-ISCO crosswalk | Tasks, work context, education and RIASEC interests for the quiz |
| 4 | Curate **career moves** between occupations, then grow them from Venturer journeys (`evidence_count`) | Paths, not just lists |
| 5 | **Country overlays**: national classifications (`NATIONAL` crosswalk rows), local titles, licensing bodies, exams, salary bands | Local accuracy everywhere |

Pages stay readable: our own plain-language summaries are written from the structured data and reviewed; imported text is attributed.

## 7. Governance

- **Licence register:** `data_sources` with licence, URL and attribution; an attribution page lists every source shown.
- **Data-quality dashboard:** latest run per source, failures, stale and held values.
- **Review:** every country overlay and every curated move has an owner and a `last_reviewed_at` date.
- **Privacy:** no personal data in statistics; salary data only as bands; consent for Venturer journeys; minors' data minimised.

## 8. What I need from you

1. **Approve downloads** of the classification files for phases 1-3: ISCO-08 structure (ILO), ESCO occupations and skills (European Commission), O\*NET database (US DOL). Each comes from the publisher's official site; I will list file names and sizes before downloading.
2. **Check ILOSTAT access** from your own browser (it blocked this environment) and confirm its licence page.
3. **Partnership outreach** to GlobalJobs and InternationalJobs for vacancy feeds. I can draft the emails; you send them.
4. **Hosted database:** approve pushing the new migrations and the importer to the hosted Supabase project, then scheduling it.

---

## 9. Second source review (2026-11-10)

Checked robots.txt, AI-crawler rules (Cloudflare Content Signals) and terms for each site before collecting anything.

| Site | Verdict | Why | What we use instead / next |
|---|---|---|---|
| whed.net (IAU WHED), UNESCO WHED page | **Not crawled** | `User-agent: ClaudeBot` and other AI crawlers disallowed; `ai-train=no, use=reference` | Request a WHED data licence from IAU; ROR for open institution data meanwhile |
| degreeatlas.org, au.int, studymalaysia.com | **Not crawled** | Same AI-crawler block | ROR and WHED; AU policy cited manually; Malaysia via MASCO and official sources |
| bls.gov (OOH A-Z) | **Website not crawled; official API used** | Website blocks automated access; data is public domain | **BLS Public Data API: US pay and employment imported (52 occupations, 2025)** |
| afriqan.aau.org | **Used, as a cited reference** | Open robots; factual names of public bodies | **14 national/regional higher-education regulators**, shown "as listed by AfriQAN", to verify |
| worldcertification.org | **Excluded** | Private credentialing body, not a recognised accreditor | Official national regulators only |
| univ.cc | **Not used** | Private directory, no stated terms | **ROR (CC0)**, about 100,000+ institutions |
| planitplus.net | **Not reused** | Written profiles; terms not stated | ESCO/O\*NET; UK overlay from official UK sources |
| education.go.ug | **Reference** | All rights reserved; mostly links and PDFs | Cite UNEB, UVTAB, NCHE, JAB directly |

**Principle:** we collect from sources that publish data for reuse (APIs, open licences) or with permission, and respect robots.txt and AI-crawler opt-outs. Everything else becomes a partnership or a manual, cited reference.

**The "sample content" banner is gone.** Each fact now carries its own provenance: official definitions (ISCO-08 via ESCO), workforce shares (World Bank), US pay (BLS) and regulators (AfriQAN) are cited inline; routes, typical durations and career moves are labelled as Career Proof guidance; licensing bodies show "To be verified" until confirmed.

## 10. Third source review: certifications and admissions (2026-11-10)

| Site | Use | Result |
|---|---|---|
| accaglobal.com and other issuers (CFA Institute, PMI, ISC2, CompTIA, Cisco, AWS, Microsoft, SHRM, CIPD, Google on Coursera) | **Official facts, one page each** | **11 certifications** with issuer-stated facts, source link and check date (`certifications.json`). PMI blocks bots, so read once in a normal browser session. |
| ibtcareers.com, indeed.com | Selection only | Used to choose which certifications matter; no text or facts taken. |
| globalcareeraccelerator.org, globalcareerpath.com, careerpathways.edu.vn | Partnership prospects | No structured data; respectively a US university programme, a US/China executive-search firm and a Vietnamese guidance consultancy. |
| UNESCO (Global Convention), UIS (ISCED 2011) | Cited facts | Power the new **Admission standards worldwide** page. |

**Admission standards:** `/simulator/programmes` (made-up DEMO programmes) now redirects to `/admissions`, which shows only sourced information: ISCED 2011 levels, the UNESCO recognition convention, and for all 250 countries the regulator (official site or AfriQAN), school-leaving exams (marked "To be verified") and ROR institution counts. Made-up cut-offs remain only inside the simulator, which still says so.

**Pending certifications** (not published until confirmed by the issuer): CIMA, national CPA boards, CIPS, PRINCE2, CEH.

## 11. Admission calculators (added 2026-11-09)

**Principle:** there is no single global admission formula. We publish a calculator only where an admissions body publishes its formula or points table, label it with that body and the cycle, and never show a "chance of admission".

| Tier | Meaning | Live now |
|---|---|---|
| Points calculator | Applies an official formula or table | UCAS Tariff, 2027 entry (verified). Uganda and Kenya simulators (illustrative until checked with PUJAB and KUCCPS) |
| Explainer | What the official body says, plus a portal link | Australia ATAR (UAC), India NTA exams (verified); France Parcoursup, US EducationUSA (portal only, pending) |
| Minimum requirements | Regulator and institutions for every other country | All 250 countries, through the country search |

- **UCAS:** the source is UCAS's *2027 Tariff tables* workbook (`tariff-may-2027_cycle-v1.1.4.1.xlsx`), parsed by `scripts/ingest/ucas_tariff_build.py` into `packages/reference-data/src/snapshots/ucas-tariff.json`. It covers 11 qualifications and 59 grades.
  - The 2014 "new Tariff" PDF is out of date for IB grades (e.g. HL H5 is now 40 points, not 32), so don't use it.
  - UCAS updates the tables every May; re-run the script each year.
- **Bot protection:** ibo.org, parcoursup.gouv.fr and enseignementsup-recherche.gouv.fr serve bot-verification pages. We did not bypass them.
  - The IB 45-point Diploma total and the Parcoursup details wait for direct confirmation with those bodies.
- **Pending:** the IB Diploma 45-point total, the Ghana WASSCE aggregate, South Africa's APS (per university) and Nigeria's UTME/post-UTME aggregate (per university).
- **Engine:** `sumQualificationPoints()` in `packages/rules-engine` (method "sum of qualification points"). The points tables are data; new tables of the same kind need no code.
- **Registry:** `packages/reference-data/src/admission-systems.json`, with sources `ucas-tariff` and `admission-bodies` in the source registry.

## 12. Global subject structure and career evidence (added 2026-11-10)

- **Subjects:** `packages/reference-data/src/school-subjects.json` defines 32 country-neutral school subjects in 9 groups.
  - **Field of study:** each links to UNESCO ISCED-F 2013 detailed field(s).
  - **Job relevance:** each links to O*NET Knowledge domain(s).
  - **Exam names:** recorded only from official documents (so far Uganda UACE, from the Notes to Schools).
  - **Adding a country:** add its exam names to each subject; nothing else changes.
- **Evidence (O*NET 31.0, CC BY 4.0):**
  - **Knowledge importance:** a 1–5 rating per occupation; we label it with O*NET's anchors (Important, Very important, Extremely important).
  - **Related occupations:** O*NET's primary tiers.
  - **Job Zone descriptions:** official text per preparation level.
  - **Build:** `scripts/ingest/onet_knowledge_build.py`.
  - **Scoring rules:** subjects measured by the same domain are merged ("Economics or Accounting"); combined subjects (Environmental Science = Biology + Geography) use the average of their domains.
- **Guided careers ↔ ESCO:** `career-esco.json` links 59 of the 68 guided careers.
  - **How:** exact title or alternative-label matches (`npm run match:career-esco`) plus hand-picked equivalents marked `manual`.
  - **Rejected:** a match was dropped when ESCO lists the title only as an alternative label in another ISCO group (e.g. "civil engineer" is an alternative label of "land planner").
  - **Two ISCO disagreements to review:** careers counsellor (ours 2359, ESCO 2423) and aircraft maintenance engineer (ours 7232, ESCO 3153).
  - **Linking to O*NET:** the official crosswalk often gives several O*NET occupations. We pick the one with knowledge ratings whose title best matches the career title (with a small synonym list, e.g. doctor = physician).
- **On pages:**
  - **Subject pages:** "where this subject matters most at work" (O*NET 4+), with ISCED-F field and exam names.
  - **Career and occupation pages:** "subjects this work relies on" (kept separate from entry subjects), preparation needed, and related occupations.
