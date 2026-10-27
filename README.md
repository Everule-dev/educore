# EDUCORE - Universal Credential Verification & Trust Infrastructure

[![PHP](https://img.shields.io/badge/PHP-8.2%2B-777BB4?logo=php&logoColor=white)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)]()

EDUCORE is a high-assurance, multi-tenant credential verification and trust infrastructure designed for universities, polytechnics, colleges, faith-based seminaries, professional bodies, and employers.

---

## 🏛️ Core Architecture & Capabilities

1. **Deterministic Cryptographic Hashing**:
   - JSON Canonicalization (lexicographically ordered keys and trimmed whitespace).
   - SHA-256 digital fingerprinting providing immutable mathematical tamper-evidence.

2. **Universal Public Verification**:
   - Instant verification by Non-Guessable Reference ID (`V-XXXX-XXXX`), 64-character SHA-256 Hash, or Camera QR Code Scan.
   - Privacy-safe responses omitting internal student identifiers (NIN, DOB, address).

3. **Strict Multi-Tenancy & Row-Level Partitioning**:
   - Cryptographic tenant boundaries with automated resolution middleware.
   - Unauthorized or spoofed cross-tenant requests are strictly blocked (`403 Forbidden`).

4. **Two-Person Review Signatory Policy**:
   - High-assurance academic awards require dual authorization: an issuing author (Registrar) cannot self-approve their own record; approval must be signed by an independent governing authority (Rector/Senate).

5. **Biometric Hardware Integration**:
   - Hardware terminal enrollment (`/api/v1/biometrics/devices`).
   - 1-to-1 template mapping (`/api/v1/biometrics/mappings`).
   - Live hardware event ingestion and attendance logging (`/api/v1/biometrics/events/ingest`).

6. **Corporate Verifier Auditing**:
   - Dedicated portal for corporate employers and background screening firms to inspect and maintain compliance verification histories without leaking issuer PII.

---

## 📂 Repository Structure

```
Educore/
├── backend/                       # Laravel 11 REST API Backend
│   ├── app/
│   │   ├── Enums/                 # Status & Result Enums (TenantStatus, CredentialStatus, etc.)
│   │   ├── Http/Controllers/Api/  # Auth, Credential, Verification, Biometric, Admin Controllers
│   │   ├── Http/Middleware/       # Multi-tenant context & Role-based Access Middleware
│   │   ├── Models/                # Eloquent Models (Tenant, Credential, Student, User, etc.)
│   │   └── Services/              # CredentialService, VerificationService, TenantResolutionService
│   ├── database/
│   │   ├── migrations/            # Multi-tenant and cryptographic database schema
│   │   └── seeders/               # Authoritative system roles and permissions
│   ├── routes/api.php             # API v1 routes with rate-limiting throttles
│   ├── tests/                     # Cryptographic & Tenancy Unit Test Suites
│   ├── nginx.educore.conf         # Production Nginx reverse-proxy template
│   └── .env.production.example    # Production environment template
├── frontend/                      # React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── app/                   # Root App component and unified state engine
│   │   ├── components/            # Modals, Navbar, Footer, Certificate preview
│   │   ├── features/              # Public, Verification, School, Company, Admin modules
│   │   ├── services/              # Universal API client and client-side cryptographic engine
│   │   └── types.ts               # Complete TypeScript data model definitions
│   ├── package.json
│   └── vite.config.ts
└── docs/                          # Architectural & Security Documentation
    ├── api-specification.md
    ├── database-design.md
    ├── deployment-runbook.md
    ├── product-requirements.md
    └── security-model.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **PHP** >= 8.2 (with `pdo_sqlite` or `pdo_pgsql`, `mbstring`, `openssl`)
- **Composer** >= 2.x
- **Node.js** >= 18.x and **npm**

### 1. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```
Backend API will be live at `http://127.0.0.1:8000/api/v1`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Portal will be live at `http://localhost:5173`.

---

## 🧪 Running the Test Suites

### 1. Cryptographic Unit Test Suite
```bash
php backend/tests/test_credential_engine.php
```

### 2. Comprehensive E2E Lifecycle Suite
Tests complete flow: School Onboarding → Super Admin Approval → Login → Student Roster → Two-Person Approval → Cryptographic Issue → Universal Verification → Revocation.
```bash
node scratch/test_e2e_lifecycle.cjs
```

---

## 🔒 Security & Production Deployment

For production deployment details, SSL configurations, rate limiting, and database clustering guidelines, see [docs/deployment-runbook.md](docs/deployment-runbook.md) and [docs/security-model.md](docs/security-model.md).
