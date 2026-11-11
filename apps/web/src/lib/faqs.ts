import { dataSources } from "@careerproof/reference-data";

/**
 * FAQs. Questions are the recurring ones that official bodies' own FAQ and guidance pages answer
 * (UCAS, NCHE, KUCCPS, Makerere Notes to Schools, ILO); the answers are written by us, never copied.
 * `facts` are statements taken from the cited official sources; `guidance` is our own advice and is
 * shown under a separate "CareerProof guidance" label. `sources` are slugs in data-sources.json, so every
 * citation points at a source already registered, with its licence, on /data-licences.
 */
export interface Faq {
  id: string;
  q: string;
  facts: string[];
  guidance?: string;
  sources: string[];
  /** Internal pages that help with this question. */
  links?: { href: string; label: string }[];
}

export interface FaqTopic { id: string; title: string; faqs: Faq[] }

/** Date the sourced answers were last checked against their sources. */
export const FAQ_CHECKED = "11 November 2026";

export const faqTopics: FaqTopic[] = [
  {
    id: "subjects",
    title: "Choosing subjects",
    faqs: [
      {
        id: "subjects-matter",
        q: "Do the subjects I choose at school decide which courses I can study?",
        facts: [
          "Yes, for many courses. University programmes set subject requirements alongside grades. In Uganda, public universities weigh A-level subjects by how relevant they are to the programme: two essential subjects count three times, one relevant subject twice and one desirable subject once.",
          "In Kenya, KUCCPS places students on government-sponsored degree programmes using the KCSE grades in each programme's cluster subjects.",
        ],
        guidance: "Start from two or three careers you are curious about, check the subjects their main degree routes ask for, and keep the subjects that stay common to all of them. That keeps doors open while you decide.",
        sources: ["ug-notes-to-schools", "kuccps-portal"],
        links: [{ href: "/subjects#selector", label: "Subject selector" }],
      },
      {
        id: "o-level-count",
        q: "Do my O-level (UCE) results count for university entry in Uganda?",
        facts: [
          "Yes. Under the weighting system in Makerere University's Notes to Schools for 2026/2027, all O-level subjects are weighed: 0.3 points for each distinction, 0.2 for each credit and 0.1 for each pass, added to the weighted A-level points.",
          "To be considered at all, applicants need at least two A-level principal passes obtained at the same sitting.",
        ],
        sources: ["ug-notes-to-schools"],
        links: [{ href: "/admissions/uganda", label: "Uganda admissions and cut-offs" }],
      },
    ],
  },
  {
    id: "university",
    title: "University entry",
    faqs: [
      {
        id: "cut-off-points",
        q: "What are cut-off points, and will they be the same next year?",
        facts: [
          "A cut-off point is the lowest score of the students admitted to a programme in a given intake. It comes from the number of places and the scores of that year's applicants, so it changes from year to year.",
          "Makerere University publishes cut-off points for government-sponsored and private places, and its Notes to Schools list three years of past cut-offs for each programme.",
        ],
        guidance: "Treat past cut-offs as a range, not a promise. If your score sits near or below the lowest recent figure, list a second and third choice where you are comfortably above it.",
        sources: ["makerere-cutoffs", "ug-notes-to-schools", "kuccps-portal"],
        links: [{ href: "/admissions/uganda", label: "Uganda cut-off points" }],
      },
      {
        id: "ucas-tariff",
        q: "What are UCAS Tariff points, and do all UK universities use them?",
        facts: [
          "The UCAS Tariff turns grades from many qualifications (A levels, the IB Diploma, Scottish Highers and others) into points, so they can be compared.",
          "Not every UK course uses Tariff points. Many make offers in grades instead, so check each course's entry requirements on UCAS.",
        ],
        sources: ["ucas-tariff"],
        links: [{ href: "/admissions/calculators/ucas-tariff", label: "UCAS Tariff calculator" }],
      },
      {
        id: "accredited",
        q: "How do I check that a university or programme in Uganda is recognised?",
        facts: [
          "The National Council for Higher Education (NCHE) licenses higher education institutions in Uganda and accredits their programmes. It publishes the lists of registered institutions and accredited programmes.",
        ],
        guidance: "Check both the institution and the exact programme name before you pay fees: a licensed university can still run a programme that has not been accredited.",
        sources: ["nche-uganda"],
        links: [{ href: "/institutions", label: "Universities and colleges" }],
      },
    ],
  },
  {
    id: "abroad",
    title: "Qualifications from another country",
    faqs: [
      {
        id: "recognition",
        q: "Will my qualification be recognised if I study or work in another country?",
        facts: [
          "Recognition is decided by the country (and often the institution or employer) where you want to use it, not the country that issued it. Most countries have a national recognition body or information centre for this.",
          "UNESCO's Global Convention on the Recognition of Qualifications concerning Higher Education, adopted in 2019, sets shared principles for fair recognition between the countries that ratify it.",
          "ISCED, UNESCO's international classification of education, describes qualifications by level (for example level 6 for a bachelor's degree), which helps compare systems.",
        ],
        guidance: "Ask the recognition body in the destination country before you enrol in a course abroad that you plan to use at home, or the other way round. A regulated profession (such as medicine, nursing, law or engineering) usually also needs registration with that country's professional body.",
        sources: ["unesco-recognition", "isced-2011", "uis-isced-mappings"],
        links: [{ href: "/admissions", label: "Admission standards by country" }],
      },
    ],
  },
  {
    id: "pay",
    title: "Pay figures",
    faqs: [
      {
        id: "where-pay-from",
        q: "Where do the pay figures on this site come from?",
        facts: [
          "Only from official publishers: national statistics offices (such as the US Bureau of Labor Statistics and the UK Office for National Statistics), government salary scales (such as Uganda's public service salary structure), legal minimum wages, and the International Labour Organization's ILOSTAT database.",
          "Each figure is shown in the currency, period (hour, month or year) and year it was published in, with a link to its source. We do not use estimates from salary-survey or job sites.",
        ],
        sources: ["ilostat", "bls-oews", "ons-ashe", "ug-mops-salary-structure"],
        links: [{ href: "/pay-coverage", label: "Pay data by country" }],
      },
      {
        id: "starting-pay",
        q: "Is the pay shown what I will earn when I start?",
        facts: [
          "Usually not. Most official figures are averages or percentiles across everyone in a job, including people with many years of experience. Only published entry scales, such as the lowest step of a government salary grade, show starting pay, and we label those separately.",
          "A legal minimum wage is the lowest amount an employer may pay, not a typical salary.",
        ],
        guidance: "Look at the lower end of a range (for example the 10th or 25th percentile) as a rough guide to early-career pay, and compare it with the entry scale where one exists.",
        sources: ["bls-oews", "ug-mops-salary-structure", "ke-minimum-wage-order"],
      },
      {
        id: "why-usd",
        q: "Why are some figures in US dollars and others in local currency?",
        facts: [
          "We keep each figure in the currency its source published it in, so it can be checked against the source. International employers such as the World Bank Group and the United Nations publish their scales in US dollars, so those stay in dollars.",
        ],
        guidance: "Converting at today's exchange rate does not tell you what the money buys locally, so compare pay with living costs in the same country rather than across countries.",
        sources: ["wbg-salary-scales", "icsc-un-pay", "ilostat"],
      },
    ],
  },
  {
    id: "changing",
    title: "Changing career and planning a path",
    faqs: [
      {
        id: "planner-routes",
        q: "How does the path planner choose the routes it shows?",
        facts: [
          "It searches a network of careers built from published sources: the main qualifications for each career, career moves recorded in our career guides, related occupations from the US O*NET database, and skills that occupations share in the EU's ESCO classification.",
          "Routes are ranked by the time their steps are known to take. Moves based only on shared skills are marked as less certain, and a route uses at most three of them.",
        ],
        guidance: "Use the routes as a map of options, then check the qualification and registration steps with the official bodies in your country.",
        sources: ["onet", "esco", "isco-08"],
        links: [{ href: "/paths", label: "Path planner" }],
      },
      {
        id: "start-again",
        q: "Do I have to start from scratch to change career?",
        facts: [
          "Often not. Occupations share many skills; O*NET and ESCO both record the skills and knowledge each occupation uses, which shows how much of what you already do carries over.",
        ],
        guidance: "Look for a move that keeps most of your current skills and adds one new qualification, rather than a complete restart. Short courses and professional certificates can bridge the gap for some moves; regulated professions need the full qualification.",
        sources: ["onet", "esco"],
        links: [{ href: "/paths", label: "Plan a route from your current job" }, { href: "/certifications", label: "Certifications" }],
      },
    ],
  },
  {
    id: "site",
    title: "About this site and your data",
    faqs: [
      {
        id: "cost-account",
        q: "Does the site cost anything, and do I need an account?",
        facts: ["No. The site is free to use and needs no account or sign-up."],
        sources: [],
        links: [{ href: "/terms", label: "Terms of use" }],
      },
      {
        id: "data-kept",
        q: "Do you keep what I type into the planner and calculators?",
        facts: [
          "No. The tools do not store what you enter against you, the site sets no cookies and it uses no tracking. The CV builder saves your CV only in your own browser, never on our servers. If you email us, we use your message only to reply.",
        ],
        sources: [],
        links: [{ href: "/privacy", label: "Privacy policy" }, { href: "/cookies", label: "Cookies" }],
      },
      {
        id: "report-error",
        q: "I found a mistake in the data. How do I report it?",
        facts: [
          "Email us with the page, what looks wrong and, if you can, a link to the official source that shows the correct figure. We check corrections against the source before changing anything.",
        ],
        sources: [],
        links: [{ href: "/data-licences", label: "Our data sources" }],
      },
    ],
  },
];

export interface FaqSource { slug: string; name: string; publisher: string; url: string | null }

export function faqSource(slug: string): FaqSource {
  const s = dataSources.find((d) => d.slug === slug);
  if (!s) throw new Error(`FAQ cites unknown data source "${slug}"`);
  return { slug, name: s.name, publisher: s.publisher, url: s.url };
}
