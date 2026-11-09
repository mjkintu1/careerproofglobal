"""Build a compact, cited O*NET snapshot for Career Proof from the O*NET text database zip.
Usage: python -I onet_build.py <db_text.zip> <ESCO_to_ONET-SOC.tsv> <out_dir>
Source: O*NET 31.0 Database, U.S. Department of Labor, Employment and Training Administration (USDOL/ETA),
used under CC BY 4.0. Career Proof selects and summarises fields (top tasks, skills, interests)."""
import csv
import io
import json
import sys
import zipfile
from collections import defaultdict

ZIP, XWALK, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
z = zipfile.ZipFile(ZIP)
PREFIX = [n for n in z.namelist() if n.endswith("Occupation Data.txt")][0].rsplit("/", 1)[0]


def rows(name):
    with z.open(f"{PREFIX}/{name}.txt") as f:
        yield from csv.DictReader(io.TextIOWrapper(f, encoding="utf-8", errors="replace"), delimiter="\t")


occ = {r["O*NET-SOC Code"]: {"code": r["O*NET-SOC Code"], "title": r["Title"], "description": r["Description"]} for r in rows("Occupation Data")}

# Tasks: core tasks first, file order otherwise.
tasks = defaultdict(list)
for r in rows("Task Statements"):
    tasks[r["O*NET-SOC Code"]].append((0 if r["Task Type"] == "Core" else 1, r["Task"]))

# Skills: essential + transferable, by importance (IM scale), skip suppressed.
skills = defaultdict(list)
for f in ("Essential Skills", "Transferable Skills"):
    for r in rows(f):
        if r["Scale ID"] == "IM" and r.get("Recommend Suppress") != "Y":
            skills[r["O*NET-SOC Code"]].append((float(r["Data Value"]), r["Element Name"]))

# Interests (RIASEC) on the occupational interest scale.
LETTER = {"Realistic": "R", "Investigative": "I", "Artistic": "A", "Social": "S", "Enterprising": "E", "Conventional": "C"}
interests = defaultdict(dict)
for r in rows("Career Interest Types"):
    if r["Scale ID"] == "OI" and r["Element Name"] in LETTER:
        interests[r["O*NET-SOC Code"]][LETTER[r["Element Name"]]] = float(r["Data Value"])

# Typical education: the most common "Required Level of Education" category.
edu_labels = {}
for r in rows("Education Categories"):
    if r["Scale ID"] == "RL":
        edu_labels[r["Category"]] = r["Category Description"]
edu = defaultdict(list)
for r in rows("Education"):
    if r["Scale ID"] == "RL":
        edu[r["O*NET-SOC Code"]].append((float(r["Data Value"]), r["Category"]))

zones = {r["O*NET-SOC Code"]: int(r["Job Zone"]) for r in rows("Job Zones")}
titles = defaultdict(list)
for r in rows("Sample of Reported Titles"):
    titles[r["O*NET-SOC Code"]].append(r["Reported Job Title"])
related = defaultdict(list)
for r in rows("Related Occupations"):
    if r["Relatedness Tier"].startswith("Primary"):
        related[r["O*NET-SOC Code"]].append((int(r["Index"]), r["Related O*NET-SOC Code"]))

for code, o in occ.items():
    o["tasks"] = [t for _, t in sorted(tasks[code], key=lambda x: x[0])][:8]
    o["skills"] = [n for _, n in sorted(skills[code], key=lambda x: -x[0])][:10]
    scores = interests.get(code, {})
    o["riasec"] = "".join(k for k, _ in sorted(scores.items(), key=lambda x: -x[1])[:3]) if scores else None
    best = max(edu.get(code, []), default=None)
    o["education"] = edu_labels.get(best[1]) if best else None
    o["jobZone"] = zones.get(code)
    o["reportedTitles"] = titles[code][:6]
    o["related"] = [c for _, c in sorted(related[code])][:6]

# Crosswalk: ESCO/ISCO code -> O*NET-SOC codes (skip the 3 header lines).
xwalk = defaultdict(list)
with open(XWALK, encoding="utf-8") as f:
    for i, line in enumerate(f):
        parts = line.rstrip("\n").split("\t")
        if i < 3 or len(parts) < 4 or not parts[2]:
            continue
        if parts[2] in occ and parts[2] not in xwalk[parts[0]]:
            xwalk[parts[0]].append(parts[2])

meta = {
    "source": "O*NET 31.0 Database (August 2026 release)",
    "attribution": "This page includes information from the O*NET 31.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the CC BY 4.0 license. O*NET is a trademark of USDOL/ETA. Career Proof has modified all or some of this information; USDOL/ETA has not approved, endorsed, or tested these modifications.",
    "url": "https://www.onetcenter.org/database.html",
    "licence": "CC BY 4.0",
}
with open(f"{OUT}/onet-occupations.json", "w", encoding="utf-8") as f:
    json.dump({"meta": meta, "occupations": occ}, f, ensure_ascii=False, separators=(",", ":"))
with open(f"{OUT}/esco-onet-crosswalk.json", "w", encoding="utf-8") as f:
    json.dump({"meta": {**meta, "source": "O*NET-SOC 2019 to ESCO crosswalk (O*NET Resource Center)"}, "map": xwalk}, f, separators=(",", ":"))
print(f"O*NET occupations: {len(occ)} | with RIASEC: {sum(1 for o in occ.values() if o['riasec'])} | crosswalk ESCO codes: {len(xwalk)}")
