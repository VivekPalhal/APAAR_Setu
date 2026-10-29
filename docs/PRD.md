# APAAR Setu — Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | APAAR Setu (सेतु, "bridge") |
| **Tagline** | One verified record for every AICTE student |
| **Problem Statement** | SIH 26263 — APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions |
| **Sponsor** | AICTE, Regulation Bureau |
| **Theme / Category** | Smart Automation / Software |
| **Version** | 1.0 (hackathon baseline + production roadmap) |
| **Related documents** | `ARCHITECTURE.md`, `UI_UX.md`, problem-solution PDF, pitch/demo script |

---

## 1. Purpose of this document

This PRD defines **what** APAAR Setu must do, **for whom**, and **how we will know it works**. `ARCHITECTURE.md` explains how it is built; `UI_UX.md` explains how it looks and feels. Requirements here are numbered (e.g. `FR-ING-03`) so they can be traced to the problem statement, the architecture, tests, and demo scenarios.

Priority labels: **P0** = required for the hackathon prototype and any pilot; **P1** = required for national rollout; **P2** = roadmap.

---

## 2. Executive summary

AICTE collects student information from approved institutions in uneven ways. PGDM institutions submit detailed annual student data; most others report only aggregate counts during approval. As a result AICTE cannot reliably answer basic questions: *Who is actually enrolled? Is any institution above its approved intake? Is a student enrolled at two places? Can an employer trust this record?*

APAAR Setu is a **plug-in module for the AICTE portal** that bridges institutions, AICTE, students, and employers through the **APAAR ID** — the national academic identifier. It provides:

1. **Student-level submission** by bulk file, API, form, or ERP webhook, validated instantly and deeply.
2. **Explainable anomaly intelligence** (rules + statistics + Isolation Forest) that finds over-intake, duplicate enrolment, and suspicious patterns, with evidence.
3. **Verifiable credentials** with offline-checkable QR codes, selective disclosure, and a DPDP-compliant consent ledger.
4. **Action-first dashboards**, a natural-language query bar with transparent answers, an AICTE-only Institution Trust Score, and intake forecasting.

Pitch line: **a single source of truth for 15,000+ institutions.**

---

## 3. Problem definition

### 3.1 Current state

| Observation | Consequence |
|---|---|
| Two reporting modes: detailed (PGDM) vs aggregate totals (others) | No uniform student-level dataset |
| No universal identifier used in submissions | Cannot match students across institutions or years |
| Intake compliance checked from self-reported totals | Over-enrolment is hard to detect early |
| No cross-institution check | Same student can be counted twice |
| Certificates and records verified manually | Slow, forgery-prone, privacy-unfriendly |
| Limited real-time visibility | Regulators react after the cycle closes |

### 3.2 Problem statement (ours)
> AICTE needs authentic, verifiable, student-level records keyed to APAAR ID, validated automatically at the moment of submission, monitored in real time, and verifiable by authorised third parties without exposing more data than necessary.

### 3.3 Why now
APAAR ID is becoming the national academic identity, so a common key now exists. Digital-public-infrastructure patterns (consent, signed credentials, API-first integration) are mature enough to deploy in government settings.

---

## 4. Vision, goals, and non-goals

**Vision.** Every AICTE-approved student has one trusted, consent-controlled record that regulators can monitor and employers can verify in seconds.

### 4.1 Goals

| ID | Goal | Measured by |
|---|---|---|
| G1 | Student-level coverage for all AICTE institutions | % institutions "student-level ready" |
| G2 | Catch data problems at submission, not months later | % issues caught before promotion to repository |
| G3 | Detect over-intake and double enrolment early | Time from submission to alert; recall on planted cases |
| G4 | Make verification instant, offline-capable, privacy-preserving | p95 verification time; claims disclosed per verification |
| G5 | Give regulators actionable, explainable insight | Alert-to-action time; % alerts with evidence opened |
| G6 | Be safe by design under DPDP Act 2023 | Zero unauthorised disclosures; consent coverage 100% for shares |
| G7 | Be easy enough that institutions adopt it | Upload-to-clean time; support tickets per 100 uploads |

