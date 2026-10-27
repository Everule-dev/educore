# EDUCORE - Product Requirements Document (PRD)

**Version:** 1.0  
**Core Promise:** Verify. Trust. Empower.  
**Pipeline:** ISSUE → HASH → VERIFY (Authentic, traceable credentials)  
**Future Release:** BIOMETRIC → ATTENDANCE → REPORT (Planned for Release 2)

---

## 1. Product Scope & Strategy

EDUCORE is a secure, multi-tenant credential verification platform built to eliminate credential forgery, streamline institutional record management, and provide instant, cryptographic verification for employers and the public.

### 1.1 Account Categories & Access Pathways

| Account Category | Purpose | Status in MVP |
|---|---|---|
| **Traditional Schools** | Formal education records, staff, students, courses, grades and credentials | Included (School Tenant) |
| **Informal Institutions** | Training centers, bootcamps, vocational institutes, trainees and certificates | Included (School Tenant - Informal) |
| **Organizations** | Professional bodies, NGOs, religious bodies, members and internal credentials | Included (Organization Tenant) |
| **Companies / Verifiers** | Independent verifier accounts to verify credentials and maintain audit logs | Included (Company Verifier) |
| **EDUCORE Administrators** | Platform oversight, institution approval, compliance, audit logs & system health | Included (Platform Admin) |
| **Biometric Devices** | Hardware biometric attendance integration | Excluded (Release 2) |

---

## 2. Release Scope

### 2.1 Included in MVP (Release 1)
- **Public Entry & Onboarding:** Public homepage, registration flows for Schools, Organizations, and Companies.
- **Vetting & Governance:** EDUCORE Administrator review and approval workflow for new institutions.
- **Tenant Isolation:** Secure multi-tenant architecture ensuring absolute boundary enforcement across institutions.
- **Identity & Records:** Student, trainee, staff, and member management.
- **Academic Programs:** Course, programme, and enrollment management.
- **Basic Attendance:** Manual attendance logging and session tracking.
- **Credential Lifecycle:** Controlled lifecycle: `DRAFT → PENDING_APPROVAL → APPROVED → ISSUED`.
- **Cryptographic Fingerprinting:** Deterministic canonicalization and SHA-256 fingerprinting.
- **Document & Visual Codes:** Dynamic Certificate PDF generation with embedded QR codes and barcode verification references.
- **Universal Verification:** Public verification portal supporting Hash lookup, Verification Reference lookup, and QR/Barcode scan.
- **Credential Revocation & Supersession:** Complete audit history for invalidations or revised issuances.
- **Company Verification Portal:** Dedicated verifier dashboard, search history, verification reports, and candidate tracking.
- **Audit Logging & Security:** Comprehensive audit trails, rate limiting, and RBAC enforcement.

### 2.2 Excluded from MVP (Deferred to Release 2+)
- Hardware biometric terminal integrations (Release 2).
- Fee payment processing, student tuition billing, and accounting.
- Native mobile applications (iOS/Android) — responsive web app provided instead.
- Full LMS (Learning Management System) and proctored examination modules.
- Blockchain tokenization (SHA-256 cryptographic audit logs provide authoritative trust without gas fees or latency).

---

### 2.3 Credential Verification Lifecycle Specification

The platform strictly enforces the following end-to-end lifecycle covering credential drafting, authorization, cryptographic locking, document generation, and external verification:

#### Step 1: Submission for Approval
- **Draft Finalization:** The institution's registrar or authorized staff member completes the recipient details, qualification title, and award metadata (`status: draft`).
- **Transition to Review:** The creator submits the draft for review via `POST /api/v1/credentials/{id}/submit`.
- **Field Freezing:** Once the status moves to `pending_approval`, general editing is locked to prevent unauthorized alterations during review.

#### Step 2: Verification Review & Authorization
- **Two-Person Policy Enforcement:** An authorized institution administrator or designated approver inspects the submission. For high-assurance awards, the approver must be distinct from the user who drafted the record.
- **Formal Approval:** The administrator executes `POST /api/v1/credentials/{id}/approve`.
- **Audit Trail:** An approval record is written to `credential_approval_requests` with the approver’s user ID, timestamp, and optional comments.

