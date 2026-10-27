import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Briefcase,
  GraduationCap,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  BookOpen,
  Award,
} from 'lucide-react';
import { User, Tenant, Company, UserRole } from '../types';
import { BrandLogo } from './BrandLogo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password?: string) => { success: boolean; user?: User; message?: string };
  onRegister: (data: {
    name: string;
    email: string;
    role: UserRole;
    tenant_id?: string;
    company_id?: string;
    company_name?: string;
    institution_name?: string;
    institution_type?: Tenant['institution_type'];
    designation?: string;
    password?: string;
  }) => { success: boolean; user?: User; message?: string };
  tenants: Tenant[];
  companies: Company[];
}

export const UserAuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  tenants,
  companies,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Sign Up Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regCategory, setRegCategory] = useState<'school' | 'church' | 'org' | 'company' | 'learner'>('school');
  const [regTenantId, setRegTenantId] = useState<string>('');
  const [regInstitutionName, setRegInstitutionName] = useState<string>('');
  const [regDesignation, setRegDesignation] = useState<string>('');
  const [regCompanyName, setRegCompanyName] = useState<string>('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    if (!loginEmail.trim()) {
      setLoginError('Please enter your account email address.');
      return;
    }

    const res = onLogin(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.message || 'Authentication failed. Please verify your credentials.');
    } else {
      setLoginSuccess(`Welcome back, ${res.user?.name}! Loading portal workspace...`);
      setTimeout(() => {
        onClose();
        setLoginSuccess(null);
      }, 700);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Please enter your email address.');
      return;
    }
    if (regPassword && regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    let role: UserRole = 'student';
    if (regCategory === 'school' || regCategory === 'church' || regCategory === 'org') {
      role = 'institution_admin';
    } else if (regCategory === 'company') {
      role = 'company_verifier';
    } else {
      role = 'student';
    }

    const res = onRegister({
      name: regName,
      email: regEmail,
      role: role,
      tenant_id: regTenantId || undefined,
      institution_name: regInstitutionName.trim() || undefined,
      institution_type: regCategory === 'church' ? 'church' : regCategory === 'org' ? 'ngo' : 'polytechnic',
      company_name: regCompanyName.trim() || undefined,
      designation:
        regDesignation ||
        (regCategory === 'church'
          ? 'Ministerial Registrar'
          : regCategory === 'school'
          ? 'Dean / Rector'
          : regCategory === 'company'
          ? 'Lead Verification Officer'
          : 'Registered Learner'),
      password: regPassword,
    });

    if (!res.success) {
      setRegError(res.message || 'Could not complete registration.');
    } else {
      setRegSuccess(`Account created successfully! Welcome, ${res.user?.name}. Loading portal...`);
      setTimeout(() => {
        onClose();
        setRegSuccess(null);
      }, 750);
    }
  };



  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '22px 28px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <BrandLogo
              alt="EDUCORE"
              style={{ height: '36px', width: 'auto', maxWidth: '160px', objectFit: 'contain' }}
            />
            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: 'var(--heading-color)' }}>
                Portal Access
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Schools · Churches · Organizations · Employers · Learners
              </p>
            </div>
          </div>
          <button id="auth-modal-close-btn" className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-card-subtle)',
            padding: '4px 20px',
            gap: '8px',
          }}
        >
          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: authMode === 'signin' ? 'var(--bg-surface)' : 'transparent',
              color: authMode === 'signin' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: authMode === 'signin' ? '2px solid var(--primary)' : '2px solid transparent',
              borderRadius: '6px 6px 0 0',
              fontWeight: 800,
              padding: '10px 18px',
              boxShadow: authMode === 'signin' ? 'var(--shadow-sm)' : 'none',
            }}
            onClick={() => {
              setAuthMode('signin');
              setLoginError(null);
            }}
          >
            <LogIn size={15} /> Sign In
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: authMode === 'signup' ? 'var(--bg-surface)' : 'transparent',
              color: authMode === 'signup' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: authMode === 'signup' ? '2px solid var(--primary)' : '2px solid transparent',
              borderRadius: '6px 6px 0 0',
              fontWeight: 800,
              padding: '10px 18px',
              boxShadow: authMode === 'signup' ? 'var(--shadow-sm)' : 'none',
            }}
            onClick={() => {
              setAuthMode('signup');
              setRegError(null);
            }}
          >
            <UserPlus size={15} /> Register Account
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px 28px', maxHeight: '78vh', overflowY: 'auto' }}>
          {/* =========================================================================
              MODE 1: PORTAL SIGN IN
              ========================================================================= */}
          {authMode === 'signin' && (
            <div>
              {loginSuccess && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--emerald)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}>
                  <CheckCircle2 size={18} />
                  <span>{loginSuccess}</span>
                </div>
              )}

              {loginError && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--rose)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}>
                  <AlertTriangle size={18} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleSignInSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" htmlFor="user-login-email">
                    Institutional, Corporate, or Personal Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      id="user-login-email"
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '44px' }}
                      placeholder="name@institution.edu.ng, official@organization.org, or hr@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" htmlFor="user-login-password" style={{ margin: 0 }}>
                      Password
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                      Forgot password?
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      id="user-login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingLeft: '44px', paddingRight: '44px' }}
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="user-signin-submit-btn"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 800, marginBottom: '20px' }}
                >
                  <span>Sign In to Portal</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Portal Registration & Support Notice */}
              <div style={{
                marginTop: '16px',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                textAlign: 'center',
              }}>
                <div>
                  Don't have an active institutional account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginError(null);
                      setAuthMode('signup');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    Register your institution or account →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MODE 2: PORTAL SIGN UP (REGISTRATION FOR SCHOOLS, CHURCHES, ORGS, EMPLOYERS)
              ========================================================================= */}
          {authMode === 'signup' && (
            <div>
              {regSuccess && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--emerald)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}>
                  <CheckCircle2 size={18} />
                  <span>{regSuccess}</span>
                </div>
              )}

              {regError && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--rose)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}>
                  <AlertTriangle size={18} />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleSignUpSubmit}>
                {/* Account Type Selector */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px' }}>
                    Select Your Organization / Account Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn"
                      style={{
                        flexDirection: 'column',
                        padding: '10px 6px',
                        fontSize: '0.72rem',
                        gap: '4px',
                        background: regCategory === 'school' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface)',
                        border: regCategory === 'school' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                        color: regCategory === 'school' ? 'var(--primary)' : 'var(--text-secondary)',
                      }}
                      onClick={() => setRegCategory('school')}
                    >
                      <Building size={16} />
                      <span style={{ fontWeight: 800 }}>School/Univ</span>
                    </button>

                    <button
                      type="button"
                      className="btn"
                      style={{
                        flexDirection: 'column',
                        padding: '10px 6px',
                        fontSize: '0.72rem',
                        gap: '4px',
                        background: regCategory === 'church' ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-surface)',
                        border: regCategory === 'church' ? '2px solid var(--violet)' : '1px solid var(--border-light)',
                        color: regCategory === 'church' ? 'var(--violet)' : 'var(--text-secondary)',
                      }}
                      onClick={() => setRegCategory('church')}
                    >
                      <BookOpen size={16} />
                      <span style={{ fontWeight: 800 }}>Church/Faith</span>
                    </button>

                    <button
                      type="button"
                      className="btn"
                      style={{
                        flexDirection: 'column',
                        padding: '10px 6px',
                        fontSize: '0.72rem',
                        gap: '4px',
                        background: regCategory === 'org' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-surface)',
                        border: regCategory === 'org' ? '2px solid var(--amber)' : '1px solid var(--border-light)',
                        color: regCategory === 'org' ? 'var(--amber)' : 'var(--text-secondary)',
                      }}
                      onClick={() => setRegCategory('org')}
                    >
                      <Award size={16} />
                      <span style={{ fontWeight: 800 }}>Org / NGO</span>
                    </button>

                    <button
                      type="button"
                      className="btn"
                      style={{
                        flexDirection: 'column',
                        padding: '10px 6px',
                        fontSize: '0.72rem',
                        gap: '4px',
                        background: regCategory === 'company' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                        border: regCategory === 'company' ? '2px solid var(--emerald)' : '1px solid var(--border-light)',
                        color: regCategory === 'company' ? 'var(--emerald)' : 'var(--text-secondary)',
                      }}
                      onClick={() => setRegCategory('company')}
                    >
                      <Briefcase size={16} />
                      <span style={{ fontWeight: 800 }}>Employer</span>
                    </button>

                    <button
                      type="button"
                      className="btn"
                      style={{
                        flexDirection: 'column',
                        padding: '10px 6px',
                        fontSize: '0.72rem',
                        gap: '4px',
                        background: regCategory === 'learner' ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-surface)',
                        border: regCategory === 'learner' ? '2px solid var(--cyan)' : '1px solid var(--border-light)',
                        color: regCategory === 'learner' ? 'var(--cyan)' : 'var(--text-secondary)',
                      }}
                      onClick={() => setRegCategory('learner')}
                    >
                      <GraduationCap size={16} />
                      <span style={{ fontWeight: 800 }}>Learner</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label className="form-label" htmlFor="reg-name">Full Name / Official Name</label>
                    <input
                      id="reg-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Pastor David Adeleke or Dr. Sarah"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="reg-email">Official Email Address</label>
                    <input
                      id="reg-email"
                      type="email"
                      className="form-input"
                      placeholder="e.g. contact@institution.org"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {(regCategory === 'school' || regCategory === 'church' || regCategory === 'org') && (
                  <div style={{ display: 'grid', gridTemplateColumns: tenants.length > 0 ? '1fr 1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    {tenants.length > 0 ? (
                      <div>
                        <label className="form-label" htmlFor="reg-tenant-select">Affiliated Institution / Registry</label>
                        <select
                          id="reg-tenant-select"
                          className="form-select"
                          value={regTenantId}
                          onChange={(e) => {
                            setRegTenantId(e.target.value);
                            if (e.target.value) setRegInstitutionName('');
                          }}
                        >
                          <option value="">+ Provision New Institution...</option>
                          {tenants.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}

                    {(!regTenantId || tenants.length === 0) && (
                      <div>
                        <label className="form-label" htmlFor="reg-institution-name">
                          {regCategory === 'church' ? 'Church / Ministry Name' : regCategory === 'org' ? 'Organization / NGO Name' : 'Institution / Academy Name'}
                        </label>
                        <input
                          id="reg-institution-name"
                          type="text"
                          className="form-input"
                          placeholder={
                            regCategory === 'church'
                              ? 'e.g. Grace Fellowship International'
                              : regCategory === 'org'
                              ? 'e.g. National Institute of Tech'
                              : 'e.g. Federal Polytechnic of Nigeria'
                          }
                          value={regInstitutionName}
                          onChange={(e) => setRegInstitutionName(e.target.value)}
                        />
                      </div>
                    )}

                    <div>
                      <label className="form-label" htmlFor="reg-designation">Designation / Role Title</label>
                      <input
                        id="reg-designation"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Rector, Registrar, Dean"
                        value={regDesignation}
                        onChange={(e) => setRegDesignation(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {regCategory === 'company' && (
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label" htmlFor="reg-company-name">Company / Verifying Firm Name</label>
                    <input
                      id="reg-company-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Global Talent Verification Ltd"
                      value={regCompanyName}
                      onChange={(e) => setRegCompanyName(e.target.value)}
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label className="form-label" htmlFor="reg-password">Password</label>
                    <input
                      id="reg-password"
                      type="password"
                      className="form-input"
                      placeholder="••••••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
                    <input
                      id="reg-confirm-password"
                      type="password"
                      className="form-input"
                      placeholder="••••••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="user-signup-submit-btn"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 800 }}
                >
                  <span>Complete Portal Registration</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
