<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds for authoritative system roles and permissions.
     * Contains NO mock users or dummy tenants (Clean Slate).
     */
    public function run(): void
    {
        $permissions = [
            // Tenant Operations
            'issue_credentials' => 'Issue and cryptographically seal credentials onto ledger',
            'approve_credentials' => 'Two-person review approval for proposed credentials',
            'manage_students' => 'Enroll and maintain student/member rosters',
            'manage_attendance' => 'Record and correct attendance logs',
            'manage_courses' => 'Create and maintain courses and batch programs',
            'view_audit_logs' => 'Review immutable tenant audit history',
            'manage_admins' => 'Invite and assign role permissions to staff members',
            'manage_settings' => 'Configure institution profile and biometrics',

            // Platform Governance
            'approve_tenants' => 'Review and approve newly registered institutions',
            'suspend_tenants' => 'Suspend non-compliant institutional tenants',
            'manage_platform_admins' => 'Administer root platform security officers',
            'view_global_audit' => 'Inspect universal cross-tenant audit ledger',
            'security_governance' => 'Oversee platform security and root key rotation',
            'manage_registry' => 'Universal accreditation registry maintenance',
        ];

        $createdPermissions = [];
        foreach ($permissions as $key => $description) {
            $createdPermissions[$key] = Permission::firstOrCreate(
                ['key' => $key],
                ['description' => $description]
            );
        }

        // Roles
        $roles = [
            'platform_admin' => [
                'scope' => 'platform',
                'description' => 'Platform Super Administrator with full regulatory authority',
                'permissions' => [
                    'approve_tenants',
                    'suspend_tenants',
                    'manage_platform_admins',
                    'view_global_audit',
                    'security_governance',
                    'manage_registry',
                ],
            ],
            'institution_admin' => [
                'scope' => 'tenant',
                'description' => 'Institutional Rector and Chief Administrative Authority',
                'permissions' => [
                    'issue_credentials',
                    'approve_credentials',
                    'manage_students',
                    'manage_attendance',
                    'manage_courses',
                    'view_audit_logs',
                    'manage_admins',
                    'manage_settings',
                ],
            ],
            'registrar' => [
                'scope' => 'tenant',
                'description' => 'Academic Registrar and Credential Originator',
                'permissions' => [
                    'issue_credentials',
                    'manage_students',
                    'manage_courses',
                    'view_audit_logs',
                ],
            ],
            'credential_approver' => [
                'scope' => 'tenant',
                'description' => 'Governing Council Signatory (Two-Person Approval Rule)',
                'permissions' => [
                    'approve_credentials',
                    'view_audit_logs',
                ],
            ],
            'attendance_officer' => [
                'scope' => 'tenant',
                'description' => 'Attendance Officer & Biometric Device Supervisor',
                'permissions' => [
                    'manage_attendance',
                    'manage_students',
                ],
            ],
            'department_admin' => [
                'scope' => 'tenant',
                'description' => 'Department Head & Academic Coordinator',
                'permissions' => [
                    'manage_students',
                    'manage_courses',
                    'manage_attendance',
                ],
            ],
            'compliance_officer' => [
                'scope' => 'tenant',
                'description' => 'Institutional Internal Auditor and Compliance Officer',
                'permissions' => [
                    'view_audit_logs',
                ],
            ],
            'company_verifier' => [
                'scope' => 'company',
                'description' => 'Corporate Background Investigator & Candidate Verifier',
                'permissions' => [],
            ],
            'student' => [
                'scope' => 'tenant',
                'description' => 'Enrolled Student or Trainee',
                'permissions' => [],
            ],
            'alumnus' => [
                'scope' => 'tenant',
                'description' => 'Graduated Alumnus',
                'permissions' => [],
            ],
        ];

        foreach ($roles as $roleName => $data) {
            $role = Role::firstOrCreate(
                ['name' => $roleName, 'scope' => $data['scope']],
                ['description' => $data['description']]
            );

            $permissionIds = [];
            foreach ($data['permissions'] as $pKey) {
                if (isset($createdPermissions[$pKey])) {
                    $permissionIds[] = $createdPermissions[$pKey]->id;
                }
            }
            $role->permissions()->sync($permissionIds);
        }
    }
}
