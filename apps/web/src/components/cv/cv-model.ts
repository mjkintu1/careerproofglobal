/** CV data, kept only in the visitor's browser (localStorage). */
export type CvStyle = "cv" | "resume";
export interface CvEducation { qualification: string; place: string; from: string; to: string; detail: string }
export interface CvJob { title: string; employer: string; from: string; to: string; detail: string }
export interface CvData {
  style: CvStyle;
  name: string; headline: string; email: string; phone: string; location: string; link: string;
  intro: string;
  education: CvEducation[];
  work: CvJob[];
  skills: string[];
  extras: string;
  references: string;
  target: string;
  /** Education before work history: suits students and people early in their career. */
  educationFirst: boolean;
}

export const STORAGE_KEY = "careerproof-cv-v1";

export const EMPTY_CV: CvData = {
  style: "cv", name: "", headline: "", email: "", phone: "", location: "", link: "", intro: "",
  education: [{ qualification: "", place: "", from: "", to: "", detail: "" }],
  work: [{ title: "", employer: "", from: "", to: "", detail: "" }],
  skills: [], extras: "", references: "References available on request.", target: "", educationFirst: true,
};

export function loadCv(): CvData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY_CV, ...(JSON.parse(raw) as Partial<CvData>) } : EMPTY_CV;
  } catch {
    return EMPTY_CV;
  }
}

export const LABELS: Record<CvStyle, { doc: string; intro: string; work: string; education: string; skills: string; extras: string }> = {
  cv: { doc: "CV (UK, Europe, Africa)", intro: "Personal profile", work: "Work history", education: "Education", skills: "Skills", extras: "Languages, achievements and interests" },
  resume: { doc: "Résumé (US, Canada)", intro: "Summary", work: "Experience", education: "Education", skills: "Skills", extras: "Additional information" },
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const dates = (a: string, b: string) => [a, b].filter(Boolean).join(" to ");

/** The CV as a simple, single-column HTML document: readable by applicant-tracking systems and openable in Word. */
export function cvHtml(d: CvData): string {
  const L = LABELS[d.style];
  const contact = [d.email, d.phone, d.location, d.link].filter(Boolean).map(esc).join(" | ");
  const section = (title: string, body: string) => (body ? `<h2>${esc(title)}</h2>${body}` : "");
  const work = d.work.filter((j) => j.title || j.employer).map((j) =>
    `<h3>${esc([j.title, j.employer].filter(Boolean).join(", "))}</h3><p class="when">${esc(dates(j.from, j.to))}</p>${list(j.detail)}`).join("");
  const edu = d.education.filter((e) => e.qualification || e.place).map((e) =>
    `<h3>${esc([e.qualification, e.place].filter(Boolean).join(", "))}</h3><p class="when">${esc(dates(e.from, e.to))}</p>${list(e.detail)}`).join("");
  function list(s: string) { const l = lines(s); return l.length ? `<ul>${l.map((x) => `<li>${esc(x.replace(/^[-•*]\s*/, ""))}</li>`).join("")}</ul>` : ""; }
  const order = d.educationFirst ? [section(L.education, edu), section(L.work, work)] : [section(L.work, work), section(L.education, edu)];
  return [
    `<h1>${esc(d.name || "Your name")}</h1>`,
    d.headline ? `<p class="headline">${esc(d.headline)}</p>` : "",
    contact ? `<p class="contact">${contact}</p>` : "",
    section(L.intro, lines(d.intro).map((p) => `<p>${esc(p)}</p>`).join("")),
    ...order,
    section(L.skills, d.skills.length ? `<p>${d.skills.map(esc).join(", ")}</p>` : ""),
    section(L.extras, lines(d.extras).map((p) => `<p>${esc(p)}</p>`).join("")),
    d.style === "cv" ? section("References", d.references ? `<p>${esc(d.references)}</p>` : "") : "",
  ].join("");
}

export const CV_CSS = "body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#111;line-height:1.35}h1{font-size:20pt;margin:0}h2{font-size:12.5pt;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #999;margin:14pt 0 4pt}h3{font-size:11pt;margin:8pt 0 0}p{margin:2pt 0}.headline{font-size:12pt}.contact,.when{color:#444;font-size:10pt}ul{margin:2pt 0 0 16pt;padding:0}";

export function wordDocument(d: CvData): Blob {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(d.name || "CV")}</title><style>${CV_CSS}</style></head><body>${cvHtml(d)}</body></html>`;
  return new Blob(["﻿", html], { type: "application/msword" });
}
