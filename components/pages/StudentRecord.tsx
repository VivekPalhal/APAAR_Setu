'use client';
import { PageHeader, Card, Table, Badge, Btn, IDChip } from '@/components/ui';
import { ShieldCheck, Share2, Award, Building, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function StudentRecord() {
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="National Academic Record" 
        subtitle="Cryptographically verified academic identity backed by AICTE & APAAR"
        action={
          <Link href="/shares" style={{ textDecoration: 'none' }}>
            <Btn variant="primary" size="md" icon={<Share2 size={14} />}>
              Share Credential
            </Btn>
          </Link>
        }
      />

      {/* Main Student Profile Card */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700
            }}>
              KS
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Kavya Sharma</h2>
                <Badge variant="ok" size="sm">Verified Active</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Unified APAAR ID:</span>
                <IDChip id="4821 7730 2915" />
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Digital Locker Status</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}>
              <ShieldCheck size={16} /> Linked & Authenticated
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginTop: 24,
          paddingTop: 20,
          borderTop: '1px solid var(--border)'
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Current Degree Programme</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>B.Tech Computer Science & Eng.</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Institution Name</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Rajiv Gandhi Inst. of Tech (Mumbai)</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Admission Academic Cycle</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>2025-26 (Regular Merit)</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Enrolment State</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ok)' }}>Active (No Cross-Duplicates)</div>
          </div>
        </div>
      </Card>

      {/* Verified Claims List */}
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Digital Claims Backed by AICTE PKI</h3>
        <Table
          columns={['Claim Attribute', 'Claim Value', 'Verification Source', 'Tamper Status']}
          rows={[
            { 'Claim Attribute': 'Academic Identity (APAAR)', 'Claim Value': '4821 7730 2915', 'Verification Source': 'National Academic Registry (MoE)', 'Tamper Status': <Badge variant="ok" size="sm">Valid Luhn + Registry Match</Badge> },
            { 'Claim Attribute': 'Approved Intake Seat', 'Claim Value': 'Regular Merit Seat #42', 'Verification Source': 'AICTE Regulation Bureau', 'Tamper Status': <Badge variant="ok" size="sm">Intake Quota Reconciled</Badge> },
            { 'Claim Attribute': 'Degree Status', 'Claim Value': 'Semester 1 Enrolled', 'Verification Source': 'University Registrar Webhook', 'Tamper Status': <Badge variant="ok" size="sm">Digitally Signed Ed25519</Badge> },
          ]}
        />
      </Card>
    </div>
  );
}
