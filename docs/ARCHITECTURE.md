# APAAR Setu — System Architecture

**Product:** APAAR Setu (सेतु, "bridge") — APAAR-based Student Data Management & Verification Platform
**Problem Statement:** SIH 26263 · AICTE, Regulation Bureau · Theme: Smart Automation
**Document status:** v1.0 · Architecture baseline for prototype and production roadmap

---

## 1. Executive Summary

AICTE receives student data in inconsistent forms: PGDM institutions send student lists, while most others send only aggregate enrolment counts. APAAR Setu is a **plug-in module for the AICTE portal** that turns this into a single, verifiable, student-level ledger keyed on **APAAR ID**, covering 15,000+ institutions.

Three ideas make it different from a plain data-collection portal:

| # | Idea | What it does |
|---|------|--------------|
| 1 | **Trust-first ingestion** | Every row passes instant basic checks, then asynchronous deep checks. Nothing reaches the AICTE repository unverified. |
| 2 | **Explainable anomaly intelligence** | Rules + statistics + Isolation Forest produce a risk score *with evidence*. Officers see why a row or institution is flagged. |
| 3 | **Offline-verifiable credentials** | Each student record becomes a W3C-style Verifiable Credential, signed with PKI, shown as a QR that employers can check even without internet, with selective disclosure under a DPDP consent ledger. |

Design stance: **balanced** — deployable on AICTE/MeghRaj infrastructure today, with two or three genuinely novel features rather than speculative technology.

---

## 2. Goals, Non-Goals, Constraints

**Goals**
- Student-level submission using APAAR ID as the only primary identity key.
- Real-time detection of duplicates, invalid IDs, over-intake, and cross-institution double enrolment.
- Verifiable, privacy-preserving student credentials.
- Sub-second dashboards on 1M+ rows (demo) and a path to 10M+ per year (production).
- DPDP Act 2023 aligned consent, minimisation, and audit.

**Non-goals (v1)**
- Replacing the AICTE approval process or institution ERPs.
- Regional/state office roles (explicitly out of scope).
- Fuzzy identity matching across institutions (exact APAAR match only; see §9.4).

**Constraints**
- APAAR registry access is simulated through an **adapter** (mock now, real DigiLocker/ABC integration later).
- Must be hostable on-prem or on MeghRaj (GoI cloud) using containers.

---

## 3. Actors and Roles

| Role | Access | Auth |
|------|--------|------|
| AICTE Super Admin | Platform config, rule engine, key management, all data | OIDC SSO + MFA |
| AICTE Regulator | Dashboards, anomalies, trust scores, NL query, reports | OIDC SSO + MFA |
| Institution Admin | Own institution: uploads, corrections, users | Linked to existing AICTE login (OIDC) |
| Data Operator | Own institution: upload and edit within assignment | Linked to existing AICTE login |
| Student | Own record, consent ledger, credential sharing | APAAR / DigiLocker OIDC |
| Employer / Verifier | Verify a shared credential only | **No login**: open QR/link, rate-limited |

Authorization is **RBAC plus attribute rules** (e.g. `institution_id == user.institution_id`, `field_sensitivity <= role.clearance`, `consent.scope contains claim`).

---

## 4. High-Level Architecture

```
                         ┌─────────────────────────────────────────────┐
   Institutions          │                APAAR SETU PLATFORM            │         Consumers
 ┌──────────────┐        │                                             │      ┌─────────────────┐
 │ Bulk CSV/XLSX│──┐     │  ┌───────────┐   ┌────────────────────────┐ │      │ AICTE Officers  │
 │ REST API     │──┼────▶│  │  API GW   │──▶│   Modular Monolith     │ │─────▶│ (Next.js web)   │
 │ Web form     │──┤     │  │ (authN,   │   │  (FastAPI, split-ready)│ │      ├─────────────────┤
 │ ERP webhook  │──┘     │  │  limits)  │   │                        │ │      │ Institutions    │
 └──────────────┘        │  └───────────┘   │ ingest · validation ·  │ │      ├─────────────────┤
                         │                  │ identity · anomaly ·   │ │      │ Students        │
   APAAR Registry        │                  │ credentials · consent ·│ │      ├─────────────────┤
 ┌──────────────┐        │  ┌───────────┐   │ audit · analytics · nlq│ │      │ Employers (QR)  │
 │ Adapter      │◀──────▶│  │ Redis     │◀─▶│                        │ │      └─────────────────┘
 │ (mock → real)│        │  │ Streams   │   └─────┬──────────┬───────┘ │
 └──────────────┘        │  └─────┬─────┘         │          │         │
                         │        ▼               ▼          ▼         │
                         │  ┌───────────┐   ┌──────────┐ ┌──────────┐ │
                         │  │ Workers   │   │PostgreSQL│ │ClickHouse│ │
                         │  │ (deep     │   │(OLTP,    │ │(analytics│ │
                         │  │  checks,  │   │ ledger)  │ │ , trends)│ │
                         │  │  ML)      │   └──────────┘ └──────────┘ │
                         │  └───────────┘   ┌──────────────────────┐  │
                         │                  │ KMS/HSM · Object store│  │
                         │                  └──────────────────────┘  │
                         └─────────────────────────────────────────────┘
```

