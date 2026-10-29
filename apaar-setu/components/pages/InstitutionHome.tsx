'use client';
import { StatCard, Card, PageHeader, Table, Badge, Btn } from '@/components/ui';
import { Upload, AlertCircle, FileCheck, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function InstitutionHome() {
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Rajiv Gandhi Institute of Technology" 
        subtitle="AICTE Code: AICTE-MH-ENG-001 · Academic Year 2025-26" 
        action={
          <Link href="/upload" style={{ textDecoration: 'none' }}>
            <Btn variant="primary" size="md" icon={<Upload size={14} />}>
              Submit New Batch
            </Btn>
          </Link>
        }
      />

      {/* Headline Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Enrolled Students" value="4,820" sub="Verified with APAAR ID" color="var(--ok)" />
        <StatCard label="Pending Corrections" value="1" sub="Regulator review requested" color="var(--crit)" />
        <StatCard label="Batches Uploaded" value="6" sub="Latest: 22 Oct 2026" />
        <StatCard label="Onboarding Status" value="Student-Level" sub="Fully compliant with AICTE" color="var(--accent)" />
      </div>

      {/* Program Intake Table */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Programme Intake vs Actual Enrolment</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cycle: 2025-26</span>
        </div>
        <Table
          columns={['Programme', 'Approved Intake', 'Enrolled (Regular)', 'Enrolled (Quota/NRI)', 'Total Filled', 'Status']}
          rows={[
            {
              Programme: 'B.Tech Computer Science & Engineering',
              'Approved Intake': '120',
              'Enrolled (Regular)': '125',
              'Enrolled (Quota/NRI)': '18',
              'Total Filled': <strong style={{ color: 'var(--crit)' }}>143 (119%)</strong>,
              Status: <Badge variant="crit" size="sm">Over Intake (+23)</Badge>
            },
            {
              Programme: 'B.Tech Electronics & Communication',
              'Approved Intake': '60',
              'Enrolled (Regular)': '50',
              'Enrolled (Quota/NRI)': '4',
              'Total Filled': '54 (90%)',
              Status: <Badge variant="ok" size="sm">Compliant</Badge>
            },
            {
              Programme: 'B.Tech Mechanical Engineering',
              'Approved Intake': '60',
              'Enrolled (Regular)': '55',
              'Enrolled (Quota/NRI)': '3',
              'Total Filled': '58 (96%)',
              Status: <Badge variant="ok" size="sm">Compliant</Badge>
            },
            {
              Programme: 'Master of Business Administration (MBA)',
              'Approved Intake': '60',
              'Enrolled (Regular)': '42',
              'Enrolled (Quota/NRI)': '5',
              'Total Filled': '47 (78%)',
              Status: <Badge variant="ok" size="sm">Compliant</Badge>
            }
          ]}
        />
      </Card>
    </div>
  );
}
