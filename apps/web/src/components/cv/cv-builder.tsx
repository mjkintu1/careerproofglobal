"use client";

import { Download, Printer, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CvCareer } from "@/lib/cv-careers";
import { AreaField, Repeater, TextField } from "./cv-fields";
import { cvHtml, EMPTY_CV, LABELS, loadCv, STORAGE_KEY, wordDocument, type CvData, type CvStyle } from "./cv-model";

/** Browser-only CV builder: nothing is sent to a server; work is saved in this browser's local storage. */
export default function CvBuilder({ careers }: { careers: CvCareer[] }) {
  const [cv, setCv] = useState<CvData>(() => loadCv());
  const set = (patch: Partial<CvData>) => setCv((c) => ({ ...c, ...patch }));
  useEffect(() => { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cv)); } catch { /* storage full or blocked */ } }, [cv]);

  const target = careers.find((c) => c.slug === cv.target);
  const html = useMemo(() => cvHtml(cv), [cv]);
  const suggested = (target?.skills ?? []).filter((s) => !cv.skills.includes(s));

  function download() {
    const url = URL.createObjectURL(wordDocument(cv));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(cv.name || "cv").trim().replace(/\s+/g, "-").toLowerCase()}-${cv.style}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function clearAll() {
    if (window.confirm("Clear everything in this CV? This cannot be undone.")) setCv(EMPTY_CV);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form className="space-y-8 print:hidden" onSubmit={(e) => e.preventDefault()} aria-label="CV details">
        <fieldset className="space-y-3">
          <legend className="font-display text-lg font-bold">Format</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Document type">
            {(Object.keys(LABELS) as CvStyle[]).map((s) => (
              <button key={s} type="button" role="radio" aria-checked={cv.style === s} onClick={() => set({ style: s })}
                className={`chip ${cv.style === s ? "bg-navy-900 text-white" : "bg-slate-100 text-ink"}`}>{LABELS[s].doc}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={cv.educationFirst} onChange={(e) => set({ educationFirst: e.target.checked })} />
            Put education before work history (best if you are a student or early in your career)
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-display text-lg font-bold">Target career (optional)</legend>
          <select className="field w-full" value={cv.target} onChange={(e) => set({ target: e.target.value })} aria-label="Target career">
            <option value="">Choose a career to get suggested skills</option>
            {careers.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
          </select>
          {target && (
            <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-sm">
              <p className="font-semibold">Skills this career relies on. Add the ones you can show evidence of:</p>
              <div className="flex flex-wrap gap-2">
                {suggested.length ? suggested.map((s) => (
                  <button key={s} type="button" onClick={() => set({ skills: [...cv.skills, s] })} className="chip bg-teal-50 text-teal-800">+ {s}</button>
                )) : <span className="text-ink-muted">All suggested skills added.</span>}
              </div>
              {target.qualifications.length > 0 && <p className="text-ink-muted">Usual qualifications: {target.qualifications.join("; ")}.</p>}
            </div>
          )}
        </fieldset>

        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 font-display text-lg font-bold">Contact details</legend>
          <TextField label="Full name" value={cv.name} onChange={(v) => set({ name: v })} />
          <TextField label="Headline" value={cv.headline} onChange={(v) => set({ headline: v })} placeholder="For example: Accounting graduate" />
          <TextField label="Email" type="email" value={cv.email} onChange={(v) => set({ email: v })} />
          <TextField label="Phone" type="tel" value={cv.phone} onChange={(v) => set({ phone: v })} />
          <TextField label="Town and country" value={cv.location} onChange={(v) => set({ location: v })} />
          <TextField label="Professional profile link" value={cv.link} onChange={(v) => set({ link: v })} placeholder="For example a LinkedIn or portfolio URL" />
        </fieldset>

        <AreaField label={LABELS[cv.style].intro} value={cv.intro} onChange={(v) => set({ intro: v })} rows={4}
          hint="A few short lines on who you are and what you want to do next, written for the job you are applying for." />
        <CvSections cv={cv} set={set} />
      </form>

      <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-wrap gap-2 print:hidden">
          <button type="button" onClick={() => window.print()} className="btn-primary inline-flex items-center gap-2"><Printer aria-hidden size={16} /> Print or save as PDF</button>
          <button type="button" onClick={download} className="chip inline-flex items-center gap-2 bg-slate-100 text-ink"><Download aria-hidden size={16} /> Download for Word</button>
          <button type="button" onClick={clearAll} className="chip inline-flex items-center gap-2 bg-slate-100 text-ink"><RotateCcw aria-hidden size={16} /> Clear</button>
        </div>
        <p className="text-xs text-ink-muted print:hidden">Saved automatically in this browser only. Nothing is sent to us.</p>
        <article id="cv-document" aria-label="CV preview" className="cv-doc rounded-lg border border-slate-200 bg-white p-8 shadow-sm" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

function CvSections({ cv, set }: { cv: CvData; set: (patch: Partial<CvData>) => void }) {
  return (
    <>
      <fieldset className="space-y-3">
        <legend className="font-display text-lg font-bold">{LABELS[cv.style].work}</legend>
        <Repeater noun="Job" items={cv.work} onChange={(work) => set({ work })} blank={EMPTY_CV.work[0]!} render={(j, u) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Job title" value={j.title} onChange={(v) => u({ title: v })} />
            <TextField label="Employer" value={j.employer} onChange={(v) => u({ employer: v })} />
            <TextField label="From" value={j.from} onChange={(v) => u({ from: v })} placeholder="Jan 2024" />
            <TextField label="To" value={j.to} onChange={(v) => u({ to: v })} placeholder="Present" />
            <div className="sm:col-span-2"><AreaField label="What you did and achieved" value={j.detail} onChange={(v) => u({ detail: v })}
              hint="One point per line. Say what happened as a result, with numbers where you can." /></div>
          </div>
        )} />
        <p className="text-xs text-ink-muted">Include volunteering, placements and projects as well as paid work.</p>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-display text-lg font-bold">Education</legend>
        <Repeater noun="Qualification" items={cv.education} onChange={(education) => set({ education })} blank={EMPTY_CV.education[0]!} render={(e, u) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Qualification" value={e.qualification} onChange={(v) => u({ qualification: v })} placeholder="For example: BSc Accounting" />
            <TextField label="School, college or university" value={e.place} onChange={(v) => u({ place: v })} />
            <TextField label="From" value={e.from} onChange={(v) => u({ from: v })} />
            <TextField label="To" value={e.to} onChange={(v) => u({ to: v })} />
            <div className="sm:col-span-2"><AreaField label="Results or relevant modules (optional)" value={e.detail} onChange={(v) => u({ detail: v })} rows={2} /></div>
          </div>
        )} />
      </fieldset>

      <SkillsField skills={cv.skills} onChange={(skills) => set({ skills })} />
      <AreaField label={LABELS[cv.style].extras} value={cv.extras} onChange={(v) => set({ extras: v })} rows={3}
        hint="For example languages you speak, awards, or interests that show a skill." />
      {cv.style === "cv" && <TextField label="References" value={cv.references} onChange={(v) => set({ references: v })}
        hint="Do not put other people's contact details on your CV; 'References available on request' is fine." />}
    </>
  );
}

function SkillsField({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => { const v = draft.trim(); if (v && !skills.includes(v)) onChange([...skills, v]); setDraft(""); };
  return (
    <fieldset className="space-y-2">
      <legend className="font-display text-lg font-bold">Skills</legend>
      <div className="flex gap-2">
        <input className="field flex-1" value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Add a skill"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder="Type a skill and press Enter" />
        <button type="button" onClick={add} className="chip bg-slate-100 text-ink">Add</button>
      </div>
      <ul className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <li key={s}><button type="button" onClick={() => onChange(skills.filter((x) => x !== s))} className="chip bg-slate-100 text-ink" aria-label={`Remove ${s}`}>{s} &times;</button></li>
        ))}
      </ul>
    </fieldset>
  );
}