### 4.1 Architecture style: modular monolith, split-ready
One deployable FastAPI application with strict module boundaries (each module owns its tables and exposes a service interface). This keeps operations simple for a hackathon and early production while allowing extraction of `ingest`, `anomaly`, and `credentials` into services later without rewriting domain logic.

### 4.2 Modules

| Module | Responsibility |
|--------|----------------|
| `identity` | APAAR adapter, student identity resolution, institution/user mapping |
| `ingest` | CSV/XLSX/API/webhook intake, schema mapping, batch lifecycle |
| `validation` | Instant checks and async deep checks, configurable rule engine |
| `lifecycle` | Student state machine and versioned history |
| `anomaly` | Statistical detectors, Isolation Forest, risk scoring, evidence builder |
| `trust` | Institution Trust Score, intake forecast |
| `credentials` | VC issuance, signing, QR payload, revocation, selective disclosure |
| `consent` | DPDP consent ledger, revoke, purpose binding |
| `audit` | Append-only hash-chained log |
| `analytics` | ClickHouse projections, report generation |
| `nlq` | Natural-language query to safe structured query plan |
| `certificates` | Degree-certificate template generator (Req 10) |

---

## 5. Data Architecture

### 5.1 Stores

| Store | Role | Why |
|-------|------|-----|
| **PostgreSQL** | System of record: students, enrolments, batches, rules, consents, credentials, audit | ACID, row-level security, mature encryption/partitioning |
| **ClickHouse** | Analytical projections: admissions by institution/programme/day, anomaly time series | Columnar speed for dashboards and NL queries on 100M+ rows |
| **Redis** | Streams (async jobs), rate limiting, short-lived caches | Simple, fast, adequate for v1 |
| **Object store (S3-compatible)** | Uploaded files, generated reports, certificate PDFs | Cheap, versioned, encrypted at rest |
| **KMS / HSM** | Data encryption keys, credential signing keys | Keys never leave the boundary |

Postgres is the source of truth; ClickHouse is rebuilt from an outbox event stream and is never written by users.

### 5.2 Core entities

```
institution(id, aicte_id, name, type, state, status)
programme(id, institution_id, name, level, approved_intake, supernumerary_quota, year)
student(apaar_id PK, name_enc, dob_enc, phone_enc, email_enc, gender, category)
enrolment(id, apaar_id FK, institution_id, programme_id, academic_year, cycle,
          seat_type, nri, oci, fn, state, valid_from, valid_to, version, batch_id)
enrolment_event(id, enrolment_id, from_state, to_state, actor, reason, at)
upload_batch(id, institution_id, source, status, rows_total, rows_ok, rows_flagged, at)
validation_issue(id, batch_id, enrolment_id, rule_id, severity, evidence_json, status)
anomaly(id, scope, subject_id, score, method, evidence_json, status, at)
trust_score(institution_id, period, score, components_json)
credential(id, apaar_id, enrolment_id, vc_json, hash, status, issued_at, revoked_at)
consent(id, apaar_id, verifier_scope, claims, purpose, granted_at, expires_at, revoked_at)
audit_log(seq, prev_hash, hash, actor, action, object, payload_digest, at)
rule(id, name, scope, expression, severity, version, active)
```

