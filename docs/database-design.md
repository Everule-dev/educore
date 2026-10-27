# EDUCORE - Database Design & Schema Specification

**Target DBMS:** PostgreSQL 15+  
**Architecture:** Shared Database, Multi-Tenant Logical Isolation via Tenant IDs & Row-Level Security (RLS)

---

## 1. Schema Conventions
- **Identifiers:** UUID primary keys (`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`) for external safety and horizontal scalability.
- **Timestamps:** `TIMESTAMPTZ` for all date/time fields with UTC normalization.
- **Tenant Context:** All tenant-owned records have `tenant_id UUID REFERENCES tenants(id) ON DELETE RESTRICT`.
- **Hashes:** Fixed-length `VARCHAR(64)` for SHA-256 digests.
- **Audit:** Append-only event logs with immutable foreign references.

---

## 2. Core Tables

### 2.1 Tenancy & Identity

#### `tenants`
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tenant_type VARCHAR(50) NOT NULL CHECK (tenant_type IN ('school', 'organization')),
    institution_type VARCHAR(100) NOT NULL, -- 'traditional', 'vocational', 'culinary', 'ngo', 'professional_body', etc.
    registration_number VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    state VARCHAR(100),
    lga VARCHAR(100),
    country_code VARCHAR(2) DEFAULT 'NG',
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected', 'closed')),
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email_verified_at TIMESTAMPTZ,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'locked', 'disabled')),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### `roles` & `permissions`
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    scope VARCHAR(50) NOT NULL CHECK (scope IN ('platform', 'tenant', 'company')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
```

#### `tenant_memberships`
```sql
CREATE TABLE tenant_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('invited', 'active', 'revoked')),
    invited_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id)
);
```

#### `companies` & `company_memberships`
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    registration_number VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'verifier',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, user_id)
);
```

---

### 2.2 Academic & Record Management

#### `students`, `staff`, `members`
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    student_number VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'withdrawn', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, student_number)
);

CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    staff_number VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, staff_number)
);

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    membership_number VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, membership_number)
);
```

#### `courses`, `academic_periods`, `enrollments`
```sql
CREATE TABLE academic_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    starts_at DATE NOT NULL,
    ends_at DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    course_type VARCHAR(50) DEFAULT 'standard',
    description TEXT,
    credits INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    student_id UUID NOT NULL REFERENCES students(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    academic_period_id UUID REFERENCES academic_periods(id),
    status VARCHAR(50) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2.3 Credential Engine & Lifecycle

```sql
CREATE TABLE credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('student', 'trainee', 'member', 'staff')),
    recipient_id UUID NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    credential_number VARCHAR(100) NOT NULL,
    credential_type VARCHAR(100) NOT NULL, -- 'degree', 'diploma', 'certificate_of_completion', 'membership_award'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    issuer_user_id UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    issued_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'issued', 'revoked', 'superseded')),
    canonical_data_version VARCHAR(20) DEFAULT '1.0',
    hash_algorithm VARCHAR(20) DEFAULT 'SHA-256',
    credential_hash VARCHAR(64),
    verification_id VARCHAR(64) UNIQUE NOT NULL,
    document_path TEXT,
    supersedes_credential_id UUID REFERENCES credentials(id),
    revocation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_credentials_lookup ON credentials (verification_id);
CREATE INDEX idx_credentials_hash ON credentials (credential_hash);
CREATE INDEX idx_credentials_tenant ON credentials (tenant_id);

CREATE TABLE credential_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'created', 'submitted', 'approved', 'issued', 'revoked', 'superseded'
    actor_id UUID REFERENCES users(id),
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2.4 Verification & Audit Logs

```sql
CREATE TABLE verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_id UUID REFERENCES credentials(id) ON DELETE SET NULL,
    lookup_type VARCHAR(50) NOT NULL, -- 'verification_id', 'hash', 'qr_scan'
    lookup_value VARCHAR(255) NOT NULL,
    result VARCHAR(50) NOT NULL, -- 'VALID', 'INVALID', 'REVOKED', 'SUPERSEDED', 'NOT_FOUND'
    requester_category VARCHAR(50) NOT NULL, -- 'public', 'company'
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100),
    target_id UUID,
    payload JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```