### 4.2 Non-goals (v1)
- Replacing AICTE approval workflows or institution ERPs.
- State/regional office roles.
- Fuzzy identity matching (APAAR exact match only).
- Storing Aadhaar numbers.
- Public ranking or public display of institution trust scores.
- Payment, fee collection, or scholarship processing.

---

## 5. Users and personas

| Persona | Description | Top needs | Pain today |
|---|---|---|---|
| **Anita — AICTE Regulator** | Officer in the Regulation Bureau monitoring compliance | Know what needs attention today; trustworthy evidence; export reports | Waits for aggregate returns; manual cross-checks |
| **Rakesh — AICTE Super Admin** | Platform owner at AICTE/NIC | Configure rules, manage keys and users, audit everything | No central control over validation policy |
| **Meera — Institution Admin** | Registrar/admission head at a college | Submit once, fix errors quickly, avoid penalties | Multiple formats, unclear errors |
| **Suresh — Data Operator** | Clerk who prepares files | Clear template, fix-in-place errors | Re-upload cycles, cryptic rejection |
| **Kavya — Student** | Enrolled student with an APAAR ID | See her record, share only what is needed, revoke | No control over who sees her data |
| **Vikram — Employer / Verifier** | HR or background-check agent | One clear result on a phone, no account | Calls and emails to colleges, forged certificates |

Out-of-scope users: state officers, public.

---

## 6. Scope

### 6.1 In scope (mapped to problem statement requirements)

| PS Req | Description | Section |
|---|---|---|
| 1 | Secure platform/API to upload and update student data by APAAR ID | 8.1 |
| 2 | Data fields: intake, enrolment, supernumerary, NRI, OCI, FN, other | 8.2 |
| 3 | Automated validation: duplicates, invalid/missing APAAR, over-intake, inconsistencies, cross-institution duplicates | 8.3 |
| 4 | Real-time dashboards for AICTE and institutions | 8.6 |
| 5 | Secure verification for authorised stakeholders | 8.5 |
| 6 | Verifiable student records | 8.5 |
| 7 | Integration/API with institutional and AICTE systems | 8.8 |
| 8 | Security, privacy, authentication, RBAC, audit, consent | 8.7 |
| 9 | Reports for policy, accreditation, monitoring, regulation | 8.9 |
| 10 | APAAR ID + student ID on certificates | 8.10 |

### 6.2 Differentiators beyond the problem statement
Explainable anomaly engine · Institution Trust Score · intake forecast · natural-language query · offline-verifiable signed QR · selective disclosure · onboarding wizard from aggregate to student-level.

### 6.3 Out of scope
See 4.2.

---

## 7. End-to-end user journeys

### J1 — Institution submits admissions (happy path with errors)
1. Meera signs in via existing AICTE login (SSO + MFA).
2. Opens **Upload**, downloads the template, or maps her own columns.
3. Uploads file with ~1,200 rows. Instant checks run; progress streams live.
4. Platform reports: *"1,150 clean, 38 invalid APAAR IDs, 8 duplicate rows, 4 flagged for cross-institution check."*
5. She fixes invalid IDs inline, exports the rest, and re-uploads corrections.
6. Deep checks finish; one programme shows *"would exceed approved intake by 22"*.
7. She submits with a justification for review, receives a batch receipt.

### J2 — Regulator handles an alert
1. Anita opens Home: attention list shows *"12 programmes exceed approved intake"*.
2. Opens one; sees score, evidence (counts vs approved seats, peers, history), affected rows.
3. Clicks **Request correction** with a comment. Institution is notified.
4. Institution responds; Anita reviews and **Approves**, **Dismisses** with reason, or **Escalates**.
5. All steps are in the audit log; the institution's Trust Score updates.

### J3 — Cross-institution duplicate
1. Student appears Active at Institution A and B.
2. Rule fires; both institutions are asked to confirm.
3. A legitimate transfer is resolved by marking the earlier enrolment *Transferred*; a true duplicate is escalated.

### J4 — Student shares a credential
1. Kavya signs in (APAAR/DigiLocker OIDC), opens **Share**.
2. Selects claims (programme, status; not institution), purpose, and expiry.
3. Previews exactly what the verifier will see; generates QR/link.
4. Later she opens **Who can see what** and revokes the share.

