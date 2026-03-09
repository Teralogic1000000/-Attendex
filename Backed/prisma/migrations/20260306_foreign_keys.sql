-- ========================================
-- SUPABASE MIGRATION: FOREIGN KEY RELATIONSHIPS
-- ========================================
-- This file documents all foreign key relationships in the schema

-- RELATIONSHIP DIAGRAM:
/*

┌──────────────────────────────────────────────────────────────┐
│                    REFERENCE TABLES                          │
├──────────────────────────────────────────────────────────────┤
│ • attendance_method (method_id)      5 records               │
│ • attendance_status (status_id)      6 records               │
│ • user_type (user_type_id)           4 records               │
│ • subscription_plan (plan_id)        4 records               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    CORE ENTITIES                             │
├──────────────────────────────────────────────────────────────┤
│ organization (org_id)                                        │
│ device (device_id)                                           │
│ super_admin (super_admin_id)                                 │
└──────────────────────────────────────────────────────────────┘
            ↓                   ↓                    ↓
     ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
     │ department  │    │    user      │    │   geofence   │
     │ (dep_id)    │    │ (user_id)    │    │  (geo_id)    │
     └─────────────┘    └──────────────┘    └──────────────┘
                            ↓        ↓
                      ┌────────────────────┐
                      │    attendance      │
                      │   (attend_id)      │
                      └────────────────────┘
                            ↓
                  ┌─────────────────────┐
                  │   audit_log         │
                  │  (log_id)           │
                  └─────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              SUBSCRIPTION RELATIONSHIPS                      │
├──────────────────────────────────────────────────────────────┤
│ subscription_plan ←→ organization_subscription ←→ organization│
└──────────────────────────────────────────────────────────────┘
*/

-- ========================================
-- FOREIGN KEY DEFINITIONS
-- ========================================

-- 1. DEPARTMENT → ORGANIZATION
-- Many departments belong to one organization
-- Cascade Delete: DELETE organization → DELETE all departments
ALTER TABLE department 
ADD CONSTRAINT fk_department_org 
FOREIGN KEY (org_id) REFERENCES organization(org_id) ON DELETE CASCADE;

-- 2. USER → ORGANIZATION
-- Many users belong to one organization
-- Cascade Delete: DELETE organization → all users marked as inactive
ALTER TABLE "user" 
ADD CONSTRAINT fk_user_org 
FOREIGN KEY (org_id) REFERENCES organization(org_id) ON DELETE SET NULL;

-- 3. USER → DEPARTMENT
-- Many users in one department
-- Cascade Delete: DELETE department → users' depart_id set to NULL
ALTER TABLE "user" 
ADD CONSTRAINT fk_user_department 
FOREIGN KEY (depart_id) REFERENCES department(dep_id) ON DELETE SET NULL;

-- 4. USER → USER_TYPE
-- Many users with one type (Employee, Manager, Admin, SuperAdmin)
-- Cascade Delete: If type is deleted, user type is set to NULL
ALTER TABLE "user" 
ADD CONSTRAINT fk_user_type 
FOREIGN KEY (user_type_id) REFERENCES user_type(user_type_id) ON DELETE SET NULL;

-- 5. USER → DEVICE
-- User's primary device (optional)
-- Cascade Delete: If device is deleted, user's device_id is NULL
ALTER TABLE "user" 
ADD CONSTRAINT fk_user_device 
FOREIGN KEY (device_id) REFERENCES device(device_id) ON DELETE SET NULL;

-- 6. ATTENDANCE → USER
-- Attendance record belongs to one user
-- Cascade Delete: DELETE user → DELETE all attendance records
ALTER TABLE attendance 
ADD CONSTRAINT fk_attendance_user 
FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE;

-- 7. ATTENDANCE → ORGANIZATION
-- Attendance record tracked for one organization
-- Cascade Delete: DELETE organization → DELETE all attendance records
ALTER TABLE attendance 
ADD CONSTRAINT fk_attendance_org 
FOREIGN KEY (org_id) REFERENCES organization(org_id) ON DELETE CASCADE;

-- 8. ATTENDANCE → DEVICE
-- Attendance checked-in from a device (optional)
-- Cascade Delete: Attendance deviceid becomes NULL if device deleted
ALTER TABLE attendance 
ADD CONSTRAINT fk_attendance_device 
FOREIGN KEY (device_id) REFERENCES device(device_id) ON DELETE SET NULL;

-- 9. ATTENDANCE → ATTENDANCE_STATUS
-- Attendance has a status (Present, Absent, Late, etc.)
-- Restrict Delete: Cannot delete status if used in attendance
ALTER TABLE attendance 
ADD CONSTRAINT fk_attendance_status 
FOREIGN KEY (status_id) REFERENCES attendance_status(status_id) ON DELETE RESTRICT;

-- 10. ATTENDANCE → ATTENDANCE_METHOD
-- Attendance tracked using a method (Mobile App, Biometric, QR, etc.)
-- Restrict Delete: Cannot delete method if used in attendance
ALTER TABLE attendance 
ADD CONSTRAINT fk_attendance_method 
FOREIGN KEY (method_id) REFERENCES attendance_method(method_id) ON DELETE RESTRICT;

-- 11. GEOFENCE → ORGANIZATION
-- Geofence zone belongs to one organization
-- Cascade Delete: DELETE organization → DELETE all geofences
ALTER TABLE geofence 
ADD CONSTRAINT fk_geofence_org 
FOREIGN KEY (org_id) REFERENCES organization(org_id) ON DELETE CASCADE;

