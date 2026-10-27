import React, { useState } from 'react';
import { User, Tenant, Company } from '../types';
import {
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password?: string) => { success: boolean; user?: User; message?: string };
  tenants?: Tenant[];
  companies?: Company[];
  allUsers?: User[];
}

export const LoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successUser, setSuccessUser] = useState<User | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = onLogin(email, password);
    if (res.success && res.user) {
      setSuccessUser(res.user);
      setTimeout(() => {
        setSuccessUser(null);
        onClose();
      }, 700);
    } else {
      setErrorMessage(res.message || 'Authentication failed. Please verify your institutional email.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="login-modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(6, 182, 212, 0.2)',
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(37, 99, 235, 0.3))',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan)',
              }}
            >
              <Lock size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                EDUCORE Tenant Sign In
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Multi-Tenant Cryptographic Gateway · Isolated Institution Workspaces
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {/* Success Banner */}
        {successUser && (
          <div
            style={{
              margin: '16px 24px 0',
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: 'var(--emerald)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <CheckCircle2 size={20} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Authentication Successful</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                Loaded session for <strong>{successUser.name}</strong> ({successUser.role}). Initializing isolated workspace...
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div
            style={{
              margin: '16px 24px 0',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: 'var(--rose)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Institutional Work Email</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--cyan)' }}>Official Institutional Email</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rector@university.edu.ng, admin@institution.edu.ng"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Multi-Tenant Boundary Information Pill */}
            <div
              style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <ShieldCheck size={20} color="var(--cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--cyan)' }}>Strict Multi-Tenant Boundary Isolation:</strong> Each institution's
                work environment is cryptographically partitioned. Logging into your institution workspace will never expose or share
                students, faculty, or issuance logs with other member institutions.
              </div>
            </div>

            <button
              type="submit"
              id="btn-login-submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.95rem',
                fontWeight: 800,
                marginTop: '8px',
              }}
            >
              Sign In to Institutional Workspace <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
