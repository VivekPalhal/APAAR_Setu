'use client';
import { useState } from 'react';
import { NLQ_ANSWERS } from '@/lib/data';
import { PageHeader, Btn, Table, Card } from '@/components/ui';
import { Search, ChevronDown, ChevronUp, Sparkles, CornerDownLeft } from 'lucide-react';

export default function AskPage() {
  const [query, setQuery] = useState('');
  const [activeResult, setActiveResult] = useState<typeof NLQ_ANSWERS['default_over_intake'] | null>(null);
  const [showHow, setShowHow] = useState(false);
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    { label: 'Which institutions exceeded approved intake?', key: 'default_over_intake' },
    { label: 'Cross-institution duplicates in current cycle', key: 'default_duplicates' },
    { label: 'Distribution of institution trust scores', key: 'default_trust' },
  ];

  const handleSearch = (keyOrQuery?: string) => {
    setLoading(true);
    setTimeout(() => {
      if (keyOrQuery === 'default_duplicates' || query.toLowerCase().includes('duplicate')) {
        setActiveResult(NLQ_ANSWERS['default_duplicates']);
      } else if (keyOrQuery === 'default_trust' || query.toLowerCase().includes('trust')) {
        setActiveResult(NLQ_ANSWERS['default_trust']);
      } else {
        setActiveResult(NLQ_ANSWERS['default_over_intake']);
      }
      setLoading(false);
      setShowHow(false);
    }, 400);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Ask APAAR Setu" 
        subtitle="Natural Language Analytics & Explainable Regulation Intelligence" 
      />

      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--surface)',
          border: '1.5px solid var(--accent)',
          borderRadius: 10,
          padding: '10px 16px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Sparkles size={18} color="var(--accent)" />
          <input
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 14,
              fontFamily: 'inherit',
              color: 'var(--text)',
              background: 'transparent'
            }}
            placeholder="Ask a regulatory query in plain English (e.g. 'Show colleges exceeding approved intake')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
          <Btn variant="primary" size="sm" onClick={() => handleSearch()} icon={<CornerDownLeft size={13} />}>
            Ask
          </Btn>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Suggested queries:</span>
          {sampleQuestions.map((sq) => (
            <button
              key={sq.key}
              onClick={() => {
                setQuery(sq.label);
                handleSearch(sq.key);
              }}
              style={{
                fontSize: 12,
                color: 'var(--accent)',
                background: 'var(--accent-soft)',
                border: '1px solid var(--border)',
                padding: '4px 10px',
                borderRadius: 20,
                cursor: 'pointer'
              }}
            >
              {sq.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="animate-spin" style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: 12 }} />
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Parsing semantic intent into structured query plan...</div>
        </Card>
      )}

      {!loading && activeResult && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Answer Card */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ok)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Query Result
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>
                  {activeResult.summary}
                </h3>
              </div>
              <button
                onClick={() => setShowHow(!showHow)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: 'var(--accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <span>How I got this</span>
                {showHow ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Explainability collapsible panel */}
            {showHow && (
              <div style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 16,
                fontSize: 12
              }}>
                <div style={{ marginBottom: 6 }}>
                  <strong style={{ color: 'var(--text)' }}>Interpreted Intent:</strong>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>{activeResult.interpretation}</span>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong style={{ color: 'var(--text)' }}>Rule Filters Applied:</strong>{' '}
                  <code style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>{activeResult.filters}</code>
                </div>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Total Matched Records:</strong>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>{activeResult.rowCount} items verified against system of record</span>
                </div>
              </div>
            )}

            {/* Result Table */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <Table
                columns={activeResult.columns}
                rows={activeResult.rows.map((r) => {
                  const out: Record<string, React.ReactNode> = {};
                  activeResult.columns.forEach((col) => {
                    out[col] = (
                      <span style={{
                        color: col === 'Excess' ? 'var(--crit)' : 'var(--text)',
                        fontWeight: col === 'Excess' || col === 'Institution' ? 600 : 400
                      }}>
                        {r[col]}
                      </span>
                    );
                  });
                  return out;
                })}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
