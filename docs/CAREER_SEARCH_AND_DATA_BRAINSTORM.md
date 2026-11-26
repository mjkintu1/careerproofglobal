# Career search gaps and career data sources: brainstorm

Branch `brainstorm/career-search-and-data`, 26 Nov 2026. Starting point: typing **"systems engineer"** in the home-page search shows *"No careers match yet. Try a broader word."*

## 1. Why it happens

| Search box | What it searches | Size |
|---|---|---|
| Home page, career pages ("I want to become…") | Titles of our **guided careers** only, exact substring | **68** careers |
| Path planner (text box and pickers) | Guided careers + O*NET occupations in the route network, plus **AI fallback** (live since 26 Nov) | 938 careers, then AI for anything else |
| Occupation directory | ESCO occupation titles | 2,909 |

The data to answer "systems engineer" is already in the repo; the home search just never looks at it:

- **ESCO** (EU, CC BY 4.0): 2,909 occupations with **16,023 alternative names**; 19 of them list "… systems engineer" (energy, automation, robotics, marine, HVAC…).
- **O*NET** (US): 1,016 occupations with reported job titles; 13 match, including **Computer Systems Engineers/Architects (15-1299.08)**.

So the AI search only covers the planner; the home search has neither the wider data nor the AI fallback.

## 2. Remedies (quick to bigger)

| # | Remedy | Effort | Effect |
|---|---|---|---|
| R1 | **One search index for every search box**: guided careers + ESCO titles and alternative names + O*NET titles and reported titles, each pointing to the best page (guide, occupation page or planner node) | Small | "Systems engineer" finds Computer Systems Engineers/Architects and the ESCO engineering occupations at once |
| R2 | **"Ask AI" when nothing matches** in the home and career search: the same `/api/ai-path` tree, shown on the page or in the planner | Small | No dead end ever; any job title gets a step-by-step path |
| R3 | **Forgiving matching**: word order, plurals, typos ("enginer"), and partial words; rank guided careers first | Small | Fewer near-misses |
| R4 | **Local job-title synonyms** that international lists miss ("clinical officer", "boda boda rider", "village health team", "UPDF officer", "bursar"), kept as a reviewed data file per country | Medium, ongoing | Searches in the words students actually use |
| R5 | **Learn from misses**: count searches that found nothing (question text only, no identity) and review the top 50 each month | Small + monthly review | Shows exactly which careers to add next |
| R6 | **Promote popular AI answers**: when an AI path is asked for often, the team checks it against official sources and turns it into a guided career | Medium, ongoing | The AI answers become reviewed, cited data over time |
| R7 | **Feedback button** on AI paths and guides ("Is this right for your country?") | Small | Corrections from teachers and professionals |

Suggested first step: **R1 + R2 + R3 together**, so every search box finds what we already hold and hands everything else to the AI.

## 3. Building the "multiverse" of career data

Principle stays the same: **official, cited sources first; the AI fills gaps and is labelled; popular gaps get turned into reviewed data.** Items marked *(verify)* are names to confirm on the body's own site before use.

### 3.1 Source map: what to collect, from whom

| Layer | Global / international | Africa: continental and regional | Per country (examples) |
|---|---|---|---|
| **Occupation lists and job titles** | ILO ISCO-08 (have), EU ESCO (have), O*NET (have), UK SOC, Canada NOC, Australia OSCA; Wikidata occupations (CC0, many languages) for synonyms | AU / ILO regional work on skills classifications *(verify)* | National standard classifications of occupations, usually from the statistics office or labour ministry: Kenya KNOCS, South Africa OFO (Department of Higher Education and Training), and the Ugandan, Nigerian and Ghanaian equivalents *(verify names)* |
| **Qualifications** | UNESCO ISCED 2011 (have) | **African Continental Qualifications Framework (ACQF)**, with its mapping of national frameworks; IUCEA East African framework for higher education | SAQA (South Africa, open register of qualifications), KNQA (Kenya), UVQF (Uganda vocational) *(verify)* |
| **Universities and programmes** | ROR (have), IAU World Higher Education Database (request sent) | IUCEA member list | NCHE Uganda (have), CUE Kenya, NUC Nigeria, GTEC Ghana, HEC Rwanda, TCU Tanzania, CHE South Africa |
| **Admission rules** | UCAS Tariff (have) | | Uganda weighting (have), KUCCPS (Kenya), JAMB (Nigeria), national exam boards: UNEB, KNEC, WAEC, NECTA, Umalusi |
| **Licensing and professional bodies** (who regulates each career) | | | Medical and nursing councils, engineering registration boards (ERB Uganda, EBK Kenya, COREN Nigeria, ECSA South Africa), accountancy institutes (ICPAU, ICPAK, ICAN, SAICA), law societies, capital-markets authorities |
| **Pay** | ILOSTAT (have), World Bank, UN salary scales (have) | | Labour force surveys (UBOS, KNBS, NBS Nigeria, GSS Ghana, Stats SA QLFS), public-service salary structures (Uganda and South Africa have), minimum-wage orders (have for Kenya) |
| **Demand (which jobs are hiring)** | | | Public employment services (e.g. Kenya National Employment Authority, South Africa ESSA), job boards by partnership, not scraping (BrighterMonday, Fuzu, Jobberman) |
| **Career guidance content** | UNESCO-UNEVOC TVET country profiles | | Ministry of Education career guidance handbooks, KUCCPS career booklets |

### 3.2 How to collect it

1. **Open data first.** Download official files where the licence allows (ESCO, O*NET, ILOSTAT, SAQA, Wikidata), record the licence in `data-licences`, and refresh on each new release.
2. **Data requests and partnerships.** A short letter template, like the one already sent to IAU WHED, for statistics offices, regulators and exam boards: ask for the occupation list, qualification register, programme list and pay tables, with permission to publish with attribution. Start with Uganda, Kenya, Nigeria, Ghana and South Africa.
3. **Universities and schools.** The Makerere outreach can include "send us your programme list and entry requirements each year".
4. **Professionals, with consent.** Short "how I got here" stories from working professionals (the `/grow` page already has a place for them), only with written consent and no scraping of LinkedIn.
5. **AI as the gap-filler, not the source.** The AI answers anything we lack, clearly labelled; misses (R5) and popular AI answers (R6) become the to-do list for the team to source properly.
6. **Country "depth levels"** so effort is visible: Level 1 = global data only; Level 2 = national occupation list, regulator per career and pay; Level 3 = admissions, programmes and exams. Uganda is close to Level 3; most countries are Level 1.

### 3.3 Rules that stay the same

- Official sources cited with publisher and year; licences checked before anything is published.
- AI content labelled and never presented as official.
- No scraping of sites that forbid it; partnerships instead.
- No personal data in search logs: question text only, counted in aggregate.

## 4. Proposed next steps

1. Build R1 + R2 + R3 (single search index, AI fallback everywhere, forgiving matching) on this branch.
2. Add R5 (log of searches with no match) so the team can see the gaps.
3. Draft the data-request letter and a tracker of bodies per country (owner, status, licence).
4. Decide which five countries go to Level 2 first.