### 5.3 Extended standard fields (beyond the problem statement)
APAAR ID, institution AICTE ID, programme, academic year, admission cycle (annual / lateral / spot round), seat type (general, supernumerary, NRI, OCI, FN, TFW, EWS), category, gender, date of birth, entry qualification, admission date, fee status, mode of study, state of domicile, status (active, transferred, withdrawn, graduated), exit date, certificate number.

### 5.4 Versioned history and lifecycle

```
 Draft ──▶ Submitted ──▶ Validated ──▶ Verified ──▶ Active ──┬──▶ Transferred
                │             │                              ├──▶ Withdrawn
                ▼             ▼                              └──▶ Graduated
            Rejected      Flagged ──▶ Under Correction ──▶ Re-submitted
```

Every transition writes an `enrolment_event`. Updates never overwrite: the row gets a new `version` with `valid_from/valid_to`, which gives full point-in-time reconstruction for audits and accreditation.

### 5.5 Handling aggregate-only institutions
An **onboarding wizard** takes institutions from aggregate to student-level in stages: (1) import current aggregate counts as baseline, (2) upload one programme at a time, (3) reconciliation view compares uploaded rows against the baseline and approved intake, (4) institution marked "student-level ready" once reconciliation is within tolerance. No institution is blocked on day one.

---

## 6. Ingestion Pipeline

```
Source ─▶ Receive ─▶ Parse & map ─▶ INSTANT checks ─▶ Persist (staged) ─▶ Stream event
                                      (sync, <1s/1000 rows)                      │
                                                                                 ▼
  Dashboard ◀─ SSE ◀─ Projections ◀─ Promote to repository ◀─ DEEP checks (async workers)
```

**Channels** (all share one validation path): bulk CSV/Excel, REST API (OAuth2 client credentials), web form for small corrections, ERP/SIS webhook with HMAC signature and idempotency keys.

**Instant checks** (synchronous): schema and types, APAAR format and checksum, required fields, in-file duplicates, date sanity, mock/real registry existence.

**Deep checks** (asynchronous via Redis Streams consumer groups): over-intake per programme and quota, supernumerary/NRI/OCI/FN rule engine, cross-institution duplicate enrolment, historical consistency (age vs level, repeated transfers), anomaly scoring.

**Idempotency and recovery:** each row has a deterministic key `(apaar_id, institution_id, programme_id, year, cycle)`. Re-uploading a file produces updates, not duplicates. Failed workers are retried with backoff; poison messages go to a dead-letter stream.

---

## 7. Validation and Rule Engine

Rules are data, not code: stored in the `rule` table, versioned, hot-reloadable, and editable only by Super Admin with an audit entry.

```yaml
- id: SEAT-OVER-INTAKE
  scope: programme
  when: count(active enrolments, regular seats) > approved_intake
  severity: critical
- id: SUPERNUMERARY-CAP
  scope: programme
  when: supernumerary_count > floor(approved_intake * 0.15)   # configurable per year
  severity: high
- id: DUP-CROSS-INSTITUTION
  scope: student
  when: exists active enrolment at another institution in same period
  severity: critical
- id: APAAR-INVALID
  scope: row
  when: not apaar_valid(apaar_id)
  severity: critical
```

Quota limits (supernumerary, NRI, OCI, FN) vary by year and circular; the engine keeps them as parameters per academic year so a policy change is a config change, not a release.

---

## 8. Anomaly Intelligence (the differentiator)

### 8.1 Layered detection

| Layer | Method | Catches |
|-------|--------|---------|
| L1 Deterministic | Rule engine | Hard violations (over-intake, invalid ID) |
| L2 Statistical | Robust z-score / MAD on per-institution ratios, Benford-style digit tests on IDs, sudden-change detection against 3-year history | Spikes, implausible fill rates, round-number reporting |
| L3 ML | **Isolation Forest** on institution-level features (fill ratio, NRI share, supernumerary share, late-admission share, transfer rate, duplicate rate, batch timing) | Unusual combined patterns no single rule describes |

### 8.2 Risk score with evidence
Each anomaly gets a 0–100 score and an **evidence bundle**: which features contributed, peer comparison, historical baseline, and the affected rows. Officers never see a bare number.

