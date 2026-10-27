import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Mail,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Fingerprint,
  Building,
  ArrowLeft,
  Globe,
  FileCheck,
} from 'lucide-react';
import { User, Tenant } from '../../types';
import { BrandLogo } from '../../components/BrandLogo';

interface Props {
  onLoginAdmin: (email: string, passcode?: string, token2FA?: string) => { success: boolean; user?: User; message?: string };
  onReturnToPublic: () => void;
  tenants: Tenant[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  hasExistingPlatformAdmin?: boolean;
  onInitializeRootAdmin?: (data: {
    name: string;
    email: string;
    passcode?: string;
    department?: string;
    designation?: string;
  }) => { success: boolean; user?: User; message?: string };
}

export const AdminLoginPage: React.FC<Props> = ({
  onLoginAdmin,
  onReturnToPublic,
  tenants,
  theme,
  onToggleTheme,
  hasExistingPlatformAdmin = true,
  onInitializeRootAdmin,
}) => {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [token2FA, setToken2FA] = useState('');
  const [enable2FA, setEnable2FA] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // First-time Root Administrator Setup State
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupDept, setSetupDept] = useState('National Accreditation & Operations');
  const [setupDesignation, setSetupDesignation] = useState('Director of Platform Governance');
  const [setupPasscode, setSetupPasscode] = useState('');
  const [setupConfirmPasscode, setSetupConfirmPasscode] = useState('');
  const [isSetupSubmitting, setIsSetupSubmitting] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!adminEmail.trim()) {
      setAuthError('Please enter authorized administrator credentials.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = onLoginAdmin(adminEmail, adminPasscode, token2FA);
      setIsSubmitting(false);

      if (!res.success) {
        setAuthError(res.message || 'Administrative verification failed. Access denied.');
      } else {
        setAuthSuccess(`Administrative session authorized for ${res.user?.name} (${res.user?.role}). Redirecting to console...`);
      }
    }, 400);
  };

  const handleRootSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!setupName.trim() || !setupEmail.trim()) {
      setAuthError('Please enter your full name and official governance email.');
      return;
    }
    if (setupPasscode && setupPasscode !== setupConfirmPasscode) {
      setAuthError('Master passcodes do not match.');
      return;
    }
    if (!onInitializeRootAdmin) {
      setAuthError('Root initialization handler is not available.');
      return;
    }

    setIsSetupSubmitting(true);
    setTimeout(() => {
      const res = onInitializeRootAdmin({
        name: setupName,
        email: setupEmail,
        passcode: setupPasscode,
        department: setupDept,
        designation: setupDesignation,
      });
      setIsSetupSubmitting(false);

      if (!res.success) {
        setAuthError(res.message || 'Could not initialize master administrator.');
      } else {
        setAuthSuccess(`Master Platform Super Administrator initialized for ${res.user?.name}. Redirecting to governance console...`);
      }
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 35%, var(--bg-main) 75%)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Background Mesh Accent */}
      <div className="bg-mesh" style={{ opacity: 0.6 }} />

      {/* Top Restricted Security Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.25)',
        padding: '12px 24px',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Left Brand & Restricted Security Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <BrandLogo
              theme={theme}
              alt="EDUCORE"
              style={{ height: '36px', width: 'auto', maxWidth: '160px', objectFit: 'contain' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(139, 92, 246, 0.18)',
                  color: 'var(--violet)',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  letterSpacing: '0.08em',
                }}>
                  Internal Admin Gateway
                </span>
              </div>
              <div style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <code>domain.com/admin</code>
                <span>·</span>
                <span>Restricted Access Protocol</span>
              </div>
            </div>
          </div>

          {/* Right Action: Return to Public Site */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              id="admin-return-public-btn"
              className="btn btn-secondary btn-sm"
              onClick={onReturnToPublic}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: 'var(--radius-pill)',
                padding: '7px 16px',
                fontWeight: 700,
                fontSize: '0.8rem',
                border: '1px solid var(--border-accent)',
              }}
            >
              <ArrowLeft size={14} />
              <span>Return to Public Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Login Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          width: '100%',
          maxWidth: '580px',
          background: 'var(--bg-surface)',
          borderRadius: '24px',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(139, 92, 246, 0.25), 0 0 50px rgba(139, 92, 246, 0.12)',
          overflow: 'hidden',
        }}>
          {/* Header Banner */}
          <div style={{
            padding: '28px 32px 20px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(37, 99, 235, 0.08) 100%)',
            borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
          }}>
            <div style={{ marginBottom: '14px' }}>
              <BrandLogo
                theme={theme}
                alt="EDUCORE"
                style={{ height: '34px', width: 'auto', maxWidth: '160px', objectFit: 'contain' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(139, 92, 246, 0.2)',
                color: 'var(--violet)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '6px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: '1px solid rgba(139, 92, 246, 0.35)',
              }}>
                <Lock size={11} /> Secured Endpoint · domain.com/admin
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--emerald)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '6px',
              }}>
                <ShieldCheck size={11} /> 256-Bit Encrypted
              </span>
            </div>

            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}>
              {hasExistingPlatformAdmin ? 'EDUCORE Platform Administration' : 'Initialize Platform Super Administrator'}
            </h1>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              margin: 0,
            }}>
              {hasExistingPlatformAdmin
                ? 'Restricted internal portal for EDUCORE Platform Governors. Schools, churches, organizations, and companies should sign in through the public portal.'
                : 'Establish the founding Master Super Administrator credentials to take governance and accreditation ownership of this clean EDUCORE instance.'}
            </p>
          </div>

          {/* Form Body */}
          <div style={{ padding: '28px 32px 32px' }}>
            {/* Status alerts */}
            {authError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: 'var(--rose)',
                fontSize: '0.825rem',
                marginBottom: '20px',
                fontWeight: 600,
              }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: 'var(--emerald)',
                fontSize: '0.825rem',
                marginBottom: '20px',
                fontWeight: 600,
              }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{authSuccess}</span>
              </div>
            )}

            {!hasExistingPlatformAdmin ? (
              <form onSubmit={handleRootSetupSubmit}>
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  marginBottom: '20px',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  color: 'var(--text-secondary)',
                }}>
                  <strong style={{ color: 'var(--violet)' }}>First-Time Setup Required:</strong> No Platform Super Administrator exists on this clean installation. Complete the form below to initialize the founding master administrator.
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Super Administrator Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Dr. Amina Yusuf"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Official Governance Email</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="e.g. director@educore.gov.ng or admin@domain.com"
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Department / Agency</label>
                    <input
                      type="text"
                      className="form-control"
                      value={setupDept}
                      onChange={(e) => setSetupDept(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation / Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={setupDesignation}
                      onChange={(e) => setSetupDesignation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Master Passcode</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="••••••••••••••••"
                    value={setupPasscode}
                    onChange={(e) => setSetupPasscode(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '22px' }}>
                  <label className="form-label">Confirm Master Passcode</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="••••••••••••••••"
                    value={setupConfirmPasscode}
                    onChange={(e) => setSetupConfirmPasscode(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  id="admin-setup-submit-btn"
                  className="btn btn-primary"
                  disabled={isSetupSubmitting}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                    boxShadow: '0 8px 24px -4px rgba(139, 92, 246, 0.45)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: isSetupSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>{isSetupSubmitting ? 'Initializing Master Administrator...' : 'Initialize Platform Super Administrator'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Admin Work ID / Institutional Email</span>
                    <span style={{ color: 'var(--violet)', fontSize: '0.75rem', fontWeight: 700 }}>Required</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      id="admin-login-email-input"
                      type="email"
                      className="form-control"
                      style={{ paddingLeft: '38px', borderRadius: '10px' }}
                      placeholder="admin@governance.gov.ng or administrator@domain.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Secure Master Passcode</label>
                  <div style={{ position: 'relative' }}>
                    <Key
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      id="admin-login-password-input"
                      type="password"
                      className="form-control"
                      style={{ paddingLeft: '38px', borderRadius: '10px' }}
                      placeholder="••••••••••••••••"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                    />
                  </div>
                </div>

                {/* 2FA Token Simulation Box */}
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '22px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Fingerprint size={16} style={{ color: 'var(--violet)' }} />
                      <span>Hardware 2FA / Security Key</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={enable2FA}
                        onChange={(e) => setEnable2FA(e.target.checked)}
                      />
                      <span>Require 2FA</span>
                    </label>
                  </div>
                  {enable2FA ? (
                    <div style={{ position: 'relative' }}>
                      <input
                        id="admin-login-2fa-input"
                        type="text"
                        className="form-control"
                        style={{
                          paddingLeft: '14px',
                          fontSize: '0.825rem',
                          letterSpacing: '0.15em',
                          fontFamily: 'monospace',
                          borderRadius: '8px',
                        }}
                        placeholder="6-Digit MFA Token (e.g. 849-204)"
                        value={token2FA}
                        onChange={(e) => setToken2FA(e.target.value)}
                      />
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        TOTP Authenticator app or hardware FIDO2 key
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.72rem', color: 'var(--amber)' }}>
                      ⚠️ 2FA bypass mode active for development/demo testing
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  id="admin-login-submit-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                    boxShadow: '0 8px 24px -4px rgba(139, 92, 246, 0.45)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Lock size={16} />
                  <span>{isSubmitting ? 'Verifying Credentials...' : 'Authenticate Administrative Session'}</span>
                </button>
              </form>
            )}



            {/* Notice for Schools, Churches, Organizations & Employers */}
            <div style={{
              marginTop: '22px',
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.06)',
              border: '1px dashed rgba(139, 92, 246, 0.3)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              textAlign: 'center',
            }}>
              <div>
                🔒 <strong>Internal Admin Endpoint:</strong> Access to <code>domain.com/admin</code> is strictly reserved for the Educore Platform Administrator.
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Schools, churches, organizations, and employers should access their workspaces via the{' '}
                <button
                  type="button"
                  id="admin-switch-to-public-btn"
                  onClick={onReturnToPublic}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--violet)',
                    fontWeight: 800,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Public Portal Sign In →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div>EDUCORE Multi-Tenant Cryptographic Infrastructure · Internal Administration Endpoint</div>
      </footer>
    </div>
  );
};
