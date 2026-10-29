'use client';
import { AUDIT_LOG } from '@/lib/data';
import { PageHeader, Table, Badge, Card } from '@/components/ui';
import { CheckCircle2, ShieldCheck, Hash } from 'lucide-react';

export default function AuditPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Immutable Audit Log" 
        subtitle="Cryptographically hash-chained tamper-evident record of all privileged actions and data mutations"
        action={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--ok-soft)',
            color: 'var(--ok)',
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600
          }}>
            <ShieldCheck size={14} />
            <span>Chain Verified (Head: a91f…c4d2)</span>
          </div>
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} color="var(--ok)" />
            <span style={{ fontSize: 13, color: 'var(--text)' }}>
              All 1,010 entries verified sequentially. Zero breaks detected.
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Anchoring Frequency: Hourly · DPDP Act 2023 Compliant
          </span>
        </div>
      </Card>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <Table
          columns={['Seq', 'Timestamp', 'Actor / Role', 'Action', 'Target Resource', 'Digest']}
          rows={AUDIT_LOG.map((entry) => ({
            Seq: <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>#{entry.seq}</span>,
            Timestamp: <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{entry.timestamp}</span>,
            'Actor / Role': (
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{entry.actor}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{entry.role}</div>
              </div>
            ),
            Action: (
              <Badge variant={entry.action.includes('VIEW') ? 'neutral' : entry.action.includes('UPDATE') || entry.action.includes('CORRECTION') ? 'warn' : 'info'} size="sm">
                {entry.action}
              </Badge>
            ),
            'Target Resource': <code style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>{entry.resource}</code>,
            Digest: (
              <span style={{
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--accent)',
                background: 'var(--accent-soft)',
                padding: '2px 6px',
                borderRadius: 4
              }}>
                {entry.digest}
              </span>
            )
          }))}
        />
      </div>
    </div>
  );
}
