"""Canada pay by occupation from the Job Bank "Wages" open dataset (Employment and Social Development
Canada, Open Government Licence - Canada), national rows, linked to ISCO-08 through two official
Statistics Canada concordances: NOC 2016 V1.3 -> NOC 2021 V1.0, and NOC 2011 -> ISCO 2008 (StatCan:
NOC 2016 keeps the NOC 2011 structure). StatCan has not yet published NOC 2021 -> ISCO-08, so the link
is chained and labelled as such.
Inputs: data-raw/canada/wages2025.csv, noc16-21.csv, n11.html (StatCan NOC 2011 - ISCO 2008 page)
Usage: python -I scripts/ingest/canada_wages_build.py <wages.csv> <noc16-21.csv> <noc11-isco.html> <out.json>"""
import csv, html, json, re, sys
from collections import defaultdict
from datetime import datetime, timezone


def num(v):
    try:
        return round(float(v), 2)
    except (TypeError, ValueError):
        return None


def main(wages_path, n1621_path, n11_path, out):
    # NOC 2011 (= NOC 2016 structure) -> ISCO-08, with StatCan's partial-match flag.
    noc11_isco = defaultdict(list)
    current = None
    page = open(n11_path, encoding="utf-8").read()
    for row in re.findall(r"<tr[^>]*>(.*?)</tr>", page, re.S):
        cells = [html.unescape(re.sub(r"<[^>]+>", "", c)).replace("\xa0", " ").strip() for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", row, re.S)]
        if len(cells) == 6 and re.fullmatch(r"\d{4}", cells[0]):
            current = cells[0]
            partial, isco = cells[2], cells[3]
        elif len(cells) == 4 and current:
            partial, isco = cells[0], cells[1]
        else:
            continue
        if re.fullmatch(r"\d{4}", isco):
            noc11_isco[current].append({"isco": isco, "partial": partial == "*"})

    # NOC 2021 -> NOC 2016 (many to many).
    noc21_16 = defaultdict(set)
    with open(n1621_path, encoding="utf-8-sig") as f:
        for r in csv.reader(f):
            if len(r) >= 4 and re.fullmatch(r"\d{4}", r[0].strip()) and re.fullmatch(r"\d{5}", r[3].strip()):
                noc21_16[r[3].strip()].add(r[0].strip())

    by_noc = {}
    with open(wages_path, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r["prov"] != "NAT":
                continue
            code = r["NOC_CNP"].replace("NOC_", "")
            row = {
                "title": r["NOC_Title_eng"],
                "period": "year" if r["Annual_Wage_Flag_Salaire_annuel"].strip() == "1" else "hour",
                "low": num(r["Low_Wage_Salaire_Minium"]), "q1": num(r["Quartile1_Wage_Salaire_Quartile1"]),
                "median": num(r["Median_Wage_Salaire_Median"]), "q3": num(r["Quartile3_Wage_Salaire_Quartile3"]),
                "high": num(r["High_Wage_Salaire_Maximal"]), "mean": num(r["Average_Wage_Salaire_Moyen"]),
                "reference": r["Reference_Period"], "dataSource": r["Data_Source_E"],
            }
            if row["median"] is not None:
                by_noc[code] = {k: v for k, v in row.items() if v not in (None, "")}

    isco_noc = defaultdict(list)
    for noc21 in by_noc:
        seen = set()
        for noc16 in sorted(noc21_16.get(noc21, [])):
            for m in noc11_isco.get(noc16, []):
                key = (m["isco"], noc21)
                if key in seen:
                    continue
                seen.add(key)
                isco_noc[m["isco"]].append({"noc": noc21, "partial": m["partial"]})
    for lst in isco_noc.values():
        lst.sort(key=lambda x: (x["partial"], x["noc"]))

    snap = {
        "meta": {
            "source": "Employment and Social Development Canada, Job Bank Wages open data (2025 release), national figures by NOC 2021 occupation",
            "attribution": "Contains information licensed under the Open Government Licence - Canada (Job Bank wages, Employment and Social Development Canada).",
            "url": "https://open.canada.ca/data/dataset/adad580f-76b0-4502-bd05-20c125de9116",
            "licence": "Open Government Licence - Canada",
            "licenceUrl": "https://open.canada.ca/en/open-government-licence-canada",
            "currency": "CAD",
            "fields": "low, q1, median, q3, high, mean; 'period' is hour or year as Job Bank publishes it. Job Bank defines low and high wages as the 10th and 90th percentiles.",
            "crosswalk": "NOC 2021 -> NOC 2016 V1.3 (StatCan) -> ISCO-08 via StatCan NOC 2011 - ISCO 2008 (NOC 2016 keeps the NOC 2011 structure). Chained; StatCan's own NOC 2021 - ISCO-08 table is not yet published.",
            "builtAt": datetime.now(timezone.utc).isoformat(),
        },
        "byNoc": dict(sorted(by_noc.items())),
        "iscoToNoc": dict(sorted(isco_noc.items())),
    }
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        json.dump(snap, f, ensure_ascii=False)
    print(f"Canada: {len(by_noc)} NOC 2021 occupations with pay; {len(isco_noc)} ISCO-08 groups linked; {len(noc11_isco)} NOC 2011 codes in concordance")


if __name__ == "__main__":
    main(*sys.argv[1:5])
