import React, { useState } from 'react';
import { Tenant, User, AuditLog, Company, Credential, PlatformPermission } from '../../types';
import {
  ShieldCheck,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Database,
  Lock,
  Server,
  FileCheck2,
  RefreshCw,
  Users,
  UserPlus,
  Sliders,
  Trash2,
  Crown,
  ShieldAlert,
  Search,
  Eye,
  SlidersHorizontal,
  Key,
  Award,
  BookOpen,
} from 'lucide-react';

export const PLATFORM_PERMISSIONS: { id: PlatformPermission; label: string; desc: string; icon: string }[] = [
  {
    id: 'approve_tenants',
    label: 'Approve & Vet Institutions',
    desc: 'Can evaluate CAC and regulatory accreditation filings, and activate institutional issuers.',
    icon: '🏛️',
  },
  {
    id: 'suspend_tenants',
    label: 'Suspend & Enforce Compliance',
    desc: 'Can freeze non-compliant institutions and suspend credential issuance privileges.',
    icon: '🛡️',
  },
  {
    id: 'manage_platform_admins',
    label: 'Platform Admin Governance',
    desc: 'Can onboard new platform administrators, configure access limits, and manage platform roles.',
    icon: '👑',
  },
  {
    id: 'view_global_audit',
    label: 'Global Audit Trail & Forensics',
    desc: 'Can inspect immutable cross-tenant security audit events, SHA-256 hashes, and forensic trails.',
    icon: '📜',
  },
  {
    id: 'security_governance',
    label: 'Zero-Trust Diagnostics & Security',
    desc: 'Can monitor row-level isolation status, system health, and trigger diagnostic security tests.',
    icon: '⚡',
  },
  {
    id: 'manage_registry',
    label: 'National Credential Registry',
    desc: 'Can inspect national registry statistics, corporate verifier nodes, and revocation records.',
    icon: '🌐',
  },
];

interface Props {
  currentUser: User;
  tenants: Tenant[];
  companies: Company[];
  allCredentials: Credential[];
  auditLogs: AuditLog[];
  platformAdmins: User[];
  allUsers: User[];
  onApproveTenant: (tenantId: string) => void;
  onRejectTenant: (tenantId: string) => void;
  onSuspendTenant: (tenantId: string) => void;
  onRegisterPlatformAdmin: (data: {
    name: string;
    email: string;
    designation?: string;
    department?: string;
    permissions?: string[];
  }) => { success: boolean; user?: User; message?: string };
  onUpdatePlatformAdminPermissions: (
    userId: string,
    permissions: string[],
    designation?: string
  ) => { success: boolean; message?: string };
  onDeletePlatformAdmin: (userId: string) => { success: boolean; message?: string };
  onTogglePlatformAdminStatus: (userId: string) => { success: boolean; message?: string };
}

