'use client';
import { PageHeader, Card, Table, Badge, Btn } from '@/components/ui';
import { Download, FileSpreadsheet, FileText, Filter } from 'lucide-react';

export default function ReportsPage() {
  const reports = [
    { title: 'National Intake Compliance Report 2025-26', scope: 'All AICTE Institutions', generated: '27 Oct 2026', format: 'PDF / CSV', records: '15,106' },
    { title: 'Cross-Institution Duplicate Enrolment Audit', scope: 'Critical Overlaps', generated: '26 Oct 2026', format: 'CSV', records: '38' },
    { title: 'Institution Trust Score Distribution', scope: 'By State & Category', generated: '25 Oct 2026', format: 'PDF / XLSX', records: '15,106' },
    { title: 'NRI & Supernumerary Quota Utilization Summary', scope: 'Engineering & Management', generated: '24 Oct 2026', format: 'CSV', records: '4,890' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Regulatory Reports" 
        subtitle="Standard, exportable compliance documents for AICTE officers and accreditation bodies" 
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {reports.map((r, i) => (
          <Card key={i} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <FileSpreadsheet size={20} color="var(--accent)" />
                <Badge variant="neutral" size="sm">{r.format}</Badge>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{r.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Scope: {r.scope}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.records} records</span>
              <Btn variant="secondary" size="sm" icon={<Download size={12} />} onClick={() => alert(`Downloading ${r.title}...`)}>
                Export
              </Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
