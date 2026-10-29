'use client';
import { PageHeader, Card, Table, Badge, Btn, StatCard } from '@/components/ui';
import { KeyRound, ShieldAlert, UserPlus, RefreshCw } from 'lucide-react';

export default function UsersKeysPage() {
  const users = [
    { name: 'Anita Sharma', email: 'anita.sharma@aicte.gov.in', role: 'AICTE Regulator', mfa: 'WebAuthn Enabled', status: 'Active' },
    { name: 'Rakesh Verma', email: 'rakesh.admin@aicte.gov.in', role: 'AICTE Super Admin', mfa: 'TOTP Enabled', status: 'Active' },
    { name: 'Meera Deshmukh', email: 'meera.reg@rgitech.ac.in', role: 'Institution Admin', mfa: 'SMS 2FA', status: 'Active' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Access Control & Cryptographic Keys" 
        subtitle="Manage administrative credentials, Ed25519 signing pairs, and RBAC authorization policies" 
      />

      {/* Key Management Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <KeyRound size={20} color="var(--accent)" />
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Active Credential Signing Key</h3>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Algorithm: <strong style={{ color: 'var(--text)' }}>Ed25519 (did:web:aicte.gov.in)</strong></div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Key ID: <code style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent)' }}>key-2026-q4</code></div>
          <Btn variant="secondary" size="sm" icon={<RefreshCw size={12} />} onClick={() => alert('Key rotation workflow initiated (Zero downtime)')}>
            Rotate Key
          </Btn>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <ShieldAlert size={20} color="var(--ok)" />
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>HSM & Envelope Encryption</h3>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Status: <strong style={{ color: 'var(--ok)' }}>Hardware Security Module Online</strong></div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Field-level KMS keys active for student personal data (DPDP Act)</div>
        </Card>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Privileged Users & Administrators</span>
          <Btn variant="primary" size="sm" icon={<UserPlus size={12} />} onClick={() => alert('Invite new administrator modal')}>Add User</Btn>
        </div>
        <Table
          columns={['Name & Email', 'Role', 'Multi-Factor Auth', 'Status']}
          rows={users.map(u => ({
            'Name & Email': (
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{u.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
              </div>
            ),
            Role: <Badge variant="neutral" size="sm">{u.role}</Badge>,
            'Multi-Factor Auth': <Badge variant="ok" size="sm">{u.mfa}</Badge>,
            Status: <Badge variant="ok" size="sm">{u.status}</Badge>,
          }))}
        />
      </div>
    </div>
  );
}