```json
{
  "subject": "INST-04412", "score": 87, "method": ["rule","iforest"],
  "evidence": [
    {"signal": "fill_ratio", "value": 1.42, "peer_median": 0.78, "weight": 0.41},
    {"signal": "nri_share", "value": 0.31, "peer_median": 0.04, "weight": 0.33}
  ],
  "rows": 214, "suggested_action": "Request correction; hold approval review"
}
```

### 8.3 Correction workflow
Flag → institution notified → institution responds with comment and corrected data or justification → AICTE reviewer approves / rejects / escalates. Every step is audited. Repeated unresolved flags feed the trust score.

### 8.4 Institution Trust Score (AICTE-only)
Weighted composite (0–100): data completeness, validation pass rate, timeliness, anomaly history, correction responsiveness, over-intake incidents. It is **never shown to institutions or the public** in v1 to avoid gaming and reputational harm; AICTE sees component breakdown to justify any action.

### 8.5 Intake forecast
Per-institution, per-programme next-year intake risk using a simple, explainable model (exponential smoothing on 3-5 years of fill ratio with demand-side adjustment). Output: "likely to exceed / under-fill" with confidence band. Deliberately simple so it can be defended in front of an institution.

---

## 9. Identity, Duplicates, and APAAR Integration

### 9.1 APAAR adapter
```python
class ApaarRegistry(Protocol):
    def validate(self, apaar_id: str) -> ApaarStatus: ...
    def basic_profile(self, apaar_id: str) -> ApaarProfile | None: ...
```
`MockRegistry` powers the prototype; `DigiLockerRegistry` (consent-based, ABC-linked) is the production implementation. The platform depends only on the interface.

### 9.2 Format
APAAR is a 12-digit identifier. The prototype validates length and a check digit (Verhoeff-style, illustrative only) plus registry existence; the production adapter defers to the authoritative registry.

### 9.3 Cross-institution duplicates
For a given `apaar_id`, more than one **active** enrolment overlapping in period at different institutions raises `DUP-CROSS-INSTITUTION`. Lateral entry and transfers are legitimate and handled by the lifecycle (the old enrolment must be `Transferred` before the new one is `Active`).

### 9.4 Why exact match only
APAAR is the national key. Fuzzy name/DOB matching would add false positives against real students. Rows with missing APAAR are held in a *pending identity* queue rather than guessed.

---

## 10. Verifiable Credentials and Verification

### 10.1 Credential format
W3C-style VC (JSON), minimal claims, signed by AICTE's issuing key:

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "AicteEnrolmentCredential"],
  "issuer": "did:web:apaarsetu.aicte.gov.in",
  "issuanceDate": "2026-08-01T00:00:00Z",
  "credentialSubject": {
    "id": "apaar:XXXXXXXXXXXX",
    "institution": "INST-04412",
    "programme": "B.Tech CSE",
    "status": "Active",
    "academicYear": "2025-26"
  },
  "proof": {"type": "Ed25519Signature2020", "jws": "..."}
}
```

### 10.2 Tamper-proofing
- **PKI signature:** Ed25519 (prototype) with keys in HSM/KMS in production; key rotation via `did:web` document with `kid`.
- **Hash chain:** every issued, revoked, or updated credential appends to a chained ledger `H(n) = SHA-256(H(n-1) || canonical(entry))`. Tampering with history breaks the chain.
- **Revocation:** status checked online via a compact status list; offline QR shows "valid as of issue time" with issue date clearly displayed.

### 10.3 Offline QR
The QR encodes a compact signed token (header.payload.signature, base64url) holding minimal claims. The verifier page embeds the issuer public key, so signature checking works **without network**. When online, it additionally checks revocation.

### 10.4 Selective disclosure and consent
Students choose which claims to share per verifier and purpose (e.g. "enrolled: yes, programme: B.Tech" without institution or APAAR). Each share creates a `consent` record with scope, purpose, expiry; the student can revoke from the dashboard and the status list updates. Employers see **only the minimum verified claims** plus a clear valid / revoked / expired result.

### 10.5 Abuse prevention
Per-IP and per-token rate limits, bulk-lookup detection, no enumeration (tokens are unguessable and signed), CAPTCHA step-up on suspicious patterns, and every verification written to the audit log.

### 10.6 Certificate integration (Req 10)
A template generator produces degree-certificate layouts with APAAR ID, student/enrolment ID, and a verification QR; degree-awarding bodies download templates or call an API to embed them. Display uses partial masking where policy requires.

---

## 11. Security and Privacy (DPDP Act 2023)

| Control | Design |
|---------|--------|
| Authentication | OIDC/SSO with MFA for all staff; student login via APAAR/DigiLocker OIDC; short-lived JWT + refresh rotation |
| Authorization | RBAC + attribute rules, enforced in the service layer and Postgres row-level security |
| Encryption in transit | TLS 1.3 everywhere, mTLS between services in K8s |
| Encryption at rest | Disk and object encryption; **field-level envelope encryption** for DOB, phone, email, Aadhaar-linked attributes (per-tenant DEKs wrapped by KMS) |
| Masking | Role-aware masking in API responses (e.g. `98••••••21`) |
| Consent | Student-level consent ledger, purpose-bound, revocable, time-limited |
| Minimisation | Verifiers get claims, not records; analytics use pseudonymised IDs |
| Audit | Append-only, hash-chained; anchors (periodic head hash) stored off-system |
| Data principal rights | Access, correction, and erasure-request workflows (subject to legal retention) |
| Breach readiness | Alerting, incident runbook, 72-hour notification template |
| Aadhaar | Never stored in raw form; only referenced through APAAR/consent flows |

**Threat model highlights:** malicious institution inflating data (anomaly layer), credential forgery (PKI), insider abuse (RBAC + audit + masking), scraping (rate limits), replay of QR (expiry + nonce on online check), supply chain (pinned dependencies, SBOM, image signing).

---

## 12. Natural-Language Query (headline feature)

Officers ask questions in plain English or Hindi: *"Which institutions in Maharashtra exceeded intake in 2025-26?"*

**Safety design — the model never writes raw SQL against production.**

```
Question ─▶ Intent + entity extraction ─▶ Structured query plan (JSON, schema-validated)
         ─▶ Policy check (role, columns, row limits) ─▶ Parameterised SQL (ClickHouse, read-only)
         ─▶ Result + "How I got this" panel (plan, filters, SQL, row count)