#### Step 3: Canonicalization, Cryptographic Hashing & Permanent Lock (Issuance)
When the institution administrator triggers formal issuance (`POST /api/v1/credentials/{id}/issue`), the platform executes the following atomic database transaction:
1. **Canonical JSON Serialization:** The credential data (tenant identity, recipient name/ID, award title, issue date) is structured and ordered deterministically to guarantee reproducible hashing.
2. **SHA-256 Hash Computation:** The backend computes the cryptographic fingerprint of the canonical payload (`hash_algorithm: SHA-256`).
3. **Lookup Reference Generation:** A non-guessable, secure `verification_id` is generated for external lookups.
4. **Permanent State Transition & Immutability:**
   - The credential transitions to `status: issued`.
   - The database enforces that an `issued` record can never return to `draft` or be modified.
   - Any change or correction requires a formal, audited **revocation** or **supersession** workflow.
5. **Event Ledger Entry:** A permanent record is inserted into `credential_events` detailing the issuing actor, issuance timestamp, and calculated hash.

#### Step 4: Document Generation & Storage
- **Asynchronous Queue Dispatch:** A background worker job (`GenerateCredentialDocumentJob`) is dispatched to handle PDF and visual asset rendering.
- **QR & Barcode Encoding:** The credential's secure verification URL or `verification_id` is converted into a standard QR code and barcode.
- **PDF Stamp & Private Storage:** The certificate PDF is generated with the cryptographic hash and QR code, then uploaded to private object storage.
- **Secure Access:** Direct file access is blocked; authorized users may only view or download the document via temporary, signed links generated through `GET /api/v1/credentials/{id}/document`.

#### Step 5: External Verification (Company / Public Lookup)
When an employer, company, or third party receives the credential, they verify it without gaining access to private institution data:
1. **Lookup Submission:**
   - The verifier submits a lookup via `POST /api/v1/verify` (supplying either the `hash`, `verification_id`, or scanned QR code).
   - Alternatively, they scan the QR code to reach `GET /api/v1/verify/{verification_id}`.
2. **Database Verification Engine:**
   - The system searches for the matching hash or verification ID.
   - It confirms record authenticity, issuance integrity, current credential status, and the issuer's institution status.
3. **Privacy-Safe Response:**
   - **VALID:** Returns verification proof, qualification title, award type, issuing institution, and issuance date. Private data (student date of birth, home address, full academic transcripts) is strictly withheld.
   - **REVOKED:** Indicates the credential was formally revoked by the institution, along with the audited reason and revocation date.
   - **SUPERSEDED:** Indicates the award has been replaced by an updated credential.
   - **NOT FOUND:** Indicates no matching record exists or the data has been altered.
4. **Audit & Activity Tracking:** If performed by a registered company, the lookup is logged in `company_verification_logs` for company compliance and audit history.


---

### 2.4 Attendance Architecture & Multi-Phase Rollout

EDUCORE handles attendance across two distinct release phases: **Manual Attendance** in the initial MVP, followed by **Automated Biometric Device Integration** in Release 2.

#### Phase 1 (MVP Attendance): Manual Logging & Auditing

In the MVP release, attendance is recorded directly by authorized staff through the institution dashboard.

* **Role-Based Recording:** Teachers and attendance officers log attendance within their assigned classes, courses, or training batches. Institution admins and registrars also have access to log or view records.
* **Supported Entities:** The system accommodates both formal students (in schools) and trainees or members (in informal institutes and organizations).
* **Data Captured:** Each entry records the `tenant_id`, the person reference (`person_id`), attendance date (`attendance_date`), status (e.g., `present`, `absent`, `late`, `excused`), source (`manual`), and the ID of the staff member logging it (`recorded_by`).
* **Audited Corrections:** If a record needs to be corrected, updates are submitted through `PATCH /api/v1/attendance/{id}`. The system creates an immutable audit trail tracking the modifying user, the reason for the change, and the original value.
* **Reporting & Exports:** Staff and administrators can filter attendance summaries and trends via `GET /api/v1/reports/attendance`. Large export requests are queued as background jobs (`GenerateAttendanceReportJob`) and retrieved securely through temporary signed links to prevent system slowdowns.

#### Phase 2: Biometric Fingerprint Integration

Release 2 introduces hardware-based automated attendance using third-party fingerprint terminals.

##### A. The Biometric Hardware Flow

