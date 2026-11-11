"""Kenya statutory minimum wages from the Regulation of Wages (General) (Amendment) Order, 2026
(Legal Notice No. 108, Kenya Gazette Supplement No. 160, 26 June 2026; in force from 1 May 2026).

Input: pdftotext -table output of the official PDF (data-raw/kenya-pay/ln108-table.txt), supplied by
the project owner. Kenya Law sets content-signal ai-input=no, so our tools do not fetch it.
The numbers are read from the PDF text in order (15 rows, 9 values each); the occupation wording is
copied from the Schedule. ISCO-08 codes and career links are CareerProof Global's mapping.
Usage: python -I scripts/ingest/ke_wages_build.py <ln108-table.txt> <out.json>"""
import json, re, sys

NUM = r"\d{1,3}(?:,\d{3})*\.\d{2}"
ROWS = [
    ("General labourer, including cleaner, sweeper, gardener, children's ayah, house servant, day watchman, messenger", ["9112", "9111", "9214", "5311", "9621", "5414"], []),
    ("Miner, stone cutter, turnboy, waiter, cook, logger, line cutter", ["8111", "7113", "5131", "5120", "6210"], ["chef"]),
    ("Night watchman", ["5414"], []),
    ("Machine attendant, sawmill sawyer, machine assistant, mass production machinist, shoe cutter, bakery worker, bakery assistant, tailor's assistant", ["8172", "8153", "8160", "7536"], []),
    ("Machinist (made to measure), shoe upper preparer, chaplis maker, vehicle service worker (petrol and service stations), bakery plant hand, laundry operator, junior clerk, wheel tractor driver (light)", ["7536", "8157", "4110", "8341"], []),
    ("Printing machine operator, bakery machine operator, plywood machine operator, sawmill dresser, shop assistant, machine tool operator, dough maker, table hand baker or confectioner, copy typist, driver (cars and light vans)", ["7322", "5223", "7223", "7512", "4131", "8322"], []),
    ("Pattern designer (draughtsman), garment and dress cutter, single hand oven man, charge-hand baker, general clerk, telephone operator, receptionist, storekeeper", ["7532", "4110", "4223", "4226", "4321"], []),
    ("Tailor, driver (medium sized vehicle)", ["7531", "8332"], []),
    ("Dyer, crawler tractor driver, salesman", ["8342", "5243"], []),
    ("Saw doctor, caretaker (buildings)", ["5153"], []),
    ("Cashier, driver (heavy commercial vehicles), salesman driver", ["5230", "8332"], []),
    ("Ungraded artisan", ["7411", "7126", "7115", "7212"], ["electrician", "plumber", "carpenter", "welder"]),
    ("Artisan Grade III", ["7411", "7126", "7115", "7212"], ["electrician", "plumber", "carpenter", "welder"]),
    ("Artisan Grade II", ["7411", "7126", "7115", "7212"], ["electrician", "plumber", "carpenter", "welder"]),
    ("Artisan Grade I", ["7411", "7126", "7115", "7212"], ["electrician", "plumber", "carpenter", "welder"]),
]
AREAS = ["Nairobi, Mombasa, Kisumu, Nakuru and Eldoret cities", "Former municipalities and town councils of Mavoko, Ruiru and Limuru", "All other areas"]


def main(src, out):
    values = []
    for line in open(src, encoding="utf-8", errors="replace"):
        nums = re.findall(NUM, line)
        if len(nums) == 9:
            values.append([float(n.replace(",", "")) for n in nums])
    if len(values) != len(ROWS):
        raise SystemExit(f"expected {len(ROWS)} rows of 9 values, found {len(values)}")
    rows = []
    for i, ((occ, isco, careers), v) in enumerate(zip(ROWS, values), 1):
        rows.append({"no": i, "occupation": occ, "isco": isco, "careers": careers,
                     "areas": [{"area": AREAS[a], "monthly": v[a * 3], "daily": v[a * 3 + 1], "hourly": v[a * 3 + 2]} for a in range(3)]})
    snap = {
        "meta": {
            "country": "KE",
            "source": "Regulation of Wages (General) (Amendment) Order, 2026, Legal Notice No. 108 (Kenya Gazette Supplement No. 160, 26 June 2026), made under section 46 of the Labour Institutions Act",
            "attribution": "Source: Regulation of Wages (General) (Amendment) Order, 2026 (Legal Notice No. 108 of 2026), Republic of Kenya.",
            "url": "https://kenyalaw.org/akn/ke/act/ln/2026/108/eng@2026-06-26",
            "inForceFrom": "2026-05-01",
            "currency": "KES",
            "unit": "Basic minimum monthly wage, exclusive of housing allowance; daily and hourly rates inclusive of housing allowance",
            "mapping": "ISCO-08 codes and career links are CareerProof Global's reading of the occupations named in the Schedule.",
            "transcription": "Values read from the text layer of the official PDF supplied by the project owner; printed figures kept as published.",
        },
        "rows": rows,
    }
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        json.dump(snap, f, ensure_ascii=False, indent=1)
    print(f"Kenya minimum wages: {len(rows)} occupation rows x {len(AREAS)} areas")


if __name__ == "__main__":
    main(*sys.argv[1:3])
