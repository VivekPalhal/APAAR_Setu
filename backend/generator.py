"""APAAR Setu synthetic data generator.

Builds a SQLite database with 1M+ student-level enrolment rows across ~1,600
institutions, and plants realistic problems for the demo:
  * programmes that exceed approved intake
  * students active at two institutions (and legitimate transfers, which must NOT be flagged)
  * institutions with unusually many invalid APAAR IDs
  * institutions with a suspicious NRI / spot-round mix (no single rule catches these; ML does)

Usage:  python generator.py [target_rows] [db_path]
"""
import sqlite3, sys, time, os
import numpy as np

CITY_STATE = [
    ("Pune", "Maharashtra"), ("Nagpur", "Maharashtra"), ("Nashik", "Maharashtra"), ("Mumbai", "Maharashtra"),
    ("Bengaluru", "Karnataka"), ("Mysuru", "Karnataka"), ("Hubballi", "Karnataka"), ("Chennai", "Tamil Nadu"),
    ("Coimbatore", "Tamil Nadu"), ("Madurai", "Tamil Nadu"), ("Hyderabad", "Telangana"), ("Warangal", "Telangana"),
    ("Vijayawada", "Andhra Pradesh"), ("Visakhapatnam", "Andhra Pradesh"), ("Kochi", "Kerala"), ("Thrissur", "Kerala"),
    ("Jaipur", "Rajasthan"), ("Kota", "Rajasthan"), ("Jodhpur", "Rajasthan"), ("Lucknow", "Uttar Pradesh"),
    ("Kanpur", "Uttar Pradesh"), ("Noida", "Uttar Pradesh"), ("Varanasi", "Uttar Pradesh"), ("Delhi", "Delhi"),
    ("Gurugram", "Haryana"), ("Ambala", "Haryana"), ("Chandigarh", "Chandigarh"), ("Ludhiana", "Punjab"),
    ("Amritsar", "Punjab"), ("Ahmedabad", "Gujarat"), ("Surat", "Gujarat"), ("Vadodara", "Gujarat"),
    ("Bhopal", "Madhya Pradesh"), ("Indore", "Madhya Pradesh"), ("Raipur", "Chhattisgarh"), ("Patna", "Bihar"),
    ("Ranchi", "Jharkhand"), ("Kolkata", "West Bengal"), ("Durgapur", "West Bengal"), ("Bhubaneswar", "Odisha"),
    ("Guwahati", "Assam"), ("Dehradun", "Uttarakhand"), ("Shimla", "Himachal Pradesh"), ("Panaji", "Goa"),
]
KINDS = [
    ("{c} Institute of Technology", "eng"), ("{c} College of Engineering", "eng"), ("{c} Institute of Management Studies", "mgmt"),
    ("{c} School of Business", "mgmt"), ("{c} Government Polytechnic", "poly"), ("{c} Institute of Computer Applications", "mca"),
    ("{c} University Institute of Technology", "eng"),
]
PREFIX = ["", "", "", "Shri ", "Government ", "National ", "Dr. ", "Sri ", "St. ", "Maharaja "]
PROGS = {
    "eng": [("B.Tech CSE", 1.0), ("B.Tech ECE", .8), ("B.Tech Mechanical", .7), ("B.Tech Civil", .6), ("B.Tech IT", .8), ("M.Tech CSE", .2)],
    "mgmt": [("MBA", 1.0), ("PGDM", 1.0), ("PGDM Finance", .5)],
    "poly": [("Diploma CSE", 1.0), ("Diploma Mechanical", .9), ("Diploma Electrical", .8), ("Diploma Civil", .8)],
    "mca": [("MCA", 1.0), ("BCA", .8)],
}
DEMO_CODE = "1-100001"


def luhn_check_digits(bodies: np.ndarray) -> np.ndarray:
    """Vectorised Luhn check digit for 11-digit integer bodies (prototype checksum)."""
    s = np.zeros(bodies.shape, dtype=np.int64)
    b = bodies.copy()
    for pos in range(11):          # rightmost body digit first; it gets doubled
        d = b % 10
        b //= 10
        if pos % 2 == 0:
            d = d * 2
            d = np.where(d > 9, d - 9, d)
        s += d
    return (10 - s % 10) % 10


def luhn_valid(apaar: str) -> bool:
    if len(apaar) != 12 or not apaar.isdigit():
        return False
    s = 0
    for i, ch in enumerate(reversed(apaar)):
        d = int(ch)
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        s += d
    return s % 10 == 0


