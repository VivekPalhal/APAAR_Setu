'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Building2, TrendingUp, ArrowRight } from 'lucide-react';
import { ALERTS } from '@/lib/data';
import { Badge, statusBadge, StatCard, PageHeader, Btn, Card } from '@/components/ui';
import Link from 'next/link';

function AttentionRow({ alert }: { alert: typeof ALERTS[0] }) {
  const severityIcon = alert.severity === 'critical' ? '●' : alert.severity === 'warning' ? '●' : '●';
  const severityColor = alert.severity === 'critical' ? 'var(--crit)' : alert.severity === 'warning' ? 'var(--warn)' : 'var(--info)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ color: severityColor, fontSize: 10, flexShrink: 0 }}>{severityIcon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, color: 'var(--text)' }}>{alert.title}</span>
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{alert.age}</span>
      <Link href="/alerts" style={{
        fontSize: 12, color: 'var(--accent)', fontWeight: 500, whiteSpace: 'nowrap',
        textDecoration: 'none',
        padding: '4px 10px',
        background: 'var(--accent-soft)',
        borderRadius: 4,
      }}>
        Review
      </Link>
    </div>
  );
}

export default function AICTEHome() {
  const [students, setStudents] = useState(1040000);
  const [pending, setPending] = useState(2310);

  useEffect(() => {
    const t = setInterval(() => {
      setStudents(v => v + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Overview"
        subtitle="Today · 27 Oct 2026"
        action={
          <Link href="/alerts" style={{ textDecoration: 'none' }}>
            <Btn variant="primary" size="sm" icon={<AlertTriangle size={13} />}>
              12 open alerts
            </Btn>
          </Link>
        }
      />

      {/* Attention list */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        marginBottom: 24,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface-2)',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Needs attention</span>
          <Link href="/alerts" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {ALERTS.slice(0, 4).map(a => <AttentionRow key={a.id} alert={a} />)}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard
          label="Students verified"
          value={students.toLocaleString('en-IN')}
          sub="This cycle"
          color="var(--ok)"
        />
        <StatCard
          label="Pending validation"
          value={pending.toLocaleString('en-IN')}
          sub="Across all institutions"
        />
        <StatCard
          label="Open anomalies"
          value="187"
          sub="12 critical"
          color="var(--crit)"
        />
        <StatCard
          label="Institutions reporting"
          value="11,942"
          sub="of 15,106 total"
        />
      </div>

      {/* Progress bar */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Institutions reporting this cycle</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>11,942 / 15,106</span>
        </div>
        <div style={{ width: '100%', height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(11942/15106)*100}%`, background: 'var(--accent)', borderRadius: 4 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>79.1% reporting</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>3,164 yet to submit</span>
        </div>
      </Card>

      {/* Quick actions row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <Link href="/alerts" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <AlertTriangle size={18} color="var(--crit)" strokeWidth={1.5} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Review Alerts</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>12 critical · 38 total open</div>
          </div>
        </Link>
        <Link href="/institutions" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <Building2 size={18} color="var(--accent)" strokeWidth={1.5} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Institutions</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>15,106 registered · Browse all</div>
          </div>
        </Link>
        <Link href="/ask" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <TrendingUp size={18} color="var(--ok)" strokeWidth={1.5} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Ask APAAR Setu</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Natural language queries</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