### J5 — Employer verifies
1. Vikram scans the QR on a phone, no login.
2. Sees one result: **Verified / Revoked / Expired / Not valid**, only shared claims, issue date.
3. If offline, the signature is still checked on-device and the screen says so.

### J6 — AICTE asks a question
1. Anita types *"Which institutions in Maharashtra exceeded intake in 2025-26?"*
2. Gets a table, a one-line summary, and a **How I got this** panel (interpretation, filters, query, row count).
3. Exports or saves it as a report.

### J7 — Aggregate-only institution onboards
Wizard: import aggregate baseline → upload one programme → reconcile against baseline and approved intake → mark "student-level ready".

---

## 8. Functional requirements

### 8.1 Data submission and ingestion (PS Req 1, 7)

| ID | Requirement | Priority |
|---|---|---|
| FR-ING-01 | Accept bulk CSV and Excel (.xlsx) uploads up to 500,000 rows per batch | P0 |
| FR-ING-02 | Provide a versioned REST API (`/v1`) for JSON batch submission with OAuth2 client credentials | P0 |
| FR-ING-03 | Provide a web form for single-record entry and correction | P1 |
| FR-ING-04 | Provide an ERP/SIS webhook with HMAC signature and idempotency keys | P1 |
| FR-ING-05 | Auto-map columns, show confidence, allow manual mapping, remember mapping per institution | P0 |
| FR-ING-06 | Every row has a deterministic idempotency key `(apaar_id, institution, programme, year, cycle)`; re-upload updates, never duplicates | P0 |
| FR-ING-07 | Show live progress (rows processed, passed, flagged, ETA) via SSE with polling fallback | P0 |
| FR-ING-08 | Batch survives browser close; user can return to progress and results | P0 |
| FR-ING-09 | Downloadable error file with row number, rule, and fix hint | P0 |
| FR-ING-10 | Institutions can only submit for their own AICTE ID and approved programmes | P0 |
| FR-ING-11 | Provide downloadable template per programme/cycle | P0 |
| FR-ING-12 | Failed processing retried with back-off; poison messages quarantined and visible to admins | P1 |

### 8.2 Data model and fields (PS Req 2)

| ID | Requirement | Priority |
|---|---|---|
| FR-DAT-01 | Capture mandatory fields: APAAR ID, institution AICTE ID, programme, academic year, admission cycle, seat type, status | P0 |
| FR-DAT-02 | Seat type values: Regular, Supernumerary, NRI, OCI, FN, plus configurable others (TFW, EWS) | P0 |
| FR-DAT-03 | Record approved intake per programme per year and actual enrolment (derived) | P0 |
| FR-DAT-04 | Extended fields: category, gender, date of birth, entry qualification, admission date, mode of study, domicile state, exit date, certificate number | P1 |
| FR-DAT-05 | Supported cycles: annual, lateral entry, spot/vacancy rounds | P0 |
| FR-DAT-06 | Lifecycle states: Draft, Submitted, Validated, Verified, Active, Flagged, Under Correction, Transferred, Withdrawn, Graduated, Rejected | P0 |
| FR-DAT-07 | Updates create new versions with valid-from/valid-to; history is never overwritten | P0 |
| FR-DAT-08 | Sensitive fields (DOB, phone, email, Aadhaar-linked) are field-level encrypted | P0 |
| FR-DAT-09 | Point-in-time reconstruction: "state of institution X on date D" | P1 |

### 8.3 Validation and rule engine (PS Req 3)

| ID | Requirement | Priority |
|---|---|---|
| FR-VAL-01 | **Instant checks** (synchronous): schema/type, required fields, APAAR format and check digit, registry existence via adapter, in-file duplicates, date sanity | P0 |
| FR-VAL-02 | **Deep checks** (asynchronous): over-intake, quota rules, cross-institution duplicate, historical consistency, anomaly scoring | P0 |
| FR-VAL-03 | Missing/invalid APAAR rows are rejected or held in a *pending identity* queue; never auto-corrected or guessed | P0 |
| FR-VAL-04 | Over-intake: Regular + NRI + OCI + FN active seats exceeding approved intake raises a critical issue; supernumerary seats are checked against their own cap | P0 |
| FR-VAL-05 | Quota rules (supernumerary, NRI, OCI, FN) are **configurable per academic year** in a rule engine, not hard-coded | P0 |
| FR-VAL-06 | Cross-institution duplicate: more than one active enrolment for the same APAAR ID at different institutions in overlapping periods | P0 |
| FR-VAL-07 | Legitimate transfers and lateral entries do not raise duplicate alerts once the earlier enrolment is marked Transferred | P0 |
| FR-VAL-08 | Every issue records rule ID, severity, evidence, status, and timestamps | P0 |
| FR-VAL-09 | Rules are versioned; edits require a reason and are audited; activation is immediate for new submissions | P1 |
| FR-VAL-10 | Super Admin can preview a rule change against recent data (dry run) before activating | P2 |

