"""South Africa public-service salary scales from the DPSA cost-of-living circular (Circular 15 of
2026, Annexures A-H, effective 1 April 2026; spreadsheet published by the Department of Public
Service and Administration). Each sheet lists posts (or salary levels) with salary notches; the
2026 full-time annual notch column is found from the sheet's own "1 April 2026" header.
Input: data-raw/south-africa/dpsa-annexures-2026.xlsx
Usage: python -I scripts/ingest/za_dpsa_build.py <annexures.xlsx> <out.json> [--list]"""
import json, re, sys, zipfile, xml.etree.ElementTree as ET
from datetime import datetime, timezone

M = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
SHEETS = {
    "A - PSAP (Non-OSD)": "General public service (salary levels 1-12, not covered by an OSD)",
    "B - Nurses": "OSD for nurses",
    "C - Legal": "OSD for legally qualified personnel",
    "D - Soc Services": "OSD for social services professions",
    "E - Engineering & related": "OSD for engineering and related professions",
    "F - Medical & related": "OSD for medical officers, dentists, pharmacists and related",
    "G - Allied & related": "OSD for therapeutic, diagnostic and related allied health professions",
}


def col_index(ref):
    n = 0
    for ch in "".join(c for c in ref if c.isalpha()):
        n = n * 26 + ord(ch) - 64
    return n


def read(path):
    z = zipfile.ZipFile(path)
    shared = ["".join(t.text or "" for t in si.iter(M + "t")) for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall(M + "si")]
    names = [s.get("name") for s in ET.fromstring(z.read("xl/workbook.xml")).iter(M + "sheet")]
    for name in SHEETS:
        rows = []
        for row in ET.fromstring(z.read("xl/worksheets/sheet%d.xml" % (names.index(name) + 1))).iter(M + "row"):
            cells = {}
            for c in row.findall(M + "c"):
                v, t = c.find(M + "v"), c.get("t")
                if v is None:
                    continue
                cells[col_index(c.get("r"))] = shared[int(v.text)].strip() if t == "s" else v.text
            rows.append(cells)
        yield name, rows


def posts(name, rows):
    # Header row: the cell mentioning "1 April 2026" marks the full-time 2026 column; the cell
    # mentioning "Post" marks the title column.
    col26 = title_col = start = None
    for i, r in enumerate(rows):
        for c, v in r.items():
            if isinstance(v, str) and "1 April 2026" in v and col26 is None:
                col26, start = c, i + 1
            if isinstance(v, str) and re.search(r"\bPost\b", v) and title_col is None:
                title_col = c
        if col26:
            break
    out, current, stream = [], None, None
    for r in rows[start:]:
        t = r.get(title_col)
        v = r.get(col26)
        if isinstance(t, str) and re.search(r"[A-Za-z]{3}", t) and not re.match(r"Notch|Full-time", t):
            if v is None or not re.fullmatch(r"\d+(\.\d+)?", str(v)):
                stream = t  # stream heading, e.g. "General Nursing Stream"
                continue
            current = {"post": t, "stream": stream, "notches": []}
            out.append(current)
        elif name.startswith("A ") and t is not None and re.fullmatch(r"\d+", str(t)):
            current = {"post": f"Salary level {t}", "stream": None, "notches": []}
            out.append(current)
        if current is not None and v is not None and re.fullmatch(r"\d+(\.\d+)?", str(v)):
            current["notches"].append(round(float(v)))
    return [{"post": p["post"], **({"stream": p["stream"]} if p["stream"] else {}), "min": min(p["notches"]), "max": max(p["notches"]), "notches": len(p["notches"])} for p in out if p["notches"]]


