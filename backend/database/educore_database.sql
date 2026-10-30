-- =====================================================================
-- EDUCORE Universal Credential Verification & Trust Infrastructure
-- Production MySQL / MariaDB Schema & Initial Data Dump
-- Generated for cPanel / Shared Hosting / phpMyAdmin Deployment
-- Target Engine: MySQL 8.0+ / MariaDB 10.4+
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- Drop all tables if re-importing (Idempotent Clean Slate)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `attendance_export_jobs`;
DROP TABLE IF EXISTS `attendance_corrections`;
DROP TABLE IF EXISTS `biometric_identity_mappings`;
DROP TABLE IF EXISTS `biometric_devices`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `verification_logs`;
DROP TABLE IF EXISTS `credential_events`;
DROP TABLE IF EXISTS `credentials`;
DROP TABLE IF EXISTS `attendance_records`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `academic_periods`;
DROP TABLE IF EXISTS `members`;
DROP TABLE IF EXISTS `staff`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `company_memberships`;
DROP TABLE IF EXISTS `companies`;
DROP TABLE IF EXISTS `tenant_memberships`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `tenants`;
DROP TABLE IF EXISTS `personal_access_tokens`;
DROP TABLE IF EXISTS `migrations`;

-- ---------------------------------------------------------------------
-- Table structure for `migrations`
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Migrations from 2026_01_01_000001_create_tenants_table.php
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `tenants`;
CREATE TABLE IF NOT EXISTS `tenants` (`id` char(36) not null, `name` varchar(255) not null, `tenant_type` varchar(255) not null, `institution_type` varchar(255) not null, `registration_number` varchar(255) null, `email` varchar(255) not null, `phone` varchar(255) null, `address` text null, `state` varchar(255) null, `lga` varchar(255) null, `country_code` varchar(2) not null default 'NG', `status` varchar(255) not null default 'pending', `approved_at` timestamp null, `approved_by` char(36) null, `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `tenants` add index `tenants_tenant_type_status_index`(`tenant_type`, `status`);

-- ---------------------------------------------------------------------
-- Migrations from 2026_01_01_000002_create_users_table.php
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (`id` char(36) not null, `name` varchar(255) not null, `email` varchar(255) not null, `password` varchar(255) not null, `email_verified_at` timestamp null, `mfa_enabled` tinyint(1) not null default '0', `status` varchar(255) not null default 'active', `last_login_at` timestamp null, `remember_token` varchar(100) null, `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `users` add unique `users_email_unique`(`email`);

-- ---------------------------------------------------------------------
-- Migrations from 2026_01_01_000003_create_roles_and_permissions_table.php
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (`id` char(36) not null, `name` varchar(255) not null, `scope` varchar(255) not null, `description` text null, `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE IF NOT EXISTS `permissions` (`id` char(36) not null, `key` varchar(255) not null, `description` text null, `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `permissions` add unique `permissions_key_unique`(`key`);

DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE IF NOT EXISTS `role_permissions` (`role_id` char(36) not null, `permission_id` char(36) not null, primary key (`role_id`, `permission_id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `role_permissions` add constraint `role_permissions_role_id_foreign` foreign key (`role_id`) references `roles` (`id`) on delete cascade;

alter table `role_permissions` add constraint `role_permissions_permission_id_foreign` foreign key (`permission_id`) references `permissions` (`id`) on delete cascade;

-- ---------------------------------------------------------------------
-- Migrations from 2026_01_01_000004_create_tenant_memberships_table.php
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `tenant_memberships`;
CREATE TABLE IF NOT EXISTS `tenant_memberships` (`id` char(36) not null, `tenant_id` char(36) not null, `user_id` char(36) not null, `role_id` char(36) not null, `status` varchar(255) not null default 'active', `invited_by` char(36) null, `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `tenant_memberships` add constraint `tenant_memberships_tenant_id_foreign` foreign key (`tenant_id`) references `tenants` (`id`) on delete cascade;

alter table `tenant_memberships` add constraint `tenant_memberships_user_id_foreign` foreign key (`user_id`) references `users` (`id`) on delete cascade;

alter table `tenant_memberships` add constraint `tenant_memberships_role_id_foreign` foreign key (`role_id`) references `roles` (`id`);

alter table `tenant_memberships` add unique `tenant_memberships_tenant_id_user_id_unique`(`tenant_id`, `user_id`);

-- ---------------------------------------------------------------------
-- Migrations from 2026_01_01_000005_create_companies_table.php
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `companies`;
CREATE TABLE IF NOT EXISTS `companies` (`id` char(36) not null, `name` varchar(255) not null, `business_type` varchar(255) null, `registration_number` varchar(255) null, `email` varchar(255) not null, `phone` varchar(255) null, `address` text null, `status` varchar(255) not null default 'active', `approved_at` timestamp null, `approved_by` char(36) null, `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

DROP TABLE IF EXISTS `company_memberships`;
CREATE TABLE IF NOT EXISTS `company_memberships` (`id` char(36) not null, `company_id` char(36) not null, `user_id` char(36) not null, `role` varchar(255) not null default 'verifier', `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `company_memberships` add constraint `company_memberships_company_id_foreign` foreign key (`company_id`) references `companies` (`id`) on delete cascade;

alter table `company_memberships` add constraint `company_memberships_user_id_foreign` foreign key (`user_id`) references `users` (`id`) on delete cascade;

alter table `company_memberships` add unique `company_memberships_company_id_user_id_unique`(`company_id`, `user_id`);

-- ---------------------------------------------------------------------
-- Migrations from 2026_01_01_000006_create_students_staff_members_table.php
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE IF NOT EXISTS `students` (`id` char(36) not null, `tenant_id` char(36) not null, `student_number` varchar(255) not null, `first_name` varchar(255) not null, `last_name` varchar(255) not null, `email` varchar(255) null, `date_of_birth` date null, `gender` varchar(20) null, `status` varchar(255) not null default 'active', `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `students` add constraint `students_tenant_id_foreign` foreign key (`tenant_id`) references `tenants` (`id`) on delete restrict;

alter table `students` add unique `students_tenant_id_student_number_unique`(`tenant_id`, `student_number`);

alter table `students` add index `students_tenant_id_status_index`(`tenant_id`, `status`);

DROP TABLE IF EXISTS `staff`;
CREATE TABLE IF NOT EXISTS `staff` (`id` char(36) not null, `tenant_id` char(36) not null, `user_id` char(36) null, `staff_number` varchar(255) not null, `name` varchar(255) not null, `department` varchar(255) null, `designation` varchar(255) null, `status` varchar(255) not null default 'active', `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `staff` add constraint `staff_tenant_id_foreign` foreign key (`tenant_id`) references `tenants` (`id`) on delete restrict;

alter table `staff` add constraint `staff_user_id_foreign` foreign key (`user_id`) references `users` (`id`) on delete set null;

alter table `staff` add unique `staff_tenant_id_staff_number_unique`(`tenant_id`, `staff_number`);

DROP TABLE IF EXISTS `members`;
CREATE TABLE IF NOT EXISTS `members` (`id` char(36) not null, `tenant_id` char(36) not null, `membership_number` varchar(255) not null, `name` varchar(255) not null, `email` varchar(255) null, `phone` varchar(255) null, `status` varchar(255) not null default 'active', `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `members` add constraint `members_tenant_id_foreign` foreign key (`tenant_id`) references `tenants` (`id`) on delete restrict;

alter table `members` add unique `members_tenant_id_membership_number_unique`(`tenant_id`, `membership_number`);

-- ---------------------------------------------------------------------
-- Migrations from 2026_01_01_000007_create_courses_and_enrollments_table.php
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `academic_periods`;
CREATE TABLE IF NOT EXISTS `academic_periods` (`id` char(36) not null, `tenant_id` char(36) not null, `name` varchar(255) not null, `starts_at` date not null, `ends_at` date not null, `status` varchar(255) not null default 'active', `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `academic_periods` add constraint `academic_periods_tenant_id_foreign` foreign key (`tenant_id`) references `tenants` (`id`) on delete cascade;

DROP TABLE IF EXISTS `courses`;
CREATE TABLE IF NOT EXISTS `courses` (`id` char(36) not null, `tenant_id` char(36) not null, `code` varchar(255) not null, `name` varchar(255) not null, `course_type` varchar(255) not null default 'standard', `description` text null, `credits` int not null default '0', `status` varchar(255) not null default 'active', `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `courses` add constraint `courses_tenant_id_foreign` foreign key (`tenant_id`) references `tenants` (`id`) on delete cascade;

alter table `courses` add unique `courses_tenant_id_code_unique`(`tenant_id`, `code`);

DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE IF NOT EXISTS `enrollments` (`id` char(36) not null, `tenant_id` char(36) not null, `student_id` char(36) not null, `course_id` char(36) not null, `academic_period_id` char(36) null, `status` varchar(255) not null default 'enrolled', `completed_at` timestamp null, `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `enrollments` add constraint `enrollments_tenant_id_foreign` foreign key (`tenant_id`) references `tenants` (`id`) on delete cascade;

alter table `enrollments` add constraint `enrollments_student_id_foreign` foreign key (`student_id`) references `students` (`id`) on delete cascade;

alter table `enrollments` add constraint `enrollments_course_id_foreign` foreign key (`course_id`) references `courses` (`id`) on delete cascade;

alter table `enrollments` add constraint `enrollments_academic_period_id_foreign` foreign key (`academic_period_id`) references `academic_periods` (`id`) on delete set null;

DROP TABLE IF EXISTS `attendance_records`;
CREATE TABLE IF NOT EXISTS `attendance_records` (`id` char(36) not null, `tenant_id` char(36) not null, `person_type` varchar(255) not null, `person_id` char(36) not null, `attendance_date` date not null, `status` varchar(255) not null default 'present', `source` varchar(255) not null default 'manual', `recorded_by` char(36) null, `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `attendance_records` add constraint `attendance_records_tenant_id_foreign` foreign key (`tenant_id`) references `tenants` (`id`) on delete cascade;

alter table `attendance_records` add constraint `attendance_records_recorded_by_foreign` foreign key (`recorded_by`) references `users` (`id`);

alter table `attendance_records` add index `attendance_records_tenant_id_attendance_date_index`(`tenant_id`, `attendance_date`);

-- ---------------------------------------------------------------------
-- Migrations from 2026_01_01_000008_create_credentials_and_events_table.php
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `credentials`;
CREATE TABLE IF NOT EXISTS `credentials` (`id` char(36) not null, `tenant_id` char(36) not null, `recipient_type` varchar(255) not null, `recipient_id` char(36) not null, `recipient_name` varchar(255) not null, `credential_number` varchar(255) not null, `credential_type` varchar(255) not null, `title` varchar(255) not null, `description` text null, `issuer_user_id` char(36) not null, `approved_by` char(36) null, `approved_at` timestamp null, `issued_at` timestamp null, `status` varchar(255) not null default 'draft', `canonical_data_version` varchar(255) not null default '1.0', `hash_algorithm` varchar(255) not null default 'SHA-256', `credential_hash` varchar(64) null, `verification_id` varchar(64) not null, `document_path` text null, `supersedes_credential_id` char(36) null, `revocation_reason` text null, `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `credentials` add constraint `credentials_tenant_id_foreign` foreign key (`tenant_id`) references `tenants` (`id`) on delete restrict;

alter table `credentials` add constraint `credentials_issuer_user_id_foreign` foreign key (`issuer_user_id`) references `users` (`id`);

alter table `credentials` add constraint `credentials_approved_by_foreign` foreign key (`approved_by`) references `users` (`id`);

alter table `credentials` add constraint `credentials_supersedes_credential_id_foreign` foreign key (`supersedes_credential_id`) references `credentials` (`id`) on delete set null;

alter table `credentials` add index `credentials_tenant_id_status_index`(`tenant_id`, `status`);

alter table `credentials` add index `credentials_credential_hash_index`(`credential_hash`);

alter table `credentials` add index `credentials_verification_id_index`(`verification_id`);

alter table `credentials` add unique `credentials_verification_id_unique`(`verification_id`);

DROP TABLE IF EXISTS `credential_events`;
CREATE TABLE IF NOT EXISTS `credential_events` (`id` char(36) not null, `credential_id` char(36) not null, `event_type` varchar(255) not null, `actor_id` char(36) null, `reason` text null, `metadata` json null, `created_at` timestamp not null default CURRENT_TIMESTAMP, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `credential_events` add constraint `credential_events_credential_id_foreign` foreign key (`credential_id`) references `credentials` (`id`) on delete cascade;

alter table `credential_events` add constraint `credential_events_actor_id_foreign` foreign key (`actor_id`) references `users` (`id`);

-- ---------------------------------------------------------------------
-- Migrations from 2026_01_01_000009_create_verification_and_audit_logs_table.php
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `verification_logs`;
CREATE TABLE IF NOT EXISTS `verification_logs` (`id` char(36) not null, `credential_id` char(36) null, `lookup_type` varchar(255) not null, `lookup_value` varchar(255) not null, `result` varchar(255) not null, `requester_category` varchar(255) not null, `company_id` char(36) null, `ip_address` varchar(45) null, `user_agent` text null, `created_at` timestamp not null default CURRENT_TIMESTAMP, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `verification_logs` add constraint `verification_logs_credential_id_foreign` foreign key (`credential_id`) references `credentials` (`id`) on delete set null;

alter table `verification_logs` add constraint `verification_logs_company_id_foreign` foreign key (`company_id`) references `companies` (`id`) on delete set null;

alter table `verification_logs` add index `verification_logs_company_id_created_at_index`(`company_id`, `created_at`);

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE IF NOT EXISTS `audit_logs` (`id` char(36) not null, `tenant_id` char(36) null, `user_id` char(36) null, `action` varchar(255) not null, `target_type` varchar(255) null, `target_id` char(36) null, `payload` json null, `ip_address` varchar(45) null, `created_at` timestamp not null default CURRENT_TIMESTAMP, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `audit_logs` add constraint `audit_logs_tenant_id_foreign` foreign key (`tenant_id`) references `tenants` (`id`) on delete set null;

alter table `audit_logs` add constraint `audit_logs_user_id_foreign` foreign key (`user_id`) references `users` (`id`) on delete set null;

alter table `audit_logs` add index `audit_logs_tenant_id_action_index`(`tenant_id`, `action`);

-- ---------------------------------------------------------------------
-- Migrations from 2026_01_01_000010_create_biometrics_and_export_jobs_table.php
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `biometric_devices`;
CREATE TABLE IF NOT EXISTS `biometric_devices` (`id` char(36) not null, `tenant_id` char(36) not null, `device_id` varchar(255) not null, `name` varchar(255) not null, `model` varchar(255) not null default 'ZKTeco BioStation Pro', `location` varchar(255) not null default 'Main Entrance', `firmware_version` varchar(255) not null default 'v2.4.1', `api_key_fingerprint` varchar(255) not null, `status` varchar(255) not null default 'online', `last_heartbeat` timestamp null, `pending_sync_count` int not null default '0', `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `biometric_devices` add constraint `biometric_devices_tenant_id_foreign` foreign key (`tenant_id`) references `tenants` (`id`) on delete cascade;

alter table `biometric_devices` add unique `biometric_devices_tenant_id_device_id_unique`(`tenant_id`, `device_id`);

DROP TABLE IF EXISTS `biometric_identity_mappings`;
CREATE TABLE IF NOT EXISTS `biometric_identity_mappings` (`id` char(36) not null, `tenant_id` char(36) not null, `device_person_reference` varchar(255) not null, `person_id` char(36) not null, `person_name` varchar(255) not null, `person_type` varchar(255) not null default 'student', `enrolled_finger` varchar(255) not null default 'Right Index', `enrolled_at` timestamp not null default CURRENT_TIMESTAMP, `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `biometric_identity_mappings` add constraint `biometric_identity_mappings_tenant_id_foreign` foreign key (`tenant_id`) references `tenants` (`id`) on delete cascade;

alter table `biometric_identity_mappings` add unique `bio_mappings_tenant_device_unique`(`tenant_id`, `device_person_reference`);

DROP TABLE IF EXISTS `attendance_corrections`;
CREATE TABLE IF NOT EXISTS `attendance_corrections` (`id` char(36) not null, `attendance_record_id` char(36) not null, `previous_status` varchar(255) not null, `new_status` varchar(255) not null, `reason` text not null, `modified_by` char(36) not null, `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `attendance_corrections` add constraint `attendance_corrections_attendance_record_id_foreign` foreign key (`attendance_record_id`) references `attendance_records` (`id`) on delete cascade;

alter table `attendance_corrections` add constraint `attendance_corrections_modified_by_foreign` foreign key (`modified_by`) references `users` (`id`);

DROP TABLE IF EXISTS `attendance_export_jobs`;
CREATE TABLE IF NOT EXISTS `attendance_export_jobs` (`id` char(36) not null, `tenant_id` char(36) not null, `requested_by` char(36) not null, `status` varchar(255) not null default 'queued', `filter_summary` varchar(255) not null, `record_count` int not null default '0', `download_url` text null, `expires_at` timestamp null, `created_at` timestamp null, `updated_at` timestamp null, primary key (`id`)) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `attendance_export_jobs` add constraint `attendance_export_jobs_tenant_id_foreign` foreign key (`tenant_id`) references `tenants` (`id`) on delete cascade;

alter table `attendance_export_jobs` add constraint `attendance_export_jobs_requested_by_foreign` foreign key (`requested_by`) references `users` (`id`);

-- ---------------------------------------------------------------------
-- Migrations from 2026_10_16_152558_create_personal_access_tokens_table.php
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (`id` bigint unsigned not null auto_increment primary key, `tokenable_type` varchar(255) not null, `tokenable_id` bigint unsigned not null, `name` text not null, `token` varchar(64) not null, `abilities` text null, `last_used_at` timestamp null, `expires_at` timestamp null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8mb4 collate 'utf8mb4_unicode_ci' engine = InnoDB;

alter table `personal_access_tokens` add index `personal_access_tokens_tokenable_type_tokenable_id_index`(`tokenable_type`, `tokenable_id`);

alter table `personal_access_tokens` add unique `personal_access_tokens_token_unique`(`token`);

alter table `personal_access_tokens` add index `personal_access_tokens_expires_at_index`(`expires_at`);

-- ---------------------------------------------------------------------
-- Seed Laravel migration tracking records
-- ---------------------------------------------------------------------
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_01_01_000001_create_tenants_table', 1) ON DUPLICATE KEY UPDATE `batch` = 1;
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_01_01_000002_create_users_table', 1) ON DUPLICATE KEY UPDATE `batch` = 1;
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_01_01_000003_create_roles_and_permissions_table', 1) ON DUPLICATE KEY UPDATE `batch` = 1;
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_01_01_000004_create_tenant_memberships_table', 1) ON DUPLICATE KEY UPDATE `batch` = 1;
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_01_01_000005_create_companies_table', 1) ON DUPLICATE KEY UPDATE `batch` = 1;
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_01_01_000006_create_students_staff_members_table', 1) ON DUPLICATE KEY UPDATE `batch` = 1;
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_01_01_000007_create_courses_and_enrollments_table', 1) ON DUPLICATE KEY UPDATE `batch` = 1;
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_01_01_000008_create_credentials_and_events_table', 1) ON DUPLICATE KEY UPDATE `batch` = 1;
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_01_01_000009_create_verification_and_audit_logs_table', 1) ON DUPLICATE KEY UPDATE `batch` = 1;
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_01_01_000010_create_biometrics_and_export_jobs_table', 1) ON DUPLICATE KEY UPDATE `batch` = 1;
INSERT INTO `migrations` (`migration`, `batch`) VALUES ('2026_10_16_152558_create_personal_access_tokens_table', 1) ON DUPLICATE KEY UPDATE `batch` = 1;

-- ---------------------------------------------------------------------
-- Seed Core Permissions
-- ---------------------------------------------------------------------
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('5c3dda9a-7a80-452d-96ba-45f445c294ca', 'issue_credentials', 'Issue and cryptographically seal credentials onto ledger', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Issue and cryptographically seal credentials onto ledger';
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('401ff4e2-e2ac-401e-9f46-97df2a6c98e1', 'approve_credentials', 'Two-person review approval for proposed credentials', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Two-person review approval for proposed credentials';
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('f188178c-390c-4529-8b9c-26dda24daa9b', 'manage_students', 'Enroll and maintain student/member rosters', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Enroll and maintain student/member rosters';
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('f9402ced-9131-4dcf-8fc3-4ae08f84c3c4', 'manage_attendance', 'Record and correct attendance logs', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Record and correct attendance logs';
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('f059401e-79e7-49bf-8b8e-f553df579971', 'manage_courses', 'Create and maintain courses and batch programs', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Create and maintain courses and batch programs';
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('5479b784-5979-4da7-adc7-e8b99871caac', 'view_audit_logs', 'Review immutable tenant audit history', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Review immutable tenant audit history';
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('5da40b95-d1d5-49a6-9d33-f5c3316c1709', 'manage_admins', 'Invite and assign role permissions to staff members', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Invite and assign role permissions to staff members';
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('cce4052c-7998-4c4e-80d9-42416083798c', 'manage_settings', 'Configure institution profile and biometrics', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Configure institution profile and biometrics';
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('6991c79e-570d-4633-87fe-5a043b80652b', 'approve_tenants', 'Review and approve newly registered institutions', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Review and approve newly registered institutions';
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('f8b6cf3b-37c8-4303-afbf-f3cb142aa0cf', 'suspend_tenants', 'Suspend non-compliant institutional tenants', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Suspend non-compliant institutional tenants';
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('73086158-105e-497e-8df4-1c9a6612d21e', 'manage_platform_admins', 'Administer root platform security officers', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Administer root platform security officers';
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('45ca19ed-bc65-4c3d-b057-c5bd9186ea9b', 'view_global_audit', 'Inspect universal cross-tenant audit ledger', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Inspect universal cross-tenant audit ledger';
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('cb8fd4cd-9c51-429b-b192-e076fef3b204', 'security_governance', 'Oversee platform security and root key rotation', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Oversee platform security and root key rotation';
INSERT INTO `permissions` (`id`, `key`, `description`, `created_at`, `updated_at`) VALUES ('83d0b8b5-2771-4a10-aa17-c6b0b22c55f3', 'manage_registry', 'Universal accreditation registry maintenance', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Universal accreditation registry maintenance';

-- ---------------------------------------------------------------------
-- Seed Authoritative Roles & Permissions Matrix
-- ---------------------------------------------------------------------
INSERT INTO `roles` (`id`, `name`, `scope`, `description`, `created_at`, `updated_at`) VALUES ('86f65686-edd6-42bd-8819-814c8a5e1b51', 'platform_admin', 'platform', 'Platform Super Administrator with full regulatory authority', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Platform Super Administrator with full regulatory authority';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, '6991c79e-570d-4633-87fe-5a043b80652b' FROM `roles` WHERE name = 'platform_admin';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, 'f8b6cf3b-37c8-4303-afbf-f3cb142aa0cf' FROM `roles` WHERE name = 'platform_admin';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, '73086158-105e-497e-8df4-1c9a6612d21e' FROM `roles` WHERE name = 'platform_admin';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, '45ca19ed-bc65-4c3d-b057-c5bd9186ea9b' FROM `roles` WHERE name = 'platform_admin';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, 'cb8fd4cd-9c51-429b-b192-e076fef3b204' FROM `roles` WHERE name = 'platform_admin';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, '83d0b8b5-2771-4a10-aa17-c6b0b22c55f3' FROM `roles` WHERE name = 'platform_admin';
INSERT INTO `roles` (`id`, `name`, `scope`, `description`, `created_at`, `updated_at`) VALUES ('1ab69e0e-2605-411e-971c-a247f625dc0e', 'institution_admin', 'tenant', 'Institutional Administrator - manages courses, students, and staff', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Institutional Administrator - manages courses, students, and staff';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, 'f188178c-390c-4529-8b9c-26dda24daa9b' FROM `roles` WHERE name = 'institution_admin';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, 'f9402ced-9131-4dcf-8fc3-4ae08f84c3c4' FROM `roles` WHERE name = 'institution_admin';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, 'f059401e-79e7-49bf-8b8e-f553df579971' FROM `roles` WHERE name = 'institution_admin';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, '5479b784-5979-4da7-adc7-e8b99871caac' FROM `roles` WHERE name = 'institution_admin';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, '5da40b95-d1d5-49a6-9d33-f5c3316c1709' FROM `roles` WHERE name = 'institution_admin';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, 'cce4052c-7998-4c4e-80d9-42416083798c' FROM `roles` WHERE name = 'institution_admin';
INSERT INTO `roles` (`id`, `name`, `scope`, `description`, `created_at`, `updated_at`) VALUES ('1f6ed4d4-8f59-4c02-8a4d-cdaadba71620', 'registrar', 'tenant', 'Academic Registrar - authorized to propose credentials and manage student rosters', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Academic Registrar - authorized to propose credentials and manage student rosters';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, '5c3dda9a-7a80-452d-96ba-45f445c294ca' FROM `roles` WHERE name = 'registrar';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, 'f188178c-390c-4529-8b9c-26dda24daa9b' FROM `roles` WHERE name = 'registrar';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, 'f059401e-79e7-49bf-8b8e-f553df579971' FROM `roles` WHERE name = 'registrar';
INSERT INTO `roles` (`id`, `name`, `scope`, `description`, `created_at`, `updated_at`) VALUES ('cb64c1a3-e692-4786-877a-2e182b5ced7f', 'teacher', 'tenant', 'Academic Instructor - records and tracks course attendance', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Academic Instructor - records and tracks course attendance';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, 'f9402ced-9131-4dcf-8fc3-4ae08f84c3c4' FROM `roles` WHERE name = 'teacher';
INSERT INTO `roles` (`id`, `name`, `scope`, `description`, `created_at`, `updated_at`) VALUES ('8e70c9fc-50b5-45f7-8c19-a3e7906fbe69', 'attendance_officer', 'tenant', 'Attendance Compliance Officer - manages biometric terminals and daily attendance rosters', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Attendance Compliance Officer - manages biometric terminals and daily attendance rosters';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, 'f9402ced-9131-4dcf-8fc3-4ae08f84c3c4' FROM `roles` WHERE name = 'attendance_officer';
INSERT INTO `roles` (`id`, `name`, `scope`, `description`, `created_at`, `updated_at`) VALUES ('7b08b6c5-5195-4c7f-a636-ea6b9dabd251', 'credential_approver', 'tenant', 'Designated Signatory / Dean - independent authorization signatory', NOW(), NOW()) ON DUPLICATE KEY UPDATE `description` = 'Designated Signatory / Dean - independent authorization signatory';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, '401ff4e2-e2ac-401e-9f46-97df2a6c98e1' FROM `roles` WHERE name = 'credential_approver';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) SELECT id, '5c3dda9a-7a80-452d-96ba-45f445c294ca' FROM `roles` WHERE name = 'credential_approver';

-- ---------------------------------------------------------------------
-- Seed Default Platform Super Administrator & Governance Authority
-- Email: tredzroyale@gmail.com
-- Password: TredzEducore2026
-- ---------------------------------------------------------------------
INSERT INTO `tenants` (`id`, `name`, `tenant_type`, `institution_type`, `email`, `status`, `approved_at`, `created_at`, `updated_at`) VALUES ('092d233c-95d3-4038-8215-aad9c5797edd', 'EDUCORE Platform Governance', 'organization', 'professional_body', 'tredzroyale@gmail.com', 'active', NOW(), NOW(), NOW()) ON DUPLICATE KEY UPDATE `status` = 'active';
INSERT INTO `users` (`id`, `name`, `email`, `password`, `email_verified_at`, `mfa_enabled`, `status`, `created_at`, `updated_at`) VALUES ('3e9a677f-0776-490c-a6c9-125c1f95f81e', 'Platform Super Administrator', 'tredzroyale@gmail.com', '$2y$12$atopHXslcGNcG.zExGFmoOQYAjENAQ4hJNNMkKgNcCa8KFctmJgQC', NOW(), 1, 'active', NOW(), NOW()) ON DUPLICATE KEY UPDATE `password` = '$2y$12$atopHXslcGNcG.zExGFmoOQYAjENAQ4hJNNMkKgNcCa8KFctmJgQC', `status` = 'active';
INSERT INTO `tenant_memberships` (`id`, `tenant_id`, `user_id`, `role_id`, `status`, `created_at`, `updated_at`) SELECT '60d5b290-1d5a-4d61-824d-1399e04db005', '092d233c-95d3-4038-8215-aad9c5797edd', '3e9a677f-0776-490c-a6c9-125c1f95f81e', id, 'active', NOW(), NOW() FROM `roles` WHERE name = 'platform_admin' LIMIT 1;

SET FOREIGN_KEY_CHECKS = 1;
