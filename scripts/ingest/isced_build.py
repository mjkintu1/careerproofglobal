"""Parse UNESCO UIS ISCED 2011 mappings into a compact per-country snapshot.

Input:  data-raw/isced/files/*.xlsx  (downloaded from download.uis.unesco.org/ISCED mapping/,
        listed on https://www.uis.unesco.org/en/methods-and-tools/isced/mapping-and-diagrams)
Output: packages/reference-data/src/snapshots/isced-mappings.json
Licence of the source: UIS terms (CC BY-SA 3.0 IGO); the snapshot is shared under the same terms.
Reads cell values only (no formulas or macros). Standard library only.
Usage: python -I scripts/ingest/isced_build.py <files dir> <names.json> <out.json>"""
import json, os, re, sys, unicodedata, zipfile, xml.etree.ElementTree as ET

M = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"


def col_index(ref):
    n = 0
    for ch in re.match(r"[A-Z]+", ref).group(0):
        n = n * 26 + ord(ch) - 64
    return n - 1


def read_rows(path):
    z = zipfile.ZipFile(path)
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall(M + "si"):
            shared.append("".join(t.text or "" for t in si.iter(M + "t")))
    sheets = sorted(n for n in z.namelist() if re.match(r"xl/worksheets/sheet\d+\.xml$", n))
    out = []
    for sh in sheets:
        rows = []
        for row in ET.fromstring(z.read(sh)).iter(M + "row"):
            cells = {}
            for c in row.findall(M + "c"):
                t, v = c.get("t"), c.find(M + "v")
                if t == "s" and v is not None:
                    val = shared[int(v.text)]
                elif t == "inlineStr":
                    val = "".join(x.text or "" for x in c.iter(M + "t"))
                else:
                    val = v.text if v is not None else ""
                cells[col_index(c.get("r"))] = re.sub(r"\s+", " ", val or "").strip()
            rows.append(cells)
        out.append(rows)
    return out


def fold(s):
    return unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()


def find_cols(header):
    h = {i: fold(v) for i, v in header.items() if v}
    def pick(must, exclude=r"$^", prefer=("english", "anglais", "ingles"), second=("francais", "frances")):
        cands = [i for i, v in h.items() if re.search(must, v) and not re.search(exclude, v)]
        en = [i for i in cands if any(p in h[i] for p in prefer)]
        fr = [i for i in cands if any(p in h[i] for p in second)]
        return (en or fr or cands or [None])[0], bool(en)
    name, name_en = pick(r"^(name|titre|nom|nombre) (of the |du |del )?(education )?(programme|programa)")
    entry, entry_en = pick(r"(entrance|entry) requirement|minimun entry|conditions? (minimales? )?d.?(admission|acces)|requisitos", exclude=r"isced-97")
    award, _ = pick(r"diploma|diplome|titulo|qualification", exclude=r"level|niveau|isced|cite|code|number|eqf|lfs|direct access|minimum entry|minimun entry")
    age, _ = pick(r"entrance age|starting age|age theorique|edad teorica|age d.entree|age d.admission|edad de ingreso", exclude=r"minimum starting")
    dur, _ = pick(r"theoretical duration|duree theorique|duracion teorica", exclude=r"cumulative|minimum duration")
    code, _ = pick(r"programme code|code a trois chiffres|codigo de tres|isced-p|cite-p|cine-p")
    if code is None:
        code, _ = pick(r"^isced-2011 level$|^isced-2011 level \(", exclude=r"qualification|attainment")
    notes, _ = pick(r"^(notes|remarques|observations|notas|observaciones)")
    return {"name": name, "entry": entry, "award": award, "age": age, "duration": dur, "code": code, "notes": notes}, (name_en or entry_en)


LEVELS = {"1": "primary", "2": "lower secondary", "3": "upper secondary", "4": "post-secondary non-tertiary",
          "5": "short-cycle tertiary", "6": "bachelor's or equivalent", "7": "master's or equivalent", "8": "doctoral"}


def readable(q):
    """OECD/UOE-format files give entry requirements as ISCED codes ("344"); spell them out."""
    codes = re.findall(r"\b(\d)\d\d\b", q)
    if q.strip() and re.fullmatch(r"[\d\s/,;or]+", q.strip()) and codes:
        lv = sorted({c for c in codes})
        names = " or ".join(LEVELS.get(c, "ISCED " + c) for c in lv)
        return f"Completed {names} (ISCED {q.strip()})"
    return q


