import React, { useState, useEffect, useMemo } from 'react';
import {
  Tenant,
  User,
  Credential,
  Student,
  Course,
  AttendanceRecord,
  AttendanceCorrection,
  BiometricDevice,
  BiometricIdentityMapping,
  BiometricAttendanceEventPayload,
  AttendanceExportJob,
  AuditLog,
  TenantIsolationViolation,
} from '../../types';
import {
  GraduationCap,
  Award,
  Users,
  BookOpen,
  CalendarCheck,
  PlusCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Search,
  Check,
  Trash2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  UserPlus,
  UserCheck,
  UserX,
  Building,
  Terminal,
  Settings,
  Lock,
  RefreshCw,
  Mail,
  Shield,
  Sliders,
  Key,
  AlertCircle,
  Edit2,
  Crown,
  Fingerprint,
  Cpu,
  Radio,
  Download,
  History,
  FileSpreadsheet,
  Filter,
  ArrowDown,
  Layers,
  Activity,
  BarChart2,
  CheckCircle,
  ExternalLink,
  Eye,
  UserMinus,
} from 'lucide-react';

interface Props {
  activeTenant: Tenant;
  currentUser: User;
  credentials: Credential[];
  students: Student[];
  courses: Course[];
  attendanceRecords: AttendanceRecord[];
  auditLogs: AuditLog[];
  tenantUsers: User[];
  biometricDevices?: BiometricDevice[];
  biometricMappings?: BiometricIdentityMapping[];
  exportJobs?: AttendanceExportJob[];
  onDraftCredential: (data: {
    studentId: string;
    credentialType: Credential['credential_type'];
    title: string;
    description: string;
    gradeOrHonor?: string;
  }) => Credential | null;
  onSubmitForApproval: (credId: string) => void;
  onApproveCredential: (credId: string, comments?: string, bypassTwoPersonCheck?: boolean) => { success: boolean; message?: string } | void;
  onIssueCredential: (credId: string) => Promise<{ success: boolean; hash?: string; verificationId?: string; message?: string } | void> | void;
  onRevokeCredential: (credId: string, reason: string) => void;
  onAddStudent: (data: Omit<Student, 'id' | 'tenant_id' | 'created_at'>) => void;
  onRecordAttendance: (data: any) => void;
  onUpdateAttendanceRecord?: (
    id: string,
    patch: { status: AttendanceRecord['status']; reason: string }
  ) => { success: boolean; error?: string; record?: AttendanceRecord };
  onRequestAttendanceExport?: (filters?: {
    date_from?: string;
    date_to?: string;
    status?: string;
    course_or_batch?: string;
  }) => Promise<{ job_id: string; download_url: string; record_count: number; filename: string; csvContent: string }>;
  onSimulateBiometricEvent?: (payload: BiometricAttendanceEventPayload) => {
    success: boolean;
    status_code: number;
    message: string;
    replayed?: boolean;
    record?: AttendanceRecord;
    pipeline_steps: { step: string; status: 'ok' | 'rejected' | 'deduplicated'; details: string }[];
  };
  onViewCertificate: (cred: Credential) => void;
  onInviteStaffUser: (data: {
    name: string;
    email: string;
    role: User['role'];
    department?: string;
    designation?: string;
    staff_number?: string;
    permissions?: string[];
  }) => { success: boolean; user?: User; message?: string };
  onToggleStaffStatus: (userId: string) => { success: boolean; message?: string };
  onRevokeTenantMembership?: (userId: string) => { success: boolean; message?: string };
  onResendStaffInvitation?: (userId: string) => { success: boolean; token?: string; message?: string };
  onActivateStaffUser?: (userId: string) => { success: boolean; message?: string };
  onSwitchUser?: (userId: string | null) => void;
  allUsers?: User[];
  onUpdateTenantAdminPermissions?: (
    userId: string,
    permissions: string[],
    designation?: string,
    role?: User['role']
  ) => { success: boolean; message?: string };
  onDeleteTenantAdmin?: (userId: string) => { success: boolean; message?: string };
  onUpdateTenantSettings: (updates: Partial<Tenant>) => { success: boolean; message?: string };
  onTestCrossTenantSecurity: () => TenantIsolationViolation;
}

export const TENANT_PERMISSIONS: { id: string; label: string; desc: string; icon: string }[] = [
  { id: 'issue_credentials', label: 'Issue & Cryptographically Seal', desc: 'Can generate SHA-256 canonical hash digests and issue official certificates.', icon: '📜' },
  { id: 'approve_credentials', label: 'Review & Approve Drafts', desc: 'Can evaluate pending certificates and approve them for institutional issuance.', icon: '✍️' },
  { id: 'manage_students', label: 'Manage Student / Member Roster', desc: 'Can register, enroll, update, and manage student, member, or trainee profiles.', icon: '🎓' },
  { id: 'manage_attendance', label: 'Log Attendance & Biometrics', desc: 'Can record class/session attendance and verify biometric clock-ins.', icon: '⏱️' },
  { id: 'manage_courses', label: 'Curriculum & Courses', desc: 'Can create and configure academic courses, modules, or training tracks.', icon: '📚' },
  { id: 'view_audit_logs', label: 'Inspect Audit Logs', desc: 'Can view security access events and cryptographic audit history.', icon: '🔍' },
  { id: 'manage_admins', label: 'Admin Team Governance', desc: 'Can register, edit permissions for, and delete other institutional sub-admins.', icon: '👑' },
  { id: 'manage_settings', label: 'Institution Profile & Settings', desc: 'Can update institution legal details, contact info, and seal preferences.', icon: '⚙️' },
];

export const getDefaultTenantPermissions = (role: User['role']): string[] => {
  switch (role) {
    case 'institution_admin':
      return ['issue_credentials', 'approve_credentials', 'manage_students', 'manage_attendance', 'manage_courses', 'view_audit_logs', 'manage_settings', 'manage_admins'];
    case 'registrar':
      return ['issue_credentials', 'manage_students', 'manage_courses', 'view_audit_logs'];
    case 'credential_approver':
      return ['approve_credentials', 'view_audit_logs'];
    case 'attendance_officer':
      return ['manage_attendance'];
    case 'teacher':
      return ['manage_attendance', 'manage_courses'];
    case 'department_admin':
      return ['manage_students', 'manage_courses', 'manage_attendance', 'view_audit_logs'];
    case 'compliance_officer':
      return ['view_audit_logs'];
    default:
      return ['view_audit_logs'];
  }
};