def make_apaar(i: np.ndarray) -> np.ndarray:
    body = 10**10 + (i * 2654435761) % 90_000_000_000   # injective, 11 digits
    return body * 10 + luhn_check_digits(body)


def build(db_path: str, target: int = 1_000_000, seed: int = 7, log=print):
    t0 = time.time()
    rng = np.random.default_rng(seed)
    if os.path.exists(db_path):
        os.remove(db_path)
    db = sqlite3.connect(db_path)
    db.executescript("""
    PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;
    CREATE TABLE institutions(id INTEGER PRIMARY KEY, code TEXT, name TEXT, city TEXT, state TEXT, kind TEXT);
    CREATE TABLE programmes(id INTEGER PRIMARY KEY, inst_id INT, name TEXT, approved_intake INT);
    CREATE TABLE enrolments(id INTEGER PRIMARY KEY, apaar TEXT, inst_id INT, prog_id INT, year TEXT,
        cycle TEXT, seat TEXT, status TEXT, gender TEXT, valid INT);
    """)

    # ---- institutions & programmes -------------------------------------------------
    inst_rows, prog_rows, plans = [], [], []
    planned, iid, pid = 0, 0, 0
    used_names = {}
    special = {}   # inst_id -> profile
    while planned < target * 1.0:
        iid += 1
        city, state = CITY_STATE[rng.integers(len(CITY_STATE))]
        tmpl, kind = KINDS[rng.integers(len(KINDS))]
        if iid == 1:
            city, state, tmpl, kind = "Pune", "Maharashtra", "{c} Institute of Technology", "eng"
        name = PREFIX[rng.integers(len(PREFIX))] + tmpl.format(c=city)
        used_names[name] = used_names.get(name, 0) + 1
        if used_names[name] > 1:
            name += f" ({['II','III','IV','V','VI','VII'][min(used_names[name]-2, 5)]})"
        code = DEMO_CODE if iid == 1 else f"1-{100000 + iid * 37}"
        inst_rows.append((iid, code, name, city, state, kind))
        plist = PROGS[kind]
        n_prog = min(len(plist), int(rng.integers(3, 7)))
        chosen = rng.choice(len(plist), size=n_prog, replace=False) if iid != 1 else np.arange(n_prog)
        scale = rng.choice([0.6, 1.0, 1.0, 1.4, 2.2])
        for ci in chosen:
            pname, w = plist[ci]
            intake = int(max(30, round(rng.choice([30, 60, 60, 90, 120, 120, 180, 240]) * scale * w / 30) * 30))
            if iid == 1 and pname == "B.Tech CSE":
                intake = 120
            pid += 1
            prog_rows.append((pid, iid, pname, intake))
            plans.append([pid, iid, intake, float(np.clip(rng.normal(0.84, 0.08), 0.45, 0.97))])
            planned += intake * plans[-1][3]
    n_inst = iid
    # profiles
    pool = rng.permutation(np.arange(2, n_inst + 1))
    over_insts = set(pool[:9].tolist())
    ml_insts = set(pool[9:15].tolist())
    inv_insts = set(pool[15:20].tolist())
    for p in plans:
        if p[1] in over_insts and rng.random() < 0.45:
            p[3] = float(rng.uniform(1.12, 1.42))
        if p[1] in ml_insts:
            p[3] = float(rng.uniform(0.985, 1.0))
        if p[1] == 1 and prog_rows[p[0] - 1][2] == "B.Tech CSE":
            p[3] = 0.9           # 108 of 120 seats used -> demo upload tips it over
    if not any(p[3] > 1 for p in plans if p[1] in over_insts):          # guarantee at least a few
        for p in [q for q in plans if q[1] in over_insts][:3]:
            p[3] = 1.25

    # ---- enrolments ------------------------------------------------------------------
    prog_id, inst_id, seat, cycle, status, valid_flag, gender = [], [], [], [], [], [], []
    for pid_, iid_, intake, fill in plans:
        n = int(round(intake * fill))
        nsup = int(min(np.floor(0.05 * intake), rng.binomial(intake, 0.03)))
        if iid_ in ml_insts:
            ps, pc = [0.55, 0.0, 0.0], 0.0
            nri_p, oci_p, fn_p, spot_p = 0.28, 0.05, 0.03, 0.26
        else:
            nri_p, oci_p, fn_p, spot_p = 0.015, 0.005, 0.003, 0.04
        probs = np.array([1 - nri_p - oci_p - fn_p, nri_p, oci_p, fn_p])
        sk = rng.choice(["Regular", "NRI", "OCI", "FN"], size=n, p=probs / probs.sum())
        ck = np.where(rng.random(n) < spot_p, "Spot", np.where(rng.random(n) < 0.05, "Lateral", "Annual"))
        seat.append(np.concatenate([sk, np.full(nsup, "Supernumerary")]))
        cycle.append(np.concatenate([ck, np.full(nsup, "Annual")]))
        tot = n + nsup
        prog_id.append(np.full(tot, pid_)); inst_id.append(np.full(tot, iid_))
    prog_id = np.concatenate(prog_id); inst_id = np.concatenate(inst_id)
    seat = np.concatenate(seat); cycle = np.concatenate(cycle)
    N = len(prog_id)
    status = np.where(rng.random(N) < 0.985, "Active", np.where(rng.random(N) < 0.5, "Withdrawn", "Transferred"))
    gender = rng.choice(["M", "F", "O"], size=N, p=[0.58, 0.415, 0.005])
    apaar_i = rng.permutation(N).astype(np.int64) + 1
    apaar = make_apaar(apaar_i)
    valid = np.ones(N, dtype=np.int8)

    # invalid IDs: sprinkled at 0.12%, and a lot more at planted institutions
    p_inv = np.where(np.isin(inst_id, list(inv_insts)), 0.045, 0.0012)
    bad = rng.random(N) < p_inv
    apaar = np.where(bad, apaar - apaar % 10 + (apaar % 10 + rng.integers(1, 10, N)) % 10, apaar)
    valid[bad] = 0
    status[bad] = "Active"

    # planted cross-institution duplicates (both rows Active)
    cand = np.where((status == "Active") & (valid == 1) & (seat == "Regular") & (inst_id != 1))[0]
    dsrc = rng.choice(cand, size=420, replace=False)
    # legitimate transfers (old row Transferred, new row Active): must NOT be flagged
    tsrc = rng.choice(np.setdiff1d(cand, dsrc), size=240, replace=False)
    status[tsrc] = "Transferred"
    extra_src = np.concatenate([dsrc, tsrc])
    # destination: random other programme from a non-planted institution (keeps over-intake story clean)
    safe_progs = np.array([p[0] for p in plans if p[1] not in over_insts and p[1] != 1 and p[1] not in ml_insts])
    dst = rng.choice(safe_progs, size=len(extra_src))
    pinst = np.array([0] + [p[1] for p in plans])
    keep = pinst[dst] != inst_id[extra_src]
    extra_src, dst = extra_src[keep], dst[keep]
    prog_id = np.concatenate([prog_id, dst]); inst_id = np.concatenate([inst_id, pinst[dst]])
    seat = np.concatenate([seat, np.full(len(dst), "Regular")]); cycle = np.concatenate([cycle, np.full(len(dst), "Lateral")])
    status = np.concatenate([status, np.full(len(dst), "Active")]); gender = np.concatenate([gender, gender[extra_src]])
    apaar = np.concatenate([apaar, apaar[extra_src]]); valid = np.concatenate([valid, np.ones(len(dst), dtype=np.int8)])
    N = len(prog_id)

    log(f"generated {N:,} rows for {n_inst:,} institutions in {time.time()-t0:.1f}s; inserting...")
    apaar_s = apaar.astype(str).tolist()
    db.executemany("INSERT INTO institutions VALUES (?,?,?,?,?,?)", inst_rows)
    db.executemany("INSERT INTO programmes VALUES (?,?,?,?)", prog_rows)
    db.executemany(
        "INSERT INTO enrolments(apaar,inst_id,prog_id,year,cycle,seat,status,gender,valid) VALUES (?,?,?,?,?,?,?,?,?)",
        zip(apaar_s, inst_id.tolist(), prog_id.tolist(), ["2025-26"] * N, cycle.tolist(), seat.tolist(),
            status.tolist(), gender.tolist(), valid.tolist()))
    db.execute("CREATE INDEX ix_apaar ON enrolments(apaar)")
    db.execute("CREATE INDEX ix_inst ON enrolments(inst_id)")
    db.execute("CREATE INDEX ix_prog ON enrolments(prog_id)")
    db.commit(); db.close()
    log(f"done: {N:,} rows, db at {db_path} ({time.time()-t0:.1f}s)")
    return N


if __name__ == "__main__":
    target = int(sys.argv[1]) if len(sys.argv) > 1 else 1_000_000
    path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "apaarsetu.db")
    build(path, target)
