export interface NavLink { href: string; label: string; description?: string }
export interface NavGroup { label: string; links: NavLink[] }

/** Main navigation, modelled on StudentHub's information architecture. */
export const mainNav: NavGroup[] = [
  {
    label: "Your Journey",
    links: [
      { href: "/careers/global", label: "Career paths", description: "Ways in and where they lead" },
      { href: "/careers/global#fields", label: "Career fields", description: "Twelve fields of work" },
      { href: "/subjects", label: "Subjects", description: "How subjects lead to careers" },
      { href: "/occupations", label: "Occupation directory", description: "Every occupation, ILO standard" },
      { href: "/grow", label: "Grow your career", description: "Habits and real career stories" },
      { href: "/job-market", label: "Finding work safely", description: "Job services and scam warnings" },
    ],
  },
  {
    label: "Career Tools",
    links: [
      { href: "/paths", label: "Path planner", description: "Every route to any career" },
      { href: "/subjects#selector", label: "Subject selector", description: "Subjects for a dream career" },
      { href: "/admissions/calculators", label: "Admission calculators", description: "Points from official tables" },
      { href: "/cv-builder", label: "CV builder", description: "A clear CV, kept on your device" },
      { href: "/negotiate-salary", label: "Salary negotiation", description: "Check an offer against official pay" },
      { href: "/pay-coverage", label: "Pay data by country", description: "Official pay sources we hold" },
    ],
  },
  {
    label: "Where to Study",
    links: [
      { href: "/institutions", label: "Universities and colleges", description: "30,000+ institutions worldwide" },
      { href: "/admissions", label: "Admission standards", description: "Entry rules and regulators by country" },
      { href: "/curricula", label: "School curricula", description: "Cambridge, IB, AP and national exams" },
      { href: "/certifications", label: "Certifications", description: "ACCA, CFA, PMP and how to judge one" },
    ],
  },
];

export const audiences: { label: string; body: string; href: string }[] = [
  { label: "Students", body: "Choosing subjects, courses and universities", href: "/subjects" },
  { label: "Graduates", body: "Turning a degree into a first career", href: "/careers/global" },
  { label: "Job seekers", body: "Upskilling or changing field", href: "/paths" },
  { label: "Adult learners", body: "Returning to study at any age", href: "/careers/global#fields" },
  { label: "Parents", body: "Understanding your child's options", href: "/careers/global" },
  { label: "Counsellors", body: "Tools for guidance sessions", href: "/admissions/calculators" },
];

/**
 * Footer legal and company links. `ready: false` pages are planned (docs/SITE_ESSENTIALS_PLAN.md) and
 * are not shown until they exist, so the footer never links to a missing page.
 */
export const legalLinks: (NavLink & { ready: boolean })[] = [
  { href: "/about", label: "About", ready: false },
  { href: "/contact", label: "Contact", ready: false },
  { href: "/faqs", label: "FAQs", ready: true },
  { href: "/privacy", label: "Privacy", ready: true },
  { href: "/terms", label: "Terms of use", ready: true },
  { href: "/cookies", label: "Cookies", ready: true },
  { href: "/disclaimer", label: "Disclaimer", ready: true },
  { href: "/data-licences", label: "Copyright and data licences", ready: true },
  { href: "/pay-coverage", label: "Pay data coverage", ready: true },
];