Rule examples are in `ARCHITECTURE.md` §7.

### 8.4 Anomaly intelligence, trust, and forecasting (differentiators)

| ID | Requirement | Priority |
|---|---|---|
| FR-ANO-01 | Layered detection: deterministic rules, statistical (robust z-score/MAD, change vs history), ML (Isolation Forest on institution features) | P0 |
| FR-ANO-02 | Each anomaly has a 0–100 risk score, method(s), contributing signals with values vs peer median, affected rows, and a suggested action | P0 |
| FR-ANO-03 | Officers can **Request correction**, **Approve**, **Dismiss with reason**, or **Escalate**; institutions respond with comment and corrected data | P0 |
| FR-ANO-04 | Institution Trust Score (0–100) with component breakdown, visible to AICTE roles only | P0 |
| FR-ANO-05 | Trust Score components: ID validity, intake discipline, identity integrity, pattern normality, correction responsiveness | P1 |
| FR-ANO-06 | Simple, explainable per-institution/programme next-year intake risk forecast with confidence band | P1 |
| FR-ANO-07 | Feedback loop: dismissed alerts are labelled and used to tune thresholds (no automatic punitive action) | P2 |
| FR-ANO-08 | No automated penalty; all consequences require human decision | P0 |

### 8.4a Natural-language query (headline feature)

| ID | Requirement | Priority |
|---|---|---|
| FR-NLQ-01 | AICTE roles can ask questions in English (Hindi P1) from a global ask bar | P0 |
| FR-NLQ-02 | Questions are converted to a **structured query plan** (whitelisted metrics, dimensions, filters), never raw SQL generated against production | P0 |
| FR-NLQ-03 | Each answer shows: summary, result table/chart, and **How I got this** (interpretation, filters, executed query, row count) | P0 |
| FR-NLQ-04 | Ambiguous questions trigger one clarifying question | P1 |
| FR-NLQ-05 | Role and row-level policy applied to every query; results capped | P0 |
| FR-NLQ-06 | Answers exportable and savable as reports; every question logged in audit | P1 |

### 8.5 Verification and verifiable records (PS Req 5, 6)

| ID | Requirement | Priority |
|---|---|---|
| FR-VER-01 | Issue W3C-style Verifiable Credentials for enrolment status, signed with AICTE's issuing key (Ed25519) | P0 |
| FR-VER-02 | Credential shown as a QR/link; verifier needs **no login** | P0 |
| FR-VER-03 | Verifier sees **minimal verified claims only**, based on the student's consent | P0 |
| FR-VER-04 | **Selective disclosure**: student chooses which claims, purpose, and expiry per share | P0 |
| FR-VER-05 | **Offline verification**: signature checked on the verifier's device using the embedded issuer public key; screen states offline status | P0 |
| FR-VER-06 | Online verification additionally checks revocation and expiry | P0 |
| FR-VER-07 | Possible results: Verified, Revoked, Expired, Not valid; each with next-step guidance | P0 |
| FR-VER-08 | Issuance, revocation, and verification events are appended to a **hash-chained** ledger | P0 |
| FR-VER-09 | Anti-abuse: rate limits per IP/token, enumeration resistance (unguessable signed tokens), bulk-lookup detection, step-up CAPTCHA | P0 |
| FR-VER-10 | Institutions, AICTE, and other regulators can verify records through authenticated roles with broader claim sets | P1 |
| FR-VER-11 | Key rotation via `did:web` document; old keys remain valid for verification until credentials expire | P1 |

### 8.6 Dashboards and monitoring (PS Req 4)

