'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, AlertTriangle, Building2, MessageSquare,
  BarChart3, Shield, Settings, Users, Upload, GraduationCap,
  ClipboardEdit, User, Share2, Activity, ChevronDown, Bell,
  Menu, X
} from 'lucide-react';
import { useApp } from '@/lib/context';
import { ROLES, NAV_ITEMS } from '@/lib/data';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, AlertTriangle, Building2, MessageSquare,
  BarChart3, Shield, Settings, Users, Upload, GraduationCap,
  ClipboardEdit, User, Share2, Activity,
};

export default function Shell({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useApp();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleDropdown, setRoleDropdown] = useState(false);

  const navItems = NAV_ITEMS[role];
  const currentRole = ROLES.find(r => r.id === role)!;

  // Resolve home path per role
  const homePathForRole: Record<string, string> = {
    regulator: '/', superadmin: '/', institution: '/inst',
    operator: '/upload', student: '/my-record', verifier: '/verify/demo-verified',
  };

  const navLinks = navItems.map(item => ({
    ...item,
    href: item.href === '/' ? homePathForRole[role] ?? '/' : item.href,
  }));

  const isActive = (href: string) => pathname === href || (href !== '/' && href !== '/inst' && pathname.startsWith(href));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'fixed',
          top: 0, bottom: 0, left: 0,
          zIndex: 40,
          transform: sidebarOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.2s ease',
        }}
        className="sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>A</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>APAAR Setu</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AICTE Platform</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
          {navLinks.map(item => {
            const Icon = ICON_MAP[item.icon];
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 6,
                  marginBottom: 2,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--accent)' : 'var(--text)',
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 0.12s, color 0.12s',
                }}
              >
                {Icon && <Icon size={16} strokeWidth={1.5} />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Role badge */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Signed in as</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>
            {currentRole.emoji} {currentRole.label}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 39 }}
        />
      )}

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: 52,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)' }}
            className="menu-btn"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div style={{ flex: 1 }} />

          {/* Role Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setRoleDropdown(!roleDropdown)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px',
                background: 'var(--accent-soft)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--accent)',
              }}
            >
              <span>{currentRole.emoji}</span>
              <span>{currentRole.label}</span>
              <ChevronDown size={12} />
            </button>
            {roleDropdown && (
              <div style={{
                position: 'absolute', right: 0, top: 36,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                boxShadow: 'var(--shadow)',
                minWidth: 180,
                zIndex: 50,
                overflow: 'hidden',
              }}>
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setRole(r.id); setRoleDropdown(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '9px 14px',
                      background: role === r.id ? 'var(--accent-soft)' : 'transparent',
                      border: 'none', cursor: 'pointer',
                      fontSize: 13,
                      color: role === r.id ? 'var(--accent)' : 'var(--text)',
                      textAlign: 'left',
                    }}
                  >
                    <span>{r.emoji}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification */}
          <button style={{
            position: 'relative',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4,
          }}>
            <Bell size={18} strokeWidth={1.5} />
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 7, height: 7,
              background: 'var(--crit)',
              borderRadius: '50%',
              border: '1.5px solid var(--surface)',
            }} />
          </button>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px', maxWidth: 1200, width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
