import React, { useState, useEffect } from 'react';
import { User, Tenant, Company } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  ShieldCheck,
  CheckCircle2,
  Building,
  School,
  Briefcase,
  Lock,
  LogOut,
  Sun,
  Moon,
  LogIn,
  X,
  Home,
  Info,
} from 'lucide-react';

interface Props {
  currentUser: User | null;
  activeTenant?: Tenant;
  activeCompany?: Company;
  activeTab: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigate: (tab: string) => void;
  onOpenRegisterSchool: () => void;
  onOpenRegisterCompany: () => void;
  onOpenUserAuth: () => void;
  onSwitchUser: (userId: string | null) => void;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  activeTenant,
  activeCompany,
  activeTab,
  theme,
  onToggleTheme,
  onNavigate,
  onOpenRegisterSchool,
  onOpenRegisterCompany,
  onOpenUserAuth,
  onSwitchUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = currentUser?.role === 'platform_admin' || currentUser?.role === 'institution_admin';

  // Automatically close mobile menu on screen resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="educore-navbar">
        <div className="navbar-inner">
          {/* Brand Logo: Official EDUCORE Logo */}
          <div
            id="nav-brand-logo"
            className="nav-brand-container"
            onClick={() => handleNav('home')}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <BrandLogo
              theme={theme}
              alt="EDUCORE - Verify · Trust · Empower"
              style={{
                height: '40px',
                width: 'auto',
                maxWidth: '185px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

        {/* 1. DESKTOP CENTER NAVIGATION TABS (>= 1024px) */}
        <nav className="navbar-desktop-nav">
          <button
            id="nav-btn-home"
            className="btn btn-sm"
            style={{
              background: activeTab === 'home' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
              color: activeTab === 'home' ? '#ffffff' : 'var(--text-secondary)',
              border: activeTab === 'home' ? '1px solid rgba(147, 197, 253, 0.3)' : '1px solid transparent',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 18px',
              fontWeight: 700,
            }}
            onClick={() => handleNav('home')}
          >
            Home
          </button>

          <button
            id="nav-btn-verify"
            className="btn btn-sm"
            style={{
              background: activeTab === 'verify'
                ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(37, 99, 235, 0.3))'
                : 'transparent',
              color: activeTab === 'verify' ? 'var(--cyan)' : 'var(--text-secondary)',
              border: activeTab === 'verify' ? '1px solid var(--cyan)' : '1px solid transparent',
              boxShadow: activeTab === 'verify' ? '0 0 16px rgba(6, 182, 212, 0.25)' : 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 18px',
              fontWeight: 700,
            }}
            onClick={() => handleNav('verify')}
          >
            <CheckCircle2 size={15} style={{ color: 'var(--cyan)' }} />
            Universal Verifier
          </button>

          {/* Conditional Contextual Portals for Authenticated Users */}
          {currentUser?.role === 'institution_admin' ||
          currentUser?.role === 'registrar' ||
          currentUser?.role === 'teacher' ||
          currentUser?.role === 'attendance_officer' ||
          currentUser?.role === 'credential_approver' ||
          currentUser?.role === 'department_admin' ||
          currentUser?.role === 'compliance_officer' ? (
            <button
              id="nav-btn-school-dashboard"
              className="btn btn-sm"
              style={{
                background: activeTab === 'school' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                color: activeTab === 'school' ? '#ffffff' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-pill)',
                padding: '8px 18px',
                fontWeight: 700,
              }}
              onClick={() => handleNav('school')}
            >
              <School size={15} />
              {activeTenant ? `${activeTenant.name.split(' ')[0]} Portal` : 'School Portal'}
            </button>
          ) : null}

