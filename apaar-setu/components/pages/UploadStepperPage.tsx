'use client';
import { useState, useEffect } from 'react';
import { PageHeader, Card, Btn, Table, Badge, ProgressBar } from '@/components/ui';
import { Upload, FileCheck, ArrowRight, CheckCircle2, AlertTriangle, Download, RefreshCw } from 'lucide-react';

export default function UploadStepperPage() {
  const [step, setStep] = useState<number>(1);
  const [progress, setProgress] = useState({ processed: 0, passed: 0, flagged: 0 });
  const [isValidating, setIsValidating] = useState(false);

  const startValidation = () => {
    setIsValidating(true);
    setProgress({ processed: 0, passed: 0, flagged: 0 });
    let count = 0;
    const interval = setInterval(() => {
      count += 120;
      if (count >= 1240) {
        count = 1240;
        clearInterval(interval);
        setIsValidating(false);
        setProgress({ processed: 1240, passed: 1186, flagged: 54 });
      } else {
        const passed = Math.floor(count * 0.95);
        const flagged = count - passed;
        setProgress({ processed: count, passed, flagged });
      }
    }, 180);
  };

  useEffect(() => {
    if (step === 3 && progress.processed === 0 && !isValidating) {
      startValidation();
    }
  }, [step]);

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Student Admissions Batch Ingestion" 
        subtitle="Upload bulk CSV / XLSX records with instant Luhn verification and cross-institutional deep validation"
      />

      {/* Stepper Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '12px 20px',
        marginBottom: 24,
        overflowX: 'auto',
        gap: 16
      }}>
        {[
          { num: 1, label: '1. Select File' },
          { num: 2, label: '2. Column Mapping' },
          { num: 3, label: '3. Real-Time Validation' },
          { num: 4, label: '4. Review Flagged' },
          { num: 5, label: '5. Repository Commit' }
        ].map((s) => {
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div 
              key={s.num} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: isCurrent ? 'var(--accent)' : isDone ? 'var(--ok)' : 'var(--text-muted)',
                fontWeight: isCurrent ? 600 : 400,
                fontSize: 13,
                cursor: isDone ? 'pointer' : 'default'
              }}
              onClick={() => { if (isDone) setStep(s.num); }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                background: isCurrent ? 'var(--accent)' : isDone ? 'var(--ok-soft)' : 'var(--surface-2)',
                color: isCurrent ? '#fff' : isDone ? 'var(--ok)' : 'var(--text-muted)'
              }}>
                {isDone ? '✓' : s.num}
              </div>
              <span style={{ whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: CHOOSE FILE */}
      {step === 1 && (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{
            border: '2px dashed var(--border)',
            borderRadius: 12,
            padding: '40px 20px',
            background: 'var(--surface-2)',
            maxWidth: 600,
            margin: '0 auto 20px'
          }}>
            <Upload size={36} color="var(--accent)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
              Drop your student admissions CSV / XLSX here
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
              Supports batches up to 500,000 records. Standard format includes APAAR ID, Programme, and Seat Type.
            </p>
            <Btn variant="primary" size="md" onClick={() => setStep(2)}>
              Select Admissions_2025_Final.csv
            </Btn>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            <a href="#" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
              ↓ Download Official AICTE Batch Template
            </a>
            <span style={{ color: 'var(--border)' }}>|</span>
            <a href="#" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>
              Using ERP? Connect via Webhook / REST API
            </a>
          </div>
        </Card>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {step === 2 && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Verify Column Mapping</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Auto-detected 7 required fields with 100% confidence</p>
            </div>
            <Btn variant="primary" size="md" onClick={() => setStep(3)}>
              Confirm & Start Live Validation →
            </Btn>
          </div>
          <Table
            columns={['CSV Header in File', 'Canonical Schema Target', 'Confidence', 'Sample Value from Row 1']}
            rows={[
              { 'CSV Header in File': 'student_apaar', 'Canonical Schema Target': 'apaar_id (Mandatory)', Confidence: <Badge variant="ok" size="sm">100% Exact</Badge>, 'Sample Value from Row 1': '4821 7730 2915' },
              { 'CSV Header in File': 'candidate_name', 'Canonical Schema Target': 'student_name', Confidence: <Badge variant="ok" size="sm">100% Exact</Badge>, 'Sample Value from Row 1': 'Kavya Sharma' },
              { 'CSV Header in File': 'prog_enrolled', 'Canonical Schema Target': 'programme_code', Confidence: <Badge variant="ok" size="sm">98% Fuzzy</Badge>, 'Sample Value from Row 1': 'B.Tech CSE' },
              { 'CSV Header in File': 'seat_category', 'Canonical Schema Target': 'seat_type (Regular/NRI/OCI)', Confidence: <Badge variant="ok" size="sm">100% Exact</Badge>, 'Sample Value from Row 1': 'Regular' },
              { 'CSV Header in File': 'date_of_admission', 'Canonical Schema Target': 'admission_date (ISO 8601)', Confidence: <Badge variant="ok" size="sm">100% Exact</Badge>, 'Sample Value from Row 1': '2025-08-01' },
            ]}
          />
        </Card>
      )}

      {/* STEP 3: LIVE PROGRESS */}
      {step === 3 && (
        <Card style={{ padding: '36px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              {isValidating ? (
                <div className="animate-spin" style={{ width: 22, height: 22, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
              ) : (
                <CheckCircle2 size={24} color="var(--ok)" />
              )}
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>
                {isValidating ? 'Validating Batch Against Registry & Quotas...' : 'Validation Completed!'}
              </h3>
            </div>

            <div style={{ marginBottom: 18 }}>
              <ProgressBar value={progress.processed} max={1240} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Processed</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{progress.processed} / 1240</div>
              </div>
              <div style={{ background: 'var(--ok-soft)', padding: '12px', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--ok)' }}>Clean Records</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ok)' }}>{progress.passed}</div>
              </div>
              <div style={{ background: 'var(--crit-soft)', padding: '12px', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--crit)' }}>Flagged Issues</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--crit)' }}>{progress.flagged}</div>
              </div>
            </div>

            {!isValidating && (
              <Btn variant="primary" size="md" onClick={() => setStep(4)}>
                Review Flagged Issues ({progress.flagged}) →
              </Btn>
            )}
          </div>
        </Card>
      )}

      {/* STEP 4: REVIEW ISSUES */}
      {step === 4 && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Review Flagged Issues Before Commit</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>You can resolve inline or hold invalid records in the pending queue</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="secondary" size="sm" icon={<Download size={13} />} onClick={() => alert('Downloading flagged error report CSV')}>
                Download Error CSV
              </Btn>
              <Btn variant="primary" size="sm" onClick={() => setStep(5)}>
                Proceed to Submit →
              </Btn>
            </div>
          </div>

          <Table
            columns={['Row #', 'Student Name', 'Candidate APAAR', 'Detected Issue', 'Recommended Action']}
            rows={[
              { 'Row #': '14', 'Student Name': 'Rakesh Sharma', 'Candidate APAAR': <code style={{ color: 'var(--crit)' }}>4821 7730 2919</code>, 'Detected Issue': <Badge variant="crit" size="sm">APAAR-INVALID (Luhn Checksum)</Badge>, 'Recommended Action': 'Verify physical APAAR card' },
              { 'Row #': '89', 'Student Name': 'Neha Kulkarni', 'Candidate APAAR': <code>7710 4421 8832</code>, 'Detected Issue': <Badge variant="crit" size="sm">SEAT-OVER-INTAKE (B.Tech CSE)</Badge>, 'Recommended Action': 'Requires Excess Seat Justification' },
              { 'Row #': '104', 'Student Name': 'Vikram Rao', 'Candidate APAAR': <code>3390 1120 5541</code>, 'Detected Issue': <Badge variant="warn" size="sm">DUP-IN-FILE (Appears twice)</Badge>, 'Recommended Action': 'Deduplicated automatically' },
            ]}
          />
        </Card>
      )}

      {/* STEP 5: COMMIT / RECEIPT */}
      {step === 5 && (
        <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
          <CheckCircle2 size={48} color="var(--ok)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Batch Successfully Committed to Repository
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
            1,186 clean student records have been promoted to Active status. Batch cryptographic receipt has been anchored to the audit ledger.
          </p>

          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px', maxWidth: 440, margin: '0 auto 24px', textAlign: 'left', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Batch Reference:</span>
              <code style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent)' }}>BATCH-2026-0193F</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Records Promoted:</span>
              <strong>1,186 Active</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cryptographic Digest:</span>
              <code style={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}>e3b0c44298fc1c149afbf4c8...</code>
            </div>
          </div>

          <Btn variant="primary" size="md" onClick={() => setStep(1)}>
            Upload Another Batch
          </Btn>
        </Card>
      )}
    </div>
  );
}