```

Plans are restricted to whitelisted metrics, dimensions, and filters. Every answer shows its interpretation, the exact query, and a link to the underlying rows, which makes results auditable and builds trust. The prototype implements a deterministic parser over the same plan format so the demo works offline; production swaps in an LLM that emits the same plan JSON.

---

## 13. Real-Time Monitoring

- **Server-Sent Events** push batch progress and new alerts to dashboards; automatic **polling fallback** (every 5 s) where proxies block SSE.
- Event flow: ingestion/validation → outbox → Redis Stream → projector → ClickHouse + SSE hub.
- Dashboards are **action-first**: attention list (critical anomalies, pending corrections) above headline counts.

---

## 14. Technology Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Backend | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic | Typed, async, OpenAPI out of the box |
| ML | scikit-learn (IsolationForest), statsmodels | Explainable, CPU-only, easy to host |
| Frontend | React, Next.js (App Router), TypeScript, TanStack Table, Recharts/ECharts | i18n-ready (next-intl): English, Hindi, regional |
| Primary DB | PostgreSQL 16 | Partitioned by academic year, RLS enabled |
| Analytics DB | ClickHouse | MergeTree, materialised views for dashboards |
| Queue / cache | Redis 7 Streams | Consumer groups, DLQ |
| Auth | Keycloak (OIDC) or AICTE SSO | MFA (TOTP/WebAuthn) |
| Crypto | Ed25519, AES-256-GCM envelope encryption, HSM/KMS | |
| Observability | Prometheus, Grafana, OpenTelemetry, Loki | |
| CI/CD | GitHub Actions, Trivy, Ruff, pytest, Playwright | |
| Deployment | Docker Compose (dev/demo), Kubernetes with Helm (MeghRaj-ready) | |

---

## 15. Deployment Topology

```
 Users ─▶ WAF/CDN ─▶ Ingress (TLS) ─┬─▶ web (Next.js, 2+ pods)
                                     └─▶ api (FastAPI, HPA 2→N)
                                           ├─▶ workers (Redis consumers, HPA on lag)
                                           ├─▶ PostgreSQL (primary + replica, PITR backups)
                                           ├─▶ ClickHouse (2 shards × 2 replicas at scale)
                                           ├─▶ Redis (Sentinel/Cluster)
                                           └─▶ KMS/HSM, Object store
