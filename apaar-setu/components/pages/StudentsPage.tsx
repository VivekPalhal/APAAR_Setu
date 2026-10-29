'use client';
import { useState } from 'react';
import { STUDENTS } from '@/lib/data';
import { PageHeader, Table, Badge, Input, statusBadge, IDChip, Btn } from '@/components/ui';
import { Search, Filter, Plus, FileSpreadsheet } from 'lucide-react';

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [programme, setProgramme] = useState('All');

  const filtered = STUDENTS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                        s.apaarId.includes(search) ||
                        s.institution.toLowerCase().includes(search.toLowerCase());
    const matchProg = programme === 'All' || s.programme.includes(programme);
    return matchSearch && matchProg;
  });

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Student Repository" 
        subtitle="Live registry of verified enrolled students with unified APAAR identifiers"
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="secondary" size="sm" icon={<FileSpreadsheet size={13} />} onClick={() => alert('Exporting all students CSV')}>
              Export CSV
            </Btn>
          </div>
        }
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <Input 
            placeholder="Search by student name, APAAR ID, or college..." 
            value={search} 
            onChange={setSearch} 
            icon={<Search size={14} />} 
          />
        </div>
        <select 
          value={programme} 
          onChange={(e) => setProgramme(e.target.value)}
          style={{
            padding: '7px 12px',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: 13,
            color: 'var(--text)',
            background: 'var(--surface)',
            cursor: 'pointer'
          }}
        >
          <option value="All">All Programmes</option>
          <option value="CSE">B.Tech Computer Science</option>
          <option value="ECE">B.Tech Electronics</option>
          <option value="MBA">MBA</option>
          <option value="Pharm">B.Pharm</option>
        </select>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <Table
          columns={['Student Name', 'Unified APAAR ID', 'Enrolled Programme', 'Institution', 'Seat Type', 'Admission Date', 'Status']}
          rows={filtered.map(s => ({
            'Student Name': (
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.gender} · {s.state}</div>
              </div>
            ),
            'Unified APAAR ID': <IDChip id={s.apaarId} />,
            'Enrolled Programme': <span style={{ fontWeight: 500 }}>{s.programme}</span>,
            'Institution': <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.institution}</span>,
            'Seat Type': <Badge variant="neutral" size="sm">{s.seatType}</Badge>,
            'Admission Date': <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.admissionDate}</span>,
            'Status': <Badge variant={statusBadge(s.status)} size="sm">{s.status}</Badge>,
          }))}
        />
      </div>
    </div>
  );
}
