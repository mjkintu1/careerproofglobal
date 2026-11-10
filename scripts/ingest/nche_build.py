"""Build Uganda's accredited institutions and programmes from the National Council for Higher Education.

Inputs (saved pages, robots.txt allows):
  data-raw/uganda/nche-institutions.html  https://unche.or.ug/institutions/
  data-raw/uganda/nche-programmes.html    https://unche.or.ug/all-academic-programs/
Output: packages/reference-data/src/snapshots/ug-nche.json
Usage: python -I scripts/ingest/nche_build.py <data-raw/uganda dir> <out.json>"""
import html, json, os, re, sys


def cells(row):
    return [html.unescape(re.sub(r"<[^>]+>", "", c)).strip() for c in re.findall(r"<td[^>]*>(.*?)</td>", row, re.S)]


def main(src, dst):
    inst_html = open(os.path.join(src, "nche-institutions.html"), encoding="utf-8").read()
    table = inst_html[inst_html.index('id="unche-table"'):]
    table = table[: table.index("</table>")]
    institutions = []
    for row in re.findall(r"<tr data-campus-template=\"unche-campus-(\d+)\">(.*?)</tr>", table, re.S):
        c = cells(row[1])
        if len(c) < 6:
            continue
        institutions.append({"id": int(row[0]), "name": c[0], "category": c[1], "status": c[2], "district": c[3],
                             "campuses": int(re.sub(r"\D", "", c[4]) or 0), "programmes": int(re.sub(r"\D", "", c[5]) or 0)})
    prog_html = open(os.path.join(src, "nche-programmes.html"), encoding="utf-8").read()
    records = json.loads(re.search(r"const records = (\[.*?\]);\s", prog_html, re.S).group(1))
    level = lambda l: "Bachelor's" if l == "Bachelor" else l
    programmes = [{"i": r["institution"], "p": r["programme"].strip(), "l": level(r["level"]), "d": r["tier_discipline"],
                   "a": r["accredited_date"], "e": r["expiry_date"], "s": r["status"]} for r in records]
    snap = {
        "meta": {
            "source": "National Council for Higher Education (NCHE), Uganda",
            "institutionsUrl": "https://unche.or.ug/institutions/",
            "programmesUrl": "https://unche.or.ug/all-academic-programs/",
            "checkedAt": "2026-11-10",
            "keys": {"i": "institution", "p": "programme", "l": "level", "d": "discipline", "a": "accredited (DD-MM-YYYY)", "e": "accreditation expires", "s": "status"},
        },
        "institutions": institutions,
        "programmes": programmes,
    }
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(snap, f, ensure_ascii=False, separators=(",", ":"))
    print("institutions", len(institutions), "programmes", len(programmes), "active", sum(p["s"] == "Active" for p in programmes))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