| ID | Requirement | Priority |
|---|---|---|
| FR-DSH-01 | AICTE Home is **action-first**: prioritised attention list, then headline numbers | P0 |
| FR-DSH-02 | Headline numbers: students verified, pending validation, open anomalies, institutions reporting, fill-ratio distribution | P0 |
| FR-DSH-03 | Real-time updates (SSE, polling fallback); dashboard refresh latency p95 < 5 s after a batch completes | P0 |
| FR-DSH-04 | Institution dashboard: own batches, issues, corrections, intake vs enrolment per programme | P0 |
| FR-DSH-05 | Institution list with search, filter (state, type, trust band), sort, and drill-down | P0 |
| FR-DSH-06 | Anomaly review screen: split view (list + evidence) with keyboard shortcuts | P0 |
| FR-DSH-07 | Compact/comfortable table density; light default, dark option | P0 |
| FR-DSH-08 | Saved views and exports (CSV) | P1 |

### 8.7 Security, privacy, and compliance (PS Req 8)

| ID | Requirement | Priority |
|---|---|---|
| FR-SEC-01 | Staff authentication via OIDC/SSO with MFA; institution users linked to existing AICTE login | P0 |
| FR-SEC-02 | Student authentication via APAAR/DigiLocker OIDC | P1 |
| FR-SEC-03 | Authorisation: RBAC plus attribute rules (institution scope, field sensitivity, consent scope) enforced in service layer and database row-level security | P0 |
| FR-SEC-04 | TLS 1.3 in transit; encryption at rest; **field-level envelope encryption** for sensitive attributes; role-aware masking in responses | P0 |
| FR-SEC-05 | **Consent ledger**: per-student, purpose-bound, time-limited, revocable; every disclosure references a consent record | P0 |
| FR-SEC-06 | **Append-only, hash-chained audit log** for all privileged and data-access actions; integrity verification endpoint; periodic head-hash anchoring off-system | P0 |
| FR-SEC-07 | Data principal rights: access, correction, erasure-request workflow (subject to legal retention) | P1 |
| FR-SEC-08 | Data minimisation: verifiers receive claims, analytics use pseudonymised IDs where possible | P0 |
| FR-SEC-09 | Retention policy per data class, configurable; automated deletion jobs | P1 |
| FR-SEC-10 | Breach detection, alerting, and 72-hour reporting template | P1 |
| FR-SEC-11 | Aadhaar numbers are never stored; only APAAR/consent-linked references | P0 |
| FR-SEC-12 | All data stored and processed in India | P0 |

### 8.8 Integration and APIs (PS Req 7)

| ID | Requirement | Priority |
|---|---|---|
| FR-INT-01 | **APAAR adapter** interface (`validate`, `basic_profile`) with mock implementation now and real implementation later | P0 |
| FR-INT-02 | Integrate with the AICTE portal as a plug-in module (SSO, institution master data, approved intake) | P1 |
| FR-INT-03 | Publish OpenAPI 3.1 spec, sandbox environment, and sample clients | P1 |
| FR-INT-04 | Webhooks for outbound events (batch complete, alert raised) with retries and signatures | P2 |
| FR-INT-05 | Adapter pattern ready for UGC, NCVET, AISHE, NAD/ABC, and state boards | P2 |

### 8.9 Reports and analytics (PS Req 9)

| ID | Requirement | Priority |
|---|---|---|
| FR-RPT-01 | Standard reports: admissions by institution/programme/state, intake utilisation, over-intake list, duplicate list, data-quality by institution, trust-score distribution | P0 |
| FR-RPT-02 | Filter by year, cycle, state, institution type, programme level | P1 |
| FR-RPT-03 | Export to PDF, CSV, and Excel; scheduled delivery by email | P1 |
| FR-RPT-04 | Accreditation pack: per-institution evidence of enrolment and compliance for a given year | P1 |
| FR-RPT-05 | Reports honour role scope and masking | P0 |

### 8.10 Certificate integration (PS Req 10)

| ID | Requirement | Priority |
|---|---|---|
| FR-CER-01 | Template generator for degree certificates showing APAAR ID, student/enrolment ID, and verification QR | P0 |
| FR-CER-02 | API for degree-awarding bodies to retrieve the certificate block (print or digital) | P1 |
| FR-CER-03 | Display of APAAR ID supports configurable masking | P1 |
| FR-CER-04 | A printed certificate QR resolves to the same verification page as shared credentials, with minimal claims | P1 |

