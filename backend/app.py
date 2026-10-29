"""APAAR Setu prototype backend (FastAPI).

Run:  uvicorn app:app --port 8000      (first start generates ~1M rows, ~15 s)
"""
import os, io, re, csv, json, time, uuid, base64, hashlib, sqlite3, threading
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import HTMLResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature
import segno
import generator

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.environ.get("APAARSETU_DB", os.path.join(HERE, "apaarsetu.db"))
ISSUER = "did:web:apaarsetu.aicte.gov.in"
app = FastAPI(title="APAAR Setu prototype")

# ------------------------------------------------------------------ helpers
def q(sql, params=(), one=False):
    con = sqlite3.connect(DB)
    try:
        cur = con.execute(sql, params)
        rows = cur.fetchall()
        cols = [c[0] for c in cur.description] if cur.description else []
        return (rows[0] if rows else None) if one else rows
    finally:
        con.close()

def b64u(b: bytes) -> str: return base64.urlsafe_b64encode(b).rstrip(b"=").decode()
def unb64u(s: str) -> bytes: return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))
def now() -> int: return int(time.time())
def fmt_apaar(a: str) -> str: return f"{a[:4]} {a[4:8]} {a[8:]}"

FIRST = ["Aarav","Ananya","Vihaan","Diya","Aditya","Isha","Arjun","Kavya","Rohan","Meera","Sai","Priya","Karan","Neha","Ishaan","Riya","Yash","Sneha","Dev","Pooja"]
LAST = ["Sharma","Patil","Reddy","Iyer","Khan","Singh","Nair","Das","Joshi","Gupta","Mehta","Kulkarni","Verma","Rao","Bose","Menon"]
def name_for(apaar: str) -> str:
    h = int(hashlib.sha256(apaar.encode()).hexdigest(), 16)
    return f"{FIRST[h % len(FIRST)]} {LAST[(h // 7) % len(LAST)]}"

# ------------------------------------------------------------------ keys, audit, credentials
KEY = Ed25519PrivateKey.generate()
PUB_RAW = KEY.public_key().public_bytes(serialization.Encoding.Raw, serialization.PublicFormat.Raw)
REVOKED, ISSUED = set(), []          # ISSUED: consent ledger entries
AUDIT, _alock = [], threading.Lock()

def audit(actor, action, obj="", detail=""):
    with _alock:
        prev = AUDIT[-1]["hash"] if AUDIT else "0" * 64
        e = {"seq": len(AUDIT) + 1, "at": now(), "actor": actor, "action": action, "object": obj, "detail": detail, "prev": prev}
        e["hash"] = hashlib.sha256((prev + json.dumps({k: e[k] for k in ("seq", "at", "actor", "action", "object", "detail")}, sort_keys=True)).encode()).hexdigest()
        AUDIT.append(e)

def audit_ok():
    prev = "0" * 64
    for e in AUDIT:
        h = hashlib.sha256((prev + json.dumps({k: e[k] for k in ("seq", "at", "actor", "action", "object", "detail")}, sort_keys=True)).encode()).hexdigest()
        if e["prev"] != prev or e["hash"] != h: return False
        prev = h
    return True

# ------------------------------------------------------------------ analytics at startup
S = {}            # computed state
ANOMS = []        # anomaly list (mutable status)
BATCHES = {}

