"""O*NET 31.0: knowledge importance, related occupations and Job Zone descriptions.

Inputs: data-raw/onet-31.0/text/{Knowledge.txt, Related Occupations.txt, Job Zone Reference.txt}
        (from db_31_0_text.zip, O*NET Resource Center; CC BY 4.0)
Output: packages/reference-data/src/snapshots/onet-knowledge-related.json
Usage:  python -I scripts/ingest/onet_knowledge_build.py <text dir> <out.json>"""
import csv, json, os, sys


def rows(path):
    with open(path, encoding="utf-8", newline="") as f:
        yield from csv.DictReader(f, delimiter="\t")


def main(src, dst):
    # Knowledge: importance (IM, 1-5) per occupation and element; skip values O*NET recommends suppressing.
    elements, importance = {}, {}
    for r in rows(os.path.join(src, "Knowledge.txt")):
        if r["Scale ID"] != "IM" or r.get("Recommend Suppress") == "Y":
            continue
        elements.setdefault(r["Element ID"], r["Element Name"])
        importance.setdefault(r["O*NET-SOC Code"], {})[r["Element ID"]] = round(float(r["Data Value"]), 2)
    order = sorted(elements)
    by_code = {soc: [vals.get(e) for e in order] for soc, vals in importance.items()}

    # Related occupations: primary tiers only, in O*NET's order.
    related = {}
    for r in rows(os.path.join(src, "Related Occupations.txt")):
        if r["Relatedness Tier"].startswith("Primary"):
            related.setdefault(r["O*NET-SOC Code"], []).append((int(r["Index"]), r["Related O*NET-SOC Code"]))
    related = {k: [c for _, c in sorted(v)][:10] for k, v in related.items()}

    zones = {}
    for r in rows(os.path.join(src, "Job Zone Reference.txt")):
        zones[r["Job Zone"]] = {"name": r["Name"], "experience": r["Experience"], "education": r["Education"], "training": r["Job Training"]}

    snap = {
        "meta": {
            "source": "O*NET 31.0 Database (Knowledge, Related Occupations, Job Zone Reference)",
            "url": "https://www.onetcenter.org/database.html",
            "licence": "CC BY 4.0",
            "attribution": "This page includes information from the O*NET 31.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the CC BY 4.0 license. O*NET is a trademark of USDOL/ETA. CareerProof Global has modified all or some of this information; USDOL/ETA has not approved, endorsed, or tested these modifications.",
            "importanceScale": "1 (not important) to 5 (extremely important)",
        },
        "knowledgeElements": [{"id": e, "name": elements[e]} for e in order],
        "knowledge": by_code,
        "related": related,
        "jobZones": zones,
    }
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(snap, f, ensure_ascii=False, separators=(",", ":"))
    print("elements", len(order), "| occupations with knowledge", len(by_code), "| with related", len(related), "| job zones", list(zones))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