### 8.11 Administration

| ID | Requirement | Priority |
|---|---|---|
| FR-ADM-01 | User and role management for AICTE; institution admins manage their own operators | P0 |
| FR-ADM-02 | Rule management with version history and diff | P1 |
| FR-ADM-03 | Key management console: current key, rotation, revocation list | P1 |
| FR-ADM-04 | System health: queue lag, validation latency, error rates | P1 |
| FR-ADM-05 | Language and localisation settings; i18n-ready strings (English, Hindi, regional) | P0 |

---

## 9. Non-functional requirements

| Category | Requirement | Target |
|---|---|---|
| Performance — ingestion | Instant checks on 1,000 rows | < 1 s |
| Performance — batch | 500,000-row batch fully validated (instant + deep) | < 15 min |
| Performance — dashboards | p95 page data latency at 10M rows | < 1.5 s |
| Performance — verification | p95 verification latency; throughput | < 300 ms; 1,000 req/s |
| Scalability | Institutions / students per year | 15,000+ / 10M+ |
| Availability | Core services | 99.9% |
| Durability and DR | RPO / RTO | ≤ 5 min / ≤ 1 h |
| Security | OWASP ASVS L2; VAPT before pilot; dependency scanning; SBOM | Required |
| Privacy | DPDP Act 2023 aligned; privacy impact assessment before pilot | Required |
| Accessibility | WCAG 2.2 AA; keyboard operable; screen-reader tested | Required |
| Localisation | UI strings externalised; text expansion 40%; Indian number formatting | Required |
| Browser/device | Latest two versions of Chrome, Edge, Firefox, Safari; mobile verifier page ≥ 360 px, < 100 KB | Required |
| Observability | Metrics, traces, structured logs, SLO alerts | Required |
| Maintainability | Modular boundaries, 80%+ unit coverage on domain modules, contract tests for APIs | Required |
| Interoperability | OpenAPI, W3C VC data model, OIDC | Required |

---

## 10. Data requirements

- **System of record:** PostgreSQL; **analytics:** ClickHouse; **queue/cache:** Redis Streams; **files:** S3-compatible object store.
- **Data classes:** Public (aggregate statistics), Internal (institution data), Confidential (student identity), Restricted (DOB, phone, email, keys).
- **Lineage:** every row links to its batch, source, rule results, and versions.
- **Quality metrics tracked per institution:** completeness, validity, timeliness, duplicate rate, correction turnaround.
- **Demo data:** synthetic, 1M+ rows, with planted over-intake programmes, cross-institution duplicates, legitimate transfers (must not be flagged), invalid IDs, and suspicious NRI/spot-round institutions.

---

## 11. Roles and permission matrix

| Capability | Super Admin | Regulator | Inst. Admin | Operator | Student | Verifier |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Upload / edit own institution data | – | – | ✓ | ✓ | – | – |
| View all institutions | ✓ | ✓ | – | – | – | – |
| View own institution | ✓ | ✓ | ✓ | ✓ | – | – |
| Manage anomalies (review, approve) | ✓ | ✓ | – | – | – | – |
| Respond to correction requests | – | – | ✓ | ✓ | – | – |
| View Trust Score | ✓ | ✓ | – | – | – | – |
| Natural-language query | ✓ | ✓ | – | – | – | – |
| Edit rules / keys / users | ✓ | – | own users | – | – | – |
| View own record, manage consent | – | – | – | – | ✓ | – |
| Issue / revoke shares | – | – | – | – | ✓ | – |
| Verify shared credential | – | – | – | – | – | ✓ |
| View audit log | ✓ | ✓ (read) | own actions | – | own activity | – |

---

## 12. Business rules (summary)

