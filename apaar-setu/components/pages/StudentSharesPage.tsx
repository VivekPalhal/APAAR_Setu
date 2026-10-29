'use client';
import { useState } from 'react';
import { PageHeader, Card, Btn, Badge, Table } from '@/components/ui';
import { QrCode, Shield, Check, Copy, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function StudentSharesPage() {
  const [selectedClaims, setSelectedClaims] = useState({
    programme: true,
    status: true,
    year: true,
    institution: false,
    marks: false
  });
  const [purpose, setPurpose] = useState('Employment Background Verification');
  const [expiry, setExpiry] = useState('7');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const toggleClaim = (k: keyof typeof selectedClaims) => {
    setSelectedClaims(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const handleGenerate = () => {
    setGeneratedLink('/verify/demo-verified');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Selective Credential Disclosure & DPDP Consent Ledger" 
        subtitle="Share minimal academic claims with employers without revealing sensitive identity or unconsented marks"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Share Form */}
        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>1. Select Attributes to Disclose (Zero-Knowledge)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { id: 'programme', label: 'Degree Programme (B.Tech CSE)' },
              { id: 'status', label: 'Enrolment State (Active)' },
              { id: 'year', label: 'Academic Year (2025-26)' },
              { id: 'institution', label: 'Institution Name (Rajiv Gandhi Inst)' },
              { id: 'marks', label: 'Cumulative GPA / Marks (Confidential)' },
            ].map((claim) => (
              <label 
                key={claim.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: selectedClaims[claim.id as keyof typeof selectedClaims] ? 'var(--accent-soft)' : 'var(--surface-2)'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={selectedClaims[claim.id as keyof typeof selectedClaims]} 
                  onChange={() => toggleClaim(claim.id as keyof typeof selectedClaims)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span style={{ fontWeight: selectedClaims[claim.id as keyof typeof selectedClaims] ? 600 : 400 }}>
                  {claim.label}
                </span>
              </label>
            ))}
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>2. Purpose & Expiry Limitation</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Purpose</label>
              <select 
                value={purpose} 
                onChange={(e) => setPurpose(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                <option>Employment Background Verification</option>
                <option>Higher Education Admission</option>
                <option>Bank Education Loan Verification</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Valid For</label>
              <select 
                value={expiry} 
                onChange={(e) => setExpiry(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </div>

          <Btn variant="primary" size="md" icon={<QrCode size={14} />} onClick={handleGenerate}>
            Generate Signed QR Token
          </Btn>
        </Card>

        {/* Live Verifier Preview Card */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
              <Eye size={14} />
              <span>LIVE PREVIEW: What the Employer Will See</span>
            </div>

            <div style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '16px',
              fontSize: 13
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ok)', fontWeight: 600, marginBottom: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)' }} />
                AICTE Verifiable Credential (W3C Standard)
              </div>

              {selectedClaims.programme && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Programme:</span>
                  <strong>B.Tech CSE</strong>
                </div>
              )}
              {selectedClaims.status && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <strong style={{ color: 'var(--ok)' }}>Active Enrolment</strong>
                </div>
              )}
              {selectedClaims.year && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Academic Year:</span>
                  <strong>2025-26</strong>
                </div>
              )}
              {selectedClaims.institution && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Institution:</span>
                  <strong>Rajiv Gandhi Inst. of Tech</strong>
                </div>
              )}
              {!selectedClaims.marks && (
                <div style={{ padding: '6px 0', fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  🔒 Marks / GPA masked per student consent
                </div>
              )}
            </div>
          </div>

          {generatedLink && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Link href={generatedLink} target="_blank" style={{ textDecoration: 'none', flex: 1 }}>
                  <Btn variant="primary" size="sm" icon={<Eye size={13} />}>
                    Open Verifier View
                  </Btn>
                </Link>
                <Btn variant="secondary" size="sm" icon={<Copy size={13} />} onClick={() => alert('Verification URL copied to clipboard')}>
                  Copy Link
                </Btn>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Active Consent Shares Ledger */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Active Shared Tokens (DPDP Right to Revoke)</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Revocation updates verification endpoint immediately</span>
        </div>
        <Table
          columns={['Recipient / Purpose', 'Disclosed Claims', 'Issued Date', 'Expiry', 'Actions']}
          rows={[
            {
              'Recipient / Purpose': 'Tata Consultancy Services (Employment Verification)',
              'Disclosed Claims': 'Programme, Status, Year',
              'Issued Date': '26 Oct 2026',
              'Expiry': <Badge variant="ok" size="sm">Valid (6 days left)</Badge>,
              'Actions': <Btn variant="danger" size="sm" icon={<Trash2 size={12} />} onClick={() => alert('Token revoked. Verifiers will receive 410 Revoked response.')}>Revoke</Btn>
            },
            {
              'Recipient / Purpose': 'State Bank of India (Education Loan Dept)',
              'Disclosed Claims': 'Programme, Status, Year, College Name',
              'Issued Date': '10 Oct 2026',
              'Expiry': <Badge variant="neutral" size="sm">Expired</Badge>,
              'Actions': <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Expired</span>
            }
          ]}
        />
      </Card>
    </div>
  );
}
