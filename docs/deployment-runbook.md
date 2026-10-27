# EDUCORE - Deployment & Operations Runbook

---

## 1. Environments & Stacks

### 1.1 Local Development
- **Backend:** Laravel 11 / PHP 8.2+ running on `http://127.0.0.1:8000`
- **Frontend:** React + TypeScript (Vite) running on `http://localhost:5173`
- **Database:** PostgreSQL 15+ (or SQLite in memory for lightweight unit test suites)
- **Cache/Queue:** Redis or sync queue driver during local development

---

## 2. Release Acceptance Checklist

- [ ] **A. Registration & Access:** Schools (traditional/informal), Organizations, and Companies have verified registration endpoints with admin vetting.
- [ ] **B. Multi-Tenancy:** Automated tests verify that User A belonging to Tenant A cannot view or mutate Student B from Tenant B.
- [ ] **C. Credential Pipeline:** Complete `DRAFT → PENDING_APPROVAL → APPROVED → ISSUED` lifecycle with deterministic SHA-256 calculation and QR generation.
- [ ] **D. Company Portal:** Company verifiers can execute batch and single lookups without receiving issuer PII.
- [ ] **E. Revocation & Supersession:** Invalidated credentials immediately yield `REVOKED` or `SUPERSEDED` during verification lookups.
- [ ] **F. Audit Trails:** All state transitions and verification lookups are stamped in immutable log tables.

---

## 3. Disaster Recovery & Security Incident Protocol
- **RPO Target:** < 15 minutes via automated WAL archiving / snapshots.
- **RTO Target:** < 4 hours from disaster declaration to restored service.
- **Log Archival:** Audit logs stored in append-only storage protected from application write/delete privileges.