def parse(path):
    year, english, progs, seen = None, False, [], set()
    for rows in read_rows(path):
        hi = next((i for i, r in enumerate(rows[:40]) if len(r) >= 6
                   and any(re.search(r"(entrance|entry) requirement|minimun entry|conditions? (minimales? )?d.?(admission|acces)|requisitos", fold(v)) for v in r.values())
                   and any(re.search(r"^(name|titre|nom|nombre)", fold(v)) for v in r.values())), None)
        if hi is None:
            continue
        head = " | ".join(fold(v) for v in rows[hi].values())
        if "school/graduation year" in head or "last entrance school year" in head:
            continue  # qualifications sheet or discontinued (ISCED-97) programmes
        cols, en = find_cols(rows[hi])
        if cols["name"] is None or cols["code"] is None:
            continue
        english = english or en
        for r in rows[:hi]:
            for v in r.values():
                m = re.search(r"(reference|referencia|annee scolaire|annee de reference).*?((19|20)\d\d)", fold(v))
                if m:
                    year = int(m.group(2))
        ycol = next((i for i, v in rows[hi].items() if re.search(r"school \(academic\) year|^school year", fold(v))), None)
        for r in rows[hi + 1:]:
            get = lambda k: r.get(cols[k], "") if cols[k] is not None else ""
            code = re.sub(r"\D", "", get("code"))
            if len(code) != 3 or not get("name") or get("name").lower() in ("none", "na"):
                continue
            if year is None and ycol is not None:
                ym = re.search(r"(19|20)\d\d", r.get(ycol, ""))
                year = int(ym.group(0)) if ym else None
            level = int(code[0])
            if level < 3 or (get("name"), code) in seen:
                continue
            seen.add((get("name"), code))
            num = lambda s: (lambda m: float(m.group(0)) if m else None)(re.search(r"\d+(\.\d+)?", s or ""))
            award = get("award")
            progs.append({"n": get("name"), "q": readable(get("entry")), "a": "" if award.lower() in ("none", "na") else award,
                          "age": num(get("age")), "y": num(get("duration")), "l": level, "c": code, "x": get("notes")[:300]})
    return {"year": year, "english": english, "programmes": progs} if progs else None


def main(src, names_path, dst):
    names = json.load(open(names_path, encoding="utf-8"))
    out, problems = {}, []
    for f in sorted(os.listdir(src)):
        if not f.endswith(".xlsx"):
            continue
        key = re.sub(r"^ISCED_2011_[Mm]apping_|\.xlsx$", "", f)
        iso = names.get(key)
        if not iso:
            problems.append(f"no country code for {key}")
            continue
        try:
            res = parse(os.path.join(src, f))
        except Exception as e:  # corrupt or unexpected file: record, never guess
            problems.append(f"{key}: {e}")
            continue
        if not res or not res["programmes"]:
            problems.append(f"{key}: no programmes found")
            continue
        res["file"] = f
        if iso in out:
            res["variant"] = key
            out[iso].setdefault("variants", []).append(res)
        else:
            out[iso] = res
    snap = {
        "meta": {
            "source": "UNESCO Institute for Statistics (UIS), ISCED 2011 mappings",
            "url": "https://www.uis.unesco.org/en/methods-and-tools/isced/mapping-and-diagrams",
            "downloadBase": "https://download.uis.unesco.org/ISCED%20mapping/",
            "licence": "CC BY-SA 3.0 IGO (UIS terms)",
            "licenceUrl": "https://uis.unesco.org/en/terms-and-conditions",
            "extractedAt": "2026-11-10",
            "levels": "ISCED 3 (upper secondary) to 8 (doctoral)",
            "keys": {"n": "programme", "q": "minimum entrance requirements", "a": "qualification awarded", "age": "theoretical entrance age", "y": "theoretical duration (years)", "l": "ISCED level", "c": "ISCED-P code", "x": "notes"},
            "problems": problems,
        },
        "byCountry": out,
    }
    with open(dst, "w", encoding="utf-8") as fh:
        json.dump(snap, fh, ensure_ascii=False, separators=(",", ":"))
    print("countries", len(out), "programmes", sum(len(v["programmes"]) for v in out.values()), "non-English", sum(not v["english"] for v in out.values()))
    for p in problems:
        print("  problem:", p)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3])
