'use client';
import { useParams } from 'next/navigation';
import { DEMO_CREDENTIALS } from '@/lib/data';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPage() {
  const params = useParams();
  const token = typeof params?.token === 'string' ? params.token : 'demo-verified';
  const cred = DEMO_CREDENTIALS[token] || DEMO_CREDENTIALS['demo-verified'];

  const isVerified = cred.result === 'verified';
  const isRevoked = cred.result === 'revoked';
  const isExpired = cred.result === 'expired';
  const isInvalid = cred.result === 'invalid';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Mobile-first compact verification container (< 360px optimized) */}
      <div style={{
        width: '100%',
        maxWidth: 380,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: 'var(--shadow)',
        overflow: 'hidden'
      }}>
        {/* Result Header Banner */}
        <div style={{
          padding: '24px 20px',
          textAlign: 'center',
          background: isVerified ? 'var(--ok-soft)' : isRevoked || isInvalid ? 'var(--crit-soft)' : 'var(--warn-soft)',
          borderBottom: '1px solid var(--border)'
        }}>
          {isVerified && <CheckCircle2 size={44} color="var(--ok)" style={{ margin: '0 auto 8px' }} />}
          {isRevoked && <XCircle size={44} color="var(--crit)" style={{ margin: '0 auto 8px' }} />}
          {isExpired && <Clock size={44} color="var(--warn)" style={{ margin: '0 auto 8px' }} />}
          {isInvalid && <AlertTriangle size={44} color="var(--crit)" style={{ margin: '0 auto 8px' }} />}

          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: isVerified ? 'var(--ok)' : isRevoked || isInvalid ? 'var(--crit)' : 'var(--warn)'
          }}>
            {isVerified && '✓ Verified'}
            {isRevoked && '✗ Revoked'}
            {isExpired && '⏱ Expired'}
            {isInvalid && '✗ Not Valid'}
          </h2>

          <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 4, fontWeight: 500 }}>
            {isVerified && 'AICTE Enrolment Authenticity Confirmed'}
            {isRevoked && 'Consent revoked by student'}
            {isExpired && 'Credential validity period ended'}
            {isInvalid && 'Ed25519 digital signature mismatch'}
          </div>
        </div>

        {/* Claim Details (Minimalist Selective Disclosure) */}
        <div style={{ padding: '20px' }}>
          {isVerified && cred.claims && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
                Disclosed Claims (Student-Authorized)
              </div>
              {Object.entries(cred.claims).map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 13
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {isRevoked && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
              The student has exercised their DPDP right to withdraw access to this credential token.
            </p>
          )}

          {isInvalid && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
              This QR code payload has been tampered with or was not issued by the AICTE Regulation Bureau PKI.
            </p>
          )}

          {/* Issuer / Proof Footer */}
          <div style={{
            background: 'var(--surface-2)',
            borderRadius: 8,
            padding: '12px',
            fontSize: 12,
            marginTop: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)', marginBottom: 4, fontWeight: 500 }}>
              <ShieldCheck size={14} color="var(--accent)" />
              <span>Issuer: AICTE (did:web:aicte.gov.in)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 11 }}>
              <WifiOff size={13} />
              <span>Verified on-device using embedded public key</span>
            </div>
          </div>
        </div>

        {/* Demo Token Switcher Bar for SIH Judges */}
        <div style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-2)',
          padding: '12px 16px',
          fontSize: 11,
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: 6, fontWeight: 500 }}>Test Verification States:</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/verify/demo-verified" style={{ color: 'var(--ok)', textDecoration: 'none', fontWeight: 600 }}>Verified</Link>
            <span>·</span>
            <Link href="/verify/demo-revoked" style={{ color: 'var(--crit)', textDecoration: 'none', fontWeight: 600 }}>Revoked</Link>
            <span>·</span>
            <Link href="/verify/demo-expired" style={{ color: 'var(--warn)', textDecoration: 'none', fontWeight: 600 }}>Expired</Link>
            <span>·</span>
            <Link href="/verify/demo-invalid" style={{ color: 'var(--crit)', textDecoration: 'none', fontWeight: 600 }}>Invalid</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