          {currentUser?.role === 'company_verifier' ? (
            <button
              id="nav-btn-company-dashboard"
              className="btn btn-sm"
              style={{
                background: activeTab === 'company' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                color: activeTab === 'company' ? '#ffffff' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-pill)',
                padding: '8px 18px',
                fontWeight: 700,
              }}
              onClick={() => handleNav('company')}
            >
              <Briefcase size={15} />
              Company Portal
            </button>
          ) : null}

          {currentUser?.role === 'platform_admin' ? (
            <button
              id="nav-btn-admin-dashboard"
              className="btn btn-sm"
              style={{
                background: activeTab === 'admin' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'transparent',
                color: activeTab === 'admin' ? '#ffffff' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-pill)',
                padding: '8px 18px',
                fontWeight: 700,
              }}
              onClick={() => handleNav('admin')}
            >
              <Lock size={15} />
              Platform Admin
            </button>
          ) : null}

          <button
            id="nav-btn-about"
            className="btn btn-sm"
            style={{
              background: activeTab === 'about' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
              color: activeTab === 'about' ? '#ffffff' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 18px',
              fontWeight: 700,
            }}
            onClick={() => handleNav('about')}
          >
            About
          </button>
        </nav>

        {/* 2. DESKTOP RIGHT ACTIONS (>= 1024px) */}
        <div className="navbar-desktop-actions">
          {/* Theme Switcher Button */}
          <button
            id="theme-toggle-btn"
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Midnight Luxe' : 'Switch to Radiant Luminous'}
          >
            {theme === 'light' ? (
              <>
                <Moon size={14} style={{ color: 'var(--violet)' }} />
                <span>Midnight</span>
              </>
            ) : (
              <>
                <Sun size={14} style={{ color: 'var(--amber)' }} />
                <span>Radiant</span>
              </>
            )}
          </button>

          {currentUser ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bg-surface)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: isAdmin ? '1px solid rgba(139, 92, 246, 0.45)' : '1px solid var(--border-accent)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: isAdmin ? 'var(--violet)' : 'var(--cyan)', fontWeight: 700 }}>
                  {isAdmin
                    ? `🛡️ ${currentUser.role === 'platform_admin' ? 'Super Admin' : 'Institution Rector'}`
                    : activeTenant
                    ? `🏢 ${activeTenant.name}`
                    : activeCompany
                    ? `💼 ${activeCompany.name}`
                    : '🎓 Verified Member'}
                </div>
              </div>
              <button
                id="nav-btn-signout"
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--rose)',
                  fontWeight: 700,
                }}
                title="Sign out of current session"
                onClick={() => onSwitchUser(null)}
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                id="nav-btn-user-auth"
                className="btn btn-secondary btn-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(6, 182, 212, 0.18))',
                  border: '1px solid rgba(6, 182, 212, 0.45)',
                  color: 'var(--text-main)',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-pill)',
                }}
                onClick={onOpenUserAuth}
                title="Sign In / Register for Schools, Churches, Organizations, Employers & Learners"
              >
                <LogIn size={14} style={{ color: 'var(--cyan)' }} />
                <span>Portal Sign In</span>
              </button>

              <button
                id="nav-btn-register-school"
                className="btn btn-secondary btn-sm"
                onClick={onOpenRegisterSchool}
                style={{ padding: '7px 12px' }}
                title="Onboard your institution"
              >
                <Building size={14} style={{ color: 'var(--cyan)' }} />
                <span>Onboard Institution</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. MOBILE CONTROLS (< 1024px) */}
        <div className="navbar-mobile-controls">
          {/* Compact Theme Switcher */}
          <button
            id="mobile-theme-toggle-btn"
            className="btn btn-secondary btn-sm"
            style={{
              width: '38px',
              height: '38px',
              padding: 0,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon size={16} style={{ color: 'var(--violet)' }} />
            ) : (
              <Sun size={16} style={{ color: 'var(--amber)' }} />
            )}
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            id="nav-mobile-toggle-btn"
            className="nav-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X size={20} style={{ color: 'var(--primary)' }} />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 4. MOBILE NAVIGATION DRAWER & BACKDROP */}
      {mobileMenuOpen && (
        <>
          <div
            className="navbar-mobile-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="navbar-mobile-drawer">
            {/* Primary Mobile Navigation Links */}
            <div className="nav-mobile-links-list">
              <button
                id="nav-mobile-btn-home"
                className={`nav-mobile-link-item ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => handleNav('home')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Home size={18} style={{ color: activeTab === 'home' ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <span>Home Overview</span>
                </div>
                {activeTab === 'home' && <span className="badge badge-valid" style={{ fontSize: '0.65rem' }}>Active</span>}
              </button>

              <button
                id="nav-mobile-btn-verify"
                className={`nav-mobile-link-item ${activeTab === 'verify' ? 'active' : ''}`}
                onClick={() => handleNav('verify')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--cyan)' }} />
                  <span>Universal Verifier</span>
                </div>
                <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)' }}>
                  Zero-Trust
                </span>
              </button>

              {/* Conditional Active Session Portal Link */}
              {currentUser?.role === 'institution_admin' ||
              currentUser?.role === 'registrar' ||
              currentUser?.role === 'teacher' ||
              currentUser?.role === 'attendance_officer' ||
              currentUser?.role === 'credential_approver' ||
              currentUser?.role === 'department_admin' ||
              currentUser?.role === 'compliance_officer' ? (
                <button
                  id="nav-mobile-btn-school"
                  className={`nav-mobile-link-item ${activeTab === 'school' ? 'active' : ''}`}
                  onClick={() => handleNav('school')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <School size={18} style={{ color: 'var(--primary)' }} />
                    <span>{activeTenant ? `${activeTenant.name}` : 'Institution Portal'}</span>
                  </div>
                  <span className="badge badge-valid" style={{ fontSize: '0.65rem' }}>Workspace</span>
                </button>
              ) : null}

              {currentUser?.role === 'company_verifier' ? (
                <button
                  id="nav-mobile-btn-company"
                  className={`nav-mobile-link-item ${activeTab === 'company' ? 'active' : ''}`}
                  onClick={() => handleNav('company')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Briefcase size={18} style={{ color: 'var(--emerald)' }} />
                    <span>{activeCompany ? `${activeCompany.name}` : 'Company Portal'}</span>
                  </div>
                  <span className="badge badge-valid" style={{ fontSize: '0.65rem' }}>HR Portal</span>
                </button>
              ) : null}

              {currentUser?.role === 'platform_admin' ? (
                <button
                  id="nav-mobile-btn-admin"
                  className={`nav-mobile-link-item ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => handleNav('admin')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Lock size={18} style={{ color: 'var(--violet)' }} />
                    <span>Platform Governance</span>
                  </div>
                  <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--violet)' }}>
                    Admin
                  </span>
                </button>
              ) : null}

              <button
                id="nav-mobile-btn-about"
                className={`nav-mobile-link-item ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => handleNav('about')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Info size={18} style={{ color: activeTab === 'about' ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <span>About EDUCORE</span>
                </div>
              </button>
            </div>

            {/* Mobile Actions Container */}
            <div className="nav-mobile-actions-container">
              {currentUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {currentUser.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cyan)', fontWeight: 600, marginTop: '2px' }}>
                      {activeTenant ? `🏢 ${activeTenant.name}` : activeCompany ? `💼 ${activeCompany.name}` : '🎓 Verified User'}
                    </div>
                  </div>

                  <button
                    id="nav-mobile-btn-signout"
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      justifyContent: 'center',
                      color: 'var(--rose)',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontWeight: 700,
                    }}
                    onClick={() => {
                      onSwitchUser(null);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut size={16} /> Sign Out of Portal
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    id="nav-mobile-btn-signin"
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '13px',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                    }}
                    onClick={() => {
                      onOpenUserAuth();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogIn size={16} />
                    <span>Portal Sign In</span>
                  </button>

                  <button
                    id="nav-mobile-btn-onboard"
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                    onClick={() => {
                      onOpenRegisterSchool();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Building size={16} style={{ color: 'var(--cyan)' }} />
                    <span>Onboard Institution</span>
                  </button>

                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    marginTop: '4px',
                    lineHeight: 1.4,
                  }}>
                    Public portal access for Schools, Churches, Organizations, Employers & Learners
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
    <div className="navbar-spacer" />
  </>
);
};
