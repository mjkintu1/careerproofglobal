"""UK pay by occupation from the ONS Annual Survey of Hours and Earnings (ASHE), Table 14.7a
(annual gross pay, full-time employees, SOC 2020 4-digit), plus a SOC 2020 -> ISCO-08 lookup
from the ONS SOC 2020 Volume 2 coding index (each job title carries both codes).

Inputs (downloaded into data-raw/ons-ashe/, Open Government Licence v3.0):
  x/...Table 14.7a   Annual pay - Gross <year>.xlsx   (from ashetable14<year>provisional.zip)
  soc/soc2020volume2thecodingindex...xlsx
Usage: python -I scripts/ingest/ons_ashe_build.py <table 14.7a xlsx> <coding index xlsx> <year label> <out.json>
"x" cells (estimates ONS judges unreliable) are left out, never filled."""
import json, re, sys, zipfile, xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from datetime import datetime, timezone

M = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"


def sheet_rows(path, sheet_name):
    z = zipfile.ZipFile(path)
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        shared = ["".join(t.text or "" for t in si.iter(M + "t")) for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall(M + "si")]
    names = [s.get("name") for s in ET.fromstring(z.read("xl/workbook.xml")).iter(M + "sheet")]
    idx = names.index(sheet_name) + 1
    for row in ET.fromstring(z.read("xl/worksheets/sheet%d.xml" % idx)).iter(M + "row"):
        cells = {}
        for c in row.findall(M + "c"):
            col = "".join(ch for ch in c.get("r") if ch.isalpha())
            t, v = c.get("t"), c.find(M + "v")
            if t == "s" and v is not None:
                txt = shared[int(v.text)]
            elif t == "inlineStr":
                txt = "".join(x.text or "" for x in c.iter(M + "t"))
            else:
                txt = v.text if v is not None else ""
            cells[col] = (txt or "").strip()
        yield cells


def num(s):
    try:
        return round(float(s))
    except (TypeError, ValueError):
        return None  # "x" (unreliable), ".." or blank


def main(table, index, year, out):
    # Columns in Table 14.7a: A description, B code, C jobs (thousand), D median, F mean,
    # H 10th, J 25th, O 75th, Q 90th percentile.
    by_soc = {}
    for r in sheet_rows(table, "Full-Time"):
        code = r.get("B", "").lstrip("'")
        if not re.fullmatch(r"\d{4}", code):
            continue
        row = {"title": r.get("A", "").strip(), "jobsThousands": num(r.get("C")), "median": num(r.get("D")), "mean": num(r.get("F")),
               "p10": num(r.get("H")), "p25": num(r.get("J")), "p75": num(r.get("O")), "p90": num(r.get("Q"))}
        if row["median"] is not None:
            by_soc[code] = {k: v for k, v in row.items() if v is not None}

    # Coding index: G = SOC 2020 unit group, M = ISCO-08 code based on SOC 2020.
    pairs = Counter()
    rows = sheet_rows(index, "SOC2020 coding index")
    next(rows)
    for r in rows:
        soc, isco = r.get("G", ""), r.get("M", "")
        if re.fullmatch(r"\d{4}", soc) and re.fullmatch(r"\d{4}", isco):
            pairs[(isco, soc)] += 1
    isco_to_soc = defaultdict(list)
    totals = Counter()
    for (isco, soc), n in pairs.items():
        totals[isco] += n
    for (isco, soc), n in sorted(pairs.items(), key=lambda kv: (kv[0][0], -kv[1])):
        isco_to_soc[isco].append([soc, n, round(n / totals[isco], 3)])

    snap = {
        "meta": {
            "source": f"Office for National Statistics, Annual Survey of Hours and Earnings (ASHE) {year}, Table 14.7a: annual gross pay, full-time employees, by occupation (SOC 2020, 4-digit)",
            "attribution": "Source: Office for National Statistics licensed under the Open Government Licence v3.0.",
            "url": "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/occupation4digitsoc2010ashetable14",
            "licence": "Open Government Licence v3.0",
            "licenceUrl": "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
            "year": year,
            "currency": "GBP",
            "unit": "Annual gross pay, full-time employees (employees in the same job for at least 12 months)",
            "crosswalk": "SOC 2020 to ISCO-08 from the ONS SOC 2020 Volume 2 coding index: job titles per (ISCO-08, SOC 2020) pair; share = proportion of the ISCO group's titles",
            "builtAt": datetime.now(timezone.utc).isoformat(),
        },
        "bySoc": dict(sorted(by_soc.items())),
        "iscoToSoc": dict(sorted(isco_to_soc.items())),
    }
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        json.dump(snap, f, ensure_ascii=False)
    print(f"ASHE {year}: {len(by_soc)} SOC 2020 occupations with pay; {len(isco_to_soc)} ISCO-08 groups mapped")


if __name__ == "__main__":
    main(*sys.argv[1:5])
