'use client';
import { PageHeader, Card, Table, Badge, Btn } from '@/components/ui';
import { ClipboardEdit, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function CorrectionsPage() {
  const [resolved, setResolved] = useState(false);

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Regulatory Correction Requests" 
        subtitle="Address discrepancies flagged during AICTE audit review cycles with direct justification or file updates" 
      />

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--crit-soft)', color: 'var(--crit)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertCircle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Action Required: B.Tech CSE Approved Intake Excess (+23)</h3>
              <Badge variant="crit" size="sm">Urgent Review</Badge>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>
              Officer <strong>Anita Sharma (Regulation Bureau)</strong> requested official justification for 143 total enrolments against 120 approved seats.
            </p>
            <div style={{ background: 'var(--surface-2)', padding: '10px 14px', borderRadius: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              "Please specify if 18 NRI quota students were admitted under AICTE approved Supernumerary circular AICTE/AB/2025/11 or regular vacancy quota."
            </div>

            {resolved ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ok)', fontSize: 13, fontWeight: 500 }}>
                <CheckCircle2 size={16} />
                Justification & NRI approval docs submitted to AICTE for final sign-off.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn variant="primary" size="sm" icon={<Send size={13} />} onClick={() => setResolved(true)}>
                  Submit Justification & Documentation
                </Btn>
                <Btn variant="secondary" size="sm" onClick={() => alert('Opening student records editor')}>
                  Adjust Enrolment List
                </Btn>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