```
[Student / Trainee Scans Finger]
               │
               ▼
   [Biometric Device Terminal]
   (Matches fingerprint locally or via device gateway)
               │
               ▼ HTTPS (Signed Event Payload)
   POST /api/v1/devices/{device_id}/attendance-events
               │
               ▼
   [EDUCORE Backend Pipeline]
   ├─ 1. Authenticate Device Credentials
   ├─ 2. Resolve Tenant ID (Device cannot pick arbitrary tenant)
   ├─ 3. Deduplicate / Check Replay (`event_id`)
   ├─ 4. Map Device Person Reference ➔ Student ID
   └─ 5. Write to `attendance_records` inside DB Transaction
```

##### B. Key Technical & Security Controls

* **Privacy & Template Protection:** Raw biometric templates and fingerprint images are **never stored** in student records or standard application tables. Matching is handled at the device/terminal level.
* **Identity Mapping Table:** EDUCORE uses an internal `biometric_identity_mappings` table to link the device’s opaque user reference (`device_person_reference`) to the actual tenant-scoped student or member.
* **Event Idempotency & Anti-Replay:** Every check-in event transmits a unique `event_id`. The backend checks `device_events` before inserting a record. If an event is replayed or re-sent during network retries, it is acknowledged without creating duplicate attendance.
* **Dual Timestamps:** The server stores both the `device_timestamp` (when the scan happened at the terminal) and the server receipt timestamp to accurately handle offline queue synchronization when internet connectivity drops.
* **Strict Tenant Boundary:** A device is permanently anchored to its registered tenant. A compromised or misconfigured device cannot submit attendance for students belonging to another school or organization.

---

### 2.5 Delegated Administration, Role-Scoped Workspaces & Real-Time Super Admin Governance

When an institution’s Super Admin (Owner/Admin) assigns roles to staff members, the workflow relies on **role-scoped dashboard views**, **API-enforced permissions**, and **centralized audit logging**.

#### 1. Invitation and Onboarding

* **Invitation Issuance:** The Super Admin invites the user via `POST /api/v1/staff/invitations`, specifying their email and assigned role (e.g., *Registrar*, *Attendance Officer*, *Credential Approver*, *Department Admin*).
* **Membership Creation:** A record is created in `tenant_memberships` linking the user’s ID to the institution’s `tenant_id` with `status: invited` and their specific `role_id`.
* **Account Activation:** The invited user receives an email containing a secure token, sets up their password (and MFA where required), and activates their membership (`status: active`).

#### 2. How Delegated Admins Access Their Assigned Work

When a delegated admin logs into the system, their workspace is dynamically tailored to their role:

* **Context & Permission Hydration:** Upon authentication, the backend reads their active record from `tenant_memberships` and permissions via `GET /api/v1/me` and `GET /api/v1/tenants/current`.
* **Filtered Navigation & UI:** The React frontend displays only the navigation items and action buttons permitted by their role:
  * **Registrars:** See the *Students*, *Courses*, and *Credentials* sections. They have buttons to draft credentials, upload student rosters, or submit awards for approval, but cannot alter institutional billing or tenant settings.
  * **Attendance Officers / Teachers:** See only their assigned classes, groups, or manual attendance entry screens (`POST /api/v1/attendance`).
  * **Credential Approvers:** See a dedicated review queue showing credentials with `status: pending_approval` waiting for validation or rejection.
* **Backend Permission Enforcement:** The frontend navigation is purely convenience; every backend request runs through Laravel Policies and middleware. If an unauthorized admin attempts an API call outside their scope, the server immediately rejects it with a `403 Forbidden`.

#### 3. How the Super Admin Monitors Them from the Dashboard

The Super Admin retains top-level visibility over all activities within their institution through three primary dashboard mechanisms:

##### A. Centralized Overview & Operational Metrics
The Super Admin dashboard aggregates live counters and progress bars showing:
* Total students, trainees, and active staff.
* Pending tasks: Credentials in `draft` vs. `pending_approval` vs. `issued`.
* Daily attendance completion rates across departments or classes.

