"""Build Uganda public-university cut-off points from official PDFs.

Inputs (pdftotext output from the official PDFs, see data-raw/uganda/):
  notes-2026-27.txt  (-layout) and notes-raw.txt (-raw): Ministry of Education & Sports,
      "Notes to Schools 2026/2027 Academic Year" (published by Makerere University)
  gov-raw.txt:   Makerere "Government (A'Level) admissions 2025/2026, National Merit cut-off points"
  priv-raw.txt:  Makerere "Private students' admissions 2025/2026, direct entry cut-off points"
Output: packages/reference-data/src/snapshots/ug-cutoffs.json
Rows that do not parse cleanly are skipped and counted, never guessed.
Usage: python -I scripts/ingest/ug_cutoffs_build.py <data-raw/uganda dir> <out.json>"""
import json, os, re, sys

NUM = r"(?:\d{2}[.,]\d|-)"
YEARS = ["2025/2026", "2024/2025", "2023/2024"]


def val(t):
    return None if t == "-" else float(t.replace(",", "."))


STOP = {"of", "and", "in", "the", "bachelor", "science", "with", "mak", "makerere", "campus", "mubs"}


def norm(t):
    words = re.findall(r"[a-z]+", t.lower().replace("&", " and "))
    return "".join(w for w in words if w not in STOP)


def makerere_three_years(layout_lines):
    """Makerere table in 'OTHER INFORMATION': 6 numbers = female/male per year, 3 = one figure per year."""
    start = next(i for i, l in enumerate(layout_lines) if "2025/2026 2024/2025 2023/2024" in l)
    end = next(i for i, l in enumerate(layout_lines) if i > start and "DETAILED WEIGHTING SYSTEM" in l)
    rows, skipped, pend_title, pend_nums = [], [], "", None
    for raw in layout_lines[start + 2:end]:
        line = raw.strip()
        if not line or re.fullmatch(r"\d{1,2}", line):
            continue
        nums = re.findall(r"(?<![\w.])" + NUM + r"(?![\w.])", line)
        text = re.sub(r"(?<![\w.])" + NUM + r"(?![\w.])", " ", line)
        m = re.match(r"^(\d{1,2})\s+(.*)$", text.strip())
        if m:
            idx, title = int(m.group(1)), (pend_title + " " + m.group(2)).strip()
            n = nums or pend_nums or []
            pend_title, pend_nums = "", None
            title = re.sub(r"\s+", " ", re.sub(r"^(PROGRAMME\s*)?((Female|Male)\s*)+", "", title))
            if idx in (38, 39) or " i) " in f" {title} " or len(n) not in (3, 6):
                skipped.append(f"{idx} {title} {n}")
                continue
            if len(n) == 6:
                cut = [{"year": y, "female": val(n[2 * k]), "male": val(n[2 * k + 1])} for k, y in enumerate(YEARS)]
            else:
                cut = [{"year": y, "all": val(n[k])} for k, y in enumerate(YEARS)]
            rows.append({"university": "Makerere University", "programme": title, "scheme": "government", "cutoffs": cut})
        else:
            pend_title = (pend_title + " " + text).strip()
            if nums:
                pend_nums = nums
    return rows, skipped


def other_universities(raw_text):
    """Tables headed 'CUT-OFF POINTS FOR <UNIVERSITY> ...' with one figure per year (3 values)."""
    rows, skipped = [], []
    parts = re.split(r"CUT-OFF POINTS FOR ([A-Z ]+?UNIVERSITY)", raw_text)
    for k in range(1, len(parts), 2):
        uni = parts[k].strip().title().replace("Of The", "of the")
        body = re.split(r"APPENDIX|DETAILED WEIGHTING|DETALIED WEIGHTING|NOTE:", parts[k + 1])[0]
        parent = None
        for line in body.splitlines():
            line = line.strip()
            nums = re.findall(r"(?<![\w.])" + NUM + r"(?![\w.])", line)
            text = re.sub(r"(?<![\w.])" + NUM + r"(?![\w.])", " ", line).strip()
            num_line = re.match(r"^(\d{1,2})\.?\s+(.+)$", text)
            sub_line = re.match(r"^(i{1,3}|iv|v)\)\s*(.+)$", text)
            if num_line and not nums:
                parent = num_line.group(2)
                continue
            if sub_line and parent and len(nums) == 3:
                title = f"{parent} ({sub_line.group(2)})"
            elif num_line and len(nums) == 3:
                title, parent = num_line.group(2), None
            elif not text and len(nums) == 3 and parent:
                title, parent = parent, None
            else:
                if nums:
                    skipped.append(f"{uni}: {line}")
                elif parent and text and not re.match(r"^(SN|PROGRAMME|Programme|Female|Academic)", text):
                    parent = f"{parent} {text}"
                continue
            title = re.sub(r"\s+", " ", title).strip()
            if re.search(r"\bYears?\b|\bKEP\b", title):
                skipped.append(f"{uni}: {line}")
                continue
            rows.append({"university": uni, "programme": title, "scheme": "government",
                         "cutoffs": [{"year": y, "all": val(nums[i])} for i, y in enumerate(YEARS)]})
    return rows, skipped