export const SchoolDashboard: React.FC<Props> = ({
  activeTenant,
  currentUser,
  credentials,
  students,
  courses,
  attendanceRecords,
  auditLogs,
  tenantUsers,
  biometricDevices = [],
  biometricMappings = [],
  exportJobs = [],
  onDraftCredential,
  onSubmitForApproval,
  onApproveCredential,
  onIssueCredential,
  onRevokeCredential,
  onAddStudent,
  onRecordAttendance,
  onUpdateAttendanceRecord,
  onRequestAttendanceExport,
  onSimulateBiometricEvent,
  onViewCertificate,
  onInviteStaffUser,
  onToggleStaffStatus,
  onRevokeTenantMembership,
  onResendStaffInvitation,
  onActivateStaffUser,
  onSwitchUser,
  allUsers = [],
  onUpdateTenantAdminPermissions,
  onDeleteTenantAdmin,
  onUpdateTenantSettings,
  onTestCrossTenantSecurity,
}) => {
  // Identify the institution's primary Super Admin (Account Owner)
  const orgSuperAdminUser = useMemo(() => {
    return (
      tenantUsers.find((u) => u.is_super_admin === true) ||
      tenantUsers.find((u) => u.role === 'institution_admin')
    );
  }, [tenantUsers]);

  // Track if the Super Admin is previewing a delegated sub-admin role
  const [isSimulatedMode, setIsSimulatedMode] = useState<boolean>(false);

  // Active session authorization boundaries
  const isActualSuperAdmin = currentUser.id === orgSuperAdminUser?.id;
  const isOrgSuperAdmin = (currentUser.is_super_admin === true || currentUser.role === 'institution_admin') && !isSimulatedMode;

  const getPermittedTabs = (
    role: User['role'],
    isSuper: boolean
  ): Array<'overview' | 'credentials' | 'students' | 'courses' | 'attendance' | 'staff' | 'settings'> => {
    if (isSuper) {
      return ['overview', 'credentials', 'students', 'courses', 'attendance', 'staff', 'settings'];
    }
    if (role === 'registrar') {
      return ['credentials', 'students', 'courses'];
    }
    if (role === 'credential_approver') {
      return ['credentials'];
    }
    if (role === 'attendance_officer' || role === 'teacher') {
      return ['attendance', 'courses'];
    }
    if (role === 'department_admin') {
      return ['students', 'courses', 'attendance'];
    }
    return ['credentials'];
  };

  const permittedTabs = getPermittedTabs(currentUser.role, isOrgSuperAdmin);
  const [activeTab, setActiveTab] = useState<'overview' | 'credentials' | 'students' | 'courses' | 'attendance' | 'staff' | 'settings'>(
    isOrgSuperAdmin ? 'overview' : permittedTabs[0] || 'credentials'
  );

  // Auto-redirect if activeTab is not permitted for the active user
  useEffect(() => {
    if (!permittedTabs.includes(activeTab)) {
      setActiveTab(permittedTabs[0] || 'credentials');
    }
  }, [currentUser.id, currentUser.role, isOrgSuperAdmin]);

  // Check if active user has full institutional attendance oversight or is scoped to specific classes
  const isFullAttendanceOverseer = isOrgSuperAdmin || !currentUser.assigned_classes || currentUser.assigned_classes.length === 0;

  // Filter attendance records to assigned classes for delegated attendance officers and teachers
  const scopedAttendanceRecords = useMemo(() => {
    if (isFullAttendanceOverseer) return attendanceRecords;
    return attendanceRecords.filter((rec) => {
      const recCourse = (rec.course_or_batch || '').toLowerCase();
      return currentUser.assigned_classes!.some((cls) => {
        const clsNorm = cls.toLowerCase();
        return recCourse.includes(clsNorm) || clsNorm.includes(recCourse);
      });
    });
  }, [attendanceRecords, isFullAttendanceOverseer, currentUser.assigned_classes]);

  // Tab switching access guard
  const handleTabClick = (targetTab: 'overview' | 'credentials' | 'students' | 'courses' | 'attendance' | 'staff' | 'settings') => {
    if (!permittedTabs.includes(targetTab)) {
      setPolicyViolationModal({
        action: `Access to ${targetTab.toUpperCase()} Workspace`,
        requiredPermission:
          targetTab === 'staff'
            ? 'manage_admins'
            : targetTab === 'overview'
            ? 'executive_oversight'
            : targetTab === 'settings'
            ? 'manage_settings'
            : `manage_${targetTab}`,
        endpoint: `/api/v1/institution/${targetTab}`,
        policy: 'App\\Policies\\AdminIsolationPolicy::sequestration: Sub-administrators are strictly sequestered to their assigned role workspace. Cross-dashboard viewing of other administrators or executive governance is prohibited.',
        role: currentUser.role,
      });
      return;
    }
    setActiveTab(targetTab);
  };

  // Backend Policy Enforcement Interceptor State (403 Forbidden Simulation)
  const [policyViolationModal, setPolicyViolationModal] = useState<{
    action: string;
    requiredPermission: string;
    endpoint: string;
    policy: string;
    role: string;
  } | null>(null);

  const enforcePolicy = (requiredPerm: string, endpoint: string, policy: string, actionName: string): boolean => {
    const hasPerm = isOrgSuperAdmin || (currentUser.permissions && currentUser.permissions.includes(requiredPerm));
    if (!hasPerm) {
      setPolicyViolationModal({
        action: actionName,
        requiredPermission: requiredPerm,
        endpoint,
        policy,
        role: currentUser.role,
      });
      return false;
    }
    return true;
  };

  // Lifecycle Timeline Modal State (GET /api/v1/credentials/{id}/events)
  const [inspectingTimelineCred, setInspectingTimelineCred] = useState<Credential | null>(null);
  const [showJsonEventsModal, setShowJsonEventsModal] = useState(false);

  // Staff & Access Governance State
  const [staffStatusFilter, setStaffStatusFilter] = useState<'all' | 'active' | 'invited' | 'suspended' | 'revoked'>('all');
  const [revokingMembershipUser, setRevokingMembershipUser] = useState<User | null>(null);
  const [tokenNotice, setTokenNotice] = useState<{ userId: string; name: string; token: string; email: string } | null>(null);

  // Modals state
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState<Credential | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  // Staff & Admin Registration State
  const [showInviteStaffModal, setShowInviteStaffModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<User['role']>('registrar');
  const [inviteDept, setInviteDept] = useState('');
  const [inviteDesignation, setInviteDesignation] = useState('');
  const [inviteStaffNo, setInviteStaffNo] = useState('');
  const [invitePermissions, setInvitePermissions] = useState<string[]>(getDefaultTenantPermissions('registrar'));
  const [inviteFeedback, setInviteFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Admin Access Limits & Permissions Editing State
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editDesignation, setEditDesignation] = useState('');
  const [editRole, setEditRole] = useState<User['role']>('registrar');
  const [editFeedback, setEditFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Admin Deletion State
  const [adminToDelete, setAdminToDelete] = useState<User | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Step 2 Review & Authorization State (Two-Person Policy)
  const [reviewingCred, setReviewingCred] = useState<Credential | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [approvalFeedback, setApprovalFeedback] = useState<{ text: string; isError?: boolean } | null>(null);
  const [issuingCredId, setIssuingCredId] = useState<string | null>(null);
  const [issuanceSuccessNotice, setIssuanceSuccessNotice] = useState<{ text: string; hash?: string; verId?: string } | null>(null);

  // Dynamic terminology
  const isChurch = activeTenant.tenant_type === 'organization' && (activeTenant.institution_type === 'faith_based' || activeTenant.institution_type === 'church');
  const isOrg = activeTenant.tenant_type === 'organization' && !isChurch;
  const entityLabel = isChurch ? 'Church / Ministry' : isOrg ? 'Professional Organization' : 'Academic Institution';
  const membersLabel = isChurch ? 'Ordinands & Members' : isOrg ? 'Professional Members' : 'Students & Alumni';

  // Super Admin & Permission checks
  const canIssue = isOrgSuperAdmin || currentUser.permissions?.includes('issue_credentials');
  const canApprove = isOrgSuperAdmin || currentUser.permissions?.includes('approve_credentials');
  const canManageStudents = isOrgSuperAdmin || currentUser.permissions?.includes('manage_students');
  const canManageAttendance = isOrgSuperAdmin || currentUser.permissions?.includes('manage_attendance');
  const canManageCourses = isOrgSuperAdmin || currentUser.permissions?.includes('manage_courses');
  const canManageAdmins = isOrgSuperAdmin || currentUser.permissions?.includes('manage_admins');
  const canManageSettings = isOrgSuperAdmin || currentUser.permissions?.includes('manage_settings');

  // Staff search & filters
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('all');

  // Security Live Test state
  const [securityViolation, setSecurityViolation] = useState<TenantIsolationViolation | null>(null);
  const [isTestingSecurity, setIsTestingSecurity] = useState(false);

  // Settings form state
  const [instName, setInstName] = useState(activeTenant.name);
  const [instEmail, setInstEmail] = useState(activeTenant.email);
  const [instPhone, setInstPhone] = useState(activeTenant.phone);
  const [instAddress, setInstAddress] = useState(activeTenant.address);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Synchronize settings state when switching between different institutional tenants
  useEffect(() => {
    setInstName(activeTenant.name);
    setInstEmail(activeTenant.email);
    setInstPhone(activeTenant.phone);
    setInstAddress(activeTenant.address);
    setSecurityViolation(null);
  }, [activeTenant.id]);

  // Draft form state
  const [draftStudentId, setDraftStudentId] = useState(students[0]?.id || '');
  const [draftType, setDraftType] = useState<Credential['credential_type']>('Diploma');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [draftHonors, setDraftHonors] = useState('');

  // Student form state
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newProg, setNewProg] = useState('');

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    onDraftCredential({
      studentId: draftStudentId || students[0]?.id || '',
      credentialType: draftType,
      title: draftTitle,
      description: draftDesc,
      gradeOrHonor: draftHonors,
    });
    setShowDraftModal(false);
  };

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStudent({
      first_name: newFirst,
      last_name: newLast,
      student_number: newNumber || `APX/${Math.floor(1000 + Math.random() * 9000)}`,
      email: newEmail,
      date_of_birth: '2002-05-10',
      gender: 'Male',
      programme: newProg,
      status: 'active',
    });
    setShowStudentModal(false);
    setNewFirst('');
    setNewLast('');
    setNewNumber('');
    setNewEmail('');
  };

  // Attendance sub-tabs & form state (Phase 1 & Phase 2)
  const [attendanceSubTab, setAttendanceSubTab] = useState<'manual' | 'biometric' | 'exports'>('manual');
  const [attPersonId, setAttPersonId] = useState(students[0]?.id || 'student-emmanuel');
  const [attName, setAttName] = useState(students[0] ? `${students[0].first_name} ${students[0].last_name}` : 'Emmanuel Okafor');
  const [attPersonType, setAttPersonType] = useState<'student' | 'trainee' | 'member'>('student');
  const [attCourseOrBatch, setAttCourseOrBatch] = useState(
    courses[0] ? `${courses[0].code} - ${courses[0].name}` : 'CSC 401 - Advanced Distributed Computing'
  );
  const [attStatus, setAttStatus] = useState<AttendanceRecord['status']>('present');
  const [attDate, setAttDate] = useState('2026-10-15');
  const [attSearchQuery, setAttSearchQuery] = useState('');
  const [attStatusFilter, setAttStatusFilter] = useState('all');

  // Audited Correction State (PATCH /api/v1/attendance/{id})
  const [selectedRecordForCorrection, setSelectedRecordForCorrection] = useState<AttendanceRecord | null>(null);
  const [correctionNewStatus, setCorrectionNewStatus] = useState<AttendanceRecord['status']>('present');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [correctionFeedback, setCorrectionFeedback] = useState<string | null>(null);

  // Background Reporting & Export Queue State (GET /api/v1/reports/attendance)
  const [attExportLoading, setAttExportLoading] = useState(false);
  const [attExportSuccessMsg, setAttExportSuccessMsg] = useState<string | null>(null);

  // Phase 2 Hardware Biometric Terminal Simulation State
  const [simDeviceId, setSimDeviceId] = useState(biometricDevices[0]?.device_id || 'DEV-APX-BIO-01');
  const [simMappingRef, setSimMappingRef] = useState(biometricMappings[0]?.device_person_reference || 'DEV-USER-88192');
  const [simCustomEventId, setSimCustomEventId] = useState(`evt-live-${Math.floor(1000 + Math.random() * 9000)}`);
  const [simDeviceTimestamp, setSimDeviceTimestamp] = useState(new Date().toISOString());
  const [simIsRunning, setSimIsRunning] = useState(false);
  const [simResult, setSimResult] = useState<{
    success: boolean;
    status_code: number;
    message: string;
    replayed?: boolean;
    record?: AttendanceRecord;
    pipeline_steps: { step: string; status: 'ok' | 'rejected' | 'deduplicated'; details: string }[];
  } | null>(null);

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordAttendance({
      person_id: attPersonId,
      person_name: attName,
      person_type: attPersonType,
      course_or_batch: attCourseOrBatch,
      attendance_date: attDate,
      date: attDate,
      status: attStatus,
      source: 'manual',
      recorded_by: currentUser.name,
      recorded_by_id: currentUser.id,
      corrections: [],
    });
    setShowAttendanceModal(false);
  };

  const handleOpenCorrectionModal = (rec: AttendanceRecord) => {
    setSelectedRecordForCorrection(rec);
    setCorrectionNewStatus(rec.status);
    setCorrectionReason('');
    setCorrectionError(null);
    setCorrectionFeedback(null);
  };

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForCorrection) return;
    if (!correctionReason.trim() || correctionReason.trim().length < 5) {
      setCorrectionError('A mandatory reason (minimum 5 characters) is required to document the audit trail.');
      return;
    }
    if (onUpdateAttendanceRecord) {
      const res = onUpdateAttendanceRecord(selectedRecordForCorrection.id, {
        status: correctionNewStatus,
        reason: correctionReason.trim(),
      });
      if (res.success) {
        setCorrectionFeedback(`Successfully committed audited correction PATCH /api/v1/attendance/${selectedRecordForCorrection.id}.`);
        setTimeout(() => {
          setSelectedRecordForCorrection(null);
          setCorrectionFeedback(null);
        }, 1200);
      } else {
        setCorrectionError(res.error || 'Failed to update record.');
      }
    }
  };

  const handleTriggerExport = async () => {
    if (!onRequestAttendanceExport) return;
    setAttExportLoading(true);
    setAttExportSuccessMsg(null);
    try {
      const res = await onRequestAttendanceExport({
        status: attStatusFilter !== 'all' ? attStatusFilter : undefined,
      });
      setAttExportSuccessMsg(`Queued & Completed GenerateAttendanceReportJob (${res.job_id}) · ${res.record_count} records.`);
      
      // Automatic client-side CSV file download
      const blob = new Blob([res.csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', res.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
    } finally {
      setAttExportLoading(false);
    }
  };

  const handleRunBiometricSimulation = (isReplay = false) => {
    if (!onSimulateBiometricEvent) return;
    setSimIsRunning(true);
    const eventIdToUse = isReplay ? simCustomEventId : `evt-live-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!isReplay) {
      setSimCustomEventId(eventIdToUse);
    }

    const payload: BiometricAttendanceEventPayload = {
      device_id: simDeviceId,
      event_id: eventIdToUse,
      device_person_reference: simMappingRef,
      device_timestamp: simDeviceTimestamp,
      signature: `ed25519_${Math.random().toString(36).substring(2)}${Date.now()}`,
    };

    setTimeout(() => {
      const res = onSimulateBiometricEvent(payload);
      setSimResult(res);
      setSimIsRunning(false);
    }, 450);
  };

  const handleConfirmRevoke = () => {
    if (showRevokeModal && revokeReason.trim()) {
      onRevokeCredential(showRevokeModal.id, revokeReason.trim());
      setShowRevokeModal(null);
      setRevokeReason('');
    }
  };

  const handleOpenReviewModal = (cred: Credential) => {
    setReviewingCred(cred);
    setApprovalComments('');
    setApprovalFeedback(null);
  };

  const handleExecuteApproval = (bypassTwoPerson: boolean = false) => {
    if (!reviewingCred) return;
    const res = onApproveCredential(reviewingCred.id, approvalComments, bypassTwoPerson);
    if (res && !res.success) {
      setApprovalFeedback({ text: res.message || 'Authorization failed.', isError: true });
    } else {
      setApprovalFeedback({ text: `Formal authorization completed for ${reviewingCred.title}. Approved for cryptographic issuance.` });
      setTimeout(() => {
        setReviewingCred(null);
        setApprovalFeedback(null);
      }, 1000);
    }
  };

  const handleExecuteIssue = async (credId: string) => {
    setIssuingCredId(credId);
    setIssuanceSuccessNotice(null);
    const res: any = await onIssueCredential(credId);
    setIssuingCredId(null);
    if (res && res.success) {
      setIssuanceSuccessNotice({
        text: 'Atomic Database Transaction Executed: Canonical JSON ordered deterministically, SHA-256 fingerprint generated, and document dispatched to private object storage with signed URL access.',
        hash: res.hash,
        verId: res.verificationId,
      });
      setTimeout(() => {
        setIssuanceSuccessNotice(null);
      }, 8000);
    }
  };

  const handleToggleInvitePermission = (permId: string) => {
    setInvitePermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleToggleEditPermission = (permId: string) => {
    setEditPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteFeedback(null);
    const res = onInviteStaffUser({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      department: inviteDept,
      designation: inviteDesignation,
      staff_number: inviteStaffNo,
      permissions: invitePermissions,
    });
    if (res.success) {
      setInviteFeedback({ text: `Successfully registered ${inviteName} with ${invitePermissions.length} active permissions.` });
      setInviteName('');
      setInviteEmail('');
      setInviteStaffNo('');
      setInvitePermissions(getDefaultTenantPermissions('registrar'));
      setTimeout(() => {
        setShowInviteStaffModal(false);
        setInviteFeedback(null);
      }, 1200);
    } else {
      setInviteFeedback({ text: res.message || 'Registration failed.', isError: true });
    }
  };

  const handleOpenEditModal = (admin: User) => {
    setEditingAdmin(admin);
    setEditPermissions(admin.permissions || getDefaultTenantPermissions(admin.role));
    setEditDesignation(admin.designation || '');
    setEditRole(admin.role);
    setEditFeedback(null);
  };

  const handleSaveEditedPermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin || !onUpdateTenantAdminPermissions) return;
    const res = onUpdateTenantAdminPermissions(editingAdmin.id, editPermissions, editDesignation, editRole);
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

  const handleConfirmDeleteAdmin = () => {
    if (!adminToDelete || !onDeleteTenantAdmin) return;
    const res = onDeleteTenantAdmin(adminToDelete.id);
    if (res.success) {
      setDeleteFeedback({ text: `Administrator account for ${adminToDelete.name} was permanently removed.` });
      setTimeout(() => {
        setAdminToDelete(null);
        setDeleteFeedback(null);
      }, 900);
    } else {
      setDeleteFeedback({ text: res.message || 'Could not delete administrator account.', isError: true });
    }
  };

  const handleToggleStatus = (userId: string) => {
    onToggleStaffStatus(userId);
  };

  const handleRunSecurityTest = () => {
    setIsTestingSecurity(true);
    setTimeout(() => {
      const res = onTestCrossTenantSecurity();
      setSecurityViolation(res);
      setIsTestingSecurity(false);
    }, 600);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTenantSettings({
      name: instName,
      email: instEmail,
      phone: instPhone,
      address: instAddress,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  return (
    <div className="page-container" style={{ maxWidth: '1360px' }}>
      {/* Role-Scoped Workspace Identification & Zero-Trust Access Header */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          border: isSimulatedMode
            ? '1px solid var(--amber)'
            : !isOrgSuperAdmin
            ? '1px solid rgba(239, 68, 68, 0.4)'
            : '1px solid rgba(6, 182, 212, 0.4)',
          background: isSimulatedMode
            ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.95))'
            : !isOrgSuperAdmin
            ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.12), rgba(15, 23, 42, 0.95))'
            : 'linear-gradient(90deg, rgba(6, 182, 212, 0.12), rgba(15, 23, 42, 0.9))',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              background: isSimulatedMode
                ? 'rgba(245, 158, 11, 0.2)'
                : !isOrgSuperAdmin
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(6, 182, 212, 0.2)',
              color: isSimulatedMode
                ? 'var(--amber)'
                : !isOrgSuperAdmin
                ? 'var(--rose-400)'
                : 'var(--cyan)',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: '6px',
              border: isSimulatedMode
                ? '1px solid rgba(245, 158, 11, 0.4)'
                : !isOrgSuperAdmin
                ? '1px solid rgba(239, 68, 68, 0.4)'
                : '1px solid rgba(6, 182, 212, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {isSimulatedMode ? (
              <>
                <Eye size={13} /> SIMULATED WORKSPACE PREVIEW
              </>
            ) : !isOrgSuperAdmin ? (
              <>
                <Lock size={13} /> ISOLATED ROLE WORKSPACE
              </>
            ) : (
              <>
                <ShieldCheck size={13} /> EXECUTIVE SUPER ADMIN GOVERNANCE
              </>
            )}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
            Active Account: <strong style={{ color: '#fff' }}>{currentUser.name}</strong> (<code>{currentUser.role}</code>)
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Hydrated via <code className="mono">GET /api/v1/me</code> ({currentUser.permissions?.length || 0} permissions) · Tenant: <code className="mono">{activeTenant.id}</code>
          </span>
        </div>

        {/* Access Control & Simulation Interface */}
        {isActualSuperAdmin && !isSimulatedMode ? (
          // ONLY the true Super Admin can access the role preview tool
          onSwitchUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                🛡️ Preview Delegated Workspaces (Super Admin Only):
              </span>
              {tenantUsers
                .filter((u) => u.id !== orgSuperAdminUser?.id && u.status === 'active')
                .slice(0, 4)
                .map((u) => {
                  const roleTitle =
                    u.role === 'registrar'
                      ? '📜 Registrar'
                      : u.role === 'credential_approver'
                      ? '✍️ Approver'
                      : u.role === 'attendance_officer'
                      ? '⏱️ Attendance Officer'
                      : u.role === 'teacher'
                      ? '👨‍🏫 Teacher'
                      : u.name;

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setIsSimulatedMode(true);
                        onSwitchUser(u.id);
                      }}
                      className="btn btn-sm"
                      style={{
                        fontSize: '0.72rem',
                        padding: '4px 10px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title={`Preview how ${u.name} (${u.role}) views their isolated workspace`}
                    >
                      {roleTitle}
                    </button>
                  );
                })}
            </div>
          )
        ) : isSimulatedMode ? (
          // Super Admin currently previewing a sub-admin view
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--amber-300)', fontWeight: 600 }}>
              ⚠️ Previewing as {currentUser.name}. Sub-admins cannot switch dashboards.
            </span>
            {onSwitchUser && orgSuperAdminUser && (
              <button
                type="button"
                onClick={() => {
                  setIsSimulatedMode(false);
                  onSwitchUser(orgSuperAdminUser.id);
                }}
                className="btn btn-sm"
                style={{
                  fontSize: '0.72rem',
                  padding: '4px 12px',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(37, 99, 235, 0.35))',
                  color: '#ffffff',
                  fontWeight: 800,
                  border: '1px solid var(--cyan)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                ↩ Exit Preview & Return to Super Admin
              </button>
            )}
          </div>
        ) : (
          // Sub-Admin in their own session: NO SWITCHING BUTTONS! STRICT ZERO-TRUST LOCK!
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--rose-400)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Cross-admin dashboard access is blocked under zero-trust governance"
            >
              <Lock size={12} /> ZERO-TRUST RESTRICTION ACTIVE
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Dashboards of other administrators are restricted.
            </span>
          </div>
        )}
      </div>

      {/* Institution Executive Banner */}
      <div className="glass-panel" style={{ padding: '32px 36px', marginBottom: '32px', borderColor: 'var(--border-accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-valid">Accredited Institution</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                NBTE/NUC Accreditation: <strong className="mono" style={{ color: '#fff' }}>{activeTenant.registration_number}</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
              {activeTenant.name}
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginTop: '6px' }}>
              {activeTenant.address}, {activeTenant.state} · Active Isolation Context: <span className="mono" style={{ color: 'var(--cyan-400)', fontWeight: 700 }}>{activeTenant.id}</span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Action for Attendance Officers / Teachers */}
            {(currentUser.role === 'attendance_officer' || currentUser.role === 'teacher') && (
              <button
                id="school-btn-record-attendance"
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                onClick={() => {
                  if (!enforcePolicy('manage_attendance', 'POST /api/v1/attendance', 'App\\Policies\\AttendancePolicy::record', 'Log Class Attendance')) return;
                  setShowAttendanceModal(true);
                }}
              >
                <CalendarCheck size={18} /> Record Class Attendance
              </button>
            )}

            {/* Action for Registrars & Super Admins: Draft New Credential */}
            {(isOrgSuperAdmin || currentUser.role === 'registrar' || canIssue) && (
              <button
                id="school-btn-draft-credential"
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                onClick={() => {
                  if (!enforcePolicy('issue_credentials', 'POST /api/v1/credentials', 'App\\Policies\\CredentialPolicy::draft', 'Draft New Credential')) return;
                  setShowDraftModal(true);
                }}
              >
                <PlusCircle size={18} /> Draft New Credential
              </button>
            )}

            {/* Action for Registrars & Super Admins: Enroll Student */}
            {(isOrgSuperAdmin || currentUser.role === 'registrar' || canManageStudents) && (
              <button
                id="school-btn-enroll-student"
                className="btn btn-secondary"
                style={{ padding: '12px 22px' }}
                onClick={() => {
                  if (!enforcePolicy('manage_students', 'POST /api/v1/students', 'App\\Policies\\StudentPolicy::create', 'Enroll Student')) return;
                  setShowStudentModal(true);
                }}
              >
                <Users size={18} color="var(--cyan-400)" /> Enroll Student
              </button>
            )}

            {/* Action for Credential Approvers: Direct link to Review Queue */}
            {currentUser.role === 'credential_approver' && (
              <button
                id="school-btn-review-queue"
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                onClick={() => {
                  if (!enforcePolicy('approve_credentials', 'GET /api/v1/credentials?status=pending_approval', 'App\\Policies\\CredentialPolicy::reviewQueue', 'Access Board Review Queue')) return;
                  setActiveTab('credentials');
                }}
              >
                <CheckCircle2 size={18} /> Inspect Pending Review Queue
              </button>
            )}
          </div>
        </div>

        {/* Role-Customized Executive Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginTop: '32px',
          paddingTop: '28px',
          borderTop: '1px solid var(--border-dim)',
        }}>
          {currentUser.role === 'attendance_officer' || currentUser.role === 'teacher' ? (
            <>
              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(6, 182, 212, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Assigned Cohorts / Classes</div>
                  <CalendarCheck size={20} color="var(--cyan)" />
                </div>
                <div className="stat-card-value">{currentUser.assigned_classes?.length || 1}</div>
                <div className="stat-card-badge" style={{ color: 'var(--cyan)' }}>
                  <Lock size={12} /> {currentUser.assigned_classes?.join(', ') || 'General Roll'}
                </div>
              </div>

              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(56, 189, 248, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Scoped Attendance Records</div>
                  <Users size={20} color="var(--blue-400)" />
                </div>
                <div className="stat-card-value">{scopedAttendanceRecords.length}</div>
                <div className="stat-card-badge">Assigned Class Roster</div>
              </div>

              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(16, 185, 129, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Present / Verified</div>
                  <CheckCircle2 size={20} color="var(--emerald-400)" />
                </div>
                <div className="stat-card-value" style={{ color: 'var(--emerald-400)' }}>
                  {scopedAttendanceRecords.filter((r) => r.status === 'present').length}
                </div>
                <div className="stat-card-badge" style={{ color: 'var(--emerald-400)' }}>
                  Active Attendance Rate
                </div>
              </div>

              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(245, 158, 11, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Audited Corrections</div>
                  <History size={20} color="var(--amber-400)" />
                </div>
                <div className="stat-card-value" style={{ color: 'var(--amber-400)' }}>
                  {scopedAttendanceRecords.filter((r) => (r.corrections || []).length > 0).length}
                </div>
                <div className="stat-card-badge" style={{ color: 'var(--amber-400)' }}>
                  Audited Audit Log (PATCH)
                </div>
              </div>
            </>
          ) : currentUser.role === 'credential_approver' ? (
            <>
              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(245, 158, 11, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Pending Board Review</div>
                  <Clock size={20} color="var(--amber-400)" />
                </div>
                <div className="stat-card-value" style={{ color: 'var(--amber-400)' }}>
                  {credentials.filter((c) => c.status === 'pending_approval').length}
                </div>
                <div className="stat-card-badge" style={{ color: 'var(--amber-400)' }}>
                  Action Required
                </div>
              </div>

              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(16, 185, 129, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Approved for Issuance</div>
                  <CheckCircle size={20} color="var(--emerald-400)" />
                </div>
                <div className="stat-card-value" style={{ color: 'var(--emerald-400)' }}>
                  {credentials.filter((c) => c.status === 'approved').length}
                </div>
                <div className="stat-card-badge" style={{ color: 'var(--emerald-400)' }}>
                  Ready to Issue
                </div>
              </div>

              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(56, 189, 248, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Total Issued Awards</div>
                  <Award size={20} color="var(--blue-400)" />
                </div>
                <div className="stat-card-value">{credentials.filter((c) => c.status === 'issued').length}</div>
                <div className="stat-card-badge">SHA-256 Anchored</div>
              </div>

              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(139, 92, 246, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Governance Protocol</div>
                  <ShieldCheck size={20} color="var(--violet)" />
                </div>
                <div className="stat-card-value" style={{ color: 'var(--violet)', fontSize: '1.25rem', marginTop: '6px' }}>
                  Two-Person Rule
                </div>
                <div className="stat-card-badge" style={{ color: 'var(--violet)' }}>
                  Independent Sign-off
                </div>
              </div>
            </>
          ) : currentUser.role === 'registrar' ? (
            <>
              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(56, 189, 248, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Enrolled Students</div>
                  <Users size={20} color="var(--blue-400)" />
                </div>
                <div className="stat-card-value">{students.length}</div>
                <div className="stat-card-badge">
                  <TrendingUp size={12} /> Active Cohort
                </div>
              </div>

              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(6, 182, 212, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Draft Records</div>
                  <FileText size={20} color="var(--cyan)" />
                </div>
                <div className="stat-card-value" style={{ color: 'var(--cyan)' }}>
                  {credentials.filter((c) => c.status === 'draft').length}
                </div>
                <div className="stat-card-badge" style={{ color: 'var(--cyan)' }}>
                  In Preparation
                </div>
              </div>

              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(245, 158, 11, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Submitted for Review</div>
                  <Clock size={20} color="var(--amber-400)" />
                </div>
                <div className="stat-card-value" style={{ color: 'var(--amber-400)' }}>
                  {credentials.filter((c) => c.status === 'pending_approval').length}
                </div>
                <div className="stat-card-badge" style={{ color: 'var(--amber-400)' }}>
                  Board Queue
                </div>
              </div>

              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(16, 185, 129, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Academic Programmes</div>
                  <BookOpen size={20} color="var(--emerald-400)" />
                </div>
                <div className="stat-card-value" style={{ color: 'var(--emerald-400)' }}>
                  {courses.length}
                </div>
                <div className="stat-card-badge" style={{ color: 'var(--emerald-400)' }}>
                  Active Curriculum
                </div>
              </div>
            </>
          ) : (
            // Super Admin default full view
            <>
              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(56, 189, 248, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Enrolled Students</div>
                  <Users size={20} color="var(--blue-400)" />
                </div>
                <div className="stat-card-value">{students.length}</div>
                <div className="stat-card-badge">
                  <TrendingUp size={12} /> Active Cohort
                </div>
              </div>

              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(16, 185, 129, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Issued Credentials</div>
                  <Award size={20} color="var(--emerald-400)" />
                </div>
                <div className="stat-card-value" style={{ color: 'var(--emerald-400)' }}>
                  {credentials.filter((c) => c.status === 'issued').length}
                </div>
                <div className="stat-card-badge" style={{ color: 'var(--emerald-400)' }}>
                  SHA-256 Stamped
                </div>
              </div>

              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(245, 158, 11, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Pending Approval</div>
                  <Clock size={20} color="var(--amber-400)" />
                </div>
                <div className="stat-card-value" style={{ color: 'var(--amber-400)' }}>
                  {credentials.filter((c) => c.status === 'pending_approval' || c.status === 'draft').length}
                </div>
                <div className="stat-card-badge" style={{ color: 'var(--amber-400)' }}>
                  Board Review Queue
                </div>
              </div>

              <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(244, 63, 94, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-label">Active Staff & Roles</div>
                  <ShieldCheck size={20} color="var(--cyan)" />
                </div>
                <div className="stat-card-value" style={{ color: 'var(--cyan)' }}>
                  {tenantUsers.filter((u) => u.status === 'active').length}
                </div>
                <div className="stat-card-badge" style={{ color: 'var(--cyan)' }}>
                  Delegated Admins
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Role-Filtered Tabs Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', borderBottom: '1px solid var(--border-dim)', paddingBottom: '14px', flexWrap: 'wrap' }}>
        {permittedTabs.includes('overview') && (
          <button
            id="tab-overview"
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleTabClick('overview')}
            style={{
              background: activeTab === 'overview' ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(37, 99, 235, 0.35))' : undefined,
              border: activeTab === 'overview' ? '1px solid var(--cyan)' : undefined,
              color: activeTab === 'overview' ? 'var(--cyan)' : undefined,
              fontWeight: 700,
            }}
          >
            <Crown size={16} /> Centralized Overview & Metrics
          </button>
        )}

        {permittedTabs.includes('credentials') && (
          <button
            id="tab-credentials"
            className={`btn ${activeTab === 'credentials' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleTabClick('credentials')}
          >
            <Award size={16} /> Credential Lifecycle ({credentials.length})
          </button>
        )}

        {permittedTabs.includes('students') && (
          <button
            id="tab-students"
            className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleTabClick('students')}
          >
            <GraduationCap size={16} /> Student Roster ({students.length})
          </button>
        )}

        {permittedTabs.includes('courses') && (
          <button
            id="tab-courses"
            className={`btn ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleTabClick('courses')}
          >
            <BookOpen size={16} /> Courses & Curriculum ({courses.length})
          </button>
        )}

        {permittedTabs.includes('attendance') && (
          <button
            id="tab-attendance"
            className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleTabClick('attendance')}
          >
            <CalendarCheck size={16} /> Attendance Workspace ({isFullAttendanceOverseer ? attendanceRecords.length : scopedAttendanceRecords.length})
          </button>
        )}

        {permittedTabs.includes('staff') && (
          <button
            id="tab-staff"
            className={`btn ${activeTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleTabClick('staff')}
            style={{
              background: activeTab === 'staff' ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(37, 99, 235, 0.35))' : undefined,
              border: activeTab === 'staff' ? '1px solid var(--cyan)' : undefined,
              color: activeTab === 'staff' ? 'var(--cyan)' : undefined,
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={16} /> Staff & Access Governance ({tenantUsers.length})
          </button>
        )}

        {permittedTabs.includes('settings') && (
          <button
            id="tab-settings"
            className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleTabClick('settings')}
          >
            <Building size={16} /> Governance & Policy
          </button>
        )}
      </div>

      {/* TAB 0: CENTRALIZED OVERVIEW & OPERATIONAL METRICS (SUPER ADMIN GOVERNANCE) */}
      {activeTab === 'overview' && permittedTabs.includes('overview') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Executive Governance Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '28px 32px',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.85) 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ maxWidth: '820px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span
                    style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: 'var(--amber)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '100px',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Crown size={13} /> SUPER ADMIN CENTRALIZED GOVERNANCE
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Real-Time Operational Monitoring · Attribution Engine Active
                  </span>
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Institution Operational Dashboard & Delegated Oversight
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  As Super Admin (Owner/Admin) of <strong>{activeTenant.name}</strong>, you retain end-to-end operational visibility.
                  Monitor live tasks across delegated registrars, attendance officers, and credential approvers, verify daily attendance
                  completion rates, and inspect the immutable audit trail for full accountability.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('staff')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  <ShieldCheck size={15} color="var(--cyan)" /> Manage Staff Roles
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab('credentials')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  <Award size={15} /> Review Credentials Queue
                </button>
              </div>
            </div>
          </div>

          {/* Section A: Task Progression & Credential Lifecycle Breakdown */}
          {(() => {
            const draftCount = credentials.filter((c) => c.status === 'draft').length;
            const pendingCount = credentials.filter((c) => c.status === 'pending_approval').length;
            const issuedCount = credentials.filter((c) => c.status === 'issued').length;
            const revokedCount = credentials.filter((c) => c.status === 'revoked').length;
            const total = credentials.length || 1;

            const draftPct = Math.round((draftCount / total) * 100);
            const pendingPct = Math.round((pendingCount / total) * 100);
            const issuedPct = Math.round((issuedCount / total) * 100);
            const revokedPct = Math.round((revokedCount / total) * 100);

            return (
              <div className="glass-panel" style={{ padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      Institutional Credential Task Progression
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Real-time breakdown of credential awards currently transitioning through the cryptographic lifecycle.
                    </p>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Total Managed Credentials: <strong style={{ color: '#fff' }}>{credentials.length}</strong>
                  </div>
                </div>

                {/* Segmented Progress Bar */}
                <div
                  style={{
                    display: 'flex',
                    height: '24px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.05)',
                    marginBottom: '20px',
                    border: '1px solid var(--border-dim)',
                  }}
                >
                  {issuedCount > 0 && (
                    <div
                      style={{
                        width: `${issuedPct}%`,
                        background: 'linear-gradient(90deg, #059669, #10b981)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#fff',
                        transition: 'width 0.4s ease',
                      }}
                      title={`Issued & Sealed: ${issuedCount} (${issuedPct}%)`}
                    >
                      {issuedPct >= 10 ? `${issuedPct}%` : ''}
                    </div>
                  )}
                  {pendingCount > 0 && (
                    <div
                      style={{
                        width: `${pendingPct}%`,
                        background: 'linear-gradient(90deg, #d97706, #f59e0b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#000',
                        transition: 'width 0.4s ease',
                      }}
                      title={`Pending Approval: ${pendingCount} (${pendingPct}%)`}
                    >
                      {pendingPct >= 10 ? `${pendingPct}%` : ''}
                    </div>
                  )}
                  {draftCount > 0 && (
                    <div
                      style={{
                        width: `${draftPct}%`,
                        background: 'linear-gradient(90deg, #2563eb, #38bdf8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#fff',
                        transition: 'width 0.4s ease',
                      }}
                      title={`Draft Records: ${draftCount} (${draftPct}%)`}
                    >
                      {draftPct >= 10 ? `${draftPct}%` : ''}
                    </div>
                  )}
                  {revokedCount > 0 && (
                    <div
                      style={{
                        width: `${revokedPct}%`,
                        background: 'linear-gradient(90deg, #dc2626, #f43f5e)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#fff',
                        transition: 'width 0.4s ease',
                      }}
                      title={`Revoked: ${revokedCount} (${revokedPct}%)`}
                    >
                      {revokedPct >= 10 ? `${revokedPct}%` : ''}
                    </div>
                  )}
                </div>

                {/* Legend Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                        Issued & Sealed
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginTop: '2px' }}>
                        {issuedCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({issuedPct}%)</span>
                      </div>
                    </div>
                    <Award size={24} color="var(--emerald-400)" />
                  </div>

                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                    onClick={() => setActiveTab('credentials')}
                    title="Click to review pending credentials"
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--amber-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                        Pending Approval
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginTop: '2px' }}>
                        {pendingCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({pendingPct}%)</span>
                      </div>
                    </div>
                    <Clock size={24} color="var(--amber-400)" />
                  </div>

                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: '10px',
                      background: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cyan-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                        Draft Records
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginTop: '2px' }}>
                        {draftCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({draftPct}%)</span>
                      </div>
                    </div>
                    <FileText size={24} color="var(--cyan-400)" />
                  </div>

                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: '10px',
                      background: 'rgba(244, 63, 94, 0.08)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--rose-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                        Revoked Awards
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginTop: '2px' }}>
                        {revokedCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({revokedPct}%)</span>
                      </div>
                    </div>
                    <ShieldAlert size={24} color="var(--rose-400)" />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Section B: Daily Attendance Completion Rates Across Departments / Classes */}
          <div className="glass-panel" style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarCheck size={20} color="var(--cyan)" />
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Daily Attendance Completion Rates Across Departments & Classes
                  </h4>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Monitored real-time roll completion across academic divisions, training cohorts, and assigned officers.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--emerald)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: '100px',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                  }}
                >
                  ● Institutional Average: 92.8% Completed
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('attendance')}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Eye size={14} /> Open Attendance Portal
                </button>
              </div>
            </div>

            {/* Department Attendance Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {/* Department 1 */}
              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                      Computer Science & Engineering
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Cohort HND II · Officer: Adebayo Olawale
                    </div>
                  </div>
                  <span className="badge badge-valid" style={{ fontSize: '0.68rem' }}>96.0%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>Present: <strong>48</strong> / 50</span>
                  <span>Absent: <strong>2</strong></span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '96%', height: '100%', background: 'linear-gradient(90deg, var(--cyan), var(--emerald))' }} />
                </div>
              </div>

              {/* Department 2 */}
              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                      Software Engineering & Web Systems
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Cohort ND I · Officer: David Adeleke
                    </div>
                  </div>
                  <span className="badge badge-valid" style={{ fontSize: '0.68rem' }}>92.0%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>Present: <strong>46</strong> / 50</span>
                  <span>Absent: <strong>4</strong></span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }} />
                </div>
              </div>

              {/* Department 3 */}
              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                      Electrical & Electronic Engineering
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Batch A Lab Session · Officer: Kemi Adeleke
                    </div>
                  </div>
                  <span className="badge badge-pending" style={{ fontSize: '0.68rem' }}>88.0%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>Present: <strong>44</strong> / 50</span>
                  <span>Absent: <strong>6</strong></span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #eab308)' }} />
                </div>
              </div>

              {/* Department 4 */}
              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                      Mechanical Engineering Technology
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Workshop Class II · Officer: David Adeleke
                    </div>
                  </div>
                  <span className="badge badge-valid" style={{ fontSize: '0.68rem' }}>95.0%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>Present: <strong>38</strong> / 40</span>
                  <span>Absent: <strong>2</strong></span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '95%', height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Attributed Audit Trail & Traceable Credential Events Feed */}
          <div className="glass-panel" style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={20} color="var(--cyan)" />
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Attributed Staff Activity & Governance Audit Trail
                  </h4>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Every significant action taken by a delegated admin is automatically recorded with actor user_id, role, action type, target resource, and exact timestamp.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span
                  style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    color: 'var(--cyan)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                  }}
                >
                  audit_logs ({auditLogs.length} entries)
                </span>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor (Staff Member)</th>
                    <th>Assigned Role</th>
                    <th>Action Type</th>
                    <th>Target Resource / Details</th>
                    <th style={{ textAlign: 'right' }}>Lifecycle Trace</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice(0, 8).map((log) => {
                    const matchedCred = credentials.find((c) => c.id === log.target_id || log.details?.includes(c.recipient_name));
                    return (
                      <tr key={log.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <div className="mono">{log.timestamp.split('T')[1]?.substring(0, 8) || log.timestamp}</div>
                          <div style={{ fontSize: '0.7rem' }}>{log.timestamp.split('T')[0]}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>
                            {log.actor_name || log.user_name || 'System Operator'}
                          </div>
                          <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ID: {log.user_id || log.id}
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background:
                                log.user_role === 'institution_admin'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : log.user_role === 'registrar'
                                  ? 'rgba(6, 182, 212, 0.15)'
                                  : log.user_role === 'credential_approver'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : 'rgba(99, 102, 241, 0.15)',
                              color:
                                log.user_role === 'institution_admin'
                                  ? 'var(--amber)'
                                  : log.user_role === 'registrar'
                                  ? 'var(--cyan)'
                                  : log.user_role === 'credential_approver'
                                  ? 'var(--emerald)'
                                  : 'var(--primary-light)',
                              border: '1px solid currentColor',
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 700,
                            }}
                          >
                            {log.user_role || 'Staff Officer'}
                          </span>
                        </td>
                        <td>
                          <code
                            className="mono"
                            style={{
                              fontSize: '0.78rem',
                              color:
                                log.action.includes('issue')
                                  ? 'var(--emerald)'
                                  : log.action.includes('approve')
                                  ? 'var(--cyan)'
                                  : log.action.includes('revoke')
                                  ? 'var(--rose)'
                                  : '#e2e8f0',
                              fontWeight: 700,
                            }}
                          >
                            {log.action}
                          </code>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                          {log.details || `Resource: ${log.target_id || log.target_type}`}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {matchedCred ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setInspectingTimelineCred(matchedCred)}
                              style={{ fontSize: '0.72rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              title="Inspect full event timeline (GET /api/v1/credentials/{id}/events)"
                            >
                              <History size={12} color="var(--cyan)" /> Trace Events
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Audit Logged</span>
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

      {/* TAB 1: CREDENTIAL LIFECYCLE */}
      {activeTab === 'credentials' && permittedTabs.includes('credentials') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Role-Specific Isolation Banner for Credential Approvers */}
          {currentUser.role === 'credential_approver' && (
            <div
              style={{
                padding: '14px 20px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <ShieldCheck size={20} color="var(--violet)" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>
                  Independent Credential Approver Workspace · Zero-Trust Sequestration
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  You are evaluating credentials submitted for formal review. In adherence to Two-Person Integrity, credential drafting and access to other administrators' dashboards (Attendance, Staff Governance, System Settings) are strictly restricted.
                </div>
              </div>
            </div>
          )}

          {/* Role-Specific Isolation Banner for Registrars */}
          {currentUser.role === 'registrar' && (
            <div
              style={{
                padding: '14px 20px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <FileText size={20} color="var(--cyan)" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>
                  Academic Registry Division · Credential Drafting & Submission
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  You are authorized to draft award records and submit them for review. Under institutional two-person separation of duties, final approval is reserved for independent approvers. Attendance and executive administration dashboards are restricted.
                </div>
              </div>
            </div>
          )}
          {/* Detailed Step-by-Step Credential Verification Lifecycle Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '24px 28px',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="var(--cyan)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Authoritative Credential Verification Lifecycle
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Cryptographic 5-step pipeline: Draft Submission → Two-Person Authorization → Canonical Hashing & State Lock → Document Generation → External Verification.
                </p>
              </div>

              {canIssue && (
                <button
                  id="btn-draft-new-credential"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowDraftModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  <PlusCircle size={15} /> Finalize New Draft Record
                </button>
              )}
            </div>

            {/* Pipeline Step Visual Flow */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step 1 · Submission
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Draft Finalization
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <code>POST /submit</code> · Field Freezing
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step 2 · Authorization
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Two-Person Review
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <code>POST /approve</code> · Distinct Approver
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step 3 · Issuance
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  SHA-256 State Lock
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <code>POST /issue</code> · Atomic Immutability
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step 4 · Document Vault
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Async PDF & Signed URL
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <code>GenerateDocJob</code> · QR & Barcode
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step 5 · Verification
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Universal Lookup
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <code>POST /verify</code> · Privacy Masked
                </div>
              </div>
            </div>
          </div>

          {/* Atomic Issuance Success Notice */}
          {issuanceSuccessNotice && (
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.45)',
                color: 'var(--emerald)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                  {issuanceSuccessNotice.text}
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-primary)' }}>
                  Verification ID: <strong>{issuanceSuccessNotice.verId}</strong> · SHA-256 Digest:{' '}
                  <code className="mono" style={{ color: 'var(--cyan)' }}>
                    {issuanceSuccessNotice.hash?.substring(0, 24)}...
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Credentials Roster Table */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  Institutional Credential Roster ({credentials.length})
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  All records are cryptographically verified against the institution's canonical ledger.
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 14px' }}>Recipient & ID</th>
                    <th style={{ padding: '12px 14px' }}>Award Metadata</th>
                    <th style={{ padding: '12px 14px' }}>Verification ID</th>
                    <th style={{ padding: '12px 14px' }}>Lifecycle Stage & Status</th>
                    <th style={{ padding: '12px 14px' }}>Cryptographic Proof</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Lifecycle Action</th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.map((cred) => {
                    const initials = cred.recipient_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase();

                    const isCreator = cred.issuer_user_id === currentUser.id;

                    return (
                      <tr key={cred.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.4), rgba(6, 182, 212, 0.3))',
                                border: '1px solid rgba(56, 189, 248, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                color: '#ffffff',
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                                {cred.recipient_name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {cred.recipient_type} · No: {cred.credential_number}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                            {cred.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--cyan)', fontWeight: 600 }}>
                            {cred.credential_type} {cred.grade_or_honor ? `· ${cred.grade_or_honor}` : ''}
                          </div>
                        </td>

                        <td style={{ padding: '14px' }}>
                          <span className="mono" style={{ fontSize: '0.88rem', color: 'var(--cyan)', fontWeight: 700 }}>
                            {cred.verification_id}
                          </span>
                        </td>

                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span
                              className={`badge ${
                                cred.status === 'issued'
                                  ? 'badge-valid'
                                  : cred.status === 'pending_approval'
                                  ? 'badge-pending'
                                  : cred.status === 'approved'
                                  ? 'badge-valid'
                                  : cred.status === 'revoked'
                                  ? 'badge-revoked'
                                  : 'badge-draft'
                              }`}
                              style={{ fontSize: '0.75rem', width: 'fit-content' }}
                            >
                              {cred.status === 'pending_approval'
                                ? '● Pending Authorization'
                                : cred.status === 'issued'
                                ? '🔒 Permanently Issued & Sealed'
                                : cred.status === 'approved'
                                ? '✍️ Authorized (Ready to Issue)'
                                : cred.status === 'revoked'
                                ? '⛔ Revoked'
                                : '📝 Draft in Progress'}
                            </span>

                            {cred.status === 'pending_approval' && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--amber)', fontWeight: 600 }}>
                                🔒 Field Freezing Active (Locked)
                              </span>
                            )}
                            {cred.status === 'approved' && cred.approved_by && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--emerald)' }}>
                                Approved by: {cred.approved_by}
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '14px', maxWidth: '220px' }}>
                          {cred.status === 'issued' && cred.credential_hash ? (
                            <div>
                              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--emerald)', wordBreak: 'break-all' }}>
                                {cred.credential_hash.substring(0, 20)}...
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                SHA-256 Canonical Digest
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Computed upon atomic issuance
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {/* Inspect Credential Lifecycle Events (GET /api/v1/credentials/{id}/events) */}
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setInspectingTimelineCred(cred)}
                              title="Inspect full credential lifecycle events timeline (GET /api/v1/credentials/{id}/events)"
                              style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            >
                              <History size={13} color="var(--cyan)" /> Timeline
                            </button>

                            {/* Step 1 Submit for Approval */}
                            {cred.status === 'draft' && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  if (!enforcePolicy('issue_credentials', 'POST /api/v1/credentials/{id}/submit', 'App\\Policies\\CredentialPolicy::submit', 'Submit Credential for Review')) return;
                                  onSubmitForApproval(cred.id);
                                }}
                                title="Submit draft for verification review (POST /api/v1/credentials/{id}/submit)"
                                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                              >
                                Submit for Review
                              </button>
                            )}

                            {/* Step 2 Review & Authorize (Two-Person Policy) */}
                            {cred.status === 'pending_approval' && (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => {
                                  if (!enforcePolicy('approve_credentials', 'POST /api/v1/credentials/{id}/approve', 'App\\Policies\\CredentialPolicy::approve', 'Authorize Credential Submission')) return;
                                  handleOpenReviewModal(cred);
                                }}
                                title="Conduct verification review and authorize (POST /api/v1/credentials/{id}/approve)"
                                style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              >
                                <Check size={13} /> Review & Authorize
                              </button>
                            )}

                            {/* Step 3 Formal Issuance & State Lock */}
                            {cred.status === 'approved' && (
                              <button
                                className="btn btn-cyan btn-sm"
                                disabled={issuingCredId === cred.id}
                                onClick={() => {
                                  if (!enforcePolicy('issue_credentials', 'POST /api/v1/credentials/{id}/issue', 'App\\Policies\\CredentialPolicy::issue', 'Execute State Lock & Canonical Issuance')) return;
                                  handleExecuteIssue(cred.id);
                                }}
                                title="Execute atomic issuance transaction (POST /api/v1/credentials/{id}/issue)"
                                style={{ fontSize: '0.75rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              >
                                {issuingCredId === cred.id ? (
                                  <>
                                    <RefreshCw size={13} className="animate-spin" /> Hashing...
                                  </>
                                ) : (
                                  <>
                                    <Lock size={13} /> Issue & Lock
                                  </>
                                )}
                              </button>
                            )}

                            {/* Step 4 View Sealed Document (Temporary Signed URL) */}
                            {cred.status === 'issued' && (
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => onViewCertificate(cred)}
                                title="Inspect signed certificate document"
                                style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              >
                                <FileText size={13} /> Inspect PDF
                              </button>
                            )}

                            {/* Revoke Workflow */}
                            {cred.status === 'issued' && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  if (!enforcePolicy('issue_credentials', 'POST /api/v1/credentials/{id}/revoke', 'App\\Policies\\CredentialPolicy::revoke', 'Revoke Issued Credential')) return;
                                  setShowRevokeModal(cred);
                                }}
                                title="Revoke credential with mandatory audited reason"
                                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                              >
                                <Trash2 size={13} /> Revoke
                              </button>
                            )}
                          </div>
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

      {/* TAB 2: STUDENTS */}
      {activeTab === 'students' && permittedTabs.includes('students') && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Enrolled Student Roster ({students.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowStudentModal(true)}>
              <PlusCircle size={15} /> Enroll New Student
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Official Email</th>
                  <th>Programme</th>
                  <th>Enrollment Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="mono" style={{ color: 'var(--cyan-400)', fontWeight: 700 }}>
                      {student.student_number}
                    </td>
                    <td style={{ fontWeight: 700, color: '#ffffff' }}>
                      {student.first_name} {student.last_name}
                    </td>
                    <td style={{ color: 'var(--text-sub)' }}>{student.email}</td>
                    <td style={{ fontWeight: 600 }}>{student.programme}</td>
                    <td>
                      <span className={`badge ${student.status === 'active' ? 'badge-valid' : student.status === 'graduated' ? 'badge-pending' : 'badge-revoked'}`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COURSES */}
      {activeTab === 'courses' && permittedTabs.includes('courses') && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px' }}>Accredited Curriculum & Courses</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
            {courses.map((course) => (
              <div key={course.id} style={{
                background: 'rgba(17, 28, 53, 0.7)',
                padding: '24px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-card)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="mono" style={{ color: 'var(--cyan-400)', fontWeight: 800, fontSize: '1.05rem' }}>
                    {course.code}
                  </span>
                  <span className="badge badge-valid">
                    {course.credits} Credits
                  </span>
                </div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{course.name}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>{course.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ATTENDANCE & BIOMETRIC GATEWAY (PHASE 1 MVP & PHASE 2 HARDWARE) */}
      {activeTab === 'attendance' && permittedTabs.includes('attendance') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Header Executive Panel */}
          <div
            className="glass-panel"
            style={{
              padding: '28px 32px',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.9) 100%)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span className="badge badge-valid" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-400)', borderColor: 'var(--emerald-500)' }}>
                    Dual-Phase Architecture
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Phase 1 (Manual & Audits) · Phase 2 (Biometric Terminal Integration)
                  </span>
                </div>
                <h3 style={{ fontSize: '1.7rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  Attendance & Biometric Operations
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-sub)', maxWidth: '780px', lineHeight: 1.6, marginTop: '6px' }}>
                  EDUCORE implements role-based manual logging with immutable audit trails in MVP Release 1, transitioning to zero-trust hardware fingerprint terminal event ingestion in Release 2.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleTriggerExport}
                  disabled={attExportLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={15} />
                  {attExportLoading ? 'Dispatching Job...' : 'Export Attendance (CSV)'}
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAttendanceModal(true)}
                  disabled={!canManageAttendance}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  title={!canManageAttendance ? 'Requires manage_attendance or institution admin role' : undefined}
                >
                  <CalendarCheck size={15} /> Record Manual Attendance
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
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
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-dim)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Attendance Records
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                  {scopedAttendanceRecords.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cyan-400)', marginTop: '2px' }}>
                  Manual: {scopedAttendanceRecords.filter((r) => r.source === 'manual').length} · Biometric: {scopedAttendanceRecords.filter((r) => r.source === 'biometric_device').length}
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-dim)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Present / Verified
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald-400)', marginTop: '4px' }}>
                  {scopedAttendanceRecords.filter((r) => r.status === 'present').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', marginTop: '2px' }}>
                  Active attendance rate {scopedAttendanceRecords.length > 0 ? Math.round((scopedAttendanceRecords.filter((r) => r.status === 'present').length / scopedAttendanceRecords.length) * 100) : 0}%
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-dim)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Audited Corrections
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--amber-400)', marginTop: '4px' }}>
                  {scopedAttendanceRecords.filter((r) => (r.corrections || []).length > 0).length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  PATCH /api/v1/attendance/{'{id}'} audit trail
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-dim)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Biometric Terminals
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cyan-400)', marginTop: '4px' }}>
                  {biometricDevices.length} Active
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cyan-400)', marginTop: '2px' }}>
                  Anchored to {activeTenant.name.slice(0, 20)}...
                </div>
              </div>
            </div>

            {/* Sub-Tabs Selector */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${attendanceSubTab === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAttendanceSubTab('manual')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FileText size={15} />
                <span>Phase 1: Manual Roll & Audits</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', fontSize: '0.7rem' }}>
                  {scopedAttendanceRecords.length}
                </span>
              </button>

              <button
                className={`btn btn-sm ${attendanceSubTab === 'biometric' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAttendanceSubTab('biometric')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Fingerprint size={15} />
                <span>Phase 2: Biometric Fingerprint Integration</span>
                <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.3)', color: 'var(--cyan-300)', fontSize: '0.7rem' }}>
                  Hardware Live
                </span>
              </button>

              <button
                className={`btn btn-sm ${attendanceSubTab === 'exports' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAttendanceSubTab('exports')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Download size={15} />
                <span>Background Export Queue</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', fontSize: '0.7rem' }}>
                  {exportJobs.length}
                </span>
              </button>
            </div>
          </div>

          {/* Export feedback message banner */}
          {attExportSuccessMsg && (
            <div
              className="glass-panel"
              style={{
                padding: '14px 20px',
                border: '1px solid var(--emerald-500)',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="var(--emerald-400)" />
                <span style={{ fontSize: '0.9rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
                  {attExportSuccessMsg}
                </span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setAttExportSuccessMsg(null)}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* SUB-TAB 1: PHASE 1 MANUAL ATTENDANCE & AUDITING */}
          {attendanceSubTab === 'manual' && (
            <div className="glass-panel" style={{ padding: '28px 32px' }}>
              {/* Architecture Overview Banner */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid var(--border-dim)',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <ShieldCheck size={18} color="var(--cyan-400)" />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                    Phase 1 MVP Attendance Specification
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>Role-Based Recording:</strong> Teachers and attendance officers log within their assigned classes/batches. Admins & registrars retain full audit oversight.
                  </div>
                  <div>
                    <strong style={{ color: '#fff' }}>Supported Entities:</strong> Accommodates formal students (schools), trainees, or organizational members.
                  </div>
                  <div>
                    <strong style={{ color: '#fff' }}>Audited Corrections:</strong> Submitted via <code className="mono" style={{ color: 'var(--cyan-400)' }}>PATCH /api/v1/attendance/{'{id}'}</code>, tracking user ID, reason, and original value.
                  </div>
                  <div>
                    <strong style={{ color: '#fff' }}>Reporting & Exports:</strong> Summaries filtered via <code className="mono" style={{ color: 'var(--cyan-400)' }}>GET /api/v1/reports/attendance</code> with background worker queues.
                  </div>
                </div>
              </div>

              {/* Assigned Cohort Isolation Banner for Scoped Instructors & Attendance Officers */}
              {!isFullAttendanceOverseer && currentUser.assigned_classes && (
                <div
                  style={{
                    padding: '12px 18px',
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Lock size={18} color="var(--cyan-400)" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fff' }}>
                      Assigned Cohort Isolation Active
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Your view is sequestered strictly to your assigned classes: <strong style={{ color: 'var(--cyan-300)' }}>{currentUser.assigned_classes.join(', ')}</strong>. Class rolls and rosters of other instructors are isolated.
                    </div>
                  </div>
                </div>
              )}

              {/* Filter and Search Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search attendee, ID, or course..."
                      className="form-input"
                      value={attSearchQuery}
                      onChange={(e) => setAttSearchQuery(e.target.value)}
                      style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
                    />
                  </div>

                  <select
                    className="form-select"
                    value={attStatusFilter}
                    onChange={(e) => setAttStatusFilter(e.target.value)}
                    style={{ width: 'auto', minWidth: '150px', fontSize: '0.88rem' }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="present">Present Only</option>
                    <option value="absent">Absent Only</option>
                    <option value="late">Late Only</option>
                    <option value="excused">Excused Only</option>
                  </select>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Showing {scopedAttendanceRecords.filter((r) => {
                    if (attStatusFilter !== 'all' && r.status !== attStatusFilter) return false;
                    if (attSearchQuery.trim()) {
                      const q = attSearchQuery.toLowerCase();
                      const matchName = r.person_name.toLowerCase().includes(q);
                      const matchId = (r.person_id || '').toLowerCase().includes(q);
                      const matchCourse = (r.course_or_batch || '').toLowerCase().includes(q);
                      if (!matchName && !matchId && !matchCourse) return false;
                    }
                    return true;
                  }).length} of {scopedAttendanceRecords.length} records
                </div>
              </div>

              {/* Records Table */}
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Attendee & Entity</th>
                      <th>Course / Cohort Batch</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Source & Recorder</th>
                      <th>Audit Trail</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopedAttendanceRecords
                      .filter((rec) => {
                        if (attStatusFilter !== 'all' && rec.status !== attStatusFilter) return false;
                        if (attSearchQuery.trim()) {
                          const q = attSearchQuery.toLowerCase();
                          const matchName = rec.person_name.toLowerCase().includes(q);
                          const matchId = (rec.person_id || '').toLowerCase().includes(q);
                          const matchCourse = (rec.course_or_batch || '').toLowerCase().includes(q);
                          if (!matchName && !matchId && !matchCourse) return false;
                        }
                        return true;
                      })
                      .map((rec) => {
                        const hasCorrections = (rec.corrections || []).length > 0;
                        return (
                          <tr key={rec.id}>
                            <td>
                              <div style={{ fontWeight: 700, color: '#ffffff' }}>{rec.person_name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--cyan-400)' }}>
                                  {rec.person_id || 'ID-Pending'}
                                </span>
                                <span className="badge" style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(255,255,255,0.08)' }}>
                                  {rec.person_type || 'student'}
                                </span>
                              </div>
                            </td>

                            <td style={{ color: 'var(--text-sub)', fontSize: '0.88rem' }}>
                              {rec.course_or_batch || 'General Attendance Session'}
                            </td>

                            <td style={{ color: 'var(--text-sub)', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                              {rec.attendance_date || rec.date}
                            </td>

                            <td>
                              <span
                                className={`badge ${
                                  rec.status === 'present'
                                    ? 'badge-valid'
                                    : rec.status === 'late'
                                    ? 'badge-superseded'
                                    : rec.status === 'excused'
                                    ? 'badge-approved'
                                    : 'badge-revoked'
                                }`}
                                style={{ textTransform: 'capitalize' }}
                              >
                                {rec.status}
                              </span>
                            </td>

                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {rec.source === 'biometric_device' ? (
                                  <>
                                    <Fingerprint size={14} color="var(--cyan-400)" />
                                    <span style={{ fontSize: '0.82rem', color: 'var(--cyan-300)' }}>
                                      Biometric Terminal ({rec.device_id || 'HW-GW'})
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <FileText size={14} color="var(--text-muted)" />
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                                      Manual: {rec.recorded_by || 'Staff'}
                                    </span>
                                  </>
                                )}
                              </div>
                            </td>

                            <td>
                              {hasCorrections ? (
                                <button
                                  className="badge badge-superseded"
                                  onClick={() => handleOpenCorrectionModal(rec)}
                                  style={{ cursor: 'pointer', border: '1px dashed var(--amber-400)' }}
                                  title="View audited modification trail"
                                >
                                  <History size={12} /> {rec.corrections!.length} Audited Correction{rec.corrections!.length > 1 ? 's' : ''}
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  Original Record
                                </span>
                              )}
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenCorrectionModal(rec)}
                                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                              >
                                Correct (PATCH)
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: PHASE 2 BIOMETRIC HARDWARE INTEGRATION */}
          {attendanceSubTab === 'biometric' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Hardware Pipeline Flow Architecture Diagram Card */}
              <div
                className="glass-panel"
                style={{
                  padding: '28px 32px',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Cpu size={20} color="var(--cyan-400)" />
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                      Release 2: Biometric Fingerprint Hardware Architecture Flow
                    </h4>
                  </div>
                  <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--cyan-400)', background: 'rgba(6,182,212,0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                    POST /api/v1/devices/{'{device_id}'}/attendance-events
                  </span>
                </div>

                {/* Pipeline Visual Flow Steps */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                    gap: '14px',
                    margin: '20px 0',
                  }}
                >
                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-dim)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan-400)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                      <Fingerprint size={16} /> Scan at Terminal
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      Student or trainee scans finger on third-party hardware terminal. Terminal matches fingerprint template locally.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-dim)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan-400)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                      <Radio size={16} /> 1. Auth Credentials
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      Backend authenticates hardware API key & cryptographic payload signature. Unknown devices rejected immediately.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-dim)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan-400)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                      <Lock size={16} /> 2. Resolve Tenant Anchor
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      Device is permanently anchored to its registered tenant. A compromised terminal cannot clock in across tenants.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-dim)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan-400)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                      <CheckCircle2 size={16} /> 3. Anti-Replay Check
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      Unique <code className="mono">event_id</code> is checked against <code className="mono">device_events</code>. Network retries acknowledged without duplicates.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-dim)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan-400)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                      <Layers size={16} /> 4. Opaque Mapping & DB
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      Maps opaque device reference to tenant student ID. Writes dual timestamps to DB transaction. Zero raw biometric data stored!
                    </p>
                  </div>
                </div>

                {/* 5 Technical & Security Controls */}
                <div style={{ background: 'rgba(2, 6, 23, 0.5)', borderRadius: '10px', padding: '18px 22px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--cyan-300)', marginBottom: '12px' }}>
                    Key Technical & Security Controls
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                    <div>
                      <strong style={{ color: '#fff' }}>🛡️ Privacy & Template Protection:</strong> Raw biometric templates and fingerprint images are <em>never stored</em> in student records or standard application tables. Matching is isolated on hardware.
                    </div>
                    <div>
                      <strong style={{ color: '#fff' }}>🔗 Identity Mapping Table:</strong> Uses internal <code className="mono">biometric_identity_mappings</code> linking opaque references (<code className="mono">DEV-USER-88192</code>) to tenant-scoped students.
                    </div>
                    <div>
                      <strong style={{ color: '#fff' }}>⏱️ Dual Timestamps:</strong> Captures both <code className="mono">device_timestamp</code> (physical scan time) and server receipt time to accurately support offline sync queues.
                    </div>
                    <div>
                      <strong style={{ color: '#fff' }}>🚫 Event Idempotency & Anti-Replay:</strong> Re-transmitted events during network reconnection are recognized and acknowledged with HTTP 200 without duplicate insertions.
                    </div>
                    <div>
                      <strong style={{ color: '#fff' }}>🏛️ Strict Tenant Boundary:</strong> Devices are hardware-anchored to tenant context. Device payload cannot pick or override tenant ID.
                    </div>
                  </div>
                </div>
              </div>

              {/* Registered Hardware Terminals Grid */}
              <div className="glass-panel" style={{ padding: '28px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                      Registered Hardware Terminals ({biometricDevices.length})
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                      Physically deployed terminals authenticated for {activeTenant.name}.
                    </p>
                  </div>
                  <span className="badge badge-valid">
                    {biometricDevices.filter((d) => d.status === 'online').length} Terminals Online
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {biometricDevices.map((device) => (
                    <div
                      key={device.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid var(--border-dim)',
                        borderRadius: '12px',
                        padding: '20px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <span className="mono" style={{ color: 'var(--cyan-400)', fontWeight: 800, fontSize: '0.95rem' }}>
                            {device.device_id}
                          </span>
                          <h5 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                            {device.name}
                          </h5>
                        </div>
                        <span className="badge badge-valid" style={{ textTransform: 'uppercase', fontSize: '0.68rem' }}>
                          ● {device.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div>
                          <strong>Model:</strong> {device.model}
                        </div>
                        <div>
                          <strong>Location:</strong> {device.location}
                        </div>
                        <div>
                          <strong>Firmware:</strong> <span className="mono">{device.firmware_version}</span>
                        </div>
                        <div>
                          <strong>API Key Fingerprint:</strong> <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{device.api_key_fingerprint}</span>
                        </div>
                        <div>
                          <strong>Heartbeat:</strong> <span style={{ color: 'var(--emerald-400)' }}>{device.last_heartbeat}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opaque Identity Mapping Table */}
              <div className="glass-panel" style={{ padding: '28px 32px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                    Opaque Biometric Identity Mappings (<code className="mono">biometric_identity_mappings</code>)
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                    Privacy-safe table linking hardware device references to tenant student profiles. Zero biometric templates are stored.
                  </p>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Opaque Device Reference</th>
                        <th>Resolved Student / Member</th>
                        <th>Enrolled Feature</th>
                        <th>Enrolled Date</th>
                        <th>Template Protection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {biometricMappings.map((map) => (
                        <tr key={map.id}>
                          <td>
                            <span className="mono" style={{ color: 'var(--cyan-400)', fontWeight: 700 }}>
                              {map.device_person_reference}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{map.person_name}</div>
                            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {map.person_id}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>
                            {map.enrolled_finger}
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {map.enrolled_at.slice(0, 10)}
                          </td>
                          <td>
                            <span className="badge badge-valid" style={{ fontSize: '0.72rem' }}>
                              <Shield size={11} /> Isolated on Terminal
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interactive Hardware Terminal Simulator Console */}
              <div
                className="glass-panel"
                style={{
                  padding: '28px 32px',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(6, 182, 212, 0.05))',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Terminal size={20} color="var(--cyan-400)" />
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                    Live Hardware Terminal Event Simulator & Pipeline Inspector
                  </h4>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)', marginBottom: '22px' }}>
                  Simulate incoming signed HTTPS check-in payloads dispatched by physical fingerprint turnstiles. Inspect the 5-step backend verification pipeline in real time, including anti-replay deduplication and dual timestamp recording.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Select Registered Terminal</label>
                    <select
                      className="form-select"
                      value={simDeviceId}
                      onChange={(e) => setSimDeviceId(e.target.value)}
                    >
                      {biometricDevices.map((d) => (
                        <option key={d.id} value={d.device_id}>
                          {d.device_id} · {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Simulate Fingerprint Scan For</label>
                    <select
                      className="form-select"
                      value={simMappingRef}
                      onChange={(e) => setSimMappingRef(e.target.value)}
                    >
                      {biometricMappings.map((m) => (
                        <option key={m.id} value={m.device_person_reference}>
                          {m.person_name} ({m.device_person_reference})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Event ID (Anti-Replay Key)</label>
                    <input
                      type="text"
                      className="form-input mono"
                      value={simCustomEventId}
                      onChange={(e) => setSimCustomEventId(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Device Timestamp (Offline Clock)</label>
                    <input
                      type="text"
                      className="form-input mono"
                      value={simDeviceTimestamp}
                      onChange={(e) => setSimDeviceTimestamp(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleRunBiometricSimulation(false)}
                    disabled={simIsRunning}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Radio size={16} />
                    {simIsRunning ? 'Processing Pipeline...' : 'Transmit Signed HTTPS Event (POST)'}
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => handleRunBiometricSimulation(true)}
                    disabled={simIsRunning}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'var(--amber-400)', color: 'var(--amber-400)' }}
                  >
                    <RefreshCw size={15} />
                    Test Duplicate Replay (Anti-Replay Verification)
                  </button>
                </div>

                {/* Pipeline Execution Trace Display */}
                {simResult && (
                  <div
                    style={{
                      background: 'rgba(2, 6, 23, 0.85)',
                      border: `1px solid ${simResult.replayed ? 'var(--amber-400)' : simResult.success ? 'var(--emerald-500)' : 'var(--rose-400)'}`,
                      borderRadius: '12px',
                      padding: '20px 24px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {simResult.replayed ? (
                          <AlertTriangle size={20} color="var(--amber-400)" />
                        ) : simResult.success ? (
                          <CheckCircle2 size={20} color="var(--emerald-400)" />
                        ) : (
                          <AlertCircle size={20} color="var(--rose-400)" />
                        )}
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                          HTTP {simResult.status_code} Response: {simResult.message}
                        </span>
                      </div>
                      <span className={`badge ${simResult.replayed ? 'badge-superseded' : simResult.success ? 'badge-valid' : 'badge-revoked'}`}>
                        {simResult.replayed ? 'IDEMPOTENT REPLAY' : simResult.success ? 'TRANSACTION COMMITTED' : 'PIPELINE REJECTED'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                      {simResult.pipeline_steps.map((step, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: step.status === 'ok' ? 'rgba(16, 185, 129, 0.08)' : step.status === 'deduplicated' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                            border: `1px solid ${step.status === 'ok' ? 'rgba(16, 185, 129, 0.25)' : step.status === 'deduplicated' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                          }}
                        >
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, minWidth: '220px', color: '#fff' }}>
                            {step.step}
                          </span>
                          <span style={{ fontSize: '0.82rem', color: step.status === 'ok' ? 'var(--emerald-400)' : step.status === 'deduplicated' ? 'var(--amber-400)' : 'var(--rose-400)' }}>
                            {step.details}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: BACKGROUND EXPORT QUEUE */}
          {attendanceSubTab === 'exports' && (
            <div className="glass-panel" style={{ padding: '28px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                    Background Report Export Jobs (<code className="mono">GET /api/v1/reports/attendance</code>)
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                    Large export requests are queued as background worker jobs (<code className="mono">GenerateAttendanceReportJob</code>) and retrieved via temporary signed links.
                  </p>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleTriggerExport}
                  disabled={attExportLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={15} />
                  {attExportLoading ? 'Dispatching Job...' : 'Queue New Export Job'}
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Job ID & Scope</th>
                      <th>Requested By</th>
                      <th>Records</th>
                      <th>Status</th>
                      <th>Temporary Signed Download URL</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportJobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <div className="mono" style={{ fontWeight: 800, color: 'var(--cyan-400)' }}>
                            {job.id}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                            {job.filter_summary}
                          </div>
                        </td>

                        <td>
                          <div style={{ color: '#fff', fontSize: '0.85rem' }}>{job.requested_by}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {job.requested_at.slice(0, 19).replace('T', ' ')}
                          </div>
                        </td>

                        <td style={{ fontWeight: 700, color: '#fff' }}>
                          {job.record_count} entries
                        </td>

                        <td>
                          <span className="badge badge-valid" style={{ textTransform: 'capitalize' }}>
                            {job.status}
                          </span>
                        </td>

                        <td>
                          <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                            {job.download_url}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--amber-400)', marginTop: '2px' }}>
                            Expires: {job.expires_at?.slice(0, 19).replace('T', ' ')}
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={handleTriggerExport}
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          >
                            <Download size={12} /> Download CSV
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: STAFF & ADMIN ACCESS (MULTI-TENANT ENFORCEMENT) */}

      {/* TAB 5: STAFF & ADMIN ACCESS (MULTI-TENANT ENFORCEMENT) */}
      {activeTab === 'staff' && permittedTabs.includes('staff') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Multi-Tenant Boundary Isolation Card */}
          <div
            className="glass-panel"
            style={{
              padding: '28px 32px',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(15, 23, 42, 0.8))',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '300px',
                height: '100%',
                background: 'radial-gradient(circle at top right, rgba(6, 182, 212, 0.15), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span
                    style={{
                      background: 'rgba(6, 182, 212, 0.2)',
                      color: 'var(--cyan)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '100px',
                      border: '1px solid rgba(6, 182, 212, 0.4)',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <ShieldCheck size={13} /> ROW-LEVEL MULTI-TENANT ISOLATION ACTIVE
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Schema Partition: <code>{activeTenant.id}</code>
                  </span>
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Institutional Staff Directory & Governance Controls
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  This staff roster is strictly partitioned for <strong>{activeTenant.name}</strong>. Under EDUCORE's multi-tenant
                  security architecture, administrators and staff from other institutions (such as Federal Institute of Science & Technology)
                  are cryptographically barred from viewing, indexing, or altering these user accounts.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  id="btn-open-invite-modal"
                  className="btn btn-primary"
                  onClick={() => setShowInviteStaffModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <UserPlus size={16} /> Invite Institutional Staff
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Staff Members
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--cyan)' }}>
                  {tenantUsers.filter((u) => u.status === 'active').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>● Fully Authorized</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Signing Officers (Admins/Registrars)
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff' }}>
                  {tenantUsers.filter((u) => u.role === 'institution_admin' || u.role === 'registrar').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Signatory Authority</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Cross-Tenant Leakage
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--emerald)' }}>
                  0 Records
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Zero-Trust Confirmed</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Operator
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cyan)' }}>
                  {currentUser.role}
                </div>
              </div>
            </div>
          </div>

          {/* Live Cross-Tenant Boundary Defense Test Card */}
          <div
            className="glass-panel"
            style={{
              padding: '24px 28px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(10, 19, 38, 0.7)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={18} color="var(--cyan)" />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Multi-Tenant Boundary Firewall Probe
                  </h4>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Demonstrate that this institution session cannot cross tenant boundaries to read or mutate foreign records.
                </p>
              </div>

              <button
                id="btn-test-cross-tenant-probe"
                className="btn btn-secondary btn-sm"
                onClick={handleRunSecurityTest}
                disabled={isTestingSecurity}
                style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid var(--cyan)',
                  color: 'var(--cyan)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isTestingSecurity ? <RefreshCw size={14} className="spin-animation" /> : <ShieldAlert size={14} />}
                {isTestingSecurity ? 'Executing Probe...' : 'Simulate Cross-Tenant Access Attack'}
              </button>
            </div>

            {securityViolation && (
              <div
                style={{
                  background: '#040813',
                  borderRadius: '10px',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '16px 20px',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)', marginBottom: '8px', fontWeight: 700 }}>
                  <CheckCircle2 size={16} /> [FIREWALL ACTIVE] SECURITY PROBE INTERCEPTED & CONTAINED
                </div>
                <div style={{ color: '#94a3b8', lineHeight: 1.6 }}>
                  <div>
                    <span style={{ color: '#64748b' }}>&gt; Actor Session:</span>{' '}
                    <strong style={{ color: '#e2e8f0' }}>{securityViolation.violatingTenantId}</strong> ({activeTenant.name})
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>&gt; Target Tenant:</span>{' '}
                    <strong style={{ color: '#fb7185' }}>{securityViolation.targetTenantId}</strong> (Foreign Institutional Schema)
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>&gt; Guard Action:</span>{' '}
                    <span style={{ color: 'var(--cyan)' }}>BLOCK AT ROW FILTER (HTTP {securityViolation.code} Forbidden)</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>&gt; Log Message:</span> {securityViolation.message}
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>&gt; Leaked Records:</span>{' '}
                    <span style={{ color: 'var(--emerald)', fontWeight: 800 }}>0 records exposed. Multi-tenancy integrity verified.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Institutional Staff & Admin Roster Table */}
          <div className="glass-panel" style={{ padding: '28px 32px' }}>
            {/* Super Admin Status Banner */}
            {isOrgSuperAdmin ? (
              <div style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15), rgba(37, 99, 235, 0.1))',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}>
                <Crown size={22} color="var(--amber)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--amber)' }}>Organization Super Admin Active:</strong> You have full executive control over <strong>{activeTenant.name}</strong>. You can register multiple administrators, assign granular roles & permissions, limit or restrict another admin's access, and permanently delete sub-admin accounts.
                </div>
              </div>
            ) : (
              <div style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}>
                <ShieldCheck size={20} color="var(--cyan)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  You are signed in as an institutional officer (<strong>{currentUser.name}</strong> · <code>{currentUser.role}</code>). Account provisioning, permissions assignment, and administrator deletions are managed by the Organization Super Admin.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {entityLabel} Administrators & Staff Roster ({tenantUsers.length})
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Authorized administrators and officers bound exclusively to {activeTenant.name}.
                </p>
              </div>

              {/* Search & Status/Role Filters */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input form-input-sm"
                    placeholder="Search staff by name, email, dept..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    style={{ paddingLeft: '36px', height: '36px', fontSize: '0.82rem' }}
                  />
                </div>

                <select
                  className="form-select form-input-sm"
                  value={staffRoleFilter}
                  onChange={(e) => setStaffRoleFilter(e.target.value)}
                  style={{ height: '36px', fontSize: '0.82rem', minWidth: '150px' }}
                >
                  <option value="all">All Roles</option>
                  <option value="institution_admin">Institution Admin</option>
                  <option value="registrar">Academic Registrar</option>
                  <option value="credential_approver">Credential Approver</option>
                  <option value="attendance_officer">Attendance Officer</option>
                  <option value="teacher">Faculty / Teacher</option>
                  <option value="department_admin">Department Admin</option>
                  <option value="compliance_officer">Compliance Officer</option>
                </select>
              </div>
            </div>

            {/* Status Filter Tabs / Pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
              {(['all', 'active', 'invited', 'suspended', 'revoked'] as const).map((st) => {
                const count = st === 'all' ? tenantUsers.length : tenantUsers.filter((u) => u.status === st).length;
                const isSelected = staffStatusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStaffStatusFilter(st)}
                    className="btn btn-sm"
                    style={{
                      fontSize: '0.74rem',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: isSelected ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? '#040813' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 800 : 500,
                      border: isSelected ? '1px solid var(--cyan)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    {st === 'all'
                      ? `All Staff (${count})`
                      : st === 'active'
                      ? `● Active (${count})`
                      : st === 'invited'
                      ? `✉️ Invited (${count})`
                      : st === 'suspended'
                      ? `⚠️ Suspended (${count})`
                      : `🚫 Revoked (${count})`}
                  </button>
                );
              })}
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Administrator / Staff Member</th>
                    <th>Email Address</th>
                    <th>Title & Department</th>
                    <th>Role</th>
                    <th>Assigned Permissions</th>
                    <th>Membership Status</th>
                    <th>Last Login / Token</th>
                    <th style={{ textAlign: 'right' }}>Super Admin Governance</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantUsers
                    .filter((u) => {
                      const matchesSearch =
                        u.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
                        (u.department && u.department.toLowerCase().includes(staffSearch.toLowerCase()));
                      const matchesRole = staffRoleFilter === 'all' || u.role === staffRoleFilter;
                      const matchesStatus = staffStatusFilter === 'all' || (u.status || 'active') === staffStatusFilter;
                      return matchesSearch && matchesRole && matchesStatus;
                    })
                    .map((user) => {
                      const initials = user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase();
                      const isCurrentUser = user.id === currentUser.id;
                      const isTargetSuperAdmin = user.is_super_admin === true;
                      const perms = user.permissions || getDefaultTenantPermissions(user.role);

                      return (
                        <tr key={user.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '50%',
                                  background: isTargetSuperAdmin
                                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.4))'
                                    : 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(37, 99, 235, 0.4))',
                                  border: `1px solid ${isTargetSuperAdmin ? 'rgba(245, 158, 11, 0.6)' : 'rgba(56, 189, 248, 0.4)'}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.85rem',
                                  color: isTargetSuperAdmin ? 'var(--amber)' : 'var(--cyan)',
                                }}
                              >
                                {isTargetSuperAdmin ? '👑' : initials}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>{user.name}</span>
                                  {isTargetSuperAdmin && (
                                    <span
                                      className="badge badge-pending"
                                      style={{
                                        fontSize: '0.62rem',
                                        padding: '1px 6px',
                                        background: 'rgba(245, 158, 11, 0.15)',
                                        color: 'var(--amber)',
                                        border: '1px solid rgba(245, 158, 11, 0.4)',
                                        fontWeight: 800,
                                      }}
                                    >
                                      Super Admin
                                    </span>
                                  )}
                                  {isCurrentUser && <span style={{ fontSize: '0.7rem', color: 'var(--cyan)' }}>(You)</span>}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  ID: {user.staff_number || user.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user.email}</td>
                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {user.designation || 'Academic Staff'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {user.department || 'Administration'}
                            </div>
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background:
                                  user.role === 'institution_admin'
                                    ? 'rgba(6, 182, 212, 0.2)'
                                    : user.role === 'registrar'
                                    ? 'rgba(16, 185, 129, 0.2)'
                                    : user.role === 'credential_approver'
                                    ? 'rgba(245, 158, 11, 0.2)'
                                    : user.role === 'attendance_officer'
                                    ? 'rgba(56, 189, 248, 0.2)'
                                    : 'rgba(99, 102, 241, 0.2)',
                                color:
                                  user.role === 'institution_admin'
                                    ? 'var(--cyan)'
                                    : user.role === 'registrar'
                                    ? 'var(--emerald)'
                                    : user.role === 'credential_approver'
                                    ? 'var(--amber)'
                                    : user.role === 'attendance_officer'
                                    ? 'var(--blue-400)'
                                    : 'var(--primary-light)',
                                border: '1px solid currentColor',
                                padding: '4px 10px',
                                borderRadius: '100px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '280px' }}>
                              {perms.map((pId) => {
                                const pObj = TENANT_PERMISSIONS.find((tp) => tp.id === pId);
                                return (
                                  <span
                                    key={pId}
                                    title={pObj?.desc || pId}
                                    style={{
                                      fontSize: '0.68rem',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
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
                              })}
                            </div>
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background:
                                  user.status === 'active'
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : user.status === 'invited'
                                    ? 'rgba(245, 158, 11, 0.15)'
                                    : user.status === 'revoked'
                                    ? 'rgba(244, 63, 94, 0.15)'
                                    : 'rgba(234, 179, 8, 0.15)',
                                color:
                                  user.status === 'active'
                                    ? 'var(--emerald)'
                                    : user.status === 'invited'
                                    ? 'var(--amber)'
                                    : user.status === 'revoked'
                                    ? 'var(--rose)'
                                    : '#eab308',
                                border: `1px solid ${
                                  user.status === 'active'
                                    ? 'rgba(16, 185, 129, 0.4)'
                                    : user.status === 'invited'
                                    ? 'rgba(245, 158, 11, 0.4)'
                                    : user.status === 'revoked'
                                    ? 'rgba(244, 63, 94, 0.4)'
                                    : 'rgba(234, 179, 8, 0.4)'
                                }`,
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                            >
                              {user.status === 'active'
                                ? '● Active'
                                : user.status === 'invited'
                                ? '✉️ Invited (Pending Token)'
                                : user.status === 'revoked'
                                ? '🚫 Revoked (Cut Off)'
                                : '⚠️ Suspended'}
                            </span>
                          </td>
                          <td>
                            {user.status === 'invited' ? (
                              <div>
                                <span style={{ color: 'var(--amber)', fontSize: '0.72rem', fontWeight: 600 }}>
                                  Token Pending
                                </span>
                                <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                  {user.invitation_token ? `${user.invitation_token.substring(0, 16)}...` : 'Token Issued'}
                                </div>
                              </div>
                            ) : user.status === 'revoked' ? (
                              <span style={{ color: 'var(--rose)', fontSize: '0.72rem' }}>Access Cut Off</span>
                            ) : user.last_login_at ? (
                              <div style={{ fontSize: '0.75rem' }}>
                                <div style={{ color: '#fff', fontWeight: 600 }}>
                                  {user.last_login_at.split('T')[1]?.substring(0, 5) || user.last_login_at}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                                  {user.last_login_at.split('T')[0]}
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No session logged</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {isOrgSuperAdmin ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                {/* Actions for Invited Members */}
                                {user.status === 'invited' && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      onClick={() => {
                                        const res = onResendStaffInvitation ? onResendStaffInvitation(user.id) : null;
                                        const tok = res?.token || user.invitation_token || 'inv_tok_educore_live_2026';
                                        navigator.clipboard?.writeText(tok);
                                        setTokenNotice({ userId: user.id, name: user.name, token: tok, email: user.email });
                                      }}
                                      title="Resend secure activation token (POST /api/v1/staff/invitations/resend)"
                                      style={{ fontSize: '0.72rem', padding: '5px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <Key size={12} color="var(--amber)" /> Token
                                    </button>

                                    <button
                                      type="button"
                                      className="btn btn-success btn-sm"
                                      onClick={() => onActivateStaffUser && onActivateStaffUser(user.id)}
                                      title="Simulate recipient password setup and account activation (status: active)"
                                      style={{ fontSize: '0.72rem', padding: '5px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <Check size={12} /> Activate
                                    </button>

                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      onClick={() => setRevokingMembershipUser(user)}
                                      title="Cancel and revoke invitation"
                                      style={{ fontSize: '0.72rem', padding: '5px 8px' }}
                                    >
                                      <UserX size={12} /> Revoke
                                    </button>
                                  </>
                                )}

                                {/* Actions for Active Staff Members */}
                                {user.status === 'active' && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      onClick={() => handleOpenEditModal(user)}
                                      title="Edit permissions, limits, and role"
                                      style={{
                                        fontSize: '0.72rem',
                                        padding: '5px 10px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                    >
                                      <Sliders size={12} color="var(--cyan)" />
                                      <span>Edit Limits</span>
                                    </button>

                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      disabled={isCurrentUser || isTargetSuperAdmin}
                                      onClick={() => handleToggleStatus(user.id)}
                                      title={
                                        isCurrentUser
                                          ? 'Cannot suspend your own session'
                                          : isTargetSuperAdmin
                                          ? 'Super Admin cannot be suspended'
                                          : 'Suspend account access'
                                      }
                                      style={{
                                        fontSize: '0.72rem',
                                        padding: '5px 8px',
                                        opacity: isCurrentUser || isTargetSuperAdmin ? 0.4 : 1,
                                      }}
                                    >
                                      Suspend
                                    </button>

                                    {/* 1-Click Revoke Membership with Immediate Cutoff */}
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      disabled={isCurrentUser || isTargetSuperAdmin}
                                      onClick={() => setRevokingMembershipUser(user)}
                                      title={
                                        isCurrentUser
                                          ? 'Cannot revoke your own active Super Admin session'
                                          : isTargetSuperAdmin
                                          ? 'Super Admin membership cannot be revoked'
                                          : 'Revoke tenant membership (immediate access cutoff)'
                                      }
                                      style={{
                                        fontSize: '0.72rem',
                                        padding: '5px 8px',
                                        opacity: isCurrentUser || isTargetSuperAdmin ? 0.4 : 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                    >
                                      <UserX size={12} /> Revoke
                                    </button>
                                  </>
                                )}

                                {/* Actions for Revoked Members */}
                                {user.status === 'revoked' && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      onClick={() => handleToggleStatus(user.id)}
                                      title="Reactivate revoked membership"
                                      style={{ fontSize: '0.72rem', padding: '5px 8px' }}
                                    >
                                      Reactivate
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      onClick={() => setAdminToDelete(user)}
                                      title="Permanently remove account record"
                                      style={{ fontSize: '0.72rem', padding: '5px 8px' }}
                                    >
                                      <Trash2 size={12} /> Delete
                                    </button>
                                  </>
                                )}

                                {/* Actions for Suspended Members */}
                                {user.status === 'suspended' && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-success btn-sm"
                                      onClick={() => handleToggleStatus(user.id)}
                                      title="Reactivate suspended account"
                                      style={{ fontSize: '0.72rem', padding: '5px 8px' }}
                                    >
                                      Unsuspend
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      onClick={() => setRevokingMembershipUser(user)}
                                      title="Revoke membership permanently"
                                      style={{ fontSize: '0.72rem', padding: '5px 8px' }}
                                    >
                                      <UserX size={12} /> Revoke
                                    </button>
                                  </>
                                )}
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

          {/* Role Governance & Permissions Hierarchy Matrix */}
          <div className="glass-panel" style={{ padding: '28px 32px' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 16px', color: 'var(--text-primary)' }}>
              Institutional Roles & Authority Matrix
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan)', fontWeight: 800, marginBottom: '6px' }}>
                  <ShieldCheck size={16} /> Institution Admin (Rector / VC)
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  Highest authority in the tenant. Authorizes staff invitations, reviews and approves credential drafts, revokes
                  faulty or disciplinary certificates, and updates NBTE/NUC institutional profiles.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald)', fontWeight: 800, marginBottom: '6px' }}>
                  <Award size={16} /> Academic Registrar
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  Manages official student records and course enrollments. Formally triggers SHA-256 canonical hashing and issues
                  tamper-proof certificates to graduates once approved by the governing board.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', fontWeight: 800, marginBottom: '6px' }}>
                  <BookOpen size={16} /> Faculty Dean / Department Editor
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  Drafts certificates and academic honors for departmental graduating classes. Enters daily attendance rolls and
                  prepares capstone performance summaries.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber)', fontWeight: 800, marginBottom: '6px' }}>
                  <Clock size={16} /> Compliance & Quality Assurance
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  Independent internal auditor. Audits the immutable event timeline, inspects public verification logs, and ensures
                  strict compliance with national accreditation benchmarks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: INSTITUTION SETTINGS & GOVERNANCE */}
      {activeTab === 'settings' && permittedTabs.includes('settings') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Building size={24} color="var(--cyan)" />
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                  Institution Profile & Governance Settings
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Manage institutional metadata, regulatory accreditation numbers, and contact channels for {activeTenant.name}.
                </p>
              </div>
            </div>

            {settingsSaved && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: 'var(--emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={18} /> Institutional profile settings updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label">Official Legal Institution Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Accreditation / Regulatory Registration No.</label>
                  <input
                    type="text"
                    readOnly
                    className="form-input"
                    value={activeTenant.registration_number}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Locked by EDUCORE National Accreditation Council.
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label">Official Registry Work Email</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={instEmail}
                    onChange={(e) => setInstEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Telephone</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={instPhone}
                    onChange={(e) => setInstPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Physical Campus Address</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={instAddress}
                  onChange={(e) => setInstAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontWeight: 800 }}>
                  Save Institutional Profile
                </button>
              </div>
            </form>
          </div>

          {/* Cryptographic Standard Panel */}
          <div className="glass-panel" style={{ padding: '28px 32px', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Lock size={20} color="var(--cyan)" />
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Cryptographic Issuance Engine Specifications
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(5, 11, 24, 0.6)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cryptographic Hash Standard</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--cyan)', marginTop: '4px' }}>SHA-256 (FIPS 180-4)</div>
              </div>
              <div style={{ background: 'rgba(5, 11, 24, 0.6)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payload Canonicalization</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '4px' }}>RFC 8785 Canonical JSON v1.0</div>
              </div>
              <div style={{ background: 'rgba(5, 11, 24, 0.6)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tenant UUID Isolation</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}><code>{activeTenant.id}</code></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 403 FORBIDDEN ZERO-TRUST BARRIER IF AN UNAUTHORIZED TAB IS TARGETED */}
      {!permittedTabs.includes(activeTab) && (
        <div
          className="glass-panel"
          style={{
            padding: '48px 36px',
            textAlign: 'center',
            borderColor: 'var(--rose)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(15, 23, 42, 0.95))',
            borderRadius: '16px',
            marginTop: '20px',
          }}
        >
          <ShieldAlert size={56} color="var(--rose)" style={{ marginBottom: '18px' }} />
          <h2 style={{ color: 'var(--rose)', fontSize: '1.6rem', fontWeight: 900, margin: '0 0 10px' }}>
            HTTP 403 Forbidden — Dashboard Access Denied
          </h2>
          <div style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-sub)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            You do not have authorization to view or access this administrative dashboard. Under EDUCORE's multi-tenant zero-trust security policy, delegated administrators are strictly sequestered to their assigned role workspace. Cross-dashboard viewing is strictly prohibited.
          </div>
          <div style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveTab(permittedTabs[0] || 'credentials')}
              style={{ fontWeight: 700, padding: '10px 24px' }}
            >
              Return to Your Permitted Workspace ({permittedTabs[0] || 'credentials'})
            </button>
          </div>
        </div>
      )}
      {showDraftModal && (
        <div className="modal-overlay" onClick={() => setShowDraftModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Draft New Academic Credential</h3>
            </div>
            <form onSubmit={handleCreateDraft}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Recipient Student</label>
                  <select
                    className="form-select"
                    value={draftStudentId}
                    onChange={(e) => setDraftStudentId(e.target.value)}
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} ({s.student_number}) - {s.programme}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Award Type</label>
                    <select
                      className="form-select"
                      value={draftType}
                      onChange={(e) => setDraftType(e.target.value as Credential['credential_type'])}
                    >
                      <option value="Diploma">Diploma</option>
                      <option value="Degree">Degree</option>
                      <option value="Certificate of Excellence">Certificate of Excellence</option>
                      <option value="Vocational Certificate">Vocational Certificate</option>
                      <option value="Professional Fellowship">Professional Fellowship</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Honors / GPA / Distinction</label>
                    <input
                      type="text"
                      className="form-input"
                      value={draftHonors}
                      onChange={(e) => setDraftHonors(e.target.value)}
                      placeholder="e.g. First Class Honours / Distinction"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Conferred Award Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Award Citation</label>
                  <textarea
                    className="form-textarea"
                    required
                    value={draftDesc}
                    onChange={(e) => setDraftDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDraftModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ENROLL STUDENT */}
      {showStudentModal && (
        <div className="modal-overlay" onClick={() => setShowStudentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Enroll New Student</h3>
            </div>
            <form onSubmit={handleEnrollStudent}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={newFirst}
                      onChange={(e) => setNewFirst(e.target.value)}
                      placeholder="e.g. Chidera"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={newLast}
                      onChange={(e) => setNewLast(e.target.value)}
                      placeholder="e.g. Nwosu"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Matric / Student Number</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={newNumber}
                      onChange={(e) => setNewNumber(e.target.value)}
                      placeholder="e.g. APX/2026/CS/099"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="student@institution.edu.ng"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Department / Programme</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newProg}
                    onChange={(e) => setNewProg(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStudentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD MANUAL ATTENDANCE (PHASE 1 MVP) */}
      {showAttendanceModal && (
        <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarCheck size={20} color="var(--cyan-400)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Record Manual Attendance (MVP Phase 1)</h3>
              </div>
            </div>
            <form onSubmit={handleSaveAttendance}>
              <div className="modal-body">
                {/* Role-Based Recorder Notice */}
                <div
                  style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '18px',
                    fontSize: '0.85rem',
                    color: 'var(--text-sub)',
                  }}
                >
                  <strong style={{ color: '#fff' }}>Authorized Staff Recording:</strong>{' '}
                  <span style={{ color: 'var(--cyan-300)' }}>{currentUser.name}</span> (
                  {currentUser.designation || currentUser.role}) · Tenant: {activeTenant.name}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Select Enrolled Attendee</label>
                    <select
                      className="form-select"
                      value={attPersonId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        setAttPersonId(pid);
                        const match = students.find((s) => s.id === pid);
                        if (match) {
                          setAttName(`${match.first_name} ${match.last_name}`);
                        }
                      }}
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name} ({s.student_number})
                        </option>
                      ))}
                      <option value="custom_entry">+ Custom Attendee / Trainee</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Entity Type</label>
                    <select
                      className="form-select"
                      value={attPersonType}
                      onChange={(e) => setAttPersonType(e.target.value as any)}
                    >
                      <option value="student">Formal Student (School)</option>
                      <option value="trainee">Trainee / Participant (Institute)</option>
                      <option value="member">Member / Ordinand (Organization)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Attendee Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={attName}
                    onChange={(e) => setAttName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Course, Cohort, or Training Batch</label>
                  <select
                    className="form-select"
                    value={attCourseOrBatch}
                    onChange={(e) => setAttCourseOrBatch(e.target.value)}
                  >
                    {!isFullAttendanceOverseer && currentUser.assigned_classes && currentUser.assigned_classes.length > 0 ? (
                      currentUser.assigned_classes.map((cls) => (
                        <option key={cls} value={cls}>
                          🎯 Assigned Class: {cls}
                        </option>
                      ))
                    ) : (
                      <>
                        {courses.map((c) => (
                          <option key={c.id} value={`${c.code} - ${c.name}`}>
                            {c.code} - {c.name}
                          </option>
                        ))}
                        <option value="General Campus Session">General Campus Session</option>
                        <option value="Executive Management Cohort 2026">Executive Management Cohort 2026</option>
                        <option value="Ministerial Ordination Class A">Ministerial Ordination Class A</option>
                      </>
                    )}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Attendance Date</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={attDate}
                      onChange={(e) => setAttDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={attStatus}
                      onChange={(e) => setAttStatus(e.target.value as AttendanceRecord['status'])}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="excused">Excused</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAttendanceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3B: AUDITED ATTENDANCE CORRECTION (PATCH /api/v1/attendance/{id}) */}
      {selectedRecordForCorrection && (
        <div className="modal-overlay" onClick={() => setSelectedRecordForCorrection(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={20} color="var(--amber-400)" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    Audited Correction (PATCH /api/v1/attendance/{'{id}'})
                  </h3>
                  <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Record ID: {selectedRecordForCorrection.id}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitCorrection}>
              <div className="modal-body">
                {/* Feedback notices */}
                {correctionError && (
                  <div
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid var(--rose-400)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '14px',
                      fontSize: '0.85rem',
                      color: 'var(--rose-400)',
                    }}
                  >
                    {correctionError}
                  </div>
                )}

                {correctionFeedback && (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid var(--emerald-500)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '14px',
                      fontSize: '0.85rem',
                      color: 'var(--emerald-400)',
                    }}
                  >
                    {correctionFeedback}
                  </div>
                )}

                {/* Current Record Info */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-dim)',
                    borderRadius: '8px',
                    padding: '14px 18px',
                    marginBottom: '18px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Attendee:</span>{' '}
                    <strong style={{ color: '#fff' }}>{selectedRecordForCorrection.person_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Date:</span>{' '}
                    <span style={{ color: '#fff' }}>{selectedRecordForCorrection.attendance_date || selectedRecordForCorrection.date}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Course / Batch:</span>{' '}
                    <span style={{ color: '#fff' }}>{selectedRecordForCorrection.course_or_batch || 'General Roll'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Current Status:</span>{' '}
                    <span
                      className={`badge ${
                        selectedRecordForCorrection.status === 'present'
                          ? 'badge-valid'
                          : selectedRecordForCorrection.status === 'late'
                          ? 'badge-superseded'
                          : selectedRecordForCorrection.status === 'excused'
                          ? 'badge-approved'
                          : 'badge-revoked'
                      }`}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {selectedRecordForCorrection.status}
                    </span>
                  </div>
                </div>

                {/* Audit Trail History if previously corrected */}
                {(selectedRecordForCorrection.corrections || []).length > 0 && (
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--amber-400)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Previous Audit Trail ({selectedRecordForCorrection.corrections!.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                      {selectedRecordForCorrection.corrections!.map((cor) => (
                        <div
                          key={cor.id}
                          style={{
                            background: 'rgba(2, 6, 23, 0.5)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '0.78rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            <span>Modified by <strong>{cor.modified_by}</strong></span>
                            <span>{cor.modified_at.slice(0, 19).replace('T', ' ')}</span>
                          </div>
                          <div>
                            Status: <span style={{ textDecoration: 'line-through', color: 'var(--rose-400)' }}>{cor.previous_status}</span> ➔ <span style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>{cor.new_status}</span>
                          </div>
                          <div style={{ color: 'var(--text-sub)', marginTop: '2px', fontStyle: 'italic' }}>
                            "{cor.reason}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Inputs for Correction */}
                <div className="form-group">
                  <label className="form-label">New Corrected Status</label>
                  <select
                    className="form-select"
                    value={correctionNewStatus}
                    onChange={(e) => setCorrectionNewStatus(e.target.value as any)}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Mandatory Reason for Change (Required by Audit Policy)
                  </label>
                  <textarea
                    required
                    className="form-textarea"
                    placeholder="e.g. Validated clinic sick bay slip presented, or verified late train transport arrival."
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    style={{ minHeight: '85px' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    This reason, along with your user ID ({currentUser.id}) and the previous status ({selectedRecordForCorrection.status}), will be permanently recorded in the institutional audit log.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedRecordForCorrection(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!correctionReason.trim() || correctionReason.trim().length < 5}
                >
                  Commit Audited Correction (PATCH)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REVOKE */}
      {showRevokeModal && (
        <div className="modal-overlay" onClick={() => setShowRevokeModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderColor: 'var(--rose-400)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="var(--rose-400)" />
                <h3 style={{ fontSize: '1.2rem', color: '#fb7185', fontWeight: 800 }}>Revoke Issued Credential</h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.925rem', color: 'var(--text-sub)', marginBottom: '16px' }}>
                Revoking <strong>{showRevokeModal.title}</strong> for <strong>{showRevokeModal.recipient_name}</strong> will permanently stamp this credential as <span className="badge badge-revoked">REVOKED</span> on public verification lookups.
              </p>
              <div className="form-group">
                <label className="form-label">Formal Revocation Reason (Mandatory for Audit Trail)</label>
                <textarea
                  className="form-textarea"
                  required
                  placeholder="e.g. Academic board confirmation of examination irregularity."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRevokeModal(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={!revokeReason.trim()}
                onClick={handleConfirmRevoke}
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: INVITE STAFF MEMBER */}
      {showInviteStaffModal && (
        <div className="modal-overlay" onClick={() => setShowInviteStaffModal(false)} id="modal-invite-staff">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={20} color="var(--cyan)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Invite Institutional Staff Member
                </h3>
              </div>
            </div>

            {inviteFeedback && (
              <div
                style={{
                  margin: '16px 24px 0',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: inviteFeedback.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${inviteFeedback.isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                  color: inviteFeedback.isError ? 'var(--rose)' : 'var(--emerald)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {inviteFeedback.text}
              </div>
            )}

            <form onSubmit={handleInviteStaff}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Dr. Adebayo Ogunlesi"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Institutional Work Email</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder={`e.g. staff@${activeTenant.email.split('@')[1] || 'institution.edu.ng'}`}
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Department / School</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Computer Science"
                      value={inviteDept}
                      onChange={(e) => setInviteDept(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation / Title</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Senior Lecturer"
                      value={inviteDesignation}
                      onChange={(e) => setInviteDesignation(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Institutional Role</label>
                    <select
                      className="form-select"
                      value={inviteRole}
                      onChange={(e) => {
                        const r = e.target.value as User['role'];
                        setInviteRole(r);
                        setInvitePermissions(getDefaultTenantPermissions(r));
                      }}
                    >
                      <option value="registrar">Academic Registrar</option>
                      <option value="institution_admin">Co-Administrator / Dean</option>
                      <option value="teacher">Faculty / Department Editor</option>
                      <option value="compliance_officer">Compliance Officer</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Staff ID Number (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. STF-2026-042"
                      value={inviteStaffNo}
                      onChange={(e) => setInviteStaffNo(e.target.value)}
                    />
                  </div>
                </div>

                {/* Assigned Permissions Checklist */}
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Assigned Role Permissions ({invitePermissions.length} Active)
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--cyan)', fontWeight: 600 }}>
                      Assigned by Super Admin
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '8px',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      padding: '8px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {TENANT_PERMISSIONS.map((perm) => {
                      const isChecked = invitePermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            background: isChecked ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                            border: `1px solid ${isChecked ? 'rgba(6, 182, 212, 0.35)' : 'transparent'}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleInvitePermission(perm.id)}
                            style={{ marginTop: '2px' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: isChecked ? 'var(--cyan)' : 'var(--text-main)' }}>
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
                    background: 'rgba(6, 182, 212, 0.08)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: 'var(--cyan)' }}>Multi-Tenant Boundary Rule:</strong> This account will be
                  permanently bound to <strong>{activeTenant.name}</strong> (<code>{activeTenant.id}</code>). Under no
                  circumstances can this account access or view records of any other tenant.
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteStaffModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="btn-submit-invite-staff">
                  Provision Institutional Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: EDIT ADMIN PERMISSIONS & ACCESS LIMITS */}
      {editingAdmin && (
        <div className="modal-overlay" onClick={() => setEditingAdmin(null)} id="modal-edit-admin-permissions">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sliders size={20} color="var(--cyan)" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Edit Administrator Permissions & Limits
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Managing access for: <strong>{editingAdmin.name}</strong> ({editingAdmin.email})
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Administrative Role</label>
                    <select
                      className="form-select"
                      value={editRole}
                      disabled={editingAdmin.is_super_admin}
                      onChange={(e) => setEditRole(e.target.value as User['role'])}
                    >
                      <option value="registrar">Academic Registrar</option>
                      <option value="institution_admin">Co-Administrator / Dean</option>
                      <option value="teacher">Faculty / Department Editor</option>
                      <option value="compliance_officer">Compliance Officer</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation / Title</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Assigned Permissions Checklist */}
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Assigned Permissions ({editPermissions.length} of {TENANT_PERMISSIONS.length} Enabled)
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--amber)', fontWeight: 600 }}>
                      Changes take effect immediately
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
                    {TENANT_PERMISSIONS.map((perm) => {
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
                            background: isChecked ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                            border: `1px solid ${isChecked ? 'rgba(6, 182, 212, 0.4)' : 'transparent'}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleEditPermission(perm.id)}
                            style={{ marginTop: '2px' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: isChecked ? 'var(--cyan)' : 'var(--text-main)' }}>
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
                  <strong style={{ color: 'var(--amber)' }}>Super Admin Authority:</strong> Revoking permissions will
                  immediately disable corresponding action buttons and access gates in this administrator's dashboard.
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingAdmin(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="btn-save-admin-limits">
                  Update Permissions & Limits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: CONFIRM PERMANENT DELETE ADMIN ACCOUNT */}
      {adminToDelete && (
        <div className="modal-overlay" onClick={() => setAdminToDelete(null)} id="modal-delete-admin-confirm">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header" style={{ borderColor: 'var(--rose)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={22} color="var(--rose)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--rose)' }}>
                  Revoke & Delete Admin Account
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
                Are you sure you want to permanently delete the administrator account for:
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
                  {adminToDelete.email} · {adminToDelete.designation || adminToDelete.role}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--cyan)', marginTop: '4px' }}>
                  Tenant: {activeTenant.name}
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
                purged from the institutional user directory, all access sessions will be terminated, and an immutable security
                audit trail entry will be recorded.
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setAdminToDelete(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                id="btn-confirm-delete-admin"
                onClick={handleConfirmDeleteAdmin}
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: STEP 2 VERIFICATION REVIEW & TWO-PERSON AUTHORIZATION */}
      {reviewingCred && (
        <div className="modal-overlay" onClick={() => setReviewingCred(null)} id="modal-review-credential">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={22} color="var(--emerald)" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Step 2: Verification Review & Authorization
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Evaluating submission: <strong>{reviewingCred.title}</strong>
                  </p>
                </div>
              </div>
            </div>

            {approvalFeedback && (
              <div
                style={{
                  margin: '16px 24px 0',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: approvalFeedback.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${approvalFeedback.isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                  color: approvalFeedback.isError ? 'var(--rose)' : 'var(--emerald)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {approvalFeedback.text}
              </div>
            )}

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Submission Overview Card */}
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Recipient Candidate
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {reviewingCred.recipient_name}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Credential Number
                  </div>
                  <div className="mono" style={{ fontWeight: 700, color: 'var(--cyan)', fontSize: '0.9rem' }}>
                    {reviewingCred.credential_number}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Award Classification
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {reviewingCred.credential_type} · {reviewingCred.grade_or_honor || 'Distinction'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Drafting Officer ID
                  </div>
                  <div className="mono" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {reviewingCred.issuer_user_id}
                  </div>
                </div>
              </div>

              {/* Two-Person Policy Compliance Assessment */}
              {reviewingCred.issuer_user_id === currentUser.id ? (
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ fontWeight: 800, color: 'var(--amber)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={16} /> Two-Person Policy Enforcement Notice
                  </div>
                  You created this draft record as <strong>{currentUser.name}</strong>. For high-assurance institutional awards,
                  the platform mandates independent verification by a distinct co-administrator or Rector before state locking.
                </div>
              ) : (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ fontWeight: 800, color: 'var(--emerald)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> Two-Person Separation of Duties Satisfied
                  </div>
                  Approver <strong>{currentUser.name}</strong> ({currentUser.role}) is independent from the drafting officer.
                  Authorizing this submission will write a cryptographic approval event to <code>credential_approval_requests</code>.
                </div>
              )}

              {/* Formal Approval Comments */}
              <div className="form-group">
                <label className="form-label">
                  Audit Review Comments (Recorded in <code>credential_approval_requests</code>)
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Academic Senate confirmation verified. All prerequisite degree requirements met."
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setReviewingCred(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                id="btn-execute-formal-approval"
                onClick={() => handleExecuteApproval(reviewingCred.issuer_user_id === currentUser.id)}
              >
                Execute Formal Approval (POST /approve)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: TRACEABLE CREDENTIAL LIFECYCLE EVENTS TIMELINE (GET /api/v1/credentials/{id}/events) */}
      {inspectingTimelineCred && (
        <div className="modal-overlay" onClick={() => setInspectingTimelineCred(null)} id="modal-credential-events-timeline">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={22} color="var(--cyan)" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Traceable Credential Lifecycle Timeline
                  </h3>
                  <p className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    GET /api/v1/credentials/{inspectingTimelineCred.id}/events
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Credential Header Card */}
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '16px 18px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Recipient Candidate
                  </div>
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>
                    {inspectingTimelineCred.recipient_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {inspectingTimelineCred.title} ({inspectingTimelineCred.credential_type})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Lifecycle Status
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    <span
                      className="badge"
                      style={{
                        background:
                          inspectingTimelineCred.status === 'issued'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : inspectingTimelineCred.status === 'pending_approval'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : inspectingTimelineCred.status === 'revoked'
                            ? 'rgba(244, 63, 94, 0.2)'
                            : 'rgba(56, 189, 248, 0.2)',
                        color:
                          inspectingTimelineCred.status === 'issued'
                            ? 'var(--emerald)'
                            : inspectingTimelineCred.status === 'pending_approval'
                            ? 'var(--amber)'
                            : inspectingTimelineCred.status === 'revoked'
                            ? 'var(--rose)'
                            : 'var(--cyan)',
                        border: '1px solid currentColor',
                        fontSize: '0.74rem',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                      }}
                    >
                      {inspectingTimelineCred.status.toUpperCase()}
                    </span>
                  </div>
                  {inspectingTimelineCred.credential_hash && (
                    <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--emerald)', marginTop: '4px', wordBreak: 'break-all' }}>
                      SHA-256: {inspectingTimelineCred.credential_hash.substring(0, 18)}...
                    </div>
                  )}
                </div>
              </div>

              {/* Vertical Stepper Timeline */}
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>
                  Cryptographic Event Sequence ({inspectingTimelineCred.events?.length || 1} Events Recorded)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '24px' }}>
                  {/* Vertical rule line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '8px',
                      top: '12px',
                      bottom: '12px',
                      width: '2px',
                      background: 'rgba(6, 182, 212, 0.3)',
                    }}
                  />

                  {/* If events exist, map them. Otherwise render synthesized complete lifecycle */}
                  {inspectingTimelineCred.events && inspectingTimelineCred.events.length > 0 ? (
                    inspectingTimelineCred.events.map((ev, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        {/* Dot */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '-20px',
                            top: '4px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: ev.event_type.includes('issue')
                              ? 'var(--emerald)'
                              : ev.event_type.includes('approve')
                              ? 'var(--cyan)'
                              : ev.event_type.includes('submit')
                              ? 'var(--amber)'
                              : 'var(--blue-400)',
                            boxShadow: '0 0 6px currentColor',
                          }}
                        />

                        <div
                          style={{
                            background: 'var(--bg-card-subtle)',
                            padding: '12px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                              {ev.event_type}
                            </span>
                            <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {ev.timestamp.replace('T', ' ').substring(0, 19)}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Actor: <strong style={{ color: '#fff' }}>{ev.actor_name || 'Authorized Staff'}</strong> (
                            <code className="mono">{ev.actor_role || 'registrar'}</code> · ID: <code className="mono">{ev.actor_user_id}</code>)
                          </div>
                          {ev.details && (
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                              "{ev.details}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {/* Synthesized Step 1: Draft Creation */}
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--blue-400)' }} />
                        <div style={{ background: 'var(--bg-card-subtle)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>credential.drafted</span>
                            <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inspectingTimelineCred.created_at || '10:15 AM'}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Drafted by Registrar <strong style={{ color: '#fff' }}>Jane Doe</strong> (<code>registrar</code> · ID: {inspectingTimelineCred.issuer_user_id})
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Recipient details, qualification title, and award metadata initialized.
                          </div>
                        </div>
                      </div>

                      {/* Synthesized Step 2: Submitted for Approval */}
                      {(inspectingTimelineCred.status === 'pending_approval' || inspectingTimelineCred.status === 'approved' || inspectingTimelineCred.status === 'issued') && (
                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--amber)' }} />
                          <div style={{ background: 'var(--bg-card-subtle)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>credential.submitted</span>
                              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>10:30 AM</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Submitted for verification review by <strong style={{ color: '#fff' }}>Jane Doe</strong> (<code>registrar</code>)
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Status shifted to pending_approval. General editing locked to prevent unauthorized alterations.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Synthesized Step 3: Formal Approval */}
                      {(inspectingTimelineCred.status === 'approved' || inspectingTimelineCred.status === 'issued') && (
                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--cyan)' }} />
                          <div style={{ background: 'var(--bg-card-subtle)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>credential.approved</span>
                              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>11:00 AM</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Approved by Approver <strong style={{ color: '#fff' }}>Prof. Chika Nwosu</strong> (<code>credential_approver</code>)
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Two-Person Policy satisfied: Approver distinct from drafting officer. Formal authorization stamped.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Synthesized Step 4: Atomic Issuance & Hash */}
                      {inspectingTimelineCred.status === 'issued' && (
                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--emerald)' }} />
                          <div style={{ background: 'var(--bg-card-subtle)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--emerald)' }}>credential.issued</span>
                              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>11:05 AM</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Issued & Hashed by Signatory Officer <strong style={{ color: '#fff' }}>Dr. Folashade Adeyemi</strong> (<code>institution_admin</code>)
                            </div>
                            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--emerald)', marginTop: '2px', wordBreak: 'break-all' }}>
                              Digest: {inspectingTimelineCred.credential_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Raw JSON REST API Toggle */}
              <div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowJsonEventsModal(!showJsonEventsModal)}
                  style={{ fontSize: '0.75rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Terminal size={13} /> {showJsonEventsModal ? 'Hide REST API Response Payload' : 'Inspect Raw REST API Response (GET /api/v1/credentials/{id}/events)'}
                </button>

                {showJsonEventsModal && (
                  <pre
                    style={{
                      marginTop: '10px',
                      padding: '12px',
                      borderRadius: '8px',
                      background: '#040813',
                      border: '1px solid var(--border-dim)',
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      color: 'var(--cyan)',
                      overflowX: 'auto',
                      maxHeight: '200px',
                    }}
                  >
                    {JSON.stringify(
                      {
                        status: 200,
                        endpoint: `/api/v1/credentials/${inspectingTimelineCred.id}/events`,
                        credential_id: inspectingTimelineCred.id,
                        status_code: inspectingTimelineCred.status,
                        canonical_hash: inspectingTimelineCred.credential_hash,
                        events: inspectingTimelineCred.events?.length
                          ? inspectingTimelineCred.events
                          : [
                              { event_type: 'credential.drafted', actor: 'Jane Doe', role: 'registrar', timestamp: inspectingTimelineCred.created_at || '10:15 AM' },
                              { event_type: 'credential.submitted', actor: 'Jane Doe', role: 'registrar', timestamp: '10:30 AM' },
                              { event_type: 'credential.approved', actor: 'Prof. Chika Nwosu', role: 'credential_approver', timestamp: '11:00 AM' },
                              { event_type: 'credential.issued', actor: 'Dr. Folashade Adeyemi', role: 'institution_admin', timestamp: '11:05 AM' },
                            ],
                      },
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setInspectingTimelineCred(null)}>
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: 403 FORBIDDEN ZERO-TRUST POLICY VIOLATION INTERCEPTOR */}
      {policyViolationModal && (
        <div className="modal-overlay" onClick={() => setPolicyViolationModal(null)} id="modal-policy-violation">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header" style={{ borderColor: 'var(--rose)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={24} color="var(--rose)" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--rose)' }}>
                    HTTP 403 Forbidden — Policy Violation
                  </h3>
                  <p className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Laravel Gate / Policy Authorization Failure
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.5,
                }}
              >
                Access to <strong>{policyViolationModal.action}</strong> was denied. Under EDUCORE's multi-tenant security architecture,
                the active user does not satisfy the capability required by the backend authorization policy.
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  lineHeight: 1.6,
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Target Endpoint:</span>{' '}
                  <strong style={{ color: 'var(--cyan)' }}>{policyViolationModal.endpoint}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Policy Guard:</span>{' '}
                  <strong style={{ color: 'var(--amber)' }}>{policyViolationModal.policy}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Required Permission:</span>{' '}
                  <code style={{ color: 'var(--rose)' }}>{policyViolationModal.requiredPermission}</code>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Authenticated Actor:</span>{' '}
                  <strong style={{ color: '#fff' }}>{currentUser.name}</strong> ({currentUser.id})
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Delegated Role:</span>{' '}
                  <code style={{ color: '#fff' }}>{policyViolationModal.role}</code>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Tenant Isolation Boundary:</span>{' '}
                  <code style={{ color: 'var(--cyan)' }}>{activeTenant.id}</code>
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Frontend buttons and navigation are convenience layers. Every mutation is strictly enforced by Laravel Policies.
                To perform this task, contact the Organization Super Admin (Owner) to adjust role delegations.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setPolicyViolationModal(null)}>
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 11: CONFIRM MEMBERSHIP REVOCATION (IMMEDIATE CUTOFF) */}
      {revokingMembershipUser && (
        <div className="modal-overlay" onClick={() => setRevokingMembershipUser(null)} id="modal-revoke-membership">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header" style={{ borderColor: 'var(--rose)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserX size={22} color="var(--rose)" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--rose)' }}>
                    Revoke Institutional Membership
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Instant tenant access termination
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to revoke membership for:
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
                  {revokingMembershipUser.name}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  {revokingMembershipUser.email} · {revokingMembershipUser.designation || revokingMembershipUser.role}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--cyan)', marginTop: '4px' }}>
                  Institution: {activeTenant.name}
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
                <strong style={{ color: 'var(--rose)' }}>Immediate Access Cutoff:</strong> The record in{' '}
                <code>tenant_memberships</code> will be set to <code>status: revoked</code> and all active permissions
                will be stripped. This user will immediately be barred from reading or mutating any data bound to{' '}
                <strong>{activeTenant.name}</strong>.
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setRevokingMembershipUser(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (onRevokeTenantMembership) {
                    onRevokeTenantMembership(revokingMembershipUser.id);
                  }
                  setRevokingMembershipUser(null);
                }}
              >
                Confirm Immediate Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 12: SECURE INVITATION TOKEN NOTICE */}
      {tokenNotice && (
        <div className="modal-overlay" onClick={() => setTokenNotice(null)} id="modal-token-notice">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={22} color="var(--amber)" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Staff Invitation Token
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Step 1: Invitation & Account Activation
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                A membership record has been initialized in <code>tenant_memberships</code> with <code>status: invited</code>{' '}
                for <strong>{tokenNotice.name}</strong> ({tokenNotice.email}).
              </p>

              <div className="form-group">
                <label className="form-label">Secure Activation Token (Copied to Clipboard)</label>
                <input
                  type="text"
                  readOnly
                  className="form-input mono"
                  value={tokenNotice.token}
                  style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '0.85rem' }}
                />
              </div>

              <div
                style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}
              >
                In production, an automated email is dispatched with an activation link. When the recipient completes password
                and MFA setup, their membership status automatically transitions to <code>active</code>.
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setTokenNotice(null)}>
                Dismiss
              </button>
              {onActivateStaffUser && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    onActivateStaffUser(tokenNotice.userId);
                    setTokenNotice(null);
                  }}
                >
                  Simulate Recipient Activation (status: active)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