1. APAAR ID is the only primary student key; no fuzzy matching.
2. A student may have one **Active** enrolment at a time in overlapping periods; transfers close the earlier enrolment.
3. Approved intake is set per programme per year by AICTE; Regular, NRI, OCI, FN active seats count against it; supernumerary seats follow their own configured cap.
4. Rule parameters (caps, percentages) are configuration owned by AICTE Super Admin.
5. No automated penalties; alerts inform human decisions.
6. Trust Score is internal to AICTE.
7. A verifier can only see claims the student consented to, for the consented time and purpose.
8. Revocation takes effect for online verification immediately; offline results are valid as of issue time and say so.

---

## 13. Success metrics

| Metric | Prototype | Pilot (100 institutions) | National |
|---|---|---|---|
| Rows validated per demo run | 1M+ | 1M+ | 10M+/yr |
| Planted issues detected (over-intake, duplicates, invalid IDs) | 100% | ≥ 98% | ≥ 98% |
| False-positive rate on duplicate rule (legit transfers flagged) | 0 | < 1% | < 1% |
| Time to first alert after upload | < 10 s | < 1 min | < 5 min |
| Institution upload-to-clean time | < 5 min (demo file) | < 1 working day | < 1 working day |
| Verification p95 | < 300 ms | < 300 ms | < 300 ms |
| Claims disclosed per verification | ≤ consented | ≤ consented | ≤ consented |
| Institutions student-level ready | – | ≥ 80% | ≥ 95% |
| User satisfaction (institution ops) | – | ≥ 4/5 | ≥ 4/5 |

---

## 14. Release plan

| Phase | Scope | Exit criteria |
|---|---|---|
| **0 — Hackathon prototype** | Mock APAAR adapter, 1M+ synthetic rows, upload with live validation, over-intake and duplicate alerts, anomaly review, trust score, NL query, credential issue + QR verify (offline-capable), audit chain | All four demo scenarios run end-to-end |
| **1 — Pilot** | Real APAAR adapter, AICTE SSO, 100 institutions, ERP webhook for 2–3 vendors, reports, consent ledger, PostgreSQL + ClickHouse | VAPT passed; DPIA done; pilot KPIs met |
| **2 — National rollout** | All institutions, certificate integration, forecasting, accreditation packs, K8s on MeghRaj | Capacity test at 10M rows; DR drill |
| **3 — Ecosystem** | UGC, NCVET, state boards, employer API, wallet integrations | Signed data-sharing agreements |

---

## 15. Demo scenarios (acceptance for Phase 0)

| # | Scenario | Pass condition |
|---|---|---|
| D1 | **Bulk upload + live validation + over-intake alert** | Upload sample CSV; stepper shows live progress; invalid, missing, in-file duplicates, and cross-institution duplicates are listed; B.Tech CSE flagged as exceeding approved seats; a critical alert appears on AICTE Home within seconds |
| D2 | **Cross-institution duplicate catch** | Students active at two institutions are flagged with both institutions named; legitimate transfers are not flagged |
| D3 | **QR credential verification by employer** | Student shares only selected claims; scanning shows a single "Verified" result on a phone; tampered token shows "Not valid"; revoked share shows "Revoked" |
| D4 | **Natural-language query + trust score** | Ask "Which institutions exceeded intake?"; answer shows table and "How I got this"; trust score screen shows component breakdown |

---

## 16. Acceptance criteria (selected, Given/When/Then)

- **AC-1 Invalid APAAR.** *Given* a row with a failing check digit, *when* it is uploaded, *then* it is rejected with rule `APAAR-INVALID`, the row number, and no student record is created.
- **AC-2 Over-intake.** *Given* a programme with 120 approved seats and 107 active students, *when* a batch adds 49 valid distinct students, *then* the batch result shows "would reach 156 against 120", a critical alert is created, and nothing is promoted to the repository until review.
- **AC-3 Idempotency.** *Given* a previously accepted file, *when* it is uploaded again, *then* row counts in the repository do not change.
- **AC-4 Transfer.** *Given* a student Active at A, *when* A marks them Transferred and B submits them Active, *then* no duplicate alert is raised.
- **AC-5 Selective disclosure.** *Given* a student shares only "programme" and "status", *when* the QR is scanned, *then* the response contains no other student attribute.
- **AC-6 Tamper.** *Given* any change to a token's payload, *when* verified, *then* the result is "Not valid".
- **AC-7 Revocation.** *Given* a revoked share, *when* verified online, *then* the result is "Revoked" within 5 seconds of revocation.
- **AC-8 Audit integrity.** *Given* any modification to a historical audit entry, *when* the integrity check runs, *then* it reports the chain as broken and identifies the first bad entry.
- **AC-9 NLQ safety.** *Given* a question requesting data outside the user's role, *when* submitted, *then* the plan is rejected by policy and the user is told why.
- **AC-10 Access control.** *Given* an institution user, *when* requesting another institution's records, *then* the response is 403 and the attempt is audited.

