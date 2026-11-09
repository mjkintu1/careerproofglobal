"""Build the UCAS Tariff snapshot used by the points calculator.

Input:  data-raw/ucas/tariff-may-2027_cycle-v1.1.4.1.xlsx (UCAS "2027 Tariff tables",
        https://www.ucas.com/applying/before-you-apply/what-and-where-to-study/entry-requirements/ucas-tariff-points)
Output: packages/reference-data/src/snapshots/ucas-tariff.json
Usage:  python -I scripts/ingest/ucas_tariff_build.py <xlsx> <out.json>
Reads cell values only (no formulas or macros). Standard library only."""
import json, sys, zipfile, xml.etree.ElementTree as ET

M = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

# (id, label, sheet, exact title in the workbook, display group)
WANTED = [
    ("a-level", "A level", "TARIFF POINTS", "A Level", "England, Wales and Northern Ireland"),
    ("as-level", "AS level", "TARIFF POINTS", "AS", "England, Wales and Northern Ireland"),
    ("epq", "Extended Project (EPQ)", "TARIFF POINTS", "Extended Project", "England, Wales and Northern Ireland"),
    ("ib-hl", "IB Diploma subject, Higher Level", "TARIFF POINTS", "IBO Certificate in Higher Level", "International Baccalaureate"),
    ("ib-sl", "IB Diploma subject, Standard Level", "TARIFF POINTS", "IBO Certificate in Standard Level", "International Baccalaureate"),
    ("ib-ee", "IB Extended Essay", "TARIFF POINTS", "IBO Certificate in Extended Essay", "International Baccalaureate"),
    ("ib-tok", "IB Theory of Knowledge", "TARIFF POINTS", "IBO Certificate in Theory of Knowledge (603/6253/4)", "International Baccalaureate"),
    ("sqa-higher", "Scottish Higher", "TARIFF SCOTLAND", "Scottish Higher", "Scotland"),
    ("sqa-adv-higher", "Scottish Advanced Higher", "TARIFF SCOTLAND", "Scottish Advanced Higher", "Scotland"),
    ("ie-lc-higher", "Irish Leaving Certificate, Higher Level", "IRISH LEAVING CERTIFICATE", "Leaving Certificate - Higher Level (Ireland) (first awarded in 2017)", "Ireland"),
    ("ie-lc-ordinary", "Irish Leaving Certificate, Ordinary Level", "IRISH LEAVING CERTIFICATE", "Leaving Certificate - Ordinary Level (Ireland) (first awarded in 2017)", "Ireland"),
]


def read_sheets(path):
    z = zipfile.ZipFile(path)
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall(M + "si"):
            shared.append("".join(t.text or "" for t in si.iter(M + "t")))
    names = [s.get("name") for s in ET.fromstring(z.read("xl/workbook.xml")).iter(M + "sheet")]
    sheets = {}
    for i, name in enumerate(names, 1):
        p = "xl/worksheets/sheet%d.xml" % i
        if p not in z.namelist():
            continue
        rows = []
        for row in ET.fromstring(z.read(p)).iter(M + "row"):
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
            rows.append(cells)
        sheets[name] = rows
    return sheets


def main(src, dst):
    sheets = read_sheets(src)
    out = []
    for qid, label, sheet, title, group in WANTED:
        rows = sheets[sheet]
        header = rows[0]
        col = {v: k for k, v in header.items()}
        tcol = col.get("Qualification Title") or col.get("Qualification/Programme Title")
        grades = [
            {"grade": r[col["Grade"]], "points": int(float(r[col["TARIFF POINTS"]]))}
            for r in rows[1:]
            if r.get(tcol, "") == title and r.get(col["Grade"])
        ]
        if not grades:
            raise SystemExit("not found: " + title)
        out.append({"id": qid, "label": label, "group": group, "officialTitle": title,
                    "sizeBand": rows[[i for i, r in enumerate(rows) if r.get(tcol) == title][0]].get(col["Size band"], ""),
                    "grades": grades})
    snap = {
        "source": "UCAS, 2027 Tariff tables (tariff-may-2027_cycle-v1.1.4.1.xlsx)",
        "url": "https://www.ucas.com/applying/before-you-apply/what-and-where-to-study/entry-requirements/ucas-tariff-points",
        "cycle": "2027 entry",
        "checkedAt": "2026-11-09",
        "notes": [
            "Points are taken unchanged from UCAS's published Tariff tables.",
            "The IB Diploma as a whole has no Tariff points; its components do. CAS has no Tariff points.",
        ],
        "qualifications": out,
    }
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(snap, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("qualifications:", len(out), "grades:", sum(len(q["grades"]) for q in out))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