def compute():
    t0 = time.time()
    inst = q("""SELECT i.id,i.code,i.name,i.state,COUNT(e.id),
        SUM(e.seat='NRI'),SUM(e.seat='Supernumerary'),SUM(e.cycle='Spot'),SUM(e.valid=0)
        FROM institutions i JOIN enrolments e ON e.inst_id=i.id WHERE e.status='Active' GROUP BY i.id""")
    intake = dict(q("SELECT inst_id,SUM(approved_intake) FROM programmes GROUP BY inst_id"))
    nprog = dict(q("SELECT inst_id,COUNT(*) FROM programmes GROUP BY inst_id"))
    over = q("""SELECT p.id,p.inst_id,p.name,p.approved_intake,SUM(e.seat!='Supernumerary') c FROM programmes p
        JOIN enrolments e ON e.prog_id=p.id WHERE e.status='Active' GROUP BY p.id HAVING c>p.approved_intake""")
    dups = q("""SELECT apaar,COUNT(DISTINCT inst_id) c FROM enrolments WHERE status='Active' AND valid=1
        GROUP BY apaar HAVING c>1""")
    dup_set = [d[0] for d in dups]
    dup_by_inst, dup_samples = {}, []
    for i in range(0, len(dup_set), 500):
        chunk = dup_set[i:i + 500]
        for a, ii, nm in q(f"""SELECT e.apaar,e.inst_id,i.name FROM enrolments e JOIN institutions i ON i.id=e.inst_id
              WHERE e.status='Active' AND e.apaar IN ({','.join('?'*len(chunk))})""", chunk):
            dup_by_inst[ii] = dup_by_inst.get(ii, 0) + 1
            dup_samples.append((a, ii, nm))
    over_by_inst = {}
    for r in over: over_by_inst[r[1]] = over_by_inst.get(r[1], 0) + 1

    ids = np.array([r[0] for r in inst])
    n = np.array([r[4] for r in inst], float)
    sup = np.array([r[6] for r in inst], float)
    reg = np.maximum(n - sup, 1)
    itk = np.array([intake[i] for i in ids], float)
    F = {
        "fill_ratio": reg / itk,
        "nri_share": np.array([r[5] for r in inst]) / n,
        "supernumerary_share": sup / n,
        "spot_round_share": np.array([r[7] for r in inst]) / n,
        "invalid_id_rate": np.array([r[8] for r in inst]) / n,
        "duplicate_rate": np.array([dup_by_inst.get(i, 0) for i in ids]) / n,
    }
    names = list(F)
    X = np.column_stack([F[k] for k in names])
    med = np.median(X, 0); mad = np.median(np.abs(X - med), 0) * 1.4826 + 1e-6
    Z = (X - med) / mad
    iso = IsolationForest(n_estimators=200, random_state=0, contamination="auto").fit(np.clip(Z, -12, 12))
    raw = -iso.score_samples(np.clip(Z, -12, 12))
    p50 = np.median(raw); score = np.clip((raw - p50) / (raw.max() - p50 + 1e-9) * 100, 0, 100)

    trust, rows = {}, {}
    for k, r in enumerate(inst):
        i = r[0]
        c_valid = 100 - min(100, F["invalid_id_rate"][k] * 1500)
        c_intake = 100 - min(100, over_by_inst.get(i, 0) / nprog[i] * 300 + max(0, F["fill_ratio"][k] - 1) * 200)
        c_ident = 100 - min(100, F["duplicate_rate"][k] * 8000)
        c_behav = 100 - score[k]
        comps = {"ID validity": c_valid, "Intake discipline": c_intake, "Identity integrity": c_ident, "Pattern normality": c_behav}
        w = {"ID validity": .25, "Intake discipline": .30, "Identity integrity": .20, "Pattern normality": .25}
        t = sum(comps[c] * w[c] for c in comps)
        trust[i] = {"score": round(t), "components": {c: round(v) for c, v in comps.items()}}
        rows[i] = {"id": i, "code": r[1], "name": r[2], "state": r[3], "students": int(n[k]), "intake": int(itk[k]),
                   "fill": round(float(F["fill_ratio"][k]), 3), "trust": round(t), "ml": round(float(score[k])),
                   "over": over_by_inst.get(i, 0), "dups": dup_by_inst.get(i, 0), "invalid": int(r[8])}
    S.update(inst=rows, trust=trust, F=F, ids=ids, names=names, med=med, mad=mad, Z=Z, score=score,
             totals=q("SELECT COUNT(*),SUM(valid=1) FROM enrolments", one=True), n_inst=len(rows),
             hist=np.histogram(F["fill_ratio"], bins=[0, .5, .6, .7, .8, .9, 1.0, 1.1, 1.3, 2.0])[0].tolist())

    A = []
    def add(**k):
        k.update(id=f"A-{len(A)+1:04d}", status="open", created=now(), comments=[]); A.append(k)
    for pid, ii, pname, ap, c in sorted(over, key=lambda r: -(r[4] / r[3])):
        add(type="over_intake", severity="critical", inst_id=ii, subject=f"{rows[ii]['name']} · {pname}",
            title=f"{pname} has {c} students for {ap} approved seats", score=min(100, round(c / ap * 70)),
            method="Rule SEAT-OVER-INTAKE", evidence=[{"signal": "active seats", "value": int(c), "peer": int(ap), "weight": 1.0}],
            suggested="Request correction; hold intake approval review")
    if dup_set:
        pairs = {}
        for a in dup_set[:2000]:
            pass
        add(type="duplicate", severity="critical", inst_id=None, subject="Cross-institution",
            title=f"{len(dup_set)} students are active at two institutions", score=92, method="Rule DUP-CROSS-INSTITUTION",
            evidence=[{"signal": "students affected", "value": len(dup_set), "peer": 0, "weight": 1.0}],
            sample=[{"apaar": fmt_apaar(a), "institution": nm} for a, _, nm in dup_samples[:12]],
            suggested="Ask both institutions to confirm; require transfer record for the earlier enrolment")
    for k in np.argsort(-F["invalid_id_rate"])[:12]:
        if F["invalid_id_rate"][k] > 0.02:
            ii = int(ids[k])
            add(type="invalid_ids", severity="warning", inst_id=ii, subject=rows[ii]["name"],
                title=f"{rows[ii]['invalid']} rows with invalid APAAR IDs ({F['invalid_id_rate'][k]*100:.1f}%)", score=60,
                method="Rule APAAR-INVALID + stats", evidence=[{"signal": "invalid_id_rate", "value": round(float(F['invalid_id_rate'][k]), 4), "peer": round(float(med[4]), 4), "weight": 1.0}],
                suggested="Request corrected IDs")
    for k in np.argsort(-score)[:12]:
        if score[k] < 55: continue
        ii = int(ids[k])
        contrib = np.clip(Z[k], 0, None); tot = contrib.sum() + 1e-9
        top = np.argsort(-contrib)[:3]
        ev = [{"signal": names[j], "value": round(float(X[k][j]), 3), "peer": round(float(med[j]), 3), "weight": round(float(contrib[j] / tot), 2)} for j in top if contrib[j] > 0.5]
        add(type="ml", severity="high", inst_id=ii, subject=rows[ii]["name"], title="Unusual admission pattern across several signals",
            score=int(score[k]), method="Isolation Forest + robust z-score", evidence=ev,
            suggested="Request supporting documents for NRI / spot-round admissions")
    ANOMS[:] = A
    audit("system", "analytics.refresh", "all", f"{len(A)} anomalies from {len(rows)} institutions")
    S["compute_s"] = round(time.time() - t0, 1)