export const AdminDashboard: React.FC<Props> = ({
  currentUser,
  tenants,
  companies,
  allCredentials,
  auditLogs,
  platformAdmins,
  allUsers,
  onApproveTenant,
  onRejectTenant,
  onSuspendTenant,
  onRegisterPlatformAdmin,
  onUpdatePlatformAdminPermissions,
  onDeletePlatformAdmin,
  onTogglePlatformAdminStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'institutions' | 'admins' | 'audit' | 'health'>('applications');

  // Platform Admin Management state
  const [adminSearch, setAdminSearch] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerDesignation, setRegisterDesignation] = useState('');
  const [registerDept, setRegisterDept] = useState('');
  const [registerPermissions, setRegisterPermissions] = useState<PlatformPermission[]>([
    'view_global_audit',
    'security_governance',
    'manage_registry',
  ]);
  const [registerFeedback, setRegisterFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Edit Platform Admin Permissions
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editDesignation, setEditDesignation] = useState('');
  const [editFeedback, setEditFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Delete Platform Admin
  const [adminToDelete, setAdminToDelete] = useState<User | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Inspect Tenant Admin Roster
  const [inspectingTenantAdmins, setInspectingTenantAdmins] = useState<Tenant | null>(null);

  const pendingTenants = tenants.filter((t) => t.status === 'pending');
  const activeTenants = tenants.filter((t) => t.status !== 'pending');
  const isSuperAdmin = currentUser.is_super_admin === true || currentUser.id === 'user-admin';

  // Toggle register permission
  const handleToggleRegisterPermission = (permId: PlatformPermission) => {
    setRegisterPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  // Toggle edit permission
  const handleToggleEditPermission = (permId: string) => {
    setEditPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  // Register admin submit
  const handleRegisterPlatformAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterFeedback(null);
    const res = onRegisterPlatformAdmin({
      name: registerName,
      email: registerEmail,
      designation: registerDesignation,
      department: registerDept,
      permissions: registerPermissions,
    });
    if (res.success) {
      setRegisterFeedback({ text: `Successfully registered platform administrator ${registerName}.` });
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPermissions(['view_global_audit', 'security_governance', 'manage_registry']);
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegisterFeedback(null);
      }, 1200);
    } else {
      setRegisterFeedback({ text: res.message || 'Registration failed.', isError: true });
    }
  };

  // Open edit modal
  const handleOpenEditModal = (admin: User) => {
    setEditingAdmin(admin);
    setEditPermissions(admin.permissions || PLATFORM_PERMISSIONS.map((p) => p.id));
    setEditDesignation(admin.designation || 'Platform Governance Officer');
    setEditFeedback(null);
  };

  // Save edited permissions
  const handleSaveEditedPermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    const res = onUpdatePlatformAdminPermissions(editingAdmin.id, editPermissions, editDesignation);
    if (res.success) {
      setEditFeedback({ text: `Access permissions and limits updated for ${editingAdmin.name}.` });
      setTimeout(() => {
        setEditingAdmin(null);
        setEditFeedback(null);
      }, 900);
    } else {
      setEditFeedback({ text: res.message || 'Failed to update admin permissions.', isError: true });
    }
  };

  // Confirm delete admin
  const handleConfirmDeleteAdmin = () => {
    if (!adminToDelete) return;
    const res = onDeletePlatformAdmin(adminToDelete.id);
    if (res.success) {
      setDeleteFeedback({ text: `Platform administrator account for ${adminToDelete.name} was permanently removed.` });
      setTimeout(() => {
        setAdminToDelete(null);
        setDeleteFeedback(null);
      }, 900);
    } else {
      setDeleteFeedback({ text: res.message || 'Could not delete administrator account.', isError: true });
    }
  };

  // Filtered platform admins
  const filteredAdmins = platformAdmins.filter((a) => {
    const q = adminSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.designation && a.designation.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-container" style={{ maxWidth: '1320px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Crown size={13} /> {isSuperAdmin ? 'Platform Super Administration' : 'Platform Administration'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                National Trust & Accreditation Authority
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>National Platform Governance</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Logged in as: <strong>{currentUser.name}</strong> ({currentUser.email}) ·{' '}
              <span style={{ color: 'var(--violet)', fontWeight: 700 }}>
                {currentUser.designation || 'Director-General'}
              </span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="badge badge-valid" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
              <Activity size={14} /> Zero-Trust RLS Active
            </span>
          </div>
        </div>

        {/* Global Statistics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-dim)',
          }}
        >
          <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(245, 158, 11, 0.25)' }}>
            <div className="stat-card-label">Pending Applications</div>
            <div className="stat-card-value" style={{ color: 'var(--amber-400)' }}>{pendingTenants.length}</div>
            <div className="stat-card-badge" style={{ color: 'var(--amber-400)' }}>Awaiting Vetting</div>
          </div>
          <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(16, 185, 129, 0.25)' }}>
            <div className="stat-card-label">Accredited Institutions</div>
            <div className="stat-card-value" style={{ color: 'var(--emerald-400)' }}>
              {tenants.filter((t) => t.status === 'active').length}
            </div>
            <div className="stat-card-badge" style={{ color: 'var(--emerald-400)' }}>Active Issuers</div>
          </div>
          <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(139, 92, 246, 0.25)' }}>
            <div className="stat-card-label">Platform Admins</div>
            <div className="stat-card-value" style={{ color: 'var(--violet)' }}>
              {platformAdmins.length}
            </div>
            <div className="stat-card-badge" style={{ color: 'var(--violet)' }}>National Trust Officers</div>
          </div>
          <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(6, 182, 212, 0.25)' }}>
            <div className="stat-card-label">Enterprise Verifiers</div>
            <div className="stat-card-value" style={{ color: 'var(--cyan-400)' }}>{companies.length}</div>
            <div className="stat-card-badge" style={{ color: 'var(--cyan-400)' }}>Corporate Auditing Nodes</div>
          </div>
          <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(37, 99, 235, 0.25)' }}>
            <div className="stat-card-label">Total Issued Credentials</div>
            <div className="stat-card-value">
              {allCredentials.filter((c) => c.status === 'issued').length}
            </div>
            <div className="stat-card-badge">Cryptographically Anchored</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        <button
          className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('applications')}
        >
          Pending Applications ({pendingTenants.length})
        </button>
        <button
          className={`btn ${activeTab === 'institutions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('institutions')}
        >
          Managed Institutions ({activeTenants.length})
        </button>
        <button
          className={`btn ${activeTab === 'admins' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('admins')}
          style={{
            borderColor: activeTab === 'admins' ? undefined : 'rgba(139, 92, 246, 0.4)',
          }}
        >
          👑 Platform Administrators ({platformAdmins.length})
        </button>
        <button
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('audit')}
        >
          Platform Audit Logs ({auditLogs.length})
        </button>
        <button
          className={`btn ${activeTab === 'health' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('health')}
        >
          System Health & Diagnostics
        </button>
      </div>

      {/* TAB 1: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Institutional Onboarding Queue</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Institutions require formal vetting and administrative approval before credential issuance capabilities are enabled.
          </p>

          {pendingTenants.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle size={36} color="var(--accent-emerald)" style={{ margin: '0 auto 12px' }} />
              <p>No pending onboarding applications. All registered institutions have been reviewed.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: '24px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge badge-pending">Pending Review</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Submitted {new Date(tenant.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{tenant.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Type: <strong>{tenant.institution_type.toUpperCase()}</strong> · CAC / Accreditation No:{' '}
                      <strong className="mono">{tenant.registration_number || 'Pending'}</strong>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Location: {tenant.address}, {tenant.state} · Contact: {tenant.email} ({tenant.phone})
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => onApproveTenant(tenant.id)}
                    >
                      <CheckCircle size={14} /> Approve & Grant Issuer Access
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onRejectTenant(tenant.id)}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INSTITUTIONS & ADMIN MONITORING */}
      {activeTab === 'institutions' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Accredited Schools, Churches & Organizations</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Monitor all registered institutions, their appointed Super Admins, and their institutional administrator teams.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Institution Name</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Accreditation No</th>
                  <th style={{ padding: '12px 16px' }}>Primary Super Admin</th>
                  <th style={{ padding: '12px 16px' }}>Admin Team</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Governance</th>
                </tr>
              </thead>
              <tbody>
                {activeTenants.map((t) => {
                  const tenantAdmins = allUsers.filter((u) => u.tenant_id === t.id);
                  const tenantSuperAdmin = tenantAdmins.find((u) => u.is_super_admin) || tenantAdmins[0];
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>
                        <div>{t.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.email}</div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                        <span style={{ textTransform: 'capitalize' }}>
                          {t.institution_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }} className="mono">{t.registration_number}</td>
                      <td style={{ padding: '16px' }}>
                        {tenantSuperAdmin ? (
                          <div>
                            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>👑</span> {tenantSuperAdmin.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {tenantSuperAdmin.email}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span
                          className="badge"
                          style={{
                            background: 'rgba(6, 182, 212, 0.12)',
                            color: 'var(--cyan)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <Users size={12} /> {tenantAdmins.length} Admins & Staff
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className={`badge ${t.status === 'active' ? 'badge-valid' : 'badge-revoked'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setInspectingTenantAdmins(t)}
                            title="Inspect institutional admin roster & permissions"
                            style={{
                              fontSize: '0.75rem',
                              padding: '5px 10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={12} /> Roster
                          </button>
                          <button
                            className={`btn btn-sm ${t.status === 'suspended' ? 'btn-success' : 'btn-danger'}`}
                            onClick={() => onSuspendTenant(t.id)}
                            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                          >
                            {t.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PLATFORM ADMINISTRATORS MANAGEMENT (GOVERNANCE ROSTER) */}
      {activeTab === 'admins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Super Admin Status Banner */}
          <div
            style={{
              padding: '18px 24px',
              borderRadius: '14px',
              background: isSuperAdmin
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.08) 100%)'
                : 'rgba(30, 41, 59, 0.5)',
              border: `1px solid ${isSuperAdmin ? 'rgba(139, 92, 246, 0.45)' : 'var(--border-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                }}
              >
                <Crown size={24} color="var(--violet)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Educore Platform Super Administration
                  </h3>
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      color: 'var(--violet)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                    }}
                  >
                    👑 National Authority
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                  {isSuperAdmin
                    ? 'You have primary administrative governance. You can register new platform administrators, customize or limit their access permissions, and revoke accounts.'
                    : 'You are signed in as an appointed Platform Administrator. Administrative actions are constrained by your assigned governance limits.'}
                </p>
              </div>
            </div>

            {isSuperAdmin && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowRegisterModal(true)}
                id="btn-register-platform-admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                }}
              >
                <UserPlus size={16} /> Register Platform Administrator
              </button>
            )}
          </div>

          {/* Platform Admins Table Panel */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Platform Administrative Roster</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Monitoring {platformAdmins.length} active platform administrators across regulatory compliance, security, and verification.
                </p>
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search
                  size={15}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search administrators..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 16px' }}>Administrator</th>
                    <th style={{ padding: '12px 16px' }}>Designation & Dept</th>
                    <th style={{ padding: '12px 16px' }}>Authority Level</th>
                    <th style={{ padding: '12px 16px' }}>Assigned Platform Permissions</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Super Admin Governance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => {
                    const isSelf = admin.id === currentUser.id;
                    const isFoundingSuper = admin.id === 'user-admin' || admin.is_super_admin;
                    const adminPerms = admin.permissions || (admin.is_super_admin ? PLATFORM_PERMISSIONS.map((p) => p.id) : []);

                    return (
                      <tr key={admin.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{admin.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{admin.email}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            Added {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'System Genesis'}
                          </div>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {admin.designation || 'Platform Governance Officer'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {admin.department || 'National Accreditation & Operations'}
                          </div>
                        </td>

                        <td style={{ padding: '16px' }}>
                          {admin.is_super_admin ? (
                            <span
                              className="badge"
                              style={{
                                background: 'rgba(139, 92, 246, 0.15)',
                                color: 'var(--violet)',
                                border: '1px solid rgba(139, 92, 246, 0.4)',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Crown size={12} /> Platform Super Admin
                            </span>
                          ) : (
                            <span
                              className="badge"
                              style={{
                                background: 'rgba(6, 182, 212, 0.12)',
                                color: 'var(--cyan)',
                                border: '1px solid rgba(6, 182, 212, 0.3)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              🛡️ Governance Officer
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '16px', maxWidth: '320px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {admin.is_super_admin ? (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: 'rgba(139, 92, 246, 0.15)',
                                  color: 'var(--violet)',
                                  fontWeight: 700,
                                  border: '1px solid rgba(139, 92, 246, 0.3)',
                                }}
                              >
                                ⚡ Unrestricted Platform Authority (All {PLATFORM_PERMISSIONS.length} Permissions)
                              </span>
                            ) : (
                              adminPerms.map((pId) => {
                                const pObj = PLATFORM_PERMISSIONS.find((p) => p.id === pId);
                                return (
                                  <span
                                    key={pId}
                                    style={{
                                      fontSize: '0.7rem',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      background: 'var(--bg-card-subtle)',
                                      border: '1px solid var(--border-subtle)',
                                      color: 'var(--text-main)',
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {pObj?.icon} {pObj?.label.split(' ')[0] || pId}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <span
                            className="badge"
                            style={{
                              background: admin.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: admin.status === 'active' ? 'var(--emerald)' : 'var(--rose)',
                              border: `1px solid ${admin.status === 'active' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                            }}
                          >
                            {admin.status === 'active' ? '● Active' : '● Restricted'}
                          </span>
                        </td>

                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          {isSuperAdmin ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {/* Edit Limits Button */}
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenEditModal(admin)}
                                title="Edit permissions and limit access"
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '5px 10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Sliders size={12} color="var(--violet)" />
                                <span>Edit Limits</span>
                              </button>

                              {/* Suspend / Activate Button */}
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={isSelf || isFoundingSuper}
                                onClick={() => onTogglePlatformAdminStatus(admin.id)}
                                title={
                                  isSelf
                                    ? 'Cannot suspend your own active session'
                                    : isFoundingSuper
                                    ? 'Founding Super Admin cannot be suspended'
                                    : 'Suspend / reactivate this account'
                                }
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '5px 10px',
                                  opacity: isSelf || isFoundingSuper ? 0.4 : 1,
                                }}
                              >
                                {admin.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>

                              {/* Delete Admin Button */}
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={isSelf || isFoundingSuper}
                                onClick={() => setAdminToDelete(admin)}
                                title={
                                  isSelf
                                    ? 'Cannot delete your own active session'
                                    : isFoundingSuper
                                    ? 'Cannot delete the Founding Super Admin'
                                    : 'Permanently delete this administrator account'
                                }
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '5px 8px',
                                  color: isSelf || isFoundingSuper ? 'var(--text-muted)' : 'var(--rose)',
                                  borderColor: isSelf || isFoundingSuper ? 'transparent' : 'rgba(239, 68, 68, 0.35)',
                                  opacity: isSelf || isFoundingSuper ? 0.4 : 1,
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Protected
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Central Platform Audit Trail</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Immutable event ledger recording state transitions, approvals, administrative permission updates, and account revocations.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px' }}>Actor</th>
                  <th style={{ padding: '12px 16px' }}>Tenant Context</th>
                  <th style={{ padding: '12px 16px' }}>Action</th>
                  <th style={{ padding: '12px 16px' }}>Audit Evidence</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{log.user_name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--accent-cyan)' }}>{log.tenant_name || 'System'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM HEALTH */}
      {activeTab === 'health' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Platform Diagnostics & SLIs</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Database size={20} style={{ color: 'var(--accent-emerald)' }} />
                <h4 style={{ fontSize: '1rem' }}>PostgreSQL Cluster</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status: <strong>CONNECTED</strong></p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Row-Level Security: <strong>ENFORCED</strong></p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Query P95: <strong>14 ms</strong></p>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Server size={20} style={{ color: 'var(--accent-cyan)' }} />
                <h4 style={{ fontSize: '1rem' }}>Redis Queues & Cache</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Queue Workers: <strong>4 ACTIVE</strong></p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Jobs: <strong>0</strong></p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rate Limiter: <strong>HEALTHY</strong></p>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Lock size={20} style={{ color: 'var(--accent-violet)' }} />
                <h4 style={{ fontSize: '1rem' }}>Disaster Recovery Targets</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target RPO: <strong>&lt; 15 mins (WAL Sync)</strong></p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target RTO: <strong>&lt; 4 hours</strong></p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Availability SLA: <strong>99.9%</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTER PLATFORM ADMINISTRATOR */}
      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)} id="modal-register-platform-admin">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={20} color="var(--violet)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Register Platform Administrator
                </h3>
              </div>
            </div>

            {registerFeedback && (
              <div
                style={{
                  margin: '16px 24px 0',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: registerFeedback.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${registerFeedback.isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                  color: registerFeedback.isError ? 'var(--rose)' : 'var(--emerald)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {registerFeedback.text}
              </div>
            )}

            <form onSubmit={handleRegisterPlatformAdmin}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Engr. Yusuf Danladi"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Administrative Email</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="e.g. yusuf.danladi@educore.gov.ng"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Designation / Role Title</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={registerDesignation}
                      onChange={(e) => setRegisterDesignation(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department / Unit</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={registerDept}
                      onChange={(e) => setRegisterDept(e.target.value)}
                    />
                  </div>
                </div>

                {/* Permissions Checklist */}
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Assigned Platform Governance Permissions ({registerPermissions.length} Active)
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--violet)', fontWeight: 600 }}>
                      Assigned by Super Admin
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '8px',
                      maxHeight: '220px',
                      overflowY: 'auto',
                      padding: '8px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {PLATFORM_PERMISSIONS.map((perm) => {
                      const isChecked = registerPermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '6px',
                            background: isChecked ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                            border: `1px solid ${isChecked ? 'rgba(139, 92, 246, 0.4)' : 'transparent'}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleRegisterPermission(perm.id)}
                            style={{ marginTop: '2px' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: isChecked ? 'var(--violet)' : 'var(--text-main)' }}>
                              {perm.icon} {perm.label}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                              {perm.desc}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(139, 92, 246, 0.08)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: 'var(--violet)' }}>Security Protocol:</strong> Platform administrators can access
                  the governance console via <code>domain.com/admin</code> using their credentials. Their operational actions will
                  be strictly gated by the permissions selected above.
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="btn-submit-platform-admin">
                  Provision Platform Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PLATFORM ADMIN PERMISSIONS & ACCESS LIMITS */}
      {editingAdmin && (
        <div className="modal-overlay" onClick={() => setEditingAdmin(null)} id="modal-edit-platform-admin">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sliders size={20} color="var(--violet)" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Edit Platform Admin Permissions & Limits
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Governing access for: <strong>{editingAdmin.name}</strong> ({editingAdmin.email})
                  </p>
                </div>
              </div>
            </div>

            {editFeedback && (
              <div
                style={{
                  margin: '16px 24px 0',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: editFeedback.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${editFeedback.isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                  color: editFeedback.isError ? 'var(--rose)' : 'var(--emerald)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {editFeedback.text}
              </div>
            )}

            <form onSubmit={handleSaveEditedPermissions}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Designation / Role Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                  />
                </div>

                {/* Assigned Permissions Checklist */}
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Assigned Platform Governance Permissions ({editPermissions.length} of {PLATFORM_PERMISSIONS.length} Enabled)
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--amber)', fontWeight: 600 }}>
                      Takes effect immediately
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '8px',
                      maxHeight: '220px',
                      overflowY: 'auto',
                      padding: '8px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {PLATFORM_PERMISSIONS.map((perm) => {
                      const isChecked = editPermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '6px',
                            background: isChecked ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                            border: `1px solid ${isChecked ? 'rgba(139, 92, 246, 0.4)' : 'transparent'}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleEditPermission(perm.id)}
                            style={{ marginTop: '2px' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: isChecked ? 'var(--violet)' : 'var(--text-main)' }}>
                              {perm.icon} {perm.label}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                              {perm.desc}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: 'var(--amber)' }}>Super Admin Governance:</strong> Limiting or removing permissions
                  will immediately revoke corresponding administrative tabs and action gates in this administrator's session.
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingAdmin(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="btn-save-platform-admin-limits">
                  Update Permissions & Limits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE PLATFORM ADMIN ACCOUNT CONFIRMATION */}
      {adminToDelete && (
        <div className="modal-overlay" onClick={() => setAdminToDelete(null)} id="modal-delete-platform-admin-confirm">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header" style={{ borderColor: 'var(--rose)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={22} color="var(--rose)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--rose)' }}>
                  Revoke & Delete Platform Admin
                </h3>
              </div>
            </div>

            {deleteFeedback && (
              <div
                style={{
                  margin: '16px 24px 0',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: deleteFeedback.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${deleteFeedback.isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                  color: deleteFeedback.isError ? 'var(--rose)' : 'var(--emerald)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {deleteFeedback.text}
              </div>
            )}

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to permanently delete the platform administrator account for:
              </p>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {adminToDelete.name}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  {adminToDelete.email} · {adminToDelete.designation || 'Platform Governance Officer'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--violet)', marginTop: '4px' }}>
                  National Trust Authority Platform Account
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: 'var(--rose)' }}>Irreversible Action:</strong> This account will be immediately
                revoked from the central identity store, all console session tokens will be invalidated, and an immutable
                forensic audit record will be generated.
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setAdminToDelete(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                id="btn-confirm-delete-platform-admin"
                onClick={handleConfirmDeleteAdmin}
              >
                Permanently Delete Administrator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MONITOR REGISTERED INSTITUTION ADMIN ROSTER */}
      {inspectingTenantAdmins && (
        <div className="modal-overlay" onClick={() => setInspectingTenantAdmins(null)} id="modal-inspect-tenant-admins">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building size={20} color="var(--cyan)" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {inspectingTenantAdmins.name} — Registered Administrators
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Monitoring all tenant administrators and permission assignments for CAC/NBTE #{inspectingTenantAdmins.registration_number}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 12px' }}>Name & Email</th>
                      <th style={{ padding: '10px 12px' }}>Role & Title</th>
                      <th style={{ padding: '10px 12px' }}>Super Admin Status</th>
                      <th style={{ padding: '10px 12px' }}>Permissions Assigned</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers
                      .filter((u) => u.tenant_id === inspectingTenantAdmins.id)
                      .map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 600 }}>{u.designation || u.role}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.department}</div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {u.is_super_admin ? (
                              <span
                                className="badge"
                                style={{
                                  background: 'rgba(245, 158, 11, 0.15)',
                                  color: 'var(--amber)',
                                  border: '1px solid rgba(245, 158, 11, 0.4)',
                                  fontWeight: 800,
                                  fontSize: '0.7rem',
                                }}
                              >
                                👑 Super Admin
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Sub-Admin
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '200px' }}>
                              {(u.permissions || []).map((p) => (
                                <span
                                  key={p}
                                  style={{
                                    fontSize: '0.65rem',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-main)',
                                  }}
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              className="badge"
                              style={{
                                background: u.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: u.status === 'active' ? 'var(--emerald)' : 'var(--rose)',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                              }}
                            >
                              {u.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setInspectingTenantAdmins(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