---

## 17. Dependencies and assumptions

**Dependencies:** access to APAAR registry/DigiLocker APIs; AICTE SSO and institution master data; HSM/KMS on hosting platform; NIC/MeghRaj hosting.

**Assumptions:**
- APAAR is a 12-digit identifier; the prototype uses an illustrative check digit and a mock registry.
- Approved intake and quota parameters are available per programme per year.
- Institutions can produce a CSV/Excel export from their systems.
- Students have or can obtain APAAR IDs; missing IDs are handled by a pending-identity queue, not by guessing.

---

## 18. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| APAAR coverage incomplete | Medium | High | Pending-identity queue; phased onboarding; wizard for aggregate institutions |
| Institution resistance | Medium | High | Clear templates, fast feedback, correction workflow; no automatic penalties |
| False positives erode trust | Medium | Medium | Evidence-based scores, human decisions, tunable thresholds, dismissal feedback |
| Privacy incident | Low | Critical | Field encryption, minimisation, consent, masking, audit, VAPT |
| Registry downtime | Medium | Medium | Adapter with queue/retry and cached results |
| Key compromise | Low | Critical | HSM, rotation, short-lived credentials, revocation |
| Gaming of data to beat rules | Medium | Medium | ML pattern detection, Trust Score hidden from institutions, spot audits |
| Peak-season load | High | Medium | Autoscaling on queue lag, pre-scaling, back-pressure |
| Scope creep | Medium | Medium | P0/P1/P2 discipline; non-goals list |

---

## 19. Open questions

1. Exact quota percentages (supernumerary, NRI, OCI, FN) per programme level and year — to be confirmed with AICTE circulars.
2. Official APAAR API access model and consent flow for registry lookups.
3. Whether degree-awarding bodies outside AICTE will consume the certificate API directly.
4. Retention periods for student-level records and audit logs under applicable law.
5. Regional-language priority list for the first release.
6. Whether employers need a bulk-verification channel (with contract and quotas) in phase 3.

---

## 20. Traceability matrix

| PS Req | Functional requirements | Demo scenario |
|---|---|---|
| 1 | FR-ING-01–12 | D1 |
| 2 | FR-DAT-01–09 | D1 |
| 3 | FR-VAL-01–10, FR-ANO-01–03 | D1, D2 |
| 4 | FR-DSH-01–08 | D1, D4 |
| 5 | FR-VER-01–11 | D3 |
| 6 | FR-VER-01–08 | D3 |
| 7 | FR-INT-01–05, FR-ING-02/04 | – |
| 8 | FR-SEC-01–12 | D3 |
| 9 | FR-RPT-01–05 | D4 |
| 10 | FR-CER-01–04 | D3 |
| Innovation | FR-ANO-04–08, FR-NLQ-01–06 | D2, D4 |

---

## 21. Glossary

| Term | Meaning |
|---|---|
| **APAAR ID** | Automated Permanent Academic Account Registry identifier, the national academic ID |
| **AICTE** | All India Council for Technical Education |
| **Approved intake** | Seats AICTE has approved for a programme in a year |
| **Supernumerary seats** | Seats allowed beyond approved intake under specific rules |
| **NRI / OCI / FN** | Non-Resident Indian / Overseas Citizen of India / Foreign National admission categories |
| **VC** | Verifiable Credential, a signed, machine-verifiable claim set |
| **Selective disclosure** | Sharing only chosen claims from a credential |
| **DPDP Act 2023** | Digital Personal Data Protection Act, 2023 (India) |
| **Isolation Forest** | Unsupervised ML method that isolates unusual points |
| **RBAC** | Role-Based Access Control |
| **SSE** | Server-Sent Events, one-way real-time updates over HTTP |
| **MeghRaj** | Government of India cloud initiative |

---

*End of PRD.*