def makerere_pdf(raw_lines, scheme):
    """Makerere 2025/26 lists: 'N Title [campus] CODE v [v]'. Two values = male then female."""
    rows = []
    for line in raw_lines:
        m = re.match(r"^(\d{1,3}) (.+?) ([A-Z]{2,4})((?: (?:\d{2}\.\d|\d{2}%))*)\s*$", line.strip())
        if not m:
            continue
        title, code, vals = m.group(2), m.group(3), m.group(4).split()
        campus = None
        cm = re.search(r"\s(MAK|MUBS)$", title)
        if cm:
            campus, title = cm.group(1), title[: cm.start()]
        row = {"university": "Makerere University", "programme": title.strip(), "code": code, "campus": campus,
               "scheme": scheme, "year": "2025/2026"}
        if any(v.endswith("%") for v in vals):
            row["note"] = f"Pre-entry examination pass mark {vals[0]}"
        elif len(vals) == 2:
            row["male"], row["female"] = float(vals[0]), float(vals[1])
        elif len(vals) == 1:
            row["all"] = float(vals[0])
        else:
            row["note"] = "No cut-off published"
        rows.append(row)
    return rows


def main(src, dst):
    read = lambda f: open(os.path.join(src, f), encoding="utf-8", errors="replace").read()
    mak3, skip_a = makerere_three_years(read("notes-2026-27.txt").splitlines())
    others, skip_b = other_universities(read("notes-raw.txt"))
    gov = makerere_pdf(read("gov-raw.txt").splitlines(), "government")
    priv = makerere_pdf(read("priv-raw.txt").splitlines(), "private")
    codes = {}
    for r in gov:
        key = norm(r["programme"]) + (r["campus"] or "").lower()
        codes[key] = r["code"]
        codes.setdefault(norm(r["programme"]), r["code"])
    for r in mak3:
        campus = "mubs" if "MUBS" in r["programme"] else ""
        r["code"] = codes.get(norm(r["programme"]) + campus) or codes.get(norm(r["programme"]))
    snap = {
        "meta": {
            "checkedAt": "2026-11-10",
            "sources": [
                {"name": "Ministry of Education & Sports, Notes to Schools 2026/2027 Academic Year (three-year government cut-offs, weighting system)",
                 "url": "https://news.mak.ac.ug/wp-content/uploads/2025/10/Notes-to-Schools-2026-2027-Academic-Year.pdf"},
                {"name": "Makerere University, Government (A'Level) admissions 2025/2026, National Merit cut-off points",
                 "url": "https://www.mak.ac.ug/sites/default/files/2025-04/Makerere-University-NATIONAL-MERIT-SCHOLARSHIP-CUT-OFF%20POINTS-2025-2026.pdf"},
                {"name": "Makerere University, Private students' admissions 2025/2026, direct entry cut-off points",
                 "url": "https://www.mak.ac.ug/sites/default/files/2025-07/Cut-Off-Points-DIRECT_ENTRY-Private-Sponsorship-2025-2026.pdf"},
            ],
            "notes": [
                "Cut-off points are the lowest combined weight admitted in that year, as published. They change every year.",
                "STEM programmes at Makerere publish separate female and male cut-offs; other programmes publish one figure.",
                "Rows that could not be read unambiguously from the PDFs were left out rather than guessed.",
            ],
            "skippedRows": len(skip_a) + len(skip_b),
        },
        "threeYear": mak3 + others,
        "makerere2025": {"government": gov, "private": priv},
    }
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(snap, f, indent=1, ensure_ascii=False)
    unis = sorted({r["university"] for r in mak3 + others})
    print("three-year rows:", len(mak3), "Makerere +", len(others), "others", unis)
    print("Makerere 2025/26: government", len(gov), "private", len(priv), "| skipped", len(skip_a) + len(skip_b))
    for s in (skip_a + skip_b)[:12]:
        print("  skip:", s[:110])


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
