'use client';
import { cn } from '@/lib/utils';

type BadgeVariant = 'ok' | 'warn' | 'crit' | 'info' | 'neutral';

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; color: string; dot: string; label: string }> = {
  ok:      { bg: 'var(--ok-soft)',   color: 'var(--ok)',   dot: 'var(--ok)',   label: '' },
  warn:    { bg: 'var(--warn-soft)', color: 'var(--warn)', dot: 'var(--warn)', label: '' },
  crit:    { bg: 'var(--crit-soft)', color: 'var(--crit)', dot: 'var(--crit)', label: '' },
  info:    { bg: 'var(--info-soft)', color: 'var(--info)', dot: 'var(--info)', label: '' },
  neutral: { bg: 'var(--surface-2)', color: 'var(--text-muted)', dot: 'var(--text-muted)', label: '' },
};

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

export function Badge({ variant, children, size = 'md' }: BadgeProps) {
  const s = VARIANT_STYLES[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'sm' ? '2px 7px' : '3px 9px',
      background: s.bg,
      color: s.color,
      borderRadius: 20,
      fontSize: size === 'sm' ? 11 : 12,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {children}
    </span>
  );
}

// Status to badge variant
export function statusBadge(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    'Active': 'ok', 'Verified': 'ok', 'Student-Level Ready': 'ok', 'Graduated': 'ok',
    'Flagged': 'crit', 'Critical': 'crit', 'Under Review': 'warn', 'Aggregate Only': 'warn',
    'Under Correction': 'warn', 'Withdrawn': 'neutral', 'open': 'crit', 'warning': 'warn',
    'critical': 'crit', 'info': 'info', 'High': 'ok', 'Medium': 'warn', 'Low': 'crit',
  };
  return map[status] ?? 'neutral';
}

// Risk meter (0-100 horizontal bar)
export function RiskMeter({ score }: { score: number }) {
  const color = score >= 70 ? 'var(--crit)' : score >= 40 ? 'var(--warn)' : 'var(--ok)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden',
        maxWidth: 100,
      }}>
        <div style={{
          height: '100%', width: `${score}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 0.3s ease',
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 24 }}>{score}</span>
    </div>
  );
}

// ID Chip
export function IDChip({ id, masked = false }: { id: string; masked?: boolean }) {
  const display = masked ? id.replace(/(\d{4}) (\d{4}) (\d{4})/, '$1 **** ****') : id;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={copy}
      title={copied ? 'Copied!' : 'Click to copy'}
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        color: copied ? 'var(--ok)' : 'var(--text)',
        background: copied ? 'var(--ok-soft)' : 'var(--surface-2)',
        border: 'none',
        borderRadius: 4,
        padding: '2px 7px',
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
        letterSpacing: '0.02em',
      }}
    >
      {copied ? '✓ Copied' : display}
    </button>
  );
}

// Page header
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Card
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  );
}

// Stat card
export function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '16px 20px',
    }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? 'var(--text)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// Button
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export function Btn({
  children, onClick, variant = 'secondary', size = 'md', disabled, type = 'button', icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  size?: 'sm' | 'md';
  disabled?: boolean;
  type?: 'button' | 'submit';
  icon?: React.ReactNode;
}) {
  const styles: Record<BtnVariant, React.CSSProperties> = {
    primary:   { background: 'var(--accent)',    color: '#fff',              border: '1px solid var(--accent)' },
    secondary: { background: 'var(--surface)',   color: 'var(--text)',       border: '1px solid var(--border)' },
    danger:    { background: 'var(--crit-soft)', color: 'var(--crit)',       border: '1px solid var(--crit)' },
    ghost:     { background: 'transparent',      color: 'var(--text-muted)', border: '1px solid transparent' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: size === 'sm' ? '5px 12px' : '7px 16px',
        borderRadius: 6,
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s',
        fontFamily: 'inherit',
        ...styles[variant],
      }}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
}

// Simple table
export function Table({ columns, rows, onRowClick }: {
  columns: string[];
  rows: Record<string, React.ReactNode>[];
  onRowClick?: (row: Record<string, React.ReactNode>, idx: number) => void;
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            {columns.map(col => (
              <th key={col} style={{
                padding: '9px 14px', textAlign: 'left',
                fontWeight: 500, color: 'var(--text-muted)', fontSize: 12,
                whiteSpace: 'nowrap',
              }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row, i)}
              style={{
                borderBottom: '1px solid var(--border)',
                cursor: onRowClick ? 'pointer' : 'default',
                background: 'var(--surface)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (onRowClick) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
            >
              {columns.map(col => (
                <td key={col} style={{ padding: '10px 14px', color: 'var(--text)' }}>
                  {row[col] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Input
export function Input({ placeholder, value, onChange, icon }: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon && <span style={{ position: 'absolute', left: 10, color: 'var(--text-muted)' }}>{icon}</span>}
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: icon ? '8px 12px 8px 34px' : '8px 12px',
          border: '1px solid var(--border)',
          borderRadius: 6,
          fontSize: 13,
          color: 'var(--text)',
          background: 'var(--surface)',
          fontFamily: 'inherit',
          outline: 'none',
        }}
      />
    </div>
  );
}

// useState import needed
import { useState } from 'react';

// Progress bar
export function ProgressBar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ width: '100%', height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: color ?? 'var(--accent)',
        borderRadius: 4,
        transition: 'width 0.5s ease',
      }} />
    </div>
  );
}
