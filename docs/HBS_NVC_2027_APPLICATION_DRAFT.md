# HBS Africa Business Club New Venture Competition 2027: application draft

**Status:** draft for the founder to edit. Not submitted. Rewritten 10 Nov 2026 to match the live product.
**Deadline:** 12 November 2026 per most listings (confirm on the form). Submit early.
**Form:** linked from https://www.africa-hbsclub.com/conference/new-venture-competition
**Live prototype:** https://careerproofglobal.vercel.app

Markers:
- **[FILL IN]** information only you have.
- **[VERIFY]** a number or claim to check against a source before submitting.

**Rule for this draft:** every feature described as "built" is live at the link above. Anything not live is under "Roadmap". Judges may click the link, so nothing here should claim more than they will see.

---

## Eligibility checklist (all must be true)

- [ ] African founder(s), building in and for Africa
- [ ] At least a prototype / MVP (live: https://careerproofglobal.vercel.app)
- [ ] Most or all operations in Africa
- [ ] Company less than 5 years old **[FILL IN: registration date, or say not yet registered]**
- [ ] Raised less than USD 1,000,000
- [ ] Never funded by ABC NVC or its sponsors
- [ ] Fewer than 50 employees

---

## One-liner

CareerProof Global shows every student, in any country, where each career leads, the subjects and qualifications that open it, and how to get in, using official international data instead of guesswork. We are piloting in Uganda and East Africa.

## The problem

Every year, millions of young Africans choose school subjects, university programmes and first jobs with almost no reliable information.

- **Careers are invisible.** Students know a handful of professions (doctor, lawyer, engineer, teacher). Thousands of real occupations, and the routes into them, are never explained.
- **Subject choices close doors early and silently.** Choosing the wrong A-level combination at 16 can rule out medicine or engineering, and students often learn this only when they apply.
- **Admission rules are opaque and scattered.** Each country, and often each university, has its own rules. Past cut-offs live in PDFs, newspaper lists and social media.
- **Information online is not built for Africa.** Most career sites are American or European, quote US pay, and ignore African exams, regulators and institutions.
- **Guidance is thin.** **[VERIFY: ratio of careers teachers or counsellors to students in Uganda, with source]**
- **Scale:** **[VERIFY: UACE candidates 2025 (UNEB); KCSE candidates 2025 (KNEC)]**

## The solution

CareerProof Global is a free, mobile-first web platform that connects four things students currently look up separately: **careers, subjects, qualifications and where to study.** It is built on international standards, so it works in every country and gets deeper country by country.

### Built and live today

1. **Career paths.** 68 guided careers across 12 fields: what the work involves, ways in (degree, diploma, apprenticeship), the subjects that open it, and where it leads next. A **path finder** shows the quickest known route between any two careers.
2. **Occupation directory on the ILO standard.** All 619 ISCO-08 occupation groups and 2,909 ESCO occupations, each with its official description and essential skills, linked to 1,016 O\*NET occupations.
3. **Subjects to careers, on global standards.** 32 school subjects linked to UNESCO's ISCED-F fields of study and to O*NET survey data on how much each occupation relies on each subject. Every career page shows the subjects the work relies on, the preparation needed and related occupations. A subject selector works backwards from a dream career, and a "Grow your career" page adds career habits and real, consent-based career stories.
4. **Where to study.** 30,326 universities and colleges in 223 countries (Research Organization Registry), plus each country's higher-education regulator (e.g. Uganda's National Council for Higher Education).
5. **Uganda admission data from official sources.** The national weighting system (Notes to Schools 2026/2027) runs in a points calculator for 13 Makerere programmes. It compares a student's points with three years of published cut-offs; it never predicts a "chance". A Uganda page lists cut-offs for 114 programmes at six public universities and all 3,736 programmes accredited by the National Council for Higher Education.
6. **Admission standards worldwide.** Official minimum entry requirements for 200 countries (from each country's UNESCO ISCED mapping), school-system data for 224 countries (UNESCO statistics) and quality-assurance agencies for more than 100 countries, plus a country-by-country guide to how admission works (ISCED 2011, UNESCO recognition convention), and a UCAS Tariff calculator from UCAS's official 2027 tables. Kenya has a cited guide to its system and KUCCPS placement (from UNESCO IICBA's country brief); its calculator is added once KUCCPS data is collected. No demo or made-up admission data remains anywhere on the site.
7. **Certifications guide.** How to judge a professional certification, and issuer-checked facts on 11 widely used ones (ACCA, CFA, PMP, CCNA, AWS and others), linked to the careers they help.
8. **Evidence on every page.** Labour-market facts from the World Bank (workforce shares in 154 countries) and US Bureau of Labor Statistics pay benchmarks, each with source, year and licence. Anything not yet verified is labelled.

### Why it scales

- **Standards first.** Every career is anchored to ISCO-08 (ILO) and ESCO (European Commission), the same codes national statistics offices use. Adding a country means adding local data (exams, regulators, institutions, pay) to an existing structure, not rebuilding the product.
- **Country rules are data.** Admission formulas are stored as versioned rule sets with sources. The engine runs the UCAS Tariff and Uganda's weighted points on official data, and already supports Kenya's cluster-point method, ready for KUCCPS data.
- **31 data sources are registered with their licences,** and import scripts can re-run when a source publishes new data.

### Roadmap (not yet built)

- **All Ugandan programmes and universities in the calculator,** with cut-offs refreshed automatically when each list is published; then Kenya (KUCCPS), Tanzania (TCU), Rwanda and Nigeria (JAMB).
- **Local pay** from ILOSTAT and national labour-force surveys, replacing US benchmarks.
- **Venturers:** professionals share their real journey from subjects to career, with verification.
- **Scholarships and internships:** matched to a student's results and chosen field.
- **Accounts and counsellor dashboards**, after data-protection registration.
- **Languages:** French, Swahili and Arabic (ESCO already provides 28 languages).

## Context and opportunity

- **Timing:** **[VERIFY: recent curriculum reforms, e.g. Uganda's competency-based lower-secondary curriculum and Kenya's CBC transition, which make subject and career choices harder for families]**
- **Mobile access:** **[VERIFY: smartphone and mobile-internet penetration for Uganda and Kenya, with source]**
- **Open data has matured:** the ILO, the European Commission (ESCO), the World Bank and the US Department of Labor now publish occupation data under open licences. Nobody has assembled it for African students.
- **Regulation:** we will handle data about minors. The live site collects no personal data. Before accounts launch we will register with Uganda's Personal Data Protection Office (Data Protection and Privacy Act 2019) and Kenya's ODPC (Data Protection Act 2019), keep profiles minimal and record consent.

## Go-to-market

1. **Uganda pilot:** 3 to 5 partner secondary schools, through careers teachers and S4 to S6 classes, timed around subject choice and the admission cycle. **[FILL IN: schools already interested]**
2. **Data partnerships:** NCHE, PUJAB and university admissions offices for verified admission rules and cut-offs; the IAU (World Higher Education Database) for accreditation data (request drafted).
3. **East Africa next:** Kenya, Rwanda and Tanzania, reusing the same structure.
4. **Growth channels:** search (thousands of career and occupation pages built on official data), WhatsApp sharing, school partnerships, results-season campaigns.

## Business model

Free for students, always. Revenue comes from organisations that want to reach or understand them:

| Customer | What they pay for |
|---|---|
| Secondary schools | Counsellor dashboard and class reports (subscription) |
| Universities and colleges | Verified programme listings; anonymised insight into student interest |
| Scholarship providers and employers | Matching to eligible students; internship postings |
| Governments, NGOs, researchers | Anonymised, aggregated data on subject choices and career interest |

**[FILL IN: first price points to test, e.g. school subscription per term]**

## Competitive landscape

| Alternative | Limitation | CareerProof Global |
|---|---|---|
| Official portals (KUCCPS, university portals) | Built for applying, one system at a time | Explores careers first, then the route in |
| Cut-off lists in newspapers and social media | Scattered, unverified | Sourced and dated, with the calculation shown |
| Global career sites (O\*NET, Prospects, Indeed) | US/UK-centric pay, exams and institutions | African exams, regulators and institutions on international standards |
| Careers teachers | Few and overstretched | A free tool they can use in class |

**[FILL IN: local competitors you know of, and how you differ]**

## Risks and how we manage them

| Risk | Mitigation |
|---|---|
| Wrong information misleads students | Official sources only; every fact carries its source and date; unverified items labelled; calculators published only from official formulas |
| Admission data hard to collect | Partnerships with NCHE, PUJAB and universities; "not enough data" shown instead of guesses |
| Data about minors | No personal data collected today; registration and consent before accounts |
| Licensing of third-party data | Only open-licensed or official sources, registered with their licences and attributions |
| Slow adoption | School partnerships; free, low-bandwidth, works on basic smartphones |

## Financials

**[FILL IN: costs to date, funding to date (must be under USD 1M), monthly running cost]**

Running cost today is low: serverless hosting and a managed database on free or entry tiers. **[VERIFY: your actual monthly cost]**

Suggested use of prize funding (adjust to your plan):

| Use | Share |
|---|---|
| Admission and labour-market data partnerships (Uganda first) | 30% |
| Pilot with partner schools (training, outreach) | 25% |
| Product development (accounts, counsellor tools, languages) | 25% |
| Legal and data-protection compliance | 10% |
| Hosting and tools | 10% |

## Traction

**[FILL IN: anything real, even small. For example: schools that agreed to pilot, students or teachers who tried the prototype, advisers, letters of support]**

Facts you can state from the product: live since November 2026; 68 guided careers, 2,909 occupations, 30,326 institutions in 223 countries; official Uganda admission data (3,736 accredited programmes, cut-offs for 114 programmes); 31 registered data sources. **[FILL IN: visitor numbers once analytics are added]**

## Team

**[FILL IN: founders, roles, relevant background, why you are the right team, time commitment]**

## Awards and support

**[FILL IN: previous awards, programmes, incubators. Must not have been funded by ABC NVC or its sponsors]**

---

## Before you submit

- [ ] Replace every **[FILL IN]** and check every **[VERIFY]** against a source
- [ ] Open https://careerproofglobal.vercel.app and check every "built" feature yourself
- [ ] Record a 1 to 2 minute screen recording: a career page, the path finder, the Uganda admissions page and points calculator, the UCAS calculator
- [ ] Confirm the deadline and any word limits on the form itself
- [ ] Keep a copy of everything you submit
