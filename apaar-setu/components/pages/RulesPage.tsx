'use client';
import { PageHeader, Card, Table, Badge, Btn } from '@/components/ui';
import { Sliders, ToggleLeft, ToggleRight, History } from 'lucide-react';
import { useState } from 'react';

export default function RulesPage() {
  const [rules, setRules] = useState([
    { id: 'SEAT-OVER-INTAKE', name: 'Approved Intake Hard Cap', severity: 'critical', version: 'v4.1', active: true, desc: 'Flags when Regular + NRI + OCI seats exceed approved capacity' },
    { id: 'DUP-CROSS-INSTITUTION', name: 'Cross-Institution Double Enrolment', severity: 'critical', version: 'v2.0', active: true, desc: 'Flags concurrent active enrolments without valid transfer' },
    { id: 'APAAR-CHECK-DIGIT', name: 'APAAR 12-Digit Luhn Check Digit', severity: 'critical', version: 'v1.0', active: true, desc: 'Instant rejection on invalid check digit format' },
    { id: 'QUOTA-SUPERNUMERARY-CAP', name: 'Supernumerary Seat Threshold (15%)', severity: 'warning', version: 'v3.2', active: true, desc: 'Warns if supernumerary exceeds allowed institutional ratio' },
    { id: 'SPOT-ROUND-SPIKE', name: 'Spot Round Enrolment Statistical Anomaly', severity: 'warning', version: 'v1.4', active: false, desc: 'Statistical outlier detection on spot round surges' },
  ]);

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Validation & Anomaly Rules" 
        subtitle="Configure real-time regulatory policies, parameter thresholds, and enforcement flags" 
      />

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <Table
          columns={['Rule ID', 'Rule Name & Scope', 'Severity', 'Version', 'Status', 'Actions']}
          rows={rules.map((rule) => ({
            'Rule ID': <code style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>{rule.id}</code>,
            'Rule Name & Scope': (
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{rule.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rule.desc}</div>
              </div>
            ),
            Severity: (
              <Badge variant={rule.severity === 'critical' ? 'crit' : 'warn'} size="sm">
                {rule.severity.toUpperCase()}
              </Badge>
            ),
            Version: <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{rule.version}</span>,
            Status: (
              <Badge variant={rule.active ? 'ok' : 'neutral'} size="sm">
                {rule.active ? 'Active' : 'Disabled'}
              </Badge>
            ),
            Actions: (
              <Btn 
                variant={rule.active ? 'ghost' : 'secondary'} 
                size="sm" 
                onClick={() => toggleRule(rule.id)}
              >
                {rule.active ? 'Disable' : 'Enable'}
              </Btn>
            )
          }))}
        />
      </div>
    </div>
  );
}
