-- ========================================
-- DATA MIGRATION SCRIPT (From Old to New Schema)
-- ========================================
-- This script migrates data from existing Prisma tables to new Supabase schema
-- 
-- IMPORTANT: 
-- - Run after creating the new schema (20260306_supabase_migration.sql)
-- - Test in development environment first
-- - Backup your database before migration
-- - This assumes UUID IDs from Prisma will Be mapped to new SERIAL IDs

-- ========================================
-- MIGRATION MAPPING
-- ========================================
/*
OLD SCHEMA (Prisma) → NEW SCHEMA (Supabase)

Role table → user_type table
- id (UUID) → user_type_id (SERIAL)
- name (String) → type_name (TEXT)

Organization table
- id (UUID) → org_id (SERIAL)
- name → org_name
- email → email (UNIQUE)
- phone → phone_num
- logoUrl → logo_url
- theme (JSON) → theme (JSONB)
- status → status
- createdAt → created_at
- updatedAt → updated_at (NEW)

User table
- id (UUID) → user_id (SERIAL)
- firstName → first_name
- lastName → surname
- email → email (UNIQUE)
- password → password (hashed)
- orgId → org_id (FK)
- roleId → user_type_id (FK to user_type)
- position → job_title
- departmentId → depart_id (FK)
- shiftId → (REMOVE - no shift in new schema)
- phone → phone_num
- status → is_active (BOOLEAN)
- createdAt → created_at
- updatedAt → updated_at (NEW)
- refreshToken → (moved to refresh_token table)
- lastLogin → last_login (NEW column)

Department table
- id (UUID) → dep_id (SERIAL)
- name → depart_name
- description → description
- head → head
- status → status
- orgId → org_id (FK)
- createdAt → created_at
- updatedAt → updated_at (NEW)

Attendance table
- id (UUID) → attend_id (SERIAL)
- date (DATE) → check_in_time (use as basis)
- checkIn (DateTime) → check_in_time
- checkOut (DateTime) → check_out_time
- totalHours (Float) → total_hours (NUMERIC)
- status (String) → status_id (FK) - map to attendance_status
- ipAddress → ip_address
- userId → user_id (FK)
- orgId → org_id (FK)
- createdAt → created_at
- updatedAt → updated_at (NEW)
- (NEW FIELDS): device_id, method_id, latitude, longitude, notes

Shift table
- id (UUID) → (REMOVE - no shifts in new schema)
- Data may need to be archived for historical reasons

AuditLog table (renamed from audit_log)
- id (UUID) → log_id (SERIAL)
- action → action
- resource → table_name
- resourceId → record_id
- changes (JSON) → old_data (TEXT) + new_data (TEXT)
- reason → reason
- ipAddress → ip_address
- userAgent → user_agent
- orgId → org_id
- userId → user_id
- createdAt → created_at

OrganizationSubscription table
- id (UUID) → sub_id (SERIAL)
- orgId → org_id (FK, UNIQUE)
- planId → plan_id (FK)
- status → status
- startDate → start_date
- endDate → end_date
- nextBillingDate → next_billing_date (NEW)
- paymentStatus → payment_status (NEW)
- cancellationDate → cancellation_date (NEW)
- createdAt → created_at
- updatedAt → updated_at (NEW)
*/

-- ========================================
-- STEP 1: MIGRATE LOOKUP/REFERENCE DATA
-- ========================================

-- Insert User Types from Role table
INSERT INTO user_type (type_name, created_at)
SELECT DISTINCT 
  r.name,
  NOW()
FROM role r
WHERE r.name IS NOT NULL
ON CONFLICT (type_name) DO NOTHING;

-- Venue: After running, verify with:
-- SELECT * FROM user_type;

-- ========================================
-- STEP 2: MIGRATE CORE ENTITIES
-- ========================================

-- Create mapping table for old org IDs to new IDs
CREATE TEMP TABLE org_id_map AS
SELECT 
  old_org.id as old_id,
  new_org.org_id as new_id