# Career -> entry posts (CareerProof Global's mapping), in the order people pass through them.
# Occupation-specific (OSD) sheets are translation keys where several posts share notch ladders, so only
# each post's first (entry) notch is used; full ranges are used for the general salary levels only.
CAREERS = {
    "medical-doctor": [("F - Medical & related", "Medical Officer (Intern)"), ("F - Medical & related", "Medical Officer (Community Service)"), ("F - Medical & related", "Medical Officer Gr 1")],
    "dentist": [("F - Medical & related", "Dentist (Community Service)"), ("F - Medical & related", "Dentist Officer Gr 1")],
    "pharmacist": [("F - Medical & related", "Pharmacist (Intern)"), ("F - Medical & related", "Pharmacist (Community Service)"), ("F - Medical & related", "Pharmacist Grade 1")],
    "nurse": [("B - Nurses", "Professional Nurse (Community Service)"), ("B - Nurses", "Professional Nurse Grade 1 (General Nursing)")],
    "midwife": [("B - Nurses", "Professional Nurse Grade 1 (Specialty Nursing)")],
    "social-worker": [("D - Soc Services", "Social Worker Grade 1")],
    "civil-engineer": [("E - Engineering & related", "Candidate Engineer")],
    "mechanical-engineer": [("E - Engineering & related", "Candidate Engineer")],
    "electrical-engineer": [("E - Engineering & related", "Candidate Engineer")],
    "chemical-engineer": [("E - Engineering & related", "Candidate Engineer")],
    "architect": [("E - Engineering & related", "Candidate Architect")],
    "quantity-surveyor": [("E - Engineering & related", "Candidate Quantity Surveyor")],
    "chemist": [("E - Engineering & related", "Candidate Scientist")],
    "industrial-chemist": [("E - Engineering & related", "Candidate Scientist")],
    "microbiologist": [("E - Engineering & related", "Candidate Scientist")],
    "environmental-scientist": [("E - Engineering & related", "Candidate Scientist")],
    "medical-lab-scientist": [("G - Allied & related", "Medical Technologist Gr 1")],
    "public-health-officer": [("G - Allied & related", "Environmental Health Practitioner Gr 1")],
    "lawyer": [("C - Legal", "Candicate Attorney, Grade 1 (LP 1)"), ("C - Legal", "Assistant State Attorney (Grade 1) (LP 3)")],
}


def main(src, out, *flags):
    schedules = {}
    for name, rows in read(src):
        schedules[name] = {"description": SHEETS[name], "posts": posts(name, rows)}
        if "--list" in flags:
            print("==", name)
            for p in schedules[name]["posts"]:
                print("  ", p["post"][:80], "|", p.get("stream", "")[:30], "|", p["min"], "-", p["max"], f"({p['notches']})")
    careers = {}
    for slug, refs in CAREERS.items():
        rows = []
        for sheet, post in refs:
            p = next((x for x in schedules[sheet]["posts"] if x["post"] == post), None)
            if not p:
                raise SystemExit(f"{slug}: post not found: {sheet} / {post}")
            rows.append({"schedule": sheet, "post": post.replace("Candicate", "Candidate"), "entry": p["min"]})
        careers[slug] = rows
    snap = {
        "meta": {
            "country": "ZA",
            "source": "Department of Public Service and Administration (DPSA), Circular 15 of 2026: cost-of-living adjustment, salary scales with translation keys (Annexures A-H), effective 1 April 2026",
            "attribution": "Source: Department of Public Service and Administration, Republic of South Africa, Circular 15 of 2026, Annexures A-H.",
            "url": "https://www.dpsa.gov.za/policy-updates/nlrrm/remuneration_policy/annual_cost_of_living_adjustments/",
            "currency": "ZAR",
            "unit": "Annual salary notch or total cost-to-employer package, full-time, 2026/27",
            "builtAt": datetime.now(timezone.utc).isoformat(),
        },
        "careers": careers,
        "generalLevels": [{"level": int(p["post"].split()[-1]), "min": p["min"], "max": p["max"], "notches": p["notches"]} for p in schedules["A - PSAP (Non-OSD)"]["posts"]],
        "mapping": "Career-to-post links are CareerProof Global's reading of the post titles. Entry notch only for OSD posts (translation-key layout).",
    }
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        json.dump(snap, f, ensure_ascii=False)
    print(f"DPSA: {sum(len(s['posts']) for s in schedules.values())} posts/levels in {len(schedules)} schedules")


if __name__ == "__main__":
    main(*sys.argv[1:])
