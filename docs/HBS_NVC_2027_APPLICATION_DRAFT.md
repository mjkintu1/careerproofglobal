# HBS Africa Business Club New Venture Competition 2027: application draft

**Status:** draft for the founder to edit. Not submitted.
**Deadline:** 12 November 2026 per most listings (confirm on the form). Submit early.
**Form:** linked from https://www.africa-hbsclub.com/conference/new-venture-competition

Markers:
- **[FILL IN]** information only you have.
- **[VERIFY]** a number or claim to check against a source before submitting.

The answers are written to match the judges' evaluation criteria (team, problem, solution, context, go-to-market, competition, risks, financials, traction).

---

## Eligibility checklist (all must be true)

- [ ] African founder(s), building in and for Africa
- [ ] At least a prototype / MVP (we have a working simulator demo, see below)
- [ ] Most or all operations in Africa
- [ ] Company less than 5 years old **[FILL IN: registration date, or say not yet registered]**
- [ ] Raised less than USD 1,000,000
- [ ] Never funded by ABC NVC or its sponsors
- [ ] Fewer than 50 employees

---

## One-liner

Career Proof turns Africa's national exam and university admission systems into an interactive tool that shows every student which programmes they qualify for, how safe each choice is, and the real careers those programmes lead to.

## The problem

Every year, hundreds of thousands of secondary-school leavers across Africa choose subjects and university programmes with almost no reliable information.

- **Admission rules are complex and opaque.** In Uganda, public-university entry uses weighted points (essential, relevant and desirable subjects, an O-level bonus, a bonus for female applicants). In Kenya, placement uses cluster-point formulas. Most students and parents never see how their points are calculated.
- **Cut-off data is scattered.** Past cut-off points live in newspaper lists, PDFs and social media posts, different for every university and year.
- **Subject choices close doors early and silently.** Choosing the wrong A-level combination at 16 can rule out medicine or engineering, and students often learn this only when they apply.
- **Careers guidance is thin.** **[VERIFY: a ratio of careers teachers or counsellors to students in Uganda/Kenya, with source]**
- **Scale:** **[VERIFY: number of UACE candidates in 2025 (UNEB) and KCSE candidates in 2025 (KNEC)]**

## The solution

Career Proof is a free, mobile-first web platform with five connected tools:

1. **Admission simulator.** Enter your results and see your points for every programme, shown step by step, with each one rated Safe, Borderline or Danger against past cut-offs. Students in the Danger zone get backup programmes in the same field.
2. **Subject what-if.** Change a subject or grade and instantly see which degrees open or close, and why.
3. **Scholarships.** A "you may qualify" check based on the student's own results and chosen field.
4. **Verified internships.** Listings from organisations we have verified, linked to the programmes and careers they suit.
5. **Career pathways and Venturers.** Real professionals ("Venturers") share their journey from subjects to degree to career, with verification tiers and salary brackets (never exact figures).

**Why it scales across Africa:** the platform runs on a country-agnostic rules engine. Each country's admission system is stored as data (a versioned rule set), so adding a country means adding data, not rebuilding the product. Our prototype already runs two different national systems on the same engine: Uganda's weighted points and Kenya's cluster-point formula.

## Prototype (built)

- Working admission simulator and subject what-if for **Uganda and Kenya**, on one shared engine.
- Shows the full calculation, safety zones, backup options, and the exact reason a programme is closed.
- Automated tests check the engine against hand-worked examples.
- Database schema with row-level security, versioned rule sets and source tracking for every cut-off.
- Accessible, low-bandwidth design: works on low-end phones and keeps working offline after the first load.
- **Demo link:** **[FILL IN: deployed URL]**. Demo data is labelled as illustrative: rule values are being verified and cut-offs in the demo are sample figures.

## Context and opportunity