FROM organization old_org
JOIN organization new_org ON new_org.org_name = old_org.name;

-- Migrate Organization (if needed - should already exist)
-- This is a reference migration in case needed
/*
INSERT INTO organization (org_name, org_slug, phone_num, email, logo_url, theme, status, created_at)
SELECT 
  o.name,
  LOWER(REPLACE(REPLACE(o.name, ' ', '-'), '.', '')),
  o.phone,
  o.email,
  o.logo_url,
  o.theme,
  COALESCE(o.status, 'ACTIVE'),
  o.created_at
FROM old_organization o
ON CONFLICT (org_id) DO NOTHING;
*/

-- ========================================
-- STEP 3: MIGRATE USERS
-- ========================================

-- Create mapping table for old user IDs to new IDs
CREATE TEMP TABLE user_id_map AS
SELECT DISTINCT
  old_user.id as old_id,
  new_user.user_id as new_id
FROM "user" old_user
JOIN "user" new_user ON new_user.email = old_user.email;

-- Migrate User data
INSERT INTO "user" (first_name, surname, email, password, org_id, user_type_id, phone_num, job_title, depart_id, is_active, last_login, created_at)
SELECT 
  u.first_name,
  u.surname,
  u.email,
  u.password,
  m.new_org_id,
  ut.user_type_id,
  u.phone_num,
  u.job_title,
  d.dep_id,
  CASE WHEN u.status = 'ACTIVE' THEN true ELSE false END,
  u.last_login,
  u.created_at
FROM old_user u
LEFT JOIN org_id_map m ON u.org_id = m.old_id
LEFT JOIN user_type ut ON ut.type_name = (SELECT r.name FROM role r WHERE r.id = u.role_id LIMIT 1)
LEFT JOIN department d ON d.depart_id = (SELECT dep_id FROM department WHERE depart_name = (SELECT name FROM old_department WHERE id = u.department_id LIMIT 1) LIMIT 1)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- STEP 4: MIGRATE DEPARTMENTS
-- ========================================

INSERT INTO department (depart_name, description, head, status, org_id, created_at)
SELECT 
  d.name,
  d.description,
  d.head,
  COALESCE(d.status, 'ACTIVE'),
  m.new_id,
  d.created_at
FROM old_department d
LEFT JOIN org_id_map m ON d.org_id = m.old_id
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 5: MIGRATE ATTENDANCE
-- ========================================

-- Seed default attendance method if not exists
INSERT INTO attendance_method (method_name) VALUES ('Imported') 
ON CONFLICT (method_name) DO NOTHING;

-- Seed default attendance status if not exists
INSERT INTO attendance_status (status_name) VALUES ('Unknown')
ON CONFLICT (status_name) DO NOTHING;

-- Migrate Attendance data
INSERT INTO attendance (user_id, org_id, check_in_time, check_out_time, total_hours, status_id, method_id, ip_address, created_at)
SELECT 
  m.new_user_id,
  old_a.org_id,
  old_a.check_in_time,
  old_a.check_out_time,
  old_a.total_hours,
  COALESCE(
    (SELECT status_id FROM attendance_status WHERE status_name = old_a.status LIMIT 1),
    (SELECT status_id FROM attendance_status WHERE status_name = 'Unknown')
  ),
  COALESCE(
    (SELECT method_id FROM attendance_method WHERE method_name = 'Imported'),
    1
  ),
  old_a.ip_address,
  old_a.created_at
FROM old_attendance old_a
LEFT JOIN user_id_map m ON old_a.user_id = m.old_id
WHERE old_a.user_id IS NOT NULL
ON CONFLICT (user_id, DATE(check_in_time)) DO NOTHING;

-- ========================================
-- STEP 6: MIGRATE SUBSCRIPTIONS
-- ========================================

INSERT INTO organization_subscription (org_id, plan_id, start_date, end_date, status, payment_status, created_at)
SELECT 
  m.new_id,
  sp.plan_id,
  os.start_date,
  os.end_date,
  COALESCE(os.status, 'Active'),
  COALESCE(os.payment_status, 'PENDING'),
  os.created_at
