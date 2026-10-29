'use client';
import { useState } from 'react';
import { INSTITUTIONS } from '@/lib/data';
import { Badge, statusBadge, RiskMeter, PageHeader, Btn, Input, Table } from '@/components/ui';
import { Search, Building2 } from 'lucide-react';
import Link from 'next/link';

const STATES = ['All States', 'Maharashtra', 'Delhi', 'Karnataka', 'Uttar Pradesh', 'Tamil Nadu', 'West Bengal', 'Rajasthan', 'Madhya Pradesh', 'Goa', 'Punjab'];
const TYPES = ['All Types', 'Engineering', 'Management', 'Pharmacy', 'Architecture'];
const BANDS = ['All Bands', 'High', 'Medium', 'Low', 'Under Review'];

export default function InstitutionsPage() {
  const [search, setSearch] = useState('');
  const [state, setState] = useState('All States');
  const [type, setType] = useState('All Types');
  const [band, setBand] = useState('All Bands');
  const [selected, setSelected] = useState<typeof INSTITUTIONS[0] | null>(null);

  const filtered = INSTITUTIONS.filter(inst => {
    const matchSearch = inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.code.toLowerCase().includes(search.toLowerCase());
    const matchState = state === 'All States' || inst.state === state;
    const matchType = type === 'All Types' || inst.type === type;
    const matchBand = band === 'All Bands' || inst.trustBand === band;
    return matchSearch && matchState && matchType && matchBand;
  });

  const selectStyle = {
    padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 6,
    fontSize: 13, color: 'var(--text)', background: 'var(--surface)', fontFamily: 'inherit', cursor: 'pointer',
  };

  if (selected) {
    const trust = selected.trustScore;
    const trustColor = trust >= 75 ? 'var(--ok)' : trust >= 50 ? 'var(--warn)' : 'var(--crit)';
    return (
      <div className="animate-fade-in">
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setSelected(null)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, padding: 0, fontFamily: 'inherit',
          }}>← Back to Institutions</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{selected.name}</h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <code style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4 }}>
                {selected.code}
              </code>
              <Badge variant={statusBadge(selected.status)}>{selected.status}</Badge>
              <Badge variant={statusBadge(selected.trustBand)}>{selected.trustBand} Trust</Badge>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* Overview */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overview</div>
            {[
              ['State', selected.state],
              ['Type', selected.type],
              ['Programmes', selected.programmes.toString()],
              ['Students (active)', selected.students.toLocaleString('en-IN')],
              ['Last submission', selected.lastSubmission],
              ['Open anomalies', selected.anomalies.toString()],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Trust Score */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trust Score</div>
            <div style={{ fontSize: 42, fontWeight: 700, color: trustColor, marginBottom: 4 }}>{trust}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>out of 100 · {selected.trustBand} band</div>
            {[
              { label: 'ID Validity', weight: 25, score: Math.round(trust * 0.9 + Math.random() * 5) },
              { label: 'Intake Discipline', weight: 30, score: Math.round(trust * 0.8 + Math.random() * 10) },
              { label: 'Identity Integrity', weight: 20, score: Math.round(trust * 1.05 + Math.random() * 3) },
              { label: 'Pattern Normality', weight: 25, score: Math.round(trust * 0.95 + Math.random() * 5) },
            ].map(comp => {
              const s = Math.min(100, Math.max(0, comp.score));
              const c = s >= 75 ? 'var(--ok)' : s >= 50 ? 'var(--warn)' : 'var(--crit)';
              return (
                <div key={comp.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text)' }}>{comp.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{comp.weight}% weight · <span style={{ color: c, fontWeight: 600 }}>{s}</span></span>
                  </div>
                  <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s}%`, background: c, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Programmes table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Programmes</span>
          </div>
          <Table
            columns={['Programme', 'Approved Intake', 'Enrolled', 'Fill %', 'Status']}
            rows={[
              { Programme: 'B.Tech CSE', 'Approved Intake': '120', Enrolled: selected.id === 'i001' ? '143' : '98', 'Fill %': selected.id === 'i001' ? '119%' : '82%', Status: <Badge variant={selected.id === 'i001' ? 'crit' : 'ok'}>{selected.id === 'i001' ? 'Over intake' : 'Normal'}</Badge> },
              { Programme: 'B.Tech ECE', 'Approved Intake': '60', Enrolled: '54', 'Fill %': '90%', Status: <Badge variant="ok">Normal</Badge> },
              { Programme: 'B.Tech ME', 'Approved Intake': '60', Enrolled: '58', 'Fill %': '97%', Status: <Badge variant="ok">Normal</Badge> },
              { Programme: 'MBA', 'Approved Intake': '60', Enrolled: '47', 'Fill %': '78%', Status: <Badge variant="ok">Normal</Badge> },
            ]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Institutions" subtitle={`${filtered.length} institutions · 15,106 total`} />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input placeholder="Search by name or code…" value={search} onChange={setSearch} icon={<Search size={14} />} />
        </div>
        <select value={state} onChange={e => setState(e.target.value)} style={selectStyle}>
          {STATES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={band} onChange={e => setBand(e.target.value)} style={selectStyle}>
          {BANDS.map(b => <option key={b}>{b}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <Table
          columns={['Institution', 'State', 'Type', 'Students', 'Trust Score', 'Status', 'Anomalies']}
          rows={filtered.map(inst => ({
            Institution: (
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{inst.name}</div>
                <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{inst.code}</div>
              </div>
            ),
            State: <span style={{ fontSize: 13, color: 'var(--text)' }}>{inst.state}</span>,
            Type: <Badge variant="neutral" size="sm">{inst.type}</Badge>,
            Students: <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{inst.students.toLocaleString('en-IN')}</span>,
            'Trust Score': (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 60, height: 5, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${inst.trustScore}%`,
                    background: inst.trustScore >= 75 ? 'var(--ok)' : inst.trustScore >= 50 ? 'var(--warn)' : 'var(--crit)',
                  }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{inst.trustScore}</span>
              </div>
            ),
            Status: <Badge variant={statusBadge(inst.status)} size="sm">{inst.status}</Badge>,
            Anomalies: inst.anomalies > 0
              ? <Badge variant="crit" size="sm">{inst.anomalies}</Badge>
              : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>None</span>,
          }))}
          onRowClick={(_, i) => setSelected(filtered[i])}
        />
      </div>
    </div>
  );
}
