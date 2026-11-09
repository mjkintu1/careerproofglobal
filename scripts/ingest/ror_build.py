"""Build a compact institution snapshot from the ROR data dump (CSV inside the zip).
Keeps active organisations of type 'education'. ROR data is CC0.
Usage: python -I ror_build.py <ror-data.zip> <out.json>"""
import csv
import io
import json
import sys
import zipfile
from collections import Counter

src, out = sys.argv[1], sys.argv[2]
z = zipfile.ZipFile(src)
name = [n for n in z.namelist() if n.endswith(".csv")][0]
version = name.split("-ror-data")[0]


def strip_lang(v):
    """'en: Foo; fr: Bar' -> first value without its language prefix."""
    first = v.split(";")[0].strip()
    return first.split(":", 1)[1].strip() if ":" in first else first


by_country = {}
types = Counter()
with z.open(name) as f:
    for r in csv.DictReader(io.TextIOWrapper(f, encoding="utf-8")):
        if r["status"] != "active" or "education" not in r["types"].split(";"):
            continue
        cc = r["locations.geonames_details.country_code"].split(";")[0].strip()
        if len(cc) != 2:
            continue
        types[r["types"]] += 1
        by_country.setdefault(cc, []).append([
            r["id"].rsplit("/", 1)[-1],                                     # ROR id suffix
            r["names.types.ror_display"].strip(),                           # display name
            strip_lang(r["names.types.acronym"]) if r["names.types.acronym"] else "",
            r["locations.geonames_details.name"].split(";")[0].strip(),     # city
            r["links.type.website"].split(";")[0].strip(),                  # website
            r["established"].strip(),                                       # year founded
        ])
for cc in by_country:
    by_country[cc].sort(key=lambda x: x[1].lower())

meta = {
    "source": f"Research Organization Registry (ROR) data dump {version}",
    "attribution": "Institution data from the Research Organization Registry (ROR), released under CC0.",
    "url": "https://ror.org/",
    "doi": "https://doi.org/10.5281/zenodo.23500708",
    "licence": "CC0 1.0",
    "fields": ["rorId", "name", "acronym", "city", "website", "established"],
    "filter": "status = active and types include education",
}
with open(out, "w", encoding="utf-8") as fh:
    json.dump({"meta": meta, "byCountry": by_country}, fh, ensure_ascii=False, separators=(",", ":"))
total = sum(len(v) for v in by_country.values())
print(f"{total} education institutions in {len(by_country)} countries")
print("top countries:", ", ".join(f"{cc} {len(v)}" for cc, v in sorted(by_country.items(), key=lambda x: -len(x[1]))[:8]))
for cc in ["UG", "KE", "NG", "GH", "ZA", "RW", "TZ", "IN", "GB", "US"]:
    print(cc, len(by_country.get(cc, [])), end=" | ")
