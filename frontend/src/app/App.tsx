import React, { useState, useEffect } from 'react';
import { useEducoreState } from './state';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CertificateModal } from '../components/CertificateModal';
import { BrandLogo } from '../components/BrandLogo';
import { RegisterSchoolModal } from '../components/RegisterSchoolModal';
import { RegisterCompanyModal } from '../components/RegisterCompanyModal';
import { UserAuthModal } from '../components/UserAuthModal';
import { AdminLoginPage } from '../features/admin/AdminLoginPage';
import { HomePage } from '../features/public/HomePage';
import { AboutPage } from '../features/public/AboutPage';
import { UniversalVerifier } from '../features/verification/UniversalVerifier';
import { SchoolDashboard } from '../features/school/SchoolDashboard';
import { CompanyDashboard } from '../features/company/CompanyDashboard';
import { AdminDashboard } from '../features/admin/AdminDashboard';
import { Credential, UserRole } from '../types';
import { ShieldAlert, ArrowLeft, LogOut, Lock, Building, Sun, Moon } from 'lucide-react';

const checkIsAdminPath = () => {
  const p = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const h = window.location.hash.toLowerCase();
  return p === '/admin' || h === '#/admin' || h === '#admin';
};

export const App: React.FC = () => {
  const state = useEducoreState();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdminPath, setIsAdminPath] = useState<boolean>(checkIsAdminPath);
  const [initialVerifyQuery, setInitialVerifyQuery] = useState<string>('');
  const [inspectCertificate, setInspectCertificate] = useState<Credential | null>(null);
  const [showRegisterSchool, setShowRegisterSchool] = useState(false);
  const [showRegisterCompany, setShowRegisterCompany] = useState(false);
  const [showUserAuthModal, setShowUserAuthModal] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('educore_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('educore_theme', theme);
  }, [theme]);

  // Synchronize route with browser URL history (popstate and hashchange)
  useEffect(() => {
    const handleLocationChange = () => {
      const onAdmin = checkIsAdminPath();
      setIsAdminPath(onAdmin);
      if (!onAdmin && (activeTab === 'admin' || activeTab === 'school')) {
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [activeTab]);

  // Route Guard: Ensure unauthenticated users accessing protected tabs are gracefully routed to home
  useEffect(() => {
    if (activeTab === 'school' && (!state.currentUser || !state.activeTenant)) {
      setActiveTab('home');
    } else if (activeTab === 'company' && (!state.currentUser || !state.activeCompany)) {
      setActiveTab('home');
    } else if (activeTab === 'admin' && state.currentUser?.role !== 'platform_admin') {
      if (!isAdminPath) {
        setActiveTab('home');
      }
    }
  }, [activeTab, state.currentUser, state.activeTenant, state.activeCompany, isAdminPath]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const navigateToPublic = () => {
    window.history.pushState(null, '', '/');
    setIsAdminPath(false);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    window.history.pushState(null, '', '/admin');
    setIsAdminPath(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When switching personas or logging in from user portal
  const handleSwitchUser = (userId: string | null) => {
    state.switchUser(userId);
    if (!userId) {
      if (!isAdminPath) {
        setActiveTab('home');
      }
    } else {
      const u = state.allUsers.find((x) => x.id === userId);
      if (
        u?.role === 'institution_admin' ||
        u?.role === 'registrar' ||
        u?.role === 'teacher' ||
        u?.role === 'attendance_officer' ||
        u?.role === 'credential_approver' ||
        u?.role === 'department_admin' ||
        u?.role === 'compliance_officer'
      ) {
        setActiveTab('school');
      } else if (u?.role === 'company_verifier') {
        setActiveTab('company');
      } else if (u?.role === 'platform_admin') {
        setActiveTab('admin');
      }
    }
  };

  // User Portal Login (For learners, alumni, HR verifiers, staff)
  const handleUserLogin = (email: string, password?: string) => {
    const res = state.login(email, password);
    if (res.success && res.user) {
      if (
        res.user.role === 'institution_admin' ||
        res.user.role === 'registrar' ||
        res.user.role === 'teacher' ||
        res.user.role === 'attendance_officer' ||
        res.user.role === 'credential_approver' ||
        res.user.role === 'department_admin' ||
        res.user.role === 'compliance_officer'
      ) {
        setActiveTab('school');
      } else if (res.user.role === 'company_verifier') {
        setActiveTab('company');
      } else if (res.user.role === 'platform_admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('verify');
      }
    }
    return res;
  };

  // Dedicated Admin Portal Login (For domain.com/admin)
  const handleAdminLogin = (email: string, passcode?: string, token2FA?: string) => {
    const res = state.loginAdmin(email, passcode, token2FA);
    if (res.success && res.user) {
      if (res.user.role === 'platform_admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('school');
      }
    }
    return res;
  };

  // User Self-Registration
  const handleUserRegister = (data: {
    name: string;
    email: string;
    role: UserRole;
    tenant_id?: string;
    company_id?: string;
    company_name?: string;
    institution_name?: string;
    institution_type?: any;
    designation?: string;
    password?: string;
  }) => {
    const res = state.registerUser(data);
    if (res.success && res.user) {
      if (res.user.role === 'company_verifier') {
        setActiveTab('company');
      } else if (
        res.user.role === 'institution_admin' ||
        res.user.role === 'registrar' ||
        res.user.role === 'teacher' ||
        res.user.role === 'attendance_officer' ||
        res.user.role === 'credential_approver'
      ) {
        setActiveTab('school');
      } else {
        setActiveTab('verify');
      }
    }
    return res;
  };

  const handleNavigateVerify = (query?: string) => {
    if (query) {
      setInitialVerifyQuery(query);
    }
    setActiveTab('verify');
  };

  const isCurrentAdmin = state.currentUser?.role === 'platform_admin';

  // =========================================================================
  // ROUTE 1: DEDICATED ADMIN ROUTE (domain.com/admin)
  // Not visible to the public unless directly accessed via /admin
  // =========================================================================
  if (isAdminPath) {
    if (!isCurrentAdmin) {
      return (
        <AdminLoginPage
          onLoginAdmin={handleAdminLogin}
          onReturnToPublic={navigateToPublic}
          tenants={state.tenants}
          theme={theme}
          onToggleTheme={toggleTheme}
          hasExistingPlatformAdmin={state.platformAdmins.length > 0}
          onInitializeRootAdmin={state.initializeRootPlatformAdmin}
        />
      );
    }

    // Authenticated Administrative Console View
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="bg-mesh"></div>

        {/* Dedicated Admin Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'var(--header-bg)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.35)',
          padding: '12px 24px',
        }}>
          <div style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            {/* Left Brand */}
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
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: 'var(--violet)',
                    border: '1px solid rgba(139, 92, 246, 0.35)',
                    letterSpacing: '0.08em',
                  }}>
                    Admin Console · domain.com/admin
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {state.currentUser?.role === 'platform_admin'
                    ? 'Global System Governance & Accreditation Registry'
                    : `${state.activeTenant?.name || 'Institution'} · Executive Administration`}
                </div>
              </div>
            </div>

            {/* Right Admin Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Theme Switcher Button */}
              <button
                id="admin-theme-toggle-btn"
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
                onClick={toggleTheme}
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

              <button
                id="admin-view-public-site-btn"
                className="btn btn-secondary btn-sm"
                onClick={navigateToPublic}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: 'var(--radius-pill)',
                  padding: '7px 16px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                <ArrowLeft size={14} />
                <span>View Public Site</span>
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--bg-surface)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(139, 92, 246, 0.45)',
              }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {state.currentUser?.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--violet)', fontWeight: 700 }}>
                    🛡️ {state.currentUser?.role === 'platform_admin' ? 'Super Admin' : 'Institution Rector'}
                  </div>
                </div>
                <button
                  id="admin-signout-btn"
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
                  title="Sign out of administrative session"
                  onClick={() => handleSwitchUser(null)}
                >
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Administrative Main Content */}
        <main className="main-content" style={{ flex: 1, padding: '24px 20px 40px' }}>
          {state.currentUser?.role === 'platform_admin' ? (
            <AdminDashboard
              currentUser={state.currentUser}
              tenants={state.tenants}
              companies={state.companies}
              allCredentials={state.allCredentials}
              auditLogs={state.auditLogs}
              platformAdmins={state.platformAdmins}
              allUsers={state.allUsers}
              onApproveTenant={state.approveTenant}
              onRejectTenant={state.rejectTenant}
              onSuspendTenant={state.suspendTenant}
              onRegisterPlatformAdmin={state.registerPlatformAdmin}
              onUpdatePlatformAdminPermissions={state.updatePlatformAdminPermissions}
              onDeletePlatformAdmin={state.deletePlatformAdmin}
              onTogglePlatformAdminStatus={state.togglePlatformAdminStatus}
            />
          ) : state.activeTenant && state.currentUser ? (
            <SchoolDashboard
              activeTenant={state.activeTenant}
              currentUser={state.currentUser}
              credentials={state.credentials}
              students={state.students}
              courses={state.courses}
              attendanceRecords={state.attendanceRecords}
              auditLogs={state.auditLogs}
              tenantUsers={state.tenantUsers}
              onDraftCredential={state.draftCredential}
              onSubmitForApproval={state.submitForApproval}
              onApproveCredential={state.approveCredential}
              onIssueCredential={state.issueCredential}
              onRevokeCredential={state.revokeCredential}
              onAddStudent={state.addStudent}
              onRecordAttendance={state.recordAttendance}
              onViewCertificate={(cred) => setInspectCertificate(cred)}
              onInviteStaffUser={state.inviteStaffUser}
              onToggleStaffStatus={state.toggleStaffStatus}
              onUpdateTenantAdminPermissions={state.updateTenantAdminPermissions}
              onDeleteTenantAdmin={state.deleteTenantAdmin}
              onUpdateTenantSettings={state.updateTenantSettings}
              onTestCrossTenantSecurity={state.testCrossTenantSecurity}
            />
          ) : null}
        </main>

        <Footer />

        <CertificateModal
          credential={inspectCertificate}
          onClose={() => setInspectCertificate(null)}
          onVerifyNow={(verId) => {
            setInspectCertificate(null);
            navigateToPublic();
            handleNavigateVerify(verId);
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // ROUTE 2: PUBLIC SITE (domain.com)
  // Completely hides admin login from public visibility
  // =========================================================================
  return (
    <div className="app-container">
      <div className="bg-mesh"></div>

      {/* Main Public Navbar - No Admin Login Button */}
      <Navbar
        currentUser={state.currentUser}
        activeTenant={state.activeTenant}
        activeCompany={state.activeCompany}
        activeTab={activeTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenRegisterSchool={() => setShowRegisterSchool(true)}
        onOpenRegisterCompany={() => setShowRegisterCompany(true)}
        onOpenUserAuth={() => setShowUserAuthModal(true)}
        onSwitchUser={handleSwitchUser}
      />

      {/* Main Content Body */}
      <main className="main-content">
        {activeTab === 'home' && (
          <HomePage
            onNavigateVerify={handleNavigateVerify}
            onOpenRegisterSchool={() => setShowRegisterSchool(true)}
            onOpenRegisterCompany={() => setShowRegisterCompany(true)}
            onOpenUserAuth={() => setShowUserAuthModal(true)}
          />
        )}

        {activeTab === 'verify' && (
          <UniversalVerifier
            initialQuery={initialVerifyQuery}
            onVerify={state.verifyCredential}
            allCredentials={state.allCredentials}
            onViewCertificate={(cred) => setInspectCertificate(cred)}
          />
        )}

        {activeTab === 'school' && state.activeTenant && state.currentUser && (
          <SchoolDashboard
            activeTenant={state.activeTenant}
            currentUser={state.currentUser}
            credentials={state.credentials}
            students={state.students}
            courses={state.courses}
            attendanceRecords={state.attendanceRecords}
            auditLogs={state.auditLogs}
            tenantUsers={state.tenantUsers}
            onDraftCredential={state.draftCredential}
            onSubmitForApproval={state.submitForApproval}
            onApproveCredential={state.approveCredential}
            onIssueCredential={state.issueCredential}
            onRevokeCredential={state.revokeCredential}
            onAddStudent={state.addStudent}
            onRecordAttendance={state.recordAttendance}
            onUpdateAttendanceRecord={state.updateAttendanceRecord}
            onRequestAttendanceExport={state.requestAttendanceExport}
            onSimulateBiometricEvent={state.simulateBiometricEvent}
            biometricDevices={state.biometricDevices}
            biometricMappings={state.biometricMappings}
            exportJobs={state.attendanceExportJobs}
            onViewCertificate={(cred) => setInspectCertificate(cred)}
            onInviteStaffUser={state.inviteStaffUser}
            onRevokeTenantMembership={state.revokeTenantMembership}
            onResendStaffInvitation={state.resendStaffInvitation}
            onActivateStaffUser={state.activateStaffUser}
            onSwitchUser={state.switchUser}
            allUsers={state.allUsers}
            onToggleStaffStatus={state.toggleStaffStatus}
            onUpdateTenantAdminPermissions={state.updateTenantAdminPermissions}
            onDeleteTenantAdmin={state.deleteTenantAdmin}
            onUpdateTenantSettings={state.updateTenantSettings}
            onTestCrossTenantSecurity={state.testCrossTenantSecurity}
          />
        )}

        {activeTab === 'company' && state.activeCompany && state.currentUser && (
          <CompanyDashboard
            activeCompany={state.activeCompany}
            currentUser={state.currentUser}
            verificationLogs={state.verificationLogs}
            onVerify={state.verifyCredential}
            allCredentials={state.allCredentials}
            onViewCertificate={(cred) => setInspectCertificate(cred)}
          />
        )}

        {activeTab === 'about' && (
          <AboutPage
            onNavigateHome={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateVerify={() => {
              setActiveTab('verify');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenUserAuth={() => setShowUserAuthModal(true)}
            onOpenRegisterSchool={() => setShowRegisterSchool(true)}
          />
        )}
      </main>

      {/* Public Footer */}
      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUserAuth={() => setShowUserAuthModal(true)}
        onOpenRegisterSchool={() => setShowRegisterSchool(true)}
      />

      {/* Modals */}
      <CertificateModal
        credential={inspectCertificate}
        onClose={() => setInspectCertificate(null)}
        onVerifyNow={(verId) => {
          setInspectCertificate(null);
          handleNavigateVerify(verId);
        }}
      />

      <RegisterSchoolModal
        isOpen={showRegisterSchool}
        onClose={() => setShowRegisterSchool(false)}
        onRegister={state.registerTenant}
      />

      <RegisterCompanyModal
        isOpen={showRegisterCompany}
        onClose={() => setShowRegisterCompany(false)}
        onRegister={state.registerCompany}
      />

      {/* Distinct User Portal Modal (Login & Sign Up) */}
      <UserAuthModal
        isOpen={showUserAuthModal}
        onClose={() => setShowUserAuthModal(false)}
        onLogin={handleUserLogin}
        onRegister={handleUserRegister}
        tenants={state.tenants}
        companies={state.companies}
      />
    </div>
  );
};