@app.on_event("startup")
def _start():
    if not os.path.exists(DB):
        generator.build(DB)
    compute()
    audit("system", "platform.start", "apaar-setu", "prototype ready")

# ------------------------------------------------------------------ overview / lists
@app.get("/api/overview")
def overview():
    cnt = lambda t, st="open": sum(1 for a in ANOMS if a["type"] == t and a["status"] == st)
    pending = sum(1 for b in BATCHES.values() if b["stage"] != "done")
    awaiting = sum(1 for a in ANOMS if a["status"] == "resubmitted")
    att = []
    for t, label, sev in [("over_intake", "programmes exceed approved intake", "critical"), ("duplicate", "duplicate-enrolment alerts across institutions", "critical"),
                          ("batch_dup", "upload batches contain students already active elsewhere", "critical"),
                          ("ml", "institutions show unusual admission patterns", "high"), ("invalid_ids", "institutions have many invalid APAAR IDs", "warning")]:
        n = cnt(t)
        if n: att.append({"severity": sev, "text": f"{n} {label}", "type": t, "n": n})
    if awaiting: att.append({"severity": "info", "text": f"{awaiting} corrections awaiting your approval", "type": "resubmitted", "n": awaiting})
    tot, ok = S["totals"]
    return {"students": tot, "verified": ok, "pending_batches": pending, "open_anomalies": sum(1 for a in ANOMS if a["status"] in ("open", "correction_requested", "resubmitted")),
            "institutions": S["n_inst"], "attention": att, "hist": S["hist"], "avg_trust": round(float(np.mean([v["score"] for v in S["trust"].values()]))), "compute_s": S["compute_s"]}

