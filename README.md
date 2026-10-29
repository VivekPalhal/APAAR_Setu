# APAAR Setu (अपार सेतु)

### APAAR-Based Student Data Management & Verification Platform
**Problem Statement SIH 26263** · AICTE, Regulation Bureau · **Theme:** Smart Automation

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-yellow?style=flat&logo=python)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Isolation_Forest-orange?style=flat&logo=scikit-learn)](https://scikit-learn.org/)
[![Security](https://img.shields.io/badge/Cryptography-Ed25519_PKI-green?style=flat)](https://w3c.github.io/vc-data-model/)
[![DPDP Act](https://img.shields.io/badge/Compliance-DPDP_Act_2023-purple?style=flat)](https://www.meity.gov.in/)

---

## 📌 Executive Summary

AICTE oversees 15,000+ technical institutions across India. Historically, student data submission has been fragmented: PGDM institutions submit raw student lists while universities report aggregate enrollment totals. This fragmentation has introduced severe challenges:
- **Ghost Enrollments & Seat Fraud**: Inability to identify students concurrently enrolled in multiple technical colleges.
- **Unapproved Over-Intake**: Institutions admitting students beyond approved AICTE intake quotas.
- **Credential Forgery**: Tamperable degree certificates and transcripts lacking real-time or offline cryptographic verification.
- **Privacy Gaps**: Absence of student-governed data sharing complying with India's **Digital Personal Data Protection (DPDP) Act 2023**.

**APAAR Setu (सेतु, "bridge")** solves this as a seamless **plug-in module for the AICTE portal**. It establishes a single, cryptographically verifiable, student-level ledger keyed on **APAAR ID (Automated Permanent Academic Account Registry)** across all technical institutions in India.

---

## 🏛️ Core Architectural Pillars

```
+---------------------------------------------------------------------------------------+
|                                      APAAR SETU                                       |
+---------------------------+---------------------------+-------------------------------+
|    Trust-First Ingestion  | Explainable Anomaly Intel |  Offline-Verifiable Creds     |
|  - Instant syntax check   | - Deterministic rules     |  - W3C Verifiable Credentials |
|  - Async intake audit     | - Isolation Forest ML     |  - Ed25519 PKI Signatures     |
|  - Zero invalid writes    | - Transparent risk score  |  - Zero-internet QR verify    |
+---------------------------+---------------------------+-------------------------------+
|                      DPDP Act 2023 Compliant Consent & Audit Ledger                   |
+---------------------------------------------------------------------------------------+
```

### 1. 🛡️ Trust-First Ingestion Pipeline
Every student upload passes through a two-tier screening process:
- **Tier 1 (Instant Synchronous)**: Fast syntactical validation checking APAAR checksums, mandatory headers, date formats, and category standards.
- **Tier 2 (Deep Asynchronous Engine)**: Validates against AICTE approved intake thresholds, detects active dual enrollments across universities, checks transfer legitimacy, and flags duplicate submissions.

### 2. 🧠 Explainable Anomaly Intelligence
Rather than black-box decisions, APAAR Setu combines:
- **Deterministic Rules Engine**: Flags clear policy violations (e.g., admitting 135 students in a 120-seat branch).
- **Unsupervised Machine Learning (Isolation Forest)**: Detects subtle multivariate outliers (unusual NRI quota spikes, irregular spot-round admissions, sudden batch anomalies).
- **Explainable Evidence Cards**: Officers receive a human-readable justification breakdown for every flagged record or institution.

### 3. 📜 Offline-Verifiable W3C Credentials
- Student records generate a **W3C-compliant Verifiable Credential**, signed by AICTE's root Ed25519 cryptographic key.
- Encoded into a high-density, tamper-evident QR code that employers or verifiers can validate on mobile devices **without internet connectivity or AICTE database lookups**.

### 4. 🔒 DPDP Act 2023 Privacy & Consent Framework
- **Purpose-Bound Sharing**: Students select exactly which data attributes to share (e.g., share CGPA and completion year without disclosing full marksheets or category).
- **Time-Bound Validity**: Configurable expiration windows (e.g., 7 days for a job application).
- **Instant Revocation**: Students can revoke shared credentials at any moment via their portal.
- **Immutable Audit Trail**: Chronologically hash-chained ledger logging every upload, consent event, and credential verification.

---

## 👥 Persona Portals & Workflows

| Persona | Key Views & Capabilities | Target Role |
|---------|-------------------------|-------------|
| **AICTE Regulator** | Dashboard overview, anomaly severity triage, national institution registry, interactive query interface (`/ask`), compliance reports | AICTE Bureau Officers |
| **AICTE Super Admin** | Anomaly rules management (`/rules`), Ed25519 PKI key rotation, user permissions (`/users`), tamper-evident audit ledger (`/audit`) | System Administrators |
| **Institution Admin** | Intake capacity monitoring, batch upload history, discrepancy corrections (`/corrections`), approval compliance | College Deans / Directors |
| **Data Operator** | Multi-stage CSV/Excel upload stepper (`/upload`), validation warnings, syntax feedback | College Registrar Staff |
| **Student (Kavya)** | Digilocker-style academic record viewer (`/my-record`), selective consent generator (`/shares`), view access logs (`/activity`) | Enrolled Students |
| **Employer / Verifier** | Instant tamper-evident credential verification (`/verify/[token]`), offline cryptographic validation | Recruiters / Universities |

---

## 💻 Tech Stack

### Web Prototype (`apaar-setu`)
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Runtime**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Flow**: Context-driven dynamic multi-role switcher

### Analytics & Verification Backend (`backend`)
- **API Framework**: [FastAPI](https://fastapi.tiangolo.com/) + Uvicorn
- **Machine Learning**: [Scikit-learn](https://scikit-learn.org/) (`IsolationForest`)
- **Data Engine**: NumPy + SQLite
- **Cryptography**: Ed25519 asymmetric key pairs via Python `cryptography`
- **QR Generation**: `segno` micro & macro QR encoder
- **Synthetic Data**: Generator capable of synthesizing 1,000,000+ realistic student records across ~1,600 institutions (`generator.py`)

---

## 🚀 Quickstart Guide

### 1. Running the Interactive Frontend Prototype

```bash
# Clone the repository
git clone https://github.com/VivekPalhal/APAAR_Setu.git
cd APAAR_Setu

# Install dependencies
pnpm install
# or: npm install

# Start development server
pnpm dev
# or: npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser. Use the persona switcher in the navigation bar to test all 6 roles.

### 2. Running the Python Analytics & Cryptography Service

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
# Linux / macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Generate synthetic 1M student dataset (takes ~15 seconds)
python generator.py 1000000 apaarsetu.db

# Launch FastAPI server
uvicorn app:app --port 8000 --reload
```

Interactive OpenAPI Swagger documentation will be available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

## 📂 Repository Structure

```
APAAR_Setu/
├── app/                         # Next.js App Router (16+ full route views)
│   ├── activity/                # Student access log
│   ├── alerts/                  # Regulator anomaly alerts & resolution
│   ├── ask/                     # Natural language query assistant
│   ├── audit/                   # Immutable hash-chained audit ledger
│   ├── corrections/             # Student record correction disputes
│   ├── inst/                    # Institution administrator portal
│   ├── institutions/            # National institution registry & trust bands
│   ├── my-record/               # Student W3C credential viewer
│   ├── reports/                 # Compliance analytics & national stats
│   ├── rules/                   # Anomaly threshold & ML rules engine
│   ├── shares/                  # DPDP selective disclosure manager
│   ├── students/                # College student database browser
│   ├── upload/                  # Multi-step batch upload wizard
│   ├── users/                   # Operator accounts & PKI key management
│   ├── verify/[token]/          # Employer offline credential verifier
│   ├── layout.tsx               # Global shell & responsive layout
│   └── page.tsx                 # Root regulator dashboard
├── components/                  # Shell, Nav, and role-specific UI components
├── lib/                         # Mock dataset, state context, utility functions
├── public/                      # Static assets & icons
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── next.config.ts               # Next.js configuration
├── backend/                     # FastAPI Anomaly Detection & Cryptography Engine
│   ├── app.py                   # FastAPI service with ML & Ed25519 PKI
│   ├── generator.py             # 1M+ student dataset generator with planted anomalies
│   ├── make_flow_images.py      # Sequence diagram generation script
│   ├── make_tables.py           # Presentation comparison generator
│   ├── make_tech_stack.py       # Architecture diagram builder
│   └── requirements.txt         # Python dependencies
├── docs/                        # Specifications & Architecture Documentation
│   ├── ARCHITECTURE.md          # Full System Architecture Document
│   ├── PRD.md                   # Product Requirements Document
│   ├── DEEP_FLOW.md             # End-to-end Data Processing Pipeline
│   └── UI_UX.md                 # Design System & User Journey Specifications
├── assets/                      # Diagrams, Visualizations & Media
│   ├── 01_upload_validation_sequence.png
│   ├── 02_credential_verification_sequence.png
│   ├── APAAR_Setu_Tech_Stack.png
│   └── slide-tables/            # Analysis slides & governance benefits
├── APAARSetu_SIH26.pptx          # Official Smart India Hackathon Presentation Deck
├── .gitignore                   # Production git ignore rules
└── README.md                    # Root project documentation
```

---

## 🔐 Security & Privacy Compliance

| Security Dimension | Implementation in APAAR Setu |
|--------------------|------------------------------|
| **Data Minimization** | Verifiable credentials only contain attributes explicitly consented to by the student. |
| **Cryptographic Integrity** | Ed25519 asymmetric signatures prevent degree manipulation or credential spoofing. |
| **Audit Immutability** | SHA-256 hash chaining ensures historical ingestion and verification events cannot be retroactively altered. |
| **Consent Revocation** | Real-time status list check allows students to invalidate shared links instantly. |
| **Zero-Knowledge Verification** | Verifiers can validate credential authenticity completely offline without querying student PII. |

---

## 🏆 Smart India Hackathon 2026
- **Problem Statement ID:** SIH 26263
- **Organization:** All India Council for Technical Education (AICTE), Ministry of Education
- **Theme:** Smart Automation
