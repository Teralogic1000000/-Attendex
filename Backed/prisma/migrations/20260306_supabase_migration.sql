-- ========================================
-- ATTENDEX DATABASE SCHEMA FOR SUPABASE
-- ========================================
-- PostgreSQL migration script for Supabase
-- Run this in Supabase SQL Editor or via CLI
-- 
-- This script creates all necessary tables with:
-- - Proper primary keys (auto-increment SERIAL)
-- - Foreign key relationships
-- - Indexes for performance
-- - Timestamps and defaults
-- - Constraints

BEGIN;

-- ========================================
-- PHASE 1: Create Lookup/Reference Tables
-- ========================================

-- Attendance Method Lookup Table
CREATE TABLE IF NOT EXISTS attendance_method (
  method_id SERIAL PRIMARY KEY,
  method_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Status Lookup Table
CREATE TABLE IF NOT EXISTS attendance_status (
  status_id SERIAL PRIMARY KEY,
  status_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Type Lookup Table (replaces Role)
CREATE TABLE IF NOT EXISTS user_type (
  user_type_id SERIAL PRIMARY KEY,
  type_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Plan Table
CREATE TABLE IF NOT EXISTS subscription_plan (
  plan_id SERIAL PRIMARY KEY,
  plan_name TEXT UNIQUE NOT NULL,
  description TEXT,
  max_users INTEGER DEFAULT 10,
  max_devices INTEGER DEFAULT 5,
  max_attendance_records INTEGER DEFAULT 1000,
  price_monthly REAL DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  duration_months INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PHASE 2: Create Core Entity Tables
-- ========================================

-- Organization Table
CREATE TABLE IF NOT EXISTS organization (
  org_id SERIAL PRIMARY KEY,
  org_name TEXT NOT NULL,
  org_slug TEXT UNIQUE,
  org_type_id INTEGER,
  region_id INTEGER,
  num_of_employee INTEGER DEFAULT 0,
  phone_num TEXT,
  email TEXT UNIQUE,
  logo_url TEXT,
  theme JSONB,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_user_id INTEGER
);

-- Device Table
CREATE TABLE IF NOT EXISTS device (
  device_id SERIAL PRIMARY KEY,
  device_name TEXT,
  device_model TEXT,
  device_uuid TEXT UNIQUE NOT NULL,
  device_type TEXT,
  os_name TEXT,
  os_version TEXT,
  ip_address TEXT,
  last_checkin TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Department Table
CREATE TABLE IF NOT EXISTS department (
  dep_id SERIAL PRIMARY KEY,
  depart_name TEXT NOT NULL,
  description TEXT,
  head TEXT,
  status TEXT DEFAULT 'ACTIVE',
  org_id INTEGER NOT NULL REFERENCES organization(org_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PHASE 3: Create User Table
-- ========================================

-- User Table
CREATE TABLE IF NOT EXISTS "user" (
  user_id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  surname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  org_id INTEGER REFERENCES organization(org_id) ON DELETE SET NULL,
  role_id INTEGER,
  user_type_id INTEGER REFERENCES user_type(user_type_id),
  phone_num TEXT,
  job_title TEXT,
  device_id INTEGER REFERENCES device(device_id) ON DELETE SET NULL,
  depart_id INTEGER REFERENCES department(dep_id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  refresh_token TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PHASE 4: Create Location & Geo Tables
-- ========================================

-- Geofence Table
CREATE TABLE IF NOT EXISTS geofence (
  geo_id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organization(org_id) ON DELETE CASCADE,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  radius REAL NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PHASE 5: Create Attendance Table
-- ========================================

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  attend_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  org_id INTEGER NOT NULL REFERENCES organization(org_id) ON DELETE CASCADE,
  device_id INTEGER REFERENCES device(device_id) ON DELETE SET NULL,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  total_hours NUMERIC(5, 2),
  status_id INTEGER REFERENCES attendance_status(status_id),
  method_id INTEGER REFERENCES attendance_method(method_id),
  latitude REAL,
  longitude REAL,
  ip_address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, DATE(check_in_time))
);

-- ========================================
-- PHASE 6: Create Subscription Table
-- ========================================

-- Organization Subscription Table
CREATE TABLE IF NOT EXISTS organization_subscription (
  sub_id SERIAL PRIMARY KEY,
  org_id INTEGER UNIQUE NOT NULL REFERENCES organization(org_id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES subscription_plan(plan_id),
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  status TEXT DEFAULT 'Active',
  payment_status TEXT DEFAULT 'PENDING',
  next_billing_date TIMESTAMP,
  cancellation_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PHASE 7: Create Audit & Admin Tables
-- ========================================

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
  log_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES "user"(user_id) ON DELETE SET NULL,
  org_id INTEGER REFERENCES organization(org_id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id INTEGER,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Super Admin Table
CREATE TABLE IF NOT EXISTS super_admin (
  super_admin_id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT,
  phone_num TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  setting_id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  data_type TEXT DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Token Table (for token management)
CREATE TABLE IF NOT EXISTS refresh_token (
  token_id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PHASE 8: Create Indexes for Performance
-- ========================================

-- Attendance Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_org_id ON attendance(org_id);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in ON attendance(check_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(check_in_time::DATE);

-- User Indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_org_id ON "user"(org_id);
CREATE INDEX IF NOT EXISTS idx_user_is_active ON "user"(is_active);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON "user"(created_at DESC);

-- Organization Indexes
CREATE INDEX IF NOT EXISTS idx_organization_email ON organization(email);
CREATE INDEX IF NOT EXISTS idx_organization_status ON organization(status);
CREATE INDEX IF NOT EXISTS idx_organization_created_at ON organization(created_at DESC);

-- Audit Log Indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_org_id ON audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);

-- Geofence Indexes
CREATE INDEX IF NOT EXISTS idx_geofence_org_id ON geofence(org_id);
CREATE INDEX IF NOT EXISTS idx_geofence_active ON geofence(is_active);

-- Department Indexes
CREATE INDEX IF NOT EXISTS idx_department_org_id ON department(org_id);
CREATE INDEX IF NOT EXISTS idx_department_status ON department(status);

-- Device Indexes
CREATE INDEX IF NOT EXISTS idx_device_uuid ON device(device_uuid);
CREATE INDEX IF NOT EXISTS idx_device_active ON device(is_active);

-- Subscription Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_org_id ON organization_subscription(org_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plan_id ON organization_subscription(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_status ON organization_subscription(status);

-- Refresh Token Indexes
CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON refresh_token(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_expires ON refresh_token(expires_at);

-- ========================================
-- PHASE 9: Seed Initial Data
-- ========================================

-- Insert Attendance Methods
INSERT INTO attendance_method (method_name) VALUES
  ('Mobile App'),
  ('Biometric'),
  ('QR Code'),
  ('Web Portal'),
  ('GPS Location')
ON CONFLICT (method_name) DO NOTHING;

-- Insert Attendance Status
INSERT INTO attendance_status (status_name) VALUES
  ('Present'),
  ('Absent'),
  ('Late'),
  ('Leave'),
  ('Work From Home'),
  ('On Leave')
ON CONFLICT (status_name) DO NOTHING;

-- Insert User Types
INSERT INTO user_type (type_name) VALUES
  ('Employee'),
  ('Manager'),
  ('Admin'),
  ('SuperAdmin')
ON CONFLICT (type_name) DO NOTHING;

-- Insert Subscription Plans
INSERT INTO subscription_plan (plan_name, description, max_users, max_devices, max_attendance_records, price_monthly, is_free, duration_months) VALUES
  ('Free Plan', 'Basic plan for small teams', 10, 1, 500, 0, TRUE, 1),
  ('Starter', 'Perfect for growing teams', 50, 5, 5000, 29.99, FALSE, 1),
  ('Professional', 'For mid-sized organizations', 250, 25, 50000, 99.99, FALSE, 1),
  ('Enterprise', 'Unlimited everything', 9999, 500, 9999999, 499.99, FALSE, 1)
ON CONFLICT (plan_name) DO NOTHING;

-- ========================================
-- PHASE 10: Enable Row Level Security (Optional)
-- ========================================
-- Uncomment these to enable RLS for data isolation
/*
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only see their own organization's data
CREATE POLICY user_org_isolation ON "user"
  USING (org_id = (SELECT org_id FROM "user" WHERE user_id = auth.uid()::int));

CREATE POLICY organization_isolation ON organization
  USING (org_id IN (SELECT org_id FROM "user" WHERE user_id = auth.uid()::int));
*/

-- ========================================
-- COMMIT TRANSACTION
-- ========================================
COMMIT;

-- ========================================
-- POST-MIGRATION CHECKS
-- ========================================
-- Run these queries to verify the schema was created correctly:

-- Check all tables created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check foreign key relationships
-- SELECT * FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';

-- Check indexes created
-- SELECT * FROM pg_indexes WHERE schemaname = 'public';

-- Verify lookup data
-- SELECT * FROM attendance_method;
-- SELECT * FROM attendance_status;
-- SELECT * FROM user_type;
-- SELECT * FROM subscription_plan;
