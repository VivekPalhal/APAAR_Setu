'use client';
import { PageHeader, Card, Table, Badge } from '@/components/ui';
import { ShieldCheck, History } from 'lucide-react';

export default function StudentActivityPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Verification & Consent Audit Trail" 
        subtitle="Complete log of third-party verifications and institutional state changes for your APAAR ID"
      />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={16} color="var(--ok)" />
          <span style={{ fontSize: 13, color: 'var(--text)' }}>
            Your data is protected under the Digital Personal Data Protection (DPDP) Act 2023. No entity can query without cryptographic consent.
          </span>
        </div>
      </Card>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <Table
          columns={['Timestamp', 'Verifier / Organization', 'Purpose', 'Shared Claims', 'Verification Result']}
          rows={[
            {
              Timestamp: '27 Oct 2026, 17:10',
              'Verifier / Organization': 'Tata Consultancy Services HR',
              Purpose: 'Pre-Employment Background Check',
              'Shared Claims': 'Programme, Status, Year',
              'Verification Result': <Badge variant="ok" size="sm">✓ Verified Offline (Ed25519)</Badge>
            },
            {
              Timestamp: '22 Oct 2026, 14:02',
              'Verifier / Organization': 'Rajiv Gandhi Inst. of Tech',
              Purpose: 'Annual AICTE Enrolment Rollup',
              'Shared Claims': 'Full Academic Record',
              'Verification Result': <Badge variant="ok" size="sm">✓ Approved & Reconciled</Badge>
            },
            {
              Timestamp: '15 Sep 2026, 09:30',
              'Verifier / Organization': 'DigiLocker Issuance Gateway',
              Purpose: 'Credential Sync to Citizen Wallet',
              'Shared Claims': 'W3C Signed Verifiable Credential',
              'Verification Result': <Badge variant="ok" size="sm">✓ Synced</Badge>
            }
          ]}
        />
      </div>
    </div>
  );
}