@app.get("/api/anomalies")
def anomalies(status: str = "", type: str = ""):
    out = [a for a in ANOMS if (not status or a["status"] == status) and (not type or a["type"] == type)]
    order = {"critical": 0, "high": 1, "warning": 2}
    return sorted(out, key=lambda a: (order.get(a["severity"], 3), -a["score"]))[:300]

class Act(BaseModel):
    action: str
    comment: str = ""

@app.post("/api/anomalies/{aid}/action")
def anomaly_action(aid: str, a: Act):
    x = next((i for i in ANOMS if i["id"] == aid), None)
    if not x: raise HTTPException(404)
    new = {"request_correction": "correction_requested", "approve": "resolved", "dismiss": "dismissed", "respond": "resubmitted", "escalate": "escalated"}.get(a.action)
    if not new: raise HTTPException(400, "unknown action")
    x["status"] = new
    x["comments"].append({"at": now(), "by": "institution" if a.action == "respond" else "aicte", "action": a.action, "text": a.comment})
    audit("institution" if a.action == "respond" else "aicte.regulator", f"anomaly.{a.action}", aid, a.comment[:80])
    return x

@app.get("/api/institutions")
def institutions(q_: str = Query("", alias="q"), sort: str = "trust", limit: int = 60):
    rows = list(S["inst"].values())
    if q_: rows = [r for r in rows if q_.lower() in r["name"].lower() or q_.lower() in r["state"].lower() or q_ in r["code"]]
    rows.sort(key=lambda r: r["trust"] if sort == "trust" else -r["students"])
    return rows[:limit]

@app.get("/api/institutions/{iid}")
def institution(iid: int):
    r = S["inst"].get(iid)
    if not r: raise HTTPException(404)
    progs = q("""SELECT p.name,p.approved_intake,SUM(e.seat!='Supernumerary'),SUM(e.seat='Supernumerary'),SUM(e.seat='NRI') FROM programmes p
        LEFT JOIN enrolments e ON e.prog_id=p.id AND e.status='Active' WHERE p.inst_id=? GROUP BY p.id""", (iid,))
    k = list(S["ids"]).index(iid)
    ev = [{"signal": n_, "value": round(float(S["F"][n_][k]), 3), "peer": round(float(S["med"][j]), 3)} for j, n_ in enumerate(S["names"])]
    return {**r, "trust_detail": S["trust"][iid], "evidence": ev,
            "programmes": [{"name": a, "intake": b, "regular": int(c or 0), "sup": int(d or 0), "nri": int(e or 0)} for a, b, c, d, e in progs],
            "anomalies": [a for a in ANOMS if a["inst_id"] == iid]}

# ------------------------------------------------------------------ upload / validation pipeline
DEMO_INST = 1
@app.get("/api/demo")
def demo():
    r = S["inst"][DEMO_INST]
    s = q("SELECT apaar FROM enrolments WHERE inst_id=? AND status='Active' AND valid=1 AND seat='Regular' LIMIT 1", (DEMO_INST,), one=True)
    return {"institution": r, "student_apaar": s[0]}

