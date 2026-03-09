/**
 * Database Initialization Script
 * 
 * Creates all necessary tables and seed data for the Supabase database.
 * Run this after setting up Supabase to initialize the schema.
 */

import supabase from './supabaseClient.js'

/**
 * Execute SQL statement via raw SQL
 * Note: This requires a stored procedure or use of Supabase admin API
 */
async function executeSql(sql, label) {
  try {
    console.log(`⏳ ${label}...`)
    
    // Since supabase-js doesn't support raw SQL execution directly,
    // we recommend running SQL in the Supabase Dashboard SQL Editor
    // instead. This script provides the SQL statements to run.
    
    console.log(`✅ ${label}`)
    return true
  } catch (error) {
    console.error(`❌ ${label} failed:`, error.message)
    return false
  }
}

/**
 * Get SQL statements for table creation
 */
function getSqlStatements() {
  return [
    // Lookup Tables
    `
    CREATE TABLE IF NOT EXISTS attendance_method (
      method_id SERIAL PRIMARY KEY,
      method_name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS attendance_status (
      status_id SERIAL PRIMARY KEY,
      status_name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS user_type (
      user_type_id SERIAL PRIMARY KEY,
      type_name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // Organization Tables
    `
    CREATE TABLE IF NOT EXISTS organization (
      org_id SERIAL PRIMARY KEY,
      org_name TEXT NOT NULL,
      org_slug TEXT UNIQUE,
      org_type_id INTEGER,
      region_id INTEGER,
      num_of_employee INTEGER DEFAULT 0,
      phone_num TEXT,
      email TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // Device Table
    `
    CREATE TABLE IF NOT EXISTS device (
      device_id SERIAL PRIMARY KEY,
      device_name TEXT,
      device_model TEXT,
      device_uuid TEXT UNIQUE,
      device_type TEXT,
      os_name TEXT,
      os_version TEXT,
      ip_address TEXT,
      last_checkin TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // Department Table
    `
    CREATE TABLE IF NOT EXISTS department (
      dep_id SERIAL PRIMARY KEY,
      depart_name TEXT NOT NULL,
      org_id INTEGER NOT NULL REFERENCES organization(org_id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // User Table
    `
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
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // Geofence Table
    `
    CREATE TABLE IF NOT EXISTS geofence (
      geo_id SERIAL PRIMARY KEY,
      org_id INTEGER NOT NULL REFERENCES organization(org_id) ON DELETE CASCADE,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      radius REAL NOT NULL,
      name TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // Attendance Table
    `
    CREATE TABLE IF NOT EXISTS attendance (
      attend_id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
      org_id INTEGER NOT NULL REFERENCES organization(org_id) ON DELETE CASCADE,
      device_id INTEGER REFERENCES device(device_id),
      check_in_time TIMESTAMP,
      check_out_time TIMESTAMP,
      status_id INTEGER REFERENCES attendance_status(status_id),
      method_id INTEGER REFERENCES attendance_method(method_id),
      latitude REAL,
      longitude REAL,
      ip_address TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, DATE(check_in_time))
    );
    `,
    
    // Subscription Plan Table
    `
    CREATE TABLE IF NOT EXISTS subscription_plan (
      plan_id SERIAL PRIMARY KEY,
      plan_name TEXT UNIQUE NOT NULL,
      max_users INTEGER DEFAULT 10,
      max_devices INTEGER DEFAULT 5,
      price_monthly REAL DEFAULT 0,
      is_free BOOLEAN DEFAULT false,
      duration_months INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // Organization Subscription Table
    `
    CREATE TABLE IF NOT EXISTS organization_subscription (
      sub_id SERIAL PRIMARY KEY,
      org_id INTEGER UNIQUE NOT NULL REFERENCES organization(org_id) ON DELETE CASCADE,
      plan_id INTEGER NOT NULL REFERENCES subscription_plan(plan_id),
      start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_date TIMESTAMP,
      status TEXT DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // Audit Log Table
    `
    CREATE TABLE IF NOT EXISTS audit_log (
      log_id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES "user"(user_id) ON DELETE SET NULL,
      org_id INTEGER REFERENCES organization(org_id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id INTEGER,
      old_data TEXT,
      new_data TEXT,
      ip_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // Super Admin Table
    `
    CREATE TABLE IF NOT EXISTS super_admin (
      super_admin_id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT,
      phone_num TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
  ]
}

/**
 * Get seed data SQL statements
 */
function getSeedStatements() {
  return [
    `
    INSERT INTO attendance_method (method_name) VALUES
      ('Mobile App'),
      ('Biometric'),
      ('QR Code'),
      ('Web Portal'),
      ('GPS Location')
    ON CONFLICT (method_name) DO NOTHING;
    `,
    `
    INSERT INTO attendance_status (status_name) VALUES
      ('Present'),
      ('Absent'),
      ('Late'),
      ('Leave'),
      ('Work From Home'),
      ('On Leave')
    ON CONFLICT (status_name) DO NOTHING;
    `,
    `
    INSERT INTO user_type (type_name) VALUES
      ('Employee'),
      ('Manager'),
      ('Admin'),
      ('SuperAdmin')
    ON CONFLICT (type_name) DO NOTHING;
    `,
    `
    INSERT INTO subscription_plan (plan_name, max_users, max_devices, price_monthly, is_free, duration_months) VALUES
      ('Free Plan', 10, 1, 0, true, 1),
      ('Starter', 50, 5, 29.99, false, 1),
      ('Professional', 250, 25, 99.99, false, 1),
      ('Enterprise', 9999, 500, 499.99, false, 1)
    ON CONFLICT (plan_name) DO NOTHING;
    `,
  ]
}

/**
 * Generate SQL script file content
 */
export function generateSqlScript() {
  const statements = getSqlStatements()
  const seedStatements = getSeedStatements()
  
  const fullScript = `
-- ========================================
-- ATTENDEX DATABASE SCHEMA - Supabase
-- ========================================
-- Generated for Supabase PostgreSQL
-- Run this script in the Supabase SQL Editor

-- STEP 1: Create Tables
-- ========================================
${statements.join('\n')}

-- STEP 2: Seed Lookup Data
-- ========================================
${seedStatements.join('\n')}

-- STEP 3: Create Indexes
-- ========================================
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_org_id ON attendance(org_id);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance(created_at);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_org_id ON "user"(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_org_id ON audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_geofence_org_id ON geofence(org_id);

-- ========================================
-- Setup Complete!
-- ========================================
-- All tables have been created and seeded.
-- Next: Update your application code to use Supabase queries.
`
  
  return fullScript
}

/**
 * Print setup instructions
 */
export function printSetupInstructions() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║         SUPABASE DATABASE INITIALIZATION SCRIPT              ║
╚══════════════════════════════════════════════════════════════╝

⚠️  IMPORTANT: This script generates SQL for manual execution.

📋 STEPS:
  1. Copy the SQL from SUPABASE_INIT.sql (generated below)
  2. Go to Supabase Dashboard → SQL Editor
  3. Paste the entire SQL script
  4. Click "RUN" button
  5. Verify all tables are created

💡 TABLES TO BE CREATED:
  ✓ Lookup Tables:     attendance_method, attendance_status, user_type
  ✓ Core Tables:       organization, user, department, device
  ✓ Data Tables:       attendance, geofence, organization_subscription
  ✓ Admin Tables:      super_admin, audit_log
  ✓ Subscription:      subscription_plan

📊 INDEXES CREATED:
  ✓ For faster queries on frequently filtered columns

🔐 SECURITY:
  ✓ Foreign key constraints enabled
  ✓ Cascade delete configured
  ✓ Unique constraints applied

✅ NEXT STEPS:
  1. Create the SQL file: node initializeDb.js > SUPABASE_INIT.sql
  2. Run in Supabase SQL Editor
  3. Update your controllers to use Supabase client
  4. Test the API endpoints

📚 REFERENCE:
  - See SUPABASE_SETUP_GUIDE.md for detailed instructions
  - See SCHEMA_MIGRATION_ANALYSIS.md for schema details
`)
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  printSetupInstructions()
  
  const sqlScript = generateSqlScript()
  console.log('\n' + '='.repeat(60))
  console.log('SQL SCRIPT GENERATED')
  console.log('='.repeat(60) + '\n')
  console.log(sqlScript)
  console.log('\n' + '='.repeat(60))
  console.log('Save this to a file and run in Supabase SQL Editor')
  console.log('='.repeat(60))
}

export default {
  getSqlStatements,
  getSeedStatements,
  generateSqlScript,
  printSetupInstructions,
}
