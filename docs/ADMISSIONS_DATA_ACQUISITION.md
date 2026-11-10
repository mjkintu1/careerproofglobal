# Getting real admission data for every country

Written 2026-11-10, after replacing the Uganda demo with official data and retiring the Kenya demo. Goal: no demo structures anywhere. Every rule, programme and cut-off comes from an official publisher, carries its source and date, and is refreshed as soon as the publisher releases new figures.

## First, what "real-time" means here

Admission data is not a live stream. Bodies publish it in **seasons**: rules once a year, cut-offs after each admission round, accreditation changes a few times a year. "Real time" for us means:

> **Detect a new official publication within 24 hours, have it extracted and reviewed within 72 hours, and show its date on every figure.**

Live data that does exist (application portals, results) is behind logins and belongs to the student. We never scrape it.

## What Uganda taught us (the template)

| Data | Official source | Format | How we got it | Refresh |
|---|---|---|---|---|
| Weighting rules | Ministry of Education & Sports, *Notes to Schools* (via Makerere) | PDF, yearly (Oct) | Downloaded; rules transcribed and tested | Yearly |
| Programme subject requirements | Same PDF, per university | PDF tables | Hand-transcribed (13 Makerere programmes so far) | Yearly |
| Cut-off points, 3 years | Same PDF, "Other information" tables | PDF tables | Parsed (`scripts/ingest/ug_cutoffs_build.py`); 114 rows from 6 universities; 82 ambiguous rows skipped, not guessed | Yearly |
| Latest cut-offs | Makerere Academic Registrar (government and private lists) | PDF, Apr and Jul | Parsed, cross-checked against the Notes (values match) | Each admission round |
| Accredited institutions and programmes | NCHE (unche.or.ug) | Data embedded in the web page | Parsed (`scripts/ingest/nche_build.py`): 156 institutions, 3,736 programmes with accreditation and expiry dates | Monthly check |

**Lessons:**
- Official PDFs are the norm; parsers must skip anything ambiguous.
- Two sources for the same figure let us cross-check automatically.
- A human must review before "published": the database enforces this (`rule_sets` needs `verified_by` and `verified_at`).

## The pipeline (same for every country)

1. **Source registry.** Every publisher URL goes in `data_sources` with its licence, cadence and robots status. (This already exists, with 28 sources.)
2. **Watchers.** A scheduled job (GitHub Actions, daily in admission season, weekly otherwise):
   - fetches each registered page;
   - respects robots.txt and AI opt-outs;
   - hashes the content and new PDF links;
   - opens an issue or PR when something changes.
3. **Extractors.** One small script per publication type (PDF tables, embedded JSON, CSV/XLSX).
   - Output: the snapshot JSON plus a list of skipped rows.
   - Unit-tested against the previous year's file.
4. **Review queue.** A person checks the diff against the PDF and signs it off. Only then:
   - `is_illustrative = false`, with `source_url` set;
   - `rule_sets.status = 'published'`, with `verified_by` set.
5. **Publish.** Snapshots ship with the app; the database holds the same rows for future APIs. Every page shows "Source, checked on <date>".
6. **Partner uploads (phase 2).** Admissions offices upload their own lists through a verified-institution portal, into the same review queue.
7. **Student-reported outcomes (phase 3, optional).** "I was admitted with X points" reports:
   - aggregated and clearly labelled;
   - never mixed with official cut-offs;
   - need consent and data-protection registration.

## Country plan

**Status key:**
- **Known:** the publisher puts this data out publicly; we have not yet checked its access terms.
- **Checked:** we have read the terms or robots.txt.

| Country | What exists | Publisher | Format | Status | Priority |
|---|---|---|---|---|---|
| **Uganda** | Rules, requirements, 3-year cut-offs, accreditation | MoES / Makerere / NCHE / other public universities | PDF, web page | **Done for Makerere (13 programmes) + 6 universities' cut-offs** | Extend to all programmes; add Mbarara and Gulu (non-standard tables); private universities |
| **Kenya** | Cluster subjects and 3 years of cut-offs per programme (portal); cluster-weight formula | KUCCPS student portal; system facts from UNESCO IICBA's country brief | Web pages | **Checked**: the portal blocks automated access (10 Nov 2026); IICBA facts published on `/admissions/kenya`. Demo removed | **Next**: request a KUCCPS data file |
| **Tanzania** | Undergraduate Admission Guidebook: programmes and minimum entry requirements | TCU (Tanzania Commission for Universities) | PDF, yearly | Known | High (East Africa) |
| **Rwanda** | Admission criteria for public institutions; accreditation | HEC (Higher Education Council); University of Rwanda | Web, PDF | Known | High |
| **Nigeria** | UTME minimum cut-off marks, institution cut-offs, post-UTME rules | JAMB (policy meeting outcomes); each university | Press releases, PDF | Known | High (largest market) |
| **Ghana** | Aggregate cut-offs per programme; accreditation | Each university; GTEC (Ghana Tertiary Education Commission) | PDF, web | Known | Medium |
| **South Africa** | APS rules and minimums per programme | Each university's undergraduate prospectus | PDF | Known | Medium |
| **United Kingdom** | Tariff tables (done); entry requirements per course | UCAS | XLSX (done); course search | **Tariff checked** | Done (Tariff); course data needs a UCAS agreement |
| **Ireland** | CAO points required per course, every round | CAO | Downloadable lists, yearly | Known | Low effort, high quality |
| **India** | Opening and closing ranks per institute and programme (IIT/NIT) | JoSAA | Web tables, each round | Known | Medium |
| **United States** | Admissions statistics (applicants, admits, test scores) per college | NCES IPEDS; College Scorecard API | Open data and API (public domain) | Known | Medium (explainer plus stats, no formula) |
| **Australia** | ATAR explanation (done); lowest selection ranks per course | UAC and state admission centres | Web | ATAR **checked** | Low |
| **France** | Parcoursup programme data | Ministry open-data portal (data.enseignementsup-recherche.gouv.fr) | Open data API | Known (the main site blocks bots; the open-data portal is separate) | Medium |

