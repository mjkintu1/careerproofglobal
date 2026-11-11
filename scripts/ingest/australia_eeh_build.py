"""Australia pay by occupation from the ABS Employee Earnings and Hours, May 2025 (63060DO011:
average weekly total cash earnings by ANZSCO 4-digit occupation, all employees, persons), with ABS's
standard errors used to drop estimates with relative standard error above 25%. Linked to ISCO-08 with
the ABS ANZSCO 2021 correspondence (Table 4: 2021 Australian Update to ISCO-08), rolled up from 6-digit
occupations to 4-digit unit groups. ABS material is licensed CC BY 4.0.
Inputs: data-raw/australia/eeh11.xlsx, data-raw/australia/anzsco21-corr.xlsx
Usage: python -I scripts/ingest/australia_eeh_build.py <eeh11.xlsx> <corr.xlsx> <out.json>"""
import json, re, sys, zipfile, xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from datetime import datetime, timezone

M = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
MAX_RSE = 0.25


def sheet(path, name):
    z = zipfile.ZipFile(path)
    shared = ["".join(t.text or "" for t in si.iter(M + "t")) for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall(M + "si")] if "xl/sharedStrings.xml" in z.namelist() else []
    names = [s.get("name") for s in ET.fromstring(z.read("xl/workbook.xml")).iter(M + "sheet")]
    for row in ET.fromstring(z.read("xl/worksheets/sheet%d.xml" % (names.index(name) + 1))).iter(M + "row"):
        cells = {}
        for c in row.findall(M + "c"):
            col = "".join(ch for ch in c.get("r") if ch.isalpha())
            v, t = c.find(M + "v"), c.get("t")
            cells[col] = (shared[int(v.text)] if t == "s" and v is not None else (v.text if v is not None else "")).strip()
        yield cells


def num(s):
    try:
        return float(s)
    except (TypeError, ValueError):
        return None


def main(eeh, corr, out):
    est = {}
    for r in sheet(eeh, "Table_1"):
        m = re.match(r"(\d{4}) (.+)", r.get("A", ""))
        if m and num(r.get("D")) is not None:
            est[m.group(1)] = (m.group(2).strip(), num(r["D"]))
    se = {}
    for r in sheet(eeh, "Table_2"):
        m = re.match(r"(\d{4}) ", r.get("A", ""))
        if m and num(r.get("D")) is not None:
            se[m.group(1)] = num(r["D"])
    by_anzsco, dropped = {}, 0
    for code, (title, mean) in est.items():
        rse = se.get(code, 0) / mean if mean else 1
        if rse > MAX_RSE:
            dropped += 1
            continue
        by_anzsco[code] = {"title": title, "weeklyMean": round(mean, 1), "rse": round(rse, 3)}

    # Table 4: 6-digit ANZSCO 2021 -> ISCO-08 (rows continue under the last 6-digit code).
    links = defaultdict(Counter)
    current = None
    for r in sheet(corr, "Table 4"):
        a, c = r.get("A", ""), r.get("C", "")
        if re.fullmatch(r"\d{6}", a):
            current = a
        if current and re.fullmatch(r"\d{4}", c):
            links[c][current[:4]] += 1
    isco_to_anzsco = {isco: [[a4, n] for a4, n in cnt.most_common() if a4 in by_anzsco] for isco, cnt in sorted(links.items())}
    isco_to_anzsco = {k: v for k, v in isco_to_anzsco.items() if v}

    snap = {
        "meta": {
            "source": "Australian Bureau of Statistics, Employee Earnings and Hours, Australia, May 2025 (63060DO011): average weekly total cash earnings by occupation (ANZSCO 4-digit), all employees",
            "attribution": "Source: Australian Bureau of Statistics, Employee Earnings and Hours, Australia, May 2025. Licensed CC BY 4.0.",
            "url": "https://www.abs.gov.au/statistics/labour/earnings-and-working-conditions/employee-earnings-and-hours-australia/may-2025",
            "licence": "CC BY 4.0",
            "currency": "AUD",
            "unit": "Average weekly total cash earnings, all employees (full-time and part-time), persons",
            "quality": f"Estimates with relative standard error above {int(MAX_RSE * 100)}% are left out ({dropped} occupations).",
            "crosswalk": "ABS ANZSCO 2021 correspondence, Table 4 (2021 Australian Update to ISCO-08), rolled up to 4-digit; links ranked by the number of 6-digit occupations.",
            "builtAt": datetime.now(timezone.utc).isoformat(),
        },
        "byAnzsco": dict(sorted(by_anzsco.items())),
        "iscoToAnzsco": isco_to_anzsco,
    }
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        json.dump(snap, f, ensure_ascii=False)
    print(f"Australia: {len(by_anzsco)} ANZSCO occupations kept ({dropped} dropped for RSE); {len(isco_to_anzsco)} ISCO-08 groups linked")


if __name__ == "__main__":
    main(*sys.argv[1:4])
