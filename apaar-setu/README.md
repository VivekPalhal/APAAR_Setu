# APAAR Setu — Frontend Web Prototype

Interactive Next.js 16 Web Application Prototype for **APAAR Setu** (Smart India Hackathon SIH 26263).

## Key Capabilities
- **6 Role-Based Views**: Instant persona switcher for AICTE Regulator, AICTE Super Admin, Institution Admin, Data Operator, Student (Kavya), and Employer/Verifier.
- **Trust-First Ingestion**: Interactive multi-stage upload wizard (`/upload`) with syntax checks, intake capacity validation, and anomaly flag warnings.
- **Deep Analytics & Alerts**: Real-time institution trust rating matrix (`/institutions`), duplicate & over-intake alerts (`/alerts`), and interactive query assistant (`/ask`).
- **Student Privacy & W3C Verifiable Credentials**: Student record portal (`/my-record`), purpose-bound selective disclosure manager (`/shares`), and tamper-evident QR verification (`/verify/[token]`).
- **Immutable Audit Trail**: Chronological hash-chained audit log (`/audit`) tracking uploads, consent delegations, and credential checks.

## Getting Started

```bash
# Install dependencies
pnpm install
# or: npm install / yarn install

# Start the development server
pnpm dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the prototype.