## Partnerships to pursue (fastest route to complete, timely data)

1. **NCHE (Uganda):** an official data feed of accreditation, plus endorsement. A natural fit with the IAU/WHED request.
2. **PUJAB and university admissions offices:** cut-off lists in machine-readable form on publication day, and requirements for all programmes.
3. **KUCCPS (Kenya), TCU (Tanzania), HEC (Rwanda), JAMB (Nigeria):** the same request: structured files when they publish, attribution in return.
4. **Exam boards (UNEB, KNEC, WAEC):** grade distributions, so students see how common their results are (aggregates only).
5. **IAU (WHED):** global accreditation data (request drafted in `docs/IAU_WHED_DATA_REQUEST.md`).

**What we offer in return:**
- free, accurate guidance for their applicants;
- fewer wrong-programme applications;
- anonymised insight into student interest;
- attribution on every page.

## Rules we keep

- **Access:** official publishers only. Respect robots.txt and AI-crawler opt-outs, and never log in on someone's behalf. Check licence terms before reuse.
- **No guessing:** ambiguous rows are skipped and counted, never filled in. Missing years show "Not enough years published".
- **Comparison, not prediction:** results compare your points with published cut-offs and never give a percentage chance.
- **Human sign-off:** a person reviews every new official figure before it is published.

## Next actions

1. **Kenya:** the demo is retired. Request a data file from KUCCPS (or a checked manual collection from the portal) and the cluster-point formula from an official document, then switch on the calculator.
2. **Uganda programmes:** transcribe the remaining Makerere programmes (including the "and/or" rules: Commerce, BBA) and parse the Mbarara and Gulu tables.
3. **Watchers:** build the watcher job for the registered Uganda URLs (Notes to Schools, Makerere lists, NCHE pages).
4. **Review step:** add a reviewer role and a review screen, so rule sets can move from `draft` to `published`.
5. **Partnerships:** send the requests (NCHE, PUJAB, KUCCPS) with the live Uganda page as the demo.

## Global baseline: UNESCO (added 2026-11-10)

- **Imported: UIS Data API** (`npm run ingest:uis`)
  - **What:** official entrance age and duration of primary, lower and upper secondary, compulsory-education duration, and tertiary gross enrolment ratio.
  - **Coverage:** **224 countries** (February 2026 release), shown on `/admissions`, the calculator finder, and the Uganda and Kenya pages.
  - **Licence:** CC BY-SA 4.0. Attribution is shown wherever the data appears, and the snapshot is shared under the same licence.
- **Imported: ISCED 2011 mapping files** (`scripts/ingest/isced_build.py`)
  - **What:** minimum entry requirements, qualification awarded, entrance age and duration for every national programme from upper secondary (ISCED 3) to doctoral (ISCED 8), as each country classified it with UNESCO.
  - **Coverage:** 201 countries.
  - **Where it shows:** `/admissions/[country]`; the school-leaving qualification also appears in the `/admissions` table.
  - **How we got it:** the files are listed on UNESCO's mapping page (read at your request) and served from download.uis.unesco.org, which has no robots.txt. We did not crawl the www.uis.unesco.org website, which disallows ClaudeBot.
  - **Licence:** CC BY-SA 3.0 IGO (UIS terms); the snapshot is shared under the same terms.
  - **Caveat:** reference years vary by country (many are 2014 to 2016). Pages show the year, and national bodies' current documents take precedence.

## Higher-education regulators and quality agencies (added 2026-11-10)

- **Imported:**
  - **AfriQAN:** 15 African bodies (curated earlier).
  - **INQAAHE:** **208 full members**, the quality-assurance and accreditation agencies, from its members database (robots.txt allows all; `npm run ingest:inqaahe`).
- **Coverage:** regulators or QA agencies for **105 countries**, shown on `/admissions/[country]`, country institution pages and career pages, each with the network that lists it.
- **Caveat:** network membership is not government recognition. Some INQAAHE members are private accreditors (e.g. BAC, ASIC in the UK). Pages say so, and a body is marked "Official site checked" only after we check its own site.
- **Gaps and next sources:**
  - **EQAR** (European register; its site serves a bot check, so request access or use its published API terms).
  - **APQN** (Asia-Pacific; robots allows, member pages to locate) and **ANQAHE** (Arab states).
  - **US Department of Education accreditor database** (bot check).
  - **Missing national regulators** such as South Africa's Council on Higher Education: add from each regulator's own site.
- **Bug fixed:** country-name mapping now uses only real ISO codes. Intl also names the reserved code "UK", which had hidden the United Kingdom's agencies.
