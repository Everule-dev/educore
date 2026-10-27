import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  X,
  Mail,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Fingerprint,
  Building,
} from 'lucide-react';
import { User, Tenant } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginAdmin: (email: string, passcode?: string, token2FA?: string) => { success: boolean; user?: User; message?: string };
  onOpenUserPortal: () => void;
  tenants: Tenant[];
}

export const AdminLoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLoginAdmin,
  onOpenUserPortal,
  tenants,
}) => {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [token2FA, setToken2FA] = useState('');
  const [enable2FA, setEnable2FA] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!adminEmail.trim()) {
      setAuthError('Please enter authorized administrator credentials.');
      return;
    }

    const res = onLoginAdmin(adminEmail, adminPasscode, token2FA);
    if (!res.success) {
      setAuthError(res.message || 'Administrative verification failed. Access denied.');
    } else {
      setAuthSuccess(`Administrative session authorized for ${res.user?.name} (${res.user?.role}).`);
      setTimeout(() => {
        onClose();
        setAuthSuccess(null);
      }, 700);
    }
  };



  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '620px',
          padding: 0,
          overflow: 'hidden',
          border: '1px solid rgba(139, 92, 246, 0.45)',
          boxShadow: '0 25px 60px -15px rgba(139, 92, 246, 0.25), 0 0 40px rgba(139, 92, 246, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Restricted Security Aura */}
        <div
          className="modal-header"
          style={{
            padding: '24px 28px 18px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)',
            borderBottom: '1px solid rgba(139, 92, 246, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
              }}
            >
              <ShieldAlert size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: 'var(--heading-color)' }}>
                  EDUCORE Admin Gateway
                </h2>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--rose)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  letterSpacing: '0.06em',
                }}>
                  RESTRICTED
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Institutional Rectors, Governing Boards & Platform Regulators
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Security Warning Notice */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
          padding: '12px 28px',
          fontSize: '0.8rem',
          color: 'var(--amber)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Zero-Trust Administrative Policy:</strong> Unauthorized access attempts are cryptographically audited and permanently flagged on the immutable ledger.
          </span>
        </div>

        <div className="modal-body" style={{ padding: '24px 28px' }}>
          {authSuccess && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--emerald)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}>
              <CheckCircle2 size={16} /> {authSuccess}
            </div>
          )}

          {authError && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--rose)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}>
              <ShieldAlert size={16} /> {authError}
            </div>
          )}

          <form onSubmit={handleAdminSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="admin-login-email">
                Administrator Work Identity
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="admin-login-email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="e.g. administrator@institution.edu.ng or admin@domain.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="admin-login-passcode">
                Governance Security Passcode
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="admin-login-passcode"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="••••••••••••••••"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                />
              </div>
            </div>

            {/* 2FA Token Simulation Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem' }}>
                <Fingerprint size={16} color="var(--violet)" />
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Hardware Key / MFA Enforced</span>
              </div>
              <span className="badge badge-valid" style={{ fontSize: '0.65rem' }}>Secured</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '1rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                borderColor: 'rgba(167, 139, 250, 0.4)',
                marginBottom: '20px',
              }}
            >
              <Lock size={16} />
              <span>Authenticate to Admin Terminal</span>
              <ArrowRight size={16} />
            </button>
          </form>



          {/* Switch to User Portal */}
          <div style={{
            textAlign: 'center',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-dim)',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
          }}>
            Looking for Student, Alumnus, or Corporate Verifier login?{' '}
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--cyan)',
                fontWeight: 800,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
              onClick={() => {
                onClose();
                onOpenUserPortal();
              }}
            >
              Switch to User Portal →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
