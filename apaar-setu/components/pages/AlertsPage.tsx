'use client';
import { useState } from 'react';
import { ALERTS } from '@/lib/data';
import { Badge, statusBadge, RiskMeter, PageHeader, Btn, Card } from '@/components/ui';
import { AlertTriangle, CheckCircle, XCircle, ArrowUp, MessageSquare } from 'lucide-react';

export default function AlertsPage() {
  const [selected, setSelected] = useState<typeof ALERTS[0] | null>(ALERTS[0]);
  const [actionDone, setActionDone] = useState<string | null>(null);

  const severityVariant = (s: string) =>
    s === 'critical' ? 'crit' : s === 'warning' ? 'warn' : 'info';

  const handleAction = (action: string) => {
    setActionDone(action);
    setTimeout(() => setActionDone(null), 2500);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Alerts" subtitle={`${ALERTS.filter(a => a.status === 'open').length} open · ${ALERTS.filter(a => a.severity === 'critical').length} critical`} />

      {actionDone && (
        <div style={{
          padding: '10px 16px', marginBottom: 16,
          background: 'var(--ok-soft)', color: 'var(--ok)',
          borderRadius: 8, fontSize: 13, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <CheckCircle size={14} />
          Action recorded: {actionDone}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, minHeight: 500 }}>
        {/* Left: alert list */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden',
        }}>
          {ALERTS.map((a, i) => (
            <div
              key={a.id}
              onClick={() => setSelected(a)}
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                background: selected?.id === a.id ? 'var(--accent-soft)' : 'transparent',
                borderLeft: selected?.id === a.id ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'background 0.1s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                  background: a.severity === 'critical' ? 'var(--crit)' : a.severity === 'warning' ? 'var(--warn)' : 'var(--info)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RiskMeter score={a.riskScore} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.age}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: evidence panel */}
        {selected && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{selected.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selected.description}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge variant={severityVariant(selected.severity) as any}>
                  {selected.severity.charAt(0).toUpperCase() + selected.severity.slice(1)}
                </Badge>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                  Rule: {selected.rule}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selected.affectedRows} rows affected</span>
                {selected.institution && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>@ {selected.institution}</span>
                )}
              </div>
            </div>

            <div style={{ padding: '16px 20px' }}>
              {/* Risk score */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8 }}>RISK SCORE</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      width: `${selected.riskScore}%`,
                      background: selected.riskScore >= 70 ? 'var(--crit)' : selected.riskScore >= 40 ? 'var(--warn)' : 'var(--ok)',
                    }} />
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: selected.riskScore >= 70 ? 'var(--crit)' : 'var(--warn)', minWidth: 32 }}>
                    {selected.riskScore}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>

              {/* Evidence */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 10 }}>EVIDENCE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selected.evidence.map((ev, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px',
                      background: ev.highlight ? 'var(--crit-soft)' : 'var(--surface-2)',
                      borderRadius: 6,
                    }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ev.label}</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: ev.highlight ? 'var(--crit)' : 'var(--text)' }}>{ev.value}</span>
                        {ev.peer && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>({ev.peer})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              {selected.comments.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8 }}>COMMENTS</div>
                  {selected.comments.map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--text)', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 6 }}>
                      <span style={{ fontWeight: 500 }}>{c.author}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>{c.time}</span>
                      <div style={{ marginTop: 3 }}>{c.text}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn variant="primary" size="sm" onClick={() => handleAction('Correction Requested')}
                  icon={<MessageSquare size={12} />}>
                  Request Correction
                </Btn>
                <Btn variant="secondary" size="sm" onClick={() => handleAction('Approved')}
                  icon={<CheckCircle size={12} />}>
                  Approve
                </Btn>
                <Btn variant="ghost" size="sm" onClick={() => handleAction('Dismissed')}
                  icon={<XCircle size={12} />}>
                  Dismiss
                </Btn>
                <Btn variant="ghost" size="sm" onClick={() => handleAction('Escalated')}
                  icon={<ArrowUp size={12} />}>
                  Escalate
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
