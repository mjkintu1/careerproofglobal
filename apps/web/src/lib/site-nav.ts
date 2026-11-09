export interface NavLink { href: string; label: string; description?: string }
export interface NavGroup { label: string; links: NavLink[] }

/** Main navigation, modelled on StudentHub's information architecture. */
export const mainNav: NavGroup[] = [
  {
    label: "Your Journey",
    links: [
      { href: "/subjects", label: "Subjects", description: "How school subjects connect to careers" },
      { href: "/careers/global#fields", label: "Career fields", description: "Twelve fields of work" },
      { href: "/careers/global", label: "Career paths", description: "Guided careers: ways in and where they lead" },
      { href: "/occupations", label: "Occupation directory", description: "Every occupation, by the ILO ISCO-08 standard" },
      { href: "/certifications", label: "Certifications", description: "ACCA, CFA, PMP, CCNA and more, plus how to judge one" },
    ],
  },
  {
    label: "Career Tools",
    links: [
      { href: "/careers/global#path-finder-heading", label: "Path finder", description: "The quickest route between two careers" },
      { href: "/subjects#selector", label: "Subject selector", description: "Pick a dream career, see the subjects to take" },
      { href: "/admissions/calculators", label: "Admission calculators", description: "UCAS Tariff and more, by country, from official tables" },
    ],
  },
  {
    label: "Where to Study",
    links: [
      { href: "/institutions", label: "Universities and colleges", description: "30,000+ institutions in every country" },
      { href: "/admissions", label: "Admission standards", description: "ISCED levels, recognition and each country's regulator" },
    ],
  },
];

export const audiences: { label: string; body: string; href: string }[] = [
  { label: "Students", body: "Choosing subjects, courses and universities", href: "/subjects" },
  { label: "Graduates", body: "Turning a degree into a first career", href: "/careers/global" },
  { label: "Job seekers", body: "Upskilling or changing field", href: "/careers/global#path-finder-heading" },
  { label: "Adult learners", body: "Returning to study at any age", href: "/careers/global#fields" },
  { label: "Parents", body: "Understanding your child's options", href: "/careers/global" },
  { label: "Counsellors", body: "Tools for guidance sessions", href: "/admissions/calculators" },
];