```

- **Environments:** dev (Compose), staging, production; separate keys and data per environment.
- **DR:** RPO ≤ 5 min (WAL shipping), RTO ≤ 1 h; ClickHouse is rebuildable from Postgres outbox.
- **Data residency:** all data in India; MeghRaj or NIC cloud.

---

## 16. Scalability and Performance

| Dimension | Target (production) | Approach |
|-----------|--------------------|----------|
| Institutions | 15,000+ | Tenant-aware indexes, per-institution rate limits |
| Student rows | 10M+/year | Postgres partitioning, bulk COPY ingest |
| Peak upload | 500k rows in a window | Chunked parsing, back-pressure through Streams |
| Dashboard latency | p95 < 1.5 s | ClickHouse projections, caching |
| Verification | p95 < 300 ms, 1000 rps | Stateless signature check, cached status list |
| Availability | 99.9% | Multi-AZ, health checks, graceful degradation |

Admissions are seasonal. Autoscaling on stream lag and pre-scaled windows during the admission-closing period handle the spike.

---

## 17. Observability and Operations

- **Metrics:** ingest rows/s, validation latency, queue lag, anomaly job duration, verification rate/latency, error budget burn.
- **Tracing:** OpenTelemetry spans across upload → validation → projection with batch ID correlation.
- **Logs:** structured JSON, PII-scrubbed.
- **SLOs and alerts:** queue lag > 2 min, validation failure spike, signing-service unavailability, audit-chain verification failure.
- **Runbooks:** key rotation, registry outage (queue and retry), restoring from backup, breach response.

---

## 18. Interoperability and API Surface

REST/JSON, OpenAPI 3.1, versioned `/v1`. Key endpoints:

```
POST /v1/batches                      upload file (multipart) -> batch id
POST /v1/students:bulk                JSON batch (REST API channel)
POST /v1/webhooks/erp/{institution}   signed ERP events
GET  /v1/batches/{id}                 progress, counts, issues
GET  /v1/anomalies?status=open        attention list
POST /v1/anomalies/{id}/resolve       correction workflow action
GET  /v1/institutions/{id}/trust      AICTE-only
POST /v1/nlq                          natural-language query
POST /v1/credentials                  issue VC (system)
GET  /v1/verify?t={token}             public verification
POST /v1/consents / DELETE /v1/consents/{id}
GET  /v1/audit/verify                 verify chain integrity
```

Future connectors: AISHE, NAD/ABC, UGC, NCVET, state boards through the same adapter pattern. This is the roadmap beyond AICTE.

---

## 18a. Roadmap

| Phase | Scope |
|-------|-------|
| 0 (this prototype) | Mock registry, upload, validation, anomaly, QR verify, NL query, trust score |
| 1 (pilot, 100 institutions) | Real APAAR adapter, SSO integration, ERP webhook for 2–3 vendors |
| 2 (national rollout) | All AICTE institutions, certificate integration, forecast, reports |
| 3 (ecosystem) | UGC / NCVET / state boards, employer API, wallet integrations |

---

## 19. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| APAAR coverage incomplete | Pending-identity queue, no guessing, phased institution onboarding |
| Institutions resist or game | Wizard onboarding, clear correction workflow, AICTE-only trust score, anomaly layer |
| False positives from ML | Evidence-based scores, human-in-the-loop approval, tunable thresholds |
| Privacy incident | Field encryption, minimisation, masking, consent, audit |
| Registry downtime | Adapter with queue/retry, cached validation results |
| Key compromise | HSM, rotation procedure, revocation list, short-lived credentials |

---

## 20. Prototype vs Production Map

| Capability | Prototype | Production |
|------------|-----------|------------|
| APAAR validation | Mock registry | Real adapter |
| Datastores | SQLite + in-memory aggregates | PostgreSQL + ClickHouse |
| Queue | In-process | Redis Streams |
| Anomaly | Rules + z-score + Isolation Forest | Same + scheduled retraining |
| Signing | Ed25519 local key | HSM/KMS |
| NL query | Deterministic parser to plan JSON | LLM to plan JSON |
| Auth | Role switcher (demo) | OIDC + MFA |
| Data | 1M+ synthetic rows | Live |

---

*End of document.*
