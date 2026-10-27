export type TenantType = 'school' | 'organization';
export type InstitutionType = 'traditional' | 'vocational' | 'polytechnic' | 'university' | 'culinary' | 'ngo' | 'professional_body' | 'faith_based' | 'church';
export type TenantStatus = 'pending' | 'active' | 'suspended' | 'rejected' | 'closed';

export type UserRole =
  | 'platform_admin'
  | 'institution_admin'
  | 'registrar'
  | 'attendance_officer'
  | 'credential_approver'
  | 'teacher'
  | 'department_admin'
  | 'compliance_officer'
  | 'company_verifier'
  | 'student'
  | 'alumnus';

export type CredentialStatus = 'draft' | 'pending_approval' | 'approved' | 'issued' | 'revoked' | 'superseded';
export type VerificationResultType = 'VALID' | 'INVALID' | 'REVOKED' | 'SUPERSEDED' | 'NOT_FOUND';

export interface TenantIsolationViolation {
  blocked: boolean;
  code: number;
  message: string;
  violatingTenantId: string;
  targetTenantId: string;
  targetResource: string;
  timestamp: string;
}

export interface Tenant {
  id: string;
  name: string;
  tenant_type: TenantType;
  institution_type: InstitutionType;
  registration_number: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  lga: string;
  country_code: string;
  status: TenantStatus;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
}

export type TenantPermission =
  | 'issue_credentials'
  | 'approve_credentials'
  | 'manage_students'
  | 'manage_attendance'
  | 'manage_courses'
  | 'view_audit_logs'
  | 'manage_admins'
  | 'manage_settings';

export type PlatformPermission =
  | 'approve_tenants'
  | 'suspend_tenants'
  | 'manage_platform_admins'
  | 'view_global_audit'
  | 'security_governance'
  | 'manage_registry';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  tenant_id?: string;
  company_id?: string;
  status: 'active' | 'invited' | 'suspended' | 'revoked' | 'locked' | 'disabled';
  department?: string;
  designation?: string;
  staff_number?: string;
  is_super_admin?: boolean;
  permissions?: string[];
  created_at?: string;
  created_by?: string;
  last_active?: string;
  last_login_at?: string;
  invitation_token?: string;
  invitation_sent_at?: string;
  assigned_classes?: string[];
}

export interface TenantMembership {
  id: string;
  tenant_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  role: UserRole;
  designation?: string;
  department?: string;
  status: 'active' | 'invited' | 'suspended' | 'revoked';
  permissions: string[];
  invited_at?: string;
  activated_at?: string;
  last_login_at?: string;
  invitation_token?: string;
}

export interface Student {
  id: string;
  tenant_id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: string;
  programme: string;
  status: 'active' | 'graduated' | 'withdrawn' | 'suspended';
  created_at: string;
}

export interface Course {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  credits: number;
  description: string;
  status: 'active' | 'archived';
}

export interface AttendanceCorrection {
  id: string;
  modified_at: string;
  modified_by: string;
  modified_by_id: string;
  previous_status: 'present' | 'absent' | 'late' | 'excused';
  new_status: 'present' | 'absent' | 'late' | 'excused';
  reason: string;
}

export interface AttendanceRecord {
  id: string;
  tenant_id: string;
  person_id: string;
  person_name: string;
  person_type: 'student' | 'trainee' | 'member' | 'staff';
  course_or_batch?: string;
  attendance_date: string;
  date: string; // for backward compatibility
  status: 'present' | 'absent' | 'late' | 'excused';
  source: 'manual' | 'biometric_device';
  recorded_by?: string;
  recorded_by_id?: string;
  // Biometric integration fields (Release 2)
  device_id?: string;
  device_person_reference?: string;
  event_id?: string; // Idempotency anti-replay key
  device_timestamp?: string; // Scan timestamp on device
  server_timestamp?: string; // Receipt timestamp on server
  corrections?: AttendanceCorrection[];
}

export interface BiometricDevice {
  id: string;
  device_id: string;
  tenant_id: string;
  name: string;
  model: string;
  location: string;
  firmware_version: string;
  api_key_fingerprint: string;
  status: 'online' | 'offline' | 'syncing';
  last_heartbeat: string;
  pending_sync_count: number;
}

export interface BiometricIdentityMapping {
  id: string;
  tenant_id: string;
  device_person_reference: string;
  person_id: string;
  person_name: string;
  person_type: 'student' | 'trainee' | 'member';
  enrolled_finger: string;
  enrolled_at: string;
}

export interface BiometricAttendanceEventPayload {
  device_id: string;
  event_id: string;
  device_person_reference: string;
  device_timestamp: string;
  signature: string;
  offline_cached?: boolean;
}

export interface AttendanceExportJob {
  id: string;
  tenant_id: string;
  requested_by: string;
  requested_at: string;
  status: 'queued' | 'processing' | 'completed';
  filter_summary: string;
  record_count: number;
  download_url?: string;
  expires_at?: string;
}

export interface CredentialApprovalRequest {
  id: string;
  credential_id: string;
  requester_user_id: string;
  requester_name: string;
  approver_user_id?: string;
  approver_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  approved_at?: string;
  comments?: string;
}

export interface CredentialEvent {
  id: string;
  credential_id: string;
  event_type: 'created' | 'submitted' | 'approved' | 'issued' | 'revoked' | 'superseded' | string;
  actor_name: string;
  actor_id?: string;
  actor_user_id?: string;
  actor_role?: string;
  timestamp: string;
  reason?: string;
  comments?: string;
  details?: string;
  hash_algorithm?: string;
  credential_hash?: string;
}

export interface Credential {
  id: string;
  tenant_id: string;
  recipient_type: 'student' | 'trainee' | 'member';
  recipient_id: string;
  recipient_name: string;
  credential_number: string;
  credential_type: 'Degree' | 'Diploma' | 'Certificate of Excellence' | 'Vocational Certificate' | 'Professional Fellowship';
  title: string;
  description: string;
  grade_or_honor?: string;
  issuer_user_id: string;
  issuer_name: string;
  requires_two_person_review?: boolean;
  approver_user_id?: string;
  approver_name?: string;
  approver_comments?: string;
  approved_by?: string;
  approved_at?: string;
  issued_at?: string;
  status: CredentialStatus;
  canonical_data_version: string;
  hash_algorithm: string;
  credential_hash: string;
  verification_id: string;
  document_path?: string;
  document_job_status?: 'dispatched' | 'rendering' | 'ready';
  signed_document_url?: string;
  signed_document_expires?: string;
  supersedes_credential_id?: string;
  revocation_reason?: string;
  revocation_date?: string;
  created_at: string;
  events: CredentialEvent[];
}

export interface Company {
  id: string;
  name: string;
  business_type: string;
  registration_number: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'pending';
  created_at: string;
}

export interface VerificationLog {
  id: string;
  credential_id?: string;
  lookup_type: 'verification_id' | 'hash' | 'qr_scan';
  lookup_value: string;
  result: VerificationResultType;
  requester_category: 'public' | 'company';
  requester_name: string;
  company_id?: string;
  ip_address: string;
  created_at: string;
  title?: string;
  recipient_name?: string;
  issuer_name?: string;
}

export interface AuditLog {
  id: string;
  tenant_id?: string;
  tenant_name?: string;
  user_id?: string;
  user_name: string;
  user_role?: string;
  actor_name?: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  timestamp: string;
  ip_address: string;
}