##### B. Activity & Audit Trails (`audit_logs` & `credential_events`)
Every significant action taken by a delegated admin is automatically recorded with attribution:
* **What is logged:** The actor’s `user_id`, role, action type (e.g., `student.created`, `credential.submitted`, `attendance.corrected`), target resource, and exact timestamp.
* **Traceable Credential Lifecycles:** When a Super Admin inspects a credential via `GET /api/v1/credentials/{id}/events`, they see a complete event timeline:
  * *Drafted by Registrar Jane Doe at 10:15 AM*
  * *Submitted for Approval at 10:30 AM*
  * *Approved by Approver John Smith at 11:00 AM*
  * *Issued & Hashed at 11:05 AM*

##### C. User & Access Management Dashboard
Under the **Users and Roles** tab on the Super Admin dashboard:
* The Super Admin can see every active, invited, suspended, or revoked staff member.
* They can monitor last login timestamps (`last_login_at`) to see who is actively using the system.
* If an employee changes roles, makes errors, or leaves the institution, the Super Admin can instantly modify their role or revoke their membership (`status: revoked`) with a single click, immediately cutting off access to tenant data.

#### 4. Strict Cross-Admin Dashboard Isolation & Sequestration

In accordance with EDUCORE's zero-trust institutional governance, **other admins (sub-admins, instructors, officers) in an organization are strictly prohibited from accessing, viewing, or switching into the dashboards of other administrators or the Super Admin**:

* **Prohibition of Cross-Admin Simulation & Switching:**
  * The administrative simulation/switching controls are exclusively reserved for the primary Super Admin (Account Owner) for audit sandbox testing.
  * For all non-super-admin accounts (Registrars, Credential Approvers, Attendance Officers, Teachers, Department Admins), the user switcher and simulation controls are completely disabled and hidden.
  * A clear security badge (`🔒 ISOLATED ROLE WORKSPACE · ZERO-TRUST`) informs delegated users that cross-admin dashboard viewing is disabled.

* **Workspace & Tab Sequestration Rules:**
  * **Registrars:** Sequestered to *Credential Drafting* (`status: draft`, `pending_approval`), *Student Roster*, and *Curriculum*. They are prohibited from viewing Attendance, Staff Governance, or System Settings.
  * **Credential Approvers:** Sequestered strictly to the *Board Approval Review Queue* (`status: pending_approval`). In accordance with the Two-Person Rule, they cannot draft credentials, manage students, log attendance, or alter institution settings.
  * **Attendance Officers & Teachers:** Sequestered strictly to the *Attendance Workspace* and assigned curriculum. They cannot view student credential drafts, issued diplomas, staff management, or executive metrics.
  * **Super Admin Only Dashboards:** The *Centralized Overview & Metrics* (`overview`), *Staff & Access Governance* (`staff`), and *Governance & Policy Settings* (`settings`) are exclusively accessible by the Super Admin.

* **Class & Cohort Attendance Isolation:**
  * Attendance Officers and Teachers are scoped strictly to their assigned classes/cohorts (`currentUser.assigned_classes`).
  * Attendance records, active rates, and rosters belonging to other instructors are sequestered and not exposed.
  * Manual roll entry dropdowns restrict course selection exclusively to assigned cohorts.

* **Backend Enforcement & HTTP 403 Forbidden Barrier:**
  * If a sub-admin attempts unauthorized URL deep-linking, script traversal, or tab switching outside their permitted workspace, the request is intercepted by the Laravel policy guard and blocked with an immediate `HTTP 403 Forbidden — Dashboard Access Denied` barrier, redirecting the user back to their authorized departmental workspace.

---

## 3. UI/UX Navigation Structure

### Public Navigation
- Home
- Verify Credential
- Schools
- Organizations
- Companies
- About EDUCORE
- Sign In / Register

### School & Informal Dashboard
- Overview / Analytics
- Students & Trainees
- Staff & Instructors
- Courses & Programmes
- Credentials (Issue, Approve, Manage)
- Attendance (Manual)
- Reports & Exports
- Users & Permissions
- Institution Settings

### Organization Dashboard
- Overview / Analytics
- Members
- Programmes & Activities
- Credentials
- Reports
- Users & Settings

### Company Verifier Dashboard
- Overview
- Verify Credential (Instant Hash / Reference)
- Verification History & Batch Logs
- Company Team / Users
- Account Settings

### Platform Administration
- System Overview
- Institution Applications (Review & Approve/Reject)
- Managed Schools & Organizations
- Verified Companies
- Platform Users & Access
- Central Audit Logs
- System Health & Diagnostics