- **Timing:** **[FILL IN / VERIFY: any recent curriculum or admission reforms, e.g. Uganda's competency-based lower-secondary curriculum and Kenya's CBC transition, which make guidance even harder for families]**
- **Mobile access:** **[VERIFY: smartphone / mobile internet penetration figures for Uganda and Kenya, with source]**
- **Regulation:** we handle data about minors. We design for Uganda's Data Protection and Privacy Act 2019 and Kenya's Data Protection Act 2019: anonymous use of the simulator, minimal profile data (birth year only), consent records, and registration with the regulators before launch.

## Go-to-market

1. **Uganda pilot:** 3 to 5 partner secondary schools, working through careers teachers and S5/S6 classes, timed around UACE results and the admission cycle. **[FILL IN: any schools already interested]**
2. **Venturer seeding:** 100+ professionals from our networks share verified career journeys before public launch.
3. **Kenya second:** rule set already in the engine; partner with an education NGO for data and schools.
4. **Growth channels:** WhatsApp sharing of results ("see my options"), school partnerships, SEO career pages, results-season campaigns.

## Business model

Free for students, always. Revenue comes from the institutions that want to reach them:

| Customer | What they pay for |
|---|---|
| Universities and colleges | Featured programme listings; anonymised insight into applicant interest and subject trends |
| Scholarship providers (foundations, NGOs, companies) | Listing and matching to eligible students; application funnel reporting |
| Employers | Verified internship postings; access to a pipeline of early-career talent |
| Secondary schools | Careers-teacher dashboard: class-level view of options and risks (subscription) |
| Governments, NGOs, researchers | Anonymised, aggregated data on subject choices, admission outcomes and career paths |

**[FILL IN: first price points to test, e.g. school subscription per term, internship posting fee]**

## Competitive landscape

| Alternative | Limitation | Career Proof |
|---|---|---|
| Official portals (e.g. KUCCPS in Kenya, university admission portals) | Built for applying, not for exploring; one institution or system at a time | Explores all options, explains the maths, works before you apply |
| Newspaper / social-media cut-off lists | Scattered, unverified, no personal calculation | Personal points per programme, cut-off history with sources |
| Careers teachers and counsellors | Few, overstretched | Gives them a tool and a class dashboard |
| Global career sites | Not built around African exam systems | Built on each country's own rules |

**[FILL IN: any local competitors you know of, and what makes you different]**

## Risks and how we manage them

| Risk | Mitigation |
|---|---|
| Wrong rules mislead students | Versioned rule sets, tests against official worked examples, review by careers teachers, visible working, clear disclaimer |
| Cut-off data hard to collect | Source tracked for every row; partners (schools, NGOs, admissions offices); "not enough data" shown instead of guesses |
| Data about minors | Anonymous simulator, minimal data, consent records, regulator registration |
| Slow adoption | School partnerships and results-season timing; shareable results |
| Revenue takes time | Low running costs (serverless hosting, managed database); B2B revenue lines tested during the pilot |

## Financials

**[FILL IN: costs to date, funding to date (must be under USD 1M), monthly running cost]**

Suggested use of prize funding (adjust to your plan):

| Use | Share |
|---|---|
| Data collection and verification (Uganda, then Kenya) | 35% |
| Pilot with partner schools (training, outreach) | 25% |
| Product development | 25% |
| Legal and data-protection compliance | 10% |
| Hosting and tools | 5% |

## Traction

**[FILL IN: anything real, even small. Examples: schools that agreed to pilot, students surveyed, Venturers signed up, letters of support, advisers]**

## Team

**[FILL IN: founders, roles, relevant background, why you are the right team, time commitment]**

## Awards and support

**[FILL IN: previous awards, programmes, incubators. Note: must not have been funded by ABC NVC or its sponsors]**

---

## Before you submit

- [ ] Replace every **[FILL IN]** and check every **[VERIFY]** against a source
- [ ] Deploy the demo and add the link (Vercel, see README)
- [ ] Record a 1 to 2 minute screen recording of the simulator in case the form asks for one
- [ ] Confirm the deadline and any word limits on the form itself
- [ ] Keep a copy of everything you submit