-- 12. ORGANIZATION_SUBSCRIPTION → ORGANIZATION
-- One subscription per organization (UNIQUE)
-- Cascade Delete: DELETE organization → DELETE subscription
ALTER TABLE organization_subscription 
ADD CONSTRAINT fk_subscription_org 
FOREIGN KEY (org_id) REFERENCES organization(org_id) ON DELETE CASCADE;

-- 13. ORGANIZATION_SUBSCRIPTION → SUBSCRIPTION_PLAN
-- Many subscriptions can use one plan
-- Restrict Delete: Cannot delete plan if in use
ALTER TABLE organization_subscription 
ADD CONSTRAINT fk_subscription_plan 
FOREIGN KEY (plan_id) REFERENCES subscription_plan(plan_id) ON DELETE RESTRICT;

-- 14. AUDIT_LOG → USER
-- Audit log records action performed by a user (optional)
-- Cascade Delete: DELETE user → audit logs kept with NULL user_id
ALTER TABLE audit_log 
ADD CONSTRAINT fk_audit_user 
FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE SET NULL;

-- 15. AUDIT_LOG → ORGANIZATION
-- Audit log records action for an organization (optional)
-- Cascade Delete: DELETE organization → audit logs kept with NULL org_id
ALTER TABLE audit_log 
ADD CONSTRAINT fk_audit_org 
FOREIGN KEY (org_id) REFERENCES organization(org_id) ON DELETE SET NULL;

-- 16. REFRESH_TOKEN → USER
-- Refresh token belongs to one user
-- Cascade Delete: DELETE user → DELETE all refresh tokens
ALTER TABLE refresh_token 
ADD CONSTRAINT fk_refresh_token_user 
FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE;

-- ========================================
-- CASCADE DELETE BEHAVIOR SUMMARY
-- ========================================
/*
CASCADE DELETE (deletes related records):
✓ organization → deletes: departments, users, attendances, geofences, subscriptions
✓ user → deletes: attendance records, refresh tokens
✓ department → deletes: nothing (users just get NULL depart_id)
✓ device → doesn't delete (just NULLifies references)

SET NULL (clears the foreign key):
✓ organization → users (user stays but org_id = NULL)
✓ department → users (user stays but depart_id = NULL)
✓ device → users (user stays but device_id = NULL)
✓ user → audit_log (log kept but user_id = NULL)
✓ organization → audit_log (log kept but org_id = NULL)
✓ user_type → users (user stays but user_type_id = NULL)

RESTRICT (prevents deletion):
✓ attendance_status (used in attendance records)
✓ attendance_method (used in attendance records)
✓ subscription_plan (used in subscriptions)
*/

-- ========================================
-- DATA INTEGRITY CONSTRAINTS
-- ========================================

-- 1. Unique email addresses (per user)
ALTER TABLE "user" ADD CONSTRAINT unique_user_email UNIQUE (email);

-- 2. Unique organization email
ALTER TABLE organization ADD CONSTRAINT unique_org_email UNIQUE (email);

-- 3. Unique device UUID (device identifier)
ALTER TABLE device ADD CONSTRAINT unique_device_uuid UNIQUE (device_uuid);

-- 4. Unique attendance per user per day
ALTER TABLE attendance 
ADD CONSTRAINT unique_attendance_per_day UNIQUE (user_id, DATE(check_in_time));

-- 5. Unique subscription per organization
ALTER TABLE organization_subscription 
ADD CONSTRAINT unique_org_subscription UNIQUE (org_id);

-- 6. Unique method name
ALTER TABLE attendance_method ADD CONSTRAINT unique_method_name UNIQUE (method_name);

-- 7. Unique status name
ALTER TABLE attendance_status ADD CONSTRAINT unique_status_name UNIQUE (status_name);

-- 8. Unique user type name
ALTER TABLE user_type ADD CONSTRAINT unique_user_type UNIQUE (type_name);

-- 9. Unique plan name
ALTER TABLE subscription_plan ADD CONSTRAINT unique_plan_name UNIQUE (plan_name);

-- ========================================
-- CHECK CONSTRAINTS
-- ========================================

-- Employee count cannot be negative
ALTER TABLE organization 
ADD CONSTRAINT check_positive_employees CHECK (num_of_employee >= 0);

-- Geofence radius must be positive
ALTER TABLE geofence 
ADD CONSTRAINT check_positive_radius CHECK (radius > 0);

-- Max users in plan must be positive
ALTER TABLE subscription_plan 
ADD CONSTRAINT check_positive_max_users CHECK (max_users > 0);

-- Max devices in plan must be positive
ALTER TABLE subscription_plan 
ADD CONSTRAINT check_positive_max_devices CHECK (max_devices > 0);

-- Price cannot be negative
ALTER TABLE subscription_plan 
ADD CONSTRAINT check_positive_price CHECK (price_monthly >= 0);

-- Duration months must be positive
ALTER TABLE subscription_plan 
ADD CONSTRAINT check_positive_duration CHECK (duration_months > 0);

-- Check-out must be after check-in (if both exist)
ALTER TABLE attendance 
ADD CONSTRAINT check_valid_times CHECK (check_out_time IS NULL OR check_out_time > check_in_time);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify relationships are correct:

/*
-- Check all foreign keys
SELECT
  con.conname AS constraint_name,
  rel.relname AS table_name,
  att.attname AS column_name,
  con.contype AS constraint_type
FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = con.conkey[1]
WHERE con.contype = 'f'
  AND rel.relname NOT LIKE 'pg%'
ORDER BY rel.relname;

-- Check unique constraints
SELECT
  con.conname AS constraint_name,
  rel.relname AS table_name
FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
WHERE con.contype = 'u'
ORDER BY rel.relname;

-- Check primary keys
SELECT
  con.conname AS constraint_name,
  rel.relname AS table_name
FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
WHERE con.contype = 'p'
ORDER BY rel.relname;
*/