FROM old_organization_subscription os
LEFT JOIN org_id_map m ON os.org_id = m.old_id
LEFT JOIN subscription_plan sp ON sp.plan_name = (SELECT name FROM old_subscription_plan WHERE id = os.plan_id LIMIT 1)
WHERE os.org_id IS NOT NULL
ON CONFLICT (org_id) DO NOTHING;

-- ========================================
-- STEP 7: MIGRATE AUDIT LOGS
-- ========================================

INSERT INTO audit_log (user_id, org_id, action, table_name, record_id, old_data, new_data, ip_address, created_at)
SELECT 
  m.new_id,
  old_a.org_id,
  old_a.action,
  old_a.table_name,
  old_a.record_id,
  old_a.old_data,
  old_a.new_data,
  old_a.ip_address,
  old_a.created_at
FROM old_audit_log old_a
LEFT JOIN user_id_map m ON old_a.user_id = m.old_id
WHERE old_a.created_at IS NOT NULL;

-- ========================================
-- DROP TEMPORARY MAPPING TABLES
-- ========================================

DROP TABLE IF EXISTS org_id_map;
DROP TABLE IF EXISTS user_id_map;

-- ========================================
-- CLEANUP & ARCHIVE OLD TABLES (OPTIONAL)
-- ========================================
-- ONLY DO THIS AFTER VERIFYING MIGRATION WAS SUCCESSFUL

/*
-- Backup original tables first!
-- These are commented to prevent accidental data loss

-- Archive shift data (no longer used)
CREATE TABLE IF NOT EXISTS archive_shift AS SELECT * FROM shift;
DROP TABLE IF EXISTS shift;

-- Archive role table (now using user_type)
CREATE TABLE IF NOT EXISTS archive_role AS SELECT * FROM role;
DROP TABLE IF EXISTS role;

-- Archive old refresh token strategy (now using refresh_token table)
CREATE TABLE IF NOT EXISTS archive_user_refresh_tokens AS
SELECT user_id, refresh_token, created_at FROM "user";

-- Remove old columns from user table
ALTER TABLE "user" DROP COLUMN IF EXISTS refresh_token;
ALTER TABLE "user" DROP COLUMN IF EXISTS shift_id;

*/

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify migration success:

/* 
-- Check organization count
SELECT COUNT(*) as org_count FROM organization;

-- Check user count
SELECT COUNT(*) as user_count FROM "user";

-- Check attendance count
SELECT COUNT(*) as attendance_count FROM attendance;

-- Check department count
SELECT COUNT(*) as dept_count FROM department;

-- Check subscriptions
SELECT COUNT(*) as subscription_count FROM organization_subscription;

-- Check for any orphaned records (users without orgs - should be few)
SELECT COUNT(*) as orphaned_users FROM "user" WHERE org_id IS NULL;

-- Check attendance status distribution
SELECT status_name, COUNT(*) as count 
FROM attendance 
JOIN attendance_status USING (status_id) 
GROUP BY status_name;

-- Check for invalid check-in times (checkout before checkin)
SELECT COUNT(*) as invalid_times 
FROM attendance 
WHERE check_out_time IS NOT NULL AND check_out_time < check_in_time;
*/

-- ========================================
-- ROLLBACK PROCEDURE (if migration failed)
-- ========================================
/*
-- If migration had errors, rollback:
-- 1. Delete all records from new tables (in reverse dependency order)
DELETE FROM refresh_token;
DELETE FROM audit_log;
DELETE FROM attendance;
DELETE FROM geofence;
DELETE FROM organization_subscription;
DELETE FROM "user";
DELETE FROM department;
DELETE FROM organization;
DELETE FROM super_admin;
DELETE FROM system_settings;
DELETE FROM user_type;
DELETE FROM attendance_method;
DELETE FROM attendance_status;
DELETE FROM subscription_plan;
DELETE FROM device;

-- 2. Then restart migration from STEP 1

-- 3. Or restore from database backup if available
*/
