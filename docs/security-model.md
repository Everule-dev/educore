# EDUCORE - Security & Multi-Tenancy Architecture

---

## 1. Multi-Tenant Boundary Isolation

### 1.1 Guiding Axiom
**A client-submitted `tenant_id` is never trusted as proof of authorization.**

All queries touching tenant-owned entities (students, courses, credentials, attendance, members) must:
1. Authenticate the user session/token.
2. Resolve the active `tenant_id` from the verified membership context.
3. Automatically apply a global Eloquent scope / query constraint (`WHERE tenant_id = :activeTenantId`).
4. Apply PostgreSQL Row-Level Security (RLS) policies at the database layer where configured.
5. In cross-tenant scenarios (e.g. company verifying a student's diploma), route through the isolated, public-safe `VerificationService` which strips personal identifying information (PII) like date of birth, home address, and internal student IDs.

---

## 2. Cryptographic Integrity & Canonical Hashing

### 2.1 The Issue → Hash → Verify Pipeline
Credentials are not merely saved as static records; they pass through a deterministic canonicalization engine.

```
+----------------------------------------------------------------------+
| 1. CANONICAL PAYLOAD GENERATION                                      |
| Version: 1.0                                                         |
| Keys sorted alphabetically, whitespace normalized, ISO 8601 dates:    |
| {                                                                    |
|   "credential_number": "EDU-APEX-2026-00412",                       |
|   "credential_type": "diploma",                                      |
|   "issued_at": "2026-10-14T21:00:00Z",                               |
|   "issuer_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",              |
|   "recipient_id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",           |
|   "recipient_name": "Emmanuel Okafor",                               |
|   "title": "National Diploma in Software Engineering",               |
|   "version": "1.0"                                                   |
| }                                                                    |
+----------------------------------------------------------------------+
                                  │
                                  ▼
+----------------------------------------------------------------------+
| 2. SHA-256 FINGERPRINT CALCULATION                                  |
| SHA-256( canonical_json ) =                                          |
| a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e    |
+----------------------------------------------------------------------+
                                  │
                                  ▼
+----------------------------------------------------------------------+
| 3. PERSISTENCE & SECURE VERIFICATION ID GENERATION                   |
| Verification ID: V-9982-1204 (Non-guessable random alphanumeric)     |
| Stored with Status = 'issued' in transactional block                 |
+----------------------------------------------------------------------+
```

### 2.2 Tamper Resistance
If any field in the credential is changed post-issuance (e.g., student name altered, grade forged, or issue date modified), re-evaluating the hash immediately flags a cryptographic mismatch (`INVALID`).

---

## 3. Role-Based Access Control (RBAC) Matrix

| Permission / Action | Platform Admin | Institution Admin | Registrar | Teacher / Officer | Company Verifier |
|---|---|---|---|---|---|
| Review Institution Applications | **YES** | NO | NO | NO | NO |
| Manage Tenant Configuration | Audited Support | **YES** | NO | NO | NO |
| Invite & Manage Staff | Audited Support | **YES** | NO | NO | NO |
| Manage Student Roster | Audited Support | **YES** | **YES** | Assigned scope | NO |
| Draft Credential | NO | **YES** | **YES** | NO | NO |
| Submit for Approval | NO | **YES** | **YES** | NO | NO |
| Approve Credential Issuance | NO | **YES** | If delegated | NO | NO |
| Issue / Generate PDF | NO | **YES** | If approved | NO | NO |
| Revoke / Supersede Credential | Audited intervention | **YES** | NO | NO | NO |
| Record Attendance | NO | **YES** | **YES** | **YES** | NO |
| Run Public Verification | **YES** | **YES** | **YES** | **YES** | **YES** |
| Access Verifier History Log | Audited Support | NO | NO | NO | **YES** (Own Company) |

---

## 4. Privacy & Compliance (NDPA 2023)
- **Data Minimization:** Public verification reports show title, issuer, issue date, and recipient display name only.
- **Sensitive Fields:** DOB, home address, National Identification Number (NIN), phone numbers are never returned in public lookups.
- **Audit Logs:** All lookups by companies are logged with IP address, timestamp, and company ID for traceability.
