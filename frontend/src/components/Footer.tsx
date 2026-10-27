import React from 'react';
import { Lock, FileCode, CheckCircle, Scale, ArrowRight, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigate?: (tab: string) => void;
  onOpenUserAuth?: () => void;
  onOpenRegisterSchool?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenUserAuth,
  onOpenRegisterSchool,
}) => {
  return (
    <footer className="site-footer">
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '32px',
        marginBottom: '32px',
      }}>
        {/* Brand & Mission Column */}
        <div>
          <div
            id="footer-brand-logo"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', cursor: onNavigate ? 'pointer' : 'default' }}
            onClick={() => onNavigate && onNavigate('home')}
          >
            <BrandLogo
              alt="EDUCORE - Verify · Trust · Empower"
              style={{ height: '36px', width: 'auto', maxWidth: '175px', objectFit: 'contain' }}
            />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The universal multi-tenant credential issuance and cryptographic verification infrastructure. Built on zero-trust principles and SHA-256 canonical hashing.
          </p>
          <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-valid" style={{ fontSize: '0.7rem' }}>
              <CheckCircle size={12} /> Global GDPR Standards
            </span>
            <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>
              <Lock size={12} /> Tenant Isolated
            </span>
          </div>
        </div>

        {/* Verification Architecture Column */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Verification Engine
          </h4>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
            <li>
              <button
                id="footer-link-verifier"
                onClick={() => onNavigate && onNavigate('verify')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'inherit',
                  font: 'inherit',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cyan)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
              >
                <FileCode size={14} style={{ color: 'var(--cyan)' }} />
                <span>Universal Verifier</span>
              </button>
            </li>
            <li>
              <button
                id="footer-link-sha256"
                onClick={() => onNavigate && onNavigate('verify')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'inherit',
                  font: 'inherit',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--emerald)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
              >
                <Lock size={14} style={{ color: 'var(--emerald)' }} />
                <span>SHA-256 Hash Engine</span>
              </button>
            </li>
            <li>
              <button
                id="footer-link-about-standards"
                onClick={() => onNavigate && onNavigate('about')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'inherit',
                  font: 'inherit',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--amber)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
              >
                <Scale size={14} style={{ color: 'var(--amber)' }} />
                <span>Zero-Trust Multi-Tenant RLS</span>
              </button>
            </li>
            <li>
              <button
                id="footer-link-about-privacy"
                onClick={() => onNavigate && onNavigate('about')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'inherit',
                  font: 'inherit',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cyan)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
              >
                <CheckCircle size={14} style={{ color: 'var(--cyan)' }} />
                <span>Privacy-Preserving Public Output</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Account Pathways Column */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Account Pathways
          </h4>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
            <li>
              <button
                id="footer-link-schools"
                onClick={onOpenUserAuth}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'inherit',
                  font: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
              >
                <span>Universities & Polytechnics</span>
                <ArrowRight size={12} />
              </button>
            </li>
            <li>
              <button
                id="footer-link-vocational"
                onClick={onOpenUserAuth}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'inherit',
                  font: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cyan)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
              >
                <span>Vocational & Skills Institutes</span>
                <ArrowRight size={12} />
              </button>
            </li>
            <li>
              <button
                id="footer-link-orgs"
                onClick={onOpenUserAuth}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'inherit',
                  font: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--amber)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
              >
                <span>Professional Bodies & Churches</span>
                <ArrowRight size={12} />
              </button>
            </li>
            <li>
              <button
                id="footer-link-employers"
                onClick={onOpenUserAuth}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'inherit',
                  font: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--emerald)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
              >
                <span>Corporate HR & Verifiers</span>
                <ArrowRight size={12} />
              </button>
            </li>
            {onOpenRegisterSchool && (
              <li style={{ marginTop: '4px' }}>
                <button
                  id="footer-link-onboard"
                  className="btn btn-secondary btn-sm"
                  onClick={onOpenRegisterSchool}
                  style={{ fontSize: '0.76rem', padding: '5px 12px', borderRadius: 'var(--radius-pill)' }}
                >
                  <ShieldCheck size={13} style={{ color: 'var(--cyan)' }} />
                  <span>Onboard New Institution</span>
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Roadmap & Release Status Column */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Status
          </h4>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--emerald)', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }}></span>
              Universal Verifier: Operational
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '6px' }}>
              Release 2 Hardware Biometrics Terminal in active development.
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.775rem',
        color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span>© 2026 EDUCORE Platform. All rights reserved. Version 1.0</span>
          {onNavigate && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => onNavigate('home')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('verify')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Verify
              </button>
              <button
                onClick={() => onNavigate('about')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                About
              </button>
            </div>
          )}
        </div>
        <div>Engineered for Universal Trust, Cryptographic Integrity & Institutional Governance</div>
      </div>
    </footer>
  );
};
