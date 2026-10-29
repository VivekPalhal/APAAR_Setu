# APAAR Setu — Backend Engine

High-performance FastAPI analytics & cryptographic verification service for APAAR Setu.

## Features
- **Synthetic Data Generator**: Generates 1M+ student-level enrolment records across ~1,600 institutions with planted anomaly test cases (`generator.py`).
- **Explainable Anomaly Intelligence**: Rule-based screening combined with Scikit-learn `IsolationForest` unsupervised outlier scoring.
- **W3C Verifiable Credentials**: Cryptographic Ed25519 digital signature issuer and verifier for offline student credentials.
- **DPDP Act 2023 Consent Ledger**: Consent audit log and tamper-evident hash chaining.

## Setup & Running

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Generate database (~1M rows synthetic data, ~15s)
python generator.py 1000000 apaarsetu.db

# 4. Start the FastAPI server
uvicorn app:app --port 8000 --reload
```
API documentation will be accessible at: `http://localhost:8000/docs`