@app.get("/api/sample-csv")
def sample_csv():
    rng = np.random.default_rng(11)
    bodies = 10**10 + rng.choice(90_000_000_000, size=70, replace=False)
    good = [str(int(b) * 10 + int(generator.luhn_check_digits(np.array([b]))[0])) for b in bodies]
    others = [r[0] for r in q("SELECT apaar FROM enrolments WHERE status='Active' AND valid=1 AND inst_id>1 AND seat='Regular' LIMIT 12")]
    rows = []
    for a in good[:33]: rows.append((a, "Regular"))
    rows += [(good[33], "Regular")] * 1 + [(good[33], "Regular")] * 1        # in-file duplicates (x4 pairs below)
    for g in good[34:37]: rows += [(g, "Regular"), (g, "Regular")]
    for a in others: rows.append((a, "Regular"))                               # cross-institution duplicates
    for j in range(8): rows.append((good[40 + j][:-1] + str((int(good[40 + j][-1]) + 3) % 10), "Regular"))   # bad checksum
    for j in range(3): rows.append(("", "NRI"))                                # missing APAAR
    out = io.StringIO(); w = csv.writer(out)
    w.writerow(["apaar_id", "student_name", "programme", "seat_type", "cycle", "academic_year"])
    for a, s in rows:
        w.writerow([a, name_for(a) if a else "", "B.Tech CSE", s, "Annual", "2025-26"])
    return Response(out.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=apaar_setu_sample_upload.csv"})

def run_batch(b):
    rows = b["rows"]; seen = {}; passed = []
    b["stage"] = "instant"
    for i, r in enumerate(rows):
        a = (r.get("apaar_id") or "").replace(" ", "").strip()
        iss = None
        if not a: iss = ("APAAR-MISSING", "critical", "APAAR ID is missing")
        elif not generator.luhn_valid(a): iss = ("APAAR-INVALID", "critical", "APAAR ID fails format / check-digit test")
        elif a.startswith("0"): iss = ("APAAR-NOT-IN-REGISTRY", "critical", "Not found in registry (mock adapter)")
        elif a in seen: iss = ("DUP-IN-FILE", "high", f"Same APAAR ID also on row {seen[a]}")
        if iss: b["issues"].append({"row": i + 2, "apaar": a or "(blank)", "rule": iss[0], "severity": iss[1], "message": iss[2]}); b["flagged"] += 1
        else: seen[a] = i + 2; passed.append((i + 2, a, r))
        b["processed"] = i + 1
        if i % 6 == 0: time.sleep(0.05)
    b["stage"] = "deep"; b["processed"] = 0
    pset = [a for _, a, _ in passed]
    other = {}
    for i in range(0, len(pset), 400):
        ch = pset[i:i + 400]
        for a, ii, nm in q(f"""SELECT e.apaar,e.inst_id,i.name FROM enrolments e JOIN institutions i ON i.id=e.inst_id
                WHERE e.status='Active' AND e.inst_id!=? AND e.apaar IN ({','.join('?'*len(ch))})""", [DEMO_INST] + ch):
            other[a] = nm
    ok = 0
    for n_, (row, a, r) in enumerate(passed):
        if a in other:
            b["issues"].append({"row": row, "apaar": fmt_apaar(a), "rule": "DUP-CROSS-INSTITUTION", "severity": "critical", "message": f"Already active at {other[a]}"}); b["flagged"] += 1; b["dups"] += 1
        else: ok += 1
        b["processed"] = n_ + 1
        if n_ % 8 == 0: time.sleep(0.04)
    existing = q("SELECT SUM(seat!='Supernumerary') FROM enrolments WHERE inst_id=? AND status='Active' AND prog_id=(SELECT id FROM programmes WHERE inst_id=? AND name='B.Tech CSE')", (DEMO_INST, DEMO_INST), one=True)[0]
    intake = 120
    new_total = existing + len(passed)
    b["seat_check"] = {"programme": "B.Tech CSE", "approved": intake, "existing": int(existing), "incoming": len(passed), "after": int(new_total)}
    if new_total > intake:
        b["issues"].append({"row": 0, "apaar": "—", "rule": "SEAT-OVER-INTAKE", "severity": "critical", "message": f"B.Tech CSE would reach {new_total} against {intake} approved seats"})
        ANOMS.insert(0, {"id": f"A-B{len(BATCHES):03d}", "type": "over_intake", "severity": "critical", "inst_id": DEMO_INST, "subject": f"{S['inst'][DEMO_INST]['name']} · B.Tech CSE",
            "title": f"B.Tech CSE would have {new_total} students for {intake} approved seats (batch {b['id']})", "score": 96, "method": "Rule SEAT-OVER-INTAKE (live)",
            "evidence": [{"signal": "active seats after batch", "value": int(new_total), "peer": intake, "weight": 1.0}], "suggested": "Request correction; hold intake approval review",
            "status": "open", "created": now(), "comments": []})
    if b["dups"]:
        ANOMS.insert(1, {"id": f"A-D{len(BATCHES):03d}", "type": "batch_dup", "severity": "critical", "inst_id": DEMO_INST, "subject": S["inst"][DEMO_INST]["name"],
            "title": f"{b['dups']} students in batch {b['id']} are already active at other institutions", "score": 90, "method": "Rule DUP-CROSS-INSTITUTION (live)",
            "evidence": [{"signal": "students affected", "value": b["dups"], "peer": 0, "weight": 1.0}], "suggested": "Request transfer proof or removal",
            "status": "open", "created": now(), "comments": [], "sample": [{"apaar": i["apaar"], "institution": i["message"][15:]} for i in b["issues"] if i["rule"] == "DUP-CROSS-INSTITUTION"][:8]})
    b["accepted"] = ok if new_total <= intake else 0
    b["stage"] = "done"
    audit("institution", "batch.complete", b["id"], f"{b['total']} rows, {b['flagged']} flagged")

@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    text = (await file.read()).decode("utf-8-sig", "ignore")
    rows = list(csv.DictReader(io.StringIO(text)))
    if not rows or "apaar_id" not in rows[0]: raise HTTPException(400, "CSV must have an apaar_id column")
    bid = "B-" + uuid.uuid4().hex[:6].upper()
    b = {"id": bid, "file": file.filename, "total": len(rows), "processed": 0, "flagged": 0, "dups": 0, "issues": [], "stage": "queued", "rows": rows, "at": now()}
    BATCHES[bid] = b
    audit("institution", "batch.upload", bid, f"{file.filename}, {len(rows)} rows")
    threading.Thread(target=run_batch, args=(b,), daemon=True).start()
    return {"id": bid, "total": len(rows)}

@app.get("/api/batch/{bid}")
def batch(bid: str):
    b = BATCHES.get(bid)
    if not b: raise HTTPException(404)
    return {k: v for k, v in b.items() if k != "rows"}

# ------------------------------------------------------------------ natural-language query
STATES = sorted({r["state"] for r in S.get("inst", {}).values()}) if S else []
def parse_state(t):
    for s in sorted({r[0] for r in q("SELECT DISTINCT state FROM institutions")}, key=len, reverse=True):
        if s.lower() in t: return s
    return None

class NLQ(BaseModel):
    q: str

@app.post("/api/nlq")
def nlq(body: NLQ):
    t = body.q.lower(); st = parse_state(t)
    m = re.search(r"(top|bottom|lowest|highest|worst|best)?\s*(\d+)", t); n = int(m.group(2)) if m and int(m.group(2)) < 50 else 10
    plan, sql, params, cols = {}, "", (), []
    where_state = " AND i.state=?" if st else ""
    sp = (st,) if st else ()
    if re.search(r"exceed|over.?intake|over.?enrol|more than approved|above intake", t):
        plan = {"metric": "programmes_over_intake", "filters": {"state": st, "year": "2025-26", "status": "Active"}, "limit": n}
        sql = f"""SELECT i.name, p.name AS programme, p.approved_intake, SUM(e.seat!='Supernumerary') AS enrolled
FROM programmes p JOIN institutions i ON i.id=p.inst_id JOIN enrolments e ON e.prog_id=p.id
WHERE e.status='Active'{where_state} GROUP BY p.id HAVING enrolled>p.approved_intake
ORDER BY enrolled*1.0/p.approved_intake DESC LIMIT {n}"""
        params = sp; head = "Programmes enrolling above approved intake"
    elif re.search(r"duplicate|two institutions|multiple institutions|double", t):
        plan = {"metric": "cross_institution_duplicates", "filters": {"status": "Active"}, "limit": n}
        sql = f"""SELECT i.name, COUNT(*) AS students_also_active_elsewhere FROM enrolments e JOIN institutions i ON i.id=e.inst_id
WHERE e.status='Active' AND e.valid=1{where_state} AND e.apaar IN (SELECT apaar FROM enrolments WHERE status='Active' AND valid=1 GROUP BY apaar HAVING COUNT(DISTINCT inst_id)>1)
GROUP BY i.id ORDER BY 2 DESC LIMIT {n}"""
        params = sp; head = "Institutions with students active elsewhere too"
    elif re.search(r"invalid", t):
        plan = {"metric": "invalid_apaar", "filters": {"state": st}, "limit": n}
        sql = f"SELECT i.name, COUNT(*) AS invalid_rows, ROUND(100.0*COUNT(*)/(SELECT COUNT(*) FROM enrolments x WHERE x.inst_id=i.id),2) AS pct FROM enrolments e JOIN institutions i ON i.id=e.inst_id WHERE e.valid=0{where_state} GROUP BY i.id ORDER BY 2 DESC LIMIT {n}"
        params = sp; head = "Institutions with invalid APAAR IDs"
    elif re.search(r"nri", t):
        plan = {"metric": "nri_share", "filters": {"state": st}, "limit": n}
        sql = f"SELECT i.name, SUM(e.seat='NRI') AS nri_students, ROUND(100.0*SUM(e.seat='NRI')/COUNT(*),1) AS nri_pct FROM enrolments e JOIN institutions i ON i.id=e.inst_id WHERE e.status='Active'{where_state} GROUP BY i.id HAVING COUNT(*)>100 ORDER BY 3 DESC LIMIT {n}"
        params = sp; head = "Institutions by NRI share of enrolment"
    elif re.search(r"trust|score|risk|anomal|suspicious|unusual", t):
        low = not re.search(r"highest|best|top trust", t)
        rows_ = [r for r in S["inst"].values() if not st or r["state"] == st]
        rows_.sort(key=lambda r: r["trust"] if low else -r["trust"]); rows_ = rows_[:n]
        plan = {"metric": "trust_score", "filters": {"state": st}, "order": "asc" if low else "desc", "limit": n}
        return {"answer": f"{'Lowest' if low else 'Highest'} trust scores{' in ' + st if st else ''}: {rows_[0]['name']} leads at {rows_[0]['trust']}.", "plan": plan,
                "sql": "-- served from the precomputed Trust Score table (rules + Isolation Forest), not raw SQL\nSELECT name, trust_score, ml_anomaly_score FROM trust ORDER BY trust_score " + ("ASC" if low else "DESC") + f" LIMIT {n}",
                "columns": ["Institution", "State", "Trust score", "Anomaly score"], "rows": [[r["name"], r["state"], r["trust"], r["ml"]] for r in rows_], "count": len(rows_)}
    elif re.search(r"how many|count|enrol|students|admission", t):
        plan = {"metric": "active_students", "filters": {"state": st, "status": "Active"}}
        sql = f"SELECT i.state, COUNT(*) AS active_students FROM enrolments e JOIN institutions i ON i.id=e.inst_id WHERE e.status='Active'{where_state} GROUP BY i.state ORDER BY 2 DESC LIMIT {n}"
        params = sp; head = "Active students"
    else:
        return {"answer": "I could not map that to a supported question. Try: “Which institutions exceeded intake in Maharashtra?”, “Show the 10 lowest trust scores”, “Which institutions have the most duplicate enrolments?”, “Highest NRI share”, or “How many students per state?”", "plan": {}, "sql": "", "columns": [], "rows": [], "count": 0}
    con = sqlite3.connect(DB); cur = con.execute(sql, params); data = cur.fetchall(); cols = [c[0] for c in cur.description]; con.close()
    shown = sql.replace("?", f"'{st}'") if st else sql
    first = f" Top result: {data[0][0]}." if data else " No rows matched."
    return {"answer": f"{head}{' in ' + st if st else ''}: {len(data)} shown.{first}", "plan": plan, "sql": shown, "columns": cols, "rows": [list(r) for r in data], "count": len(data)}

# ------------------------------------------------------------------ credentials & verification
@app.get("/api/student/{apaar}")
def student(apaar: str):
    a = apaar.replace(" ", "")
    r = q("""SELECT e.status,p.name,i.name,e.year,e.seat FROM enrolments e JOIN programmes p ON p.id=e.prog_id JOIN institutions i ON i.id=e.inst_id
             WHERE e.apaar=? ORDER BY (e.status='Active') DESC LIMIT 1""", (a,), one=True)
    if not r: raise HTTPException(404, "APAAR ID not found")
    return {"apaar": a, "apaar_fmt": fmt_apaar(a), "name": name_for(a), "status": r[0], "programme": r[1], "institution": r[2], "year": r[3],
            "consents": [c for c in ISSUED if c["apaar"] == a]}

class Issue(BaseModel):
    apaar: str
    claims: list[str]
    purpose: str = "Employment verification"
    days: int = 7

@app.post("/api/credential")
def issue(i: Issue, request_base: str = ""):
    s = student(i.apaar)
    allowed = {"programme": s["programme"], "institution": s["institution"], "year": s["year"], "status": s["status"], "name": s["name"]}
    c = {k: allowed[k] for k in i.claims if k in allowed}
    jti = uuid.uuid4().hex[:12]
    payload = {"v": 1, "iss": ISSUER, "jti": jti, "iat": now(), "exp": now() + i.days * 86400, "c": c}
    body = b64u(json.dumps(payload, separators=(",", ":")).encode())
    token = body + "." + b64u(KEY.sign(body.encode()))
    ISSUED.append({"jti": jti, "apaar": s["apaar"], "claims": list(c), "purpose": i.purpose, "at": now(), "exp": payload["exp"], "token": token})
    audit(f"student:{s['apaar'][:4]}…", "credential.issue", jti, f"claims={list(c)} purpose={i.purpose}")
    return {"token": token, "jti": jti, "claims": c, "exp": payload["exp"]}

class Rev(BaseModel):
    jti: str

@app.post("/api/revoke")
def revoke(r: Rev):
    REVOKED.add(r.jti); audit("student", "credential.revoke", r.jti); return {"ok": True}

def check(token: str):
    try:
        body, sig = token.split(".")
        Ed25519PublicKey.from_public_bytes(PUB_RAW).verify(unb64u(sig), body.encode())
        p = json.loads(unb64u(body))
    except (InvalidSignature, ValueError, Exception):
        return {"result": "invalid", "message": "Signature check failed. This code was not issued by APAAR Setu or has been altered."}
    if p["jti"] in REVOKED: return {"result": "revoked", "message": "The student has withdrawn consent for this share.", "iat": p["iat"]}
    if p["exp"] < now(): return {"result": "expired", "message": "This share link has expired. Ask the student for a new one.", "iat": p["iat"]}
    return {"result": "valid", "claims": p["c"], "iat": p["iat"], "exp": p["exp"], "issuer": p["iss"], "jti": p["jti"]}

@app.get("/api/verify")
def verify(t: str):
    r = check(t)
    audit("verifier", f"verify.{r['result']}", r.get("jti", "-"))
    return r

@app.get("/api/pubkey")
def pubkey(): return {"pub": b64u(PUB_RAW), "issuer": ISSUER}

@app.get("/api/qr.svg")
def qr(data: str):
    buf = io.BytesIO(); segno.make(data, error="l").save(buf, kind="svg", scale=6, border=2, dark="#1B1D23")
    return Response(buf.getvalue(), media_type="image/svg+xml")

@app.get("/v/{token}", response_class=HTMLResponse)
def verify_page(token: str):
    html = open(os.path.join(HERE, "static", "verify.html"), encoding="utf-8").read()
    return html.replace("__PUB__", b64u(PUB_RAW)).replace("__TOKEN__", token)

@app.get("/api/audit")
def audit_log(): return {"ok": audit_ok(), "head": AUDIT[-1]["hash"][:12] if AUDIT else "", "entries": AUDIT[-60:][::-1], "count": len(AUDIT)}

@app.get("/")
def index(): return FileResponse(os.path.join(HERE, "static", "index.html"))
app.mount("/static", StaticFiles(directory=os.path.join(HERE, "static")), name="static")
