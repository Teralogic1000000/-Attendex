-- ============================================================================
-- STEP 5: Complete Database Schema Migration for Supabase
-- Created: March 6, 2026
-- Purpose: Create/Update all required tables with proper relationships
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Lookup/Reference Tables (No Dependencies)
-- ============================================================================

-- Attendance_Status table
CREATE TABLE IF NOT EXISTS Attendance_Status (
  Status_ID SERIAL PRIMARY KEY,
  Status_Name TEXT NOT NULL UNIQUE,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default status values if not exists
INSERT INTO Attendance_Status (Status_Name) VALUES
  ('Present'),
  ('Absent'),
  ('Late'),
  ('On_Leave'),
  ('Pending_Approval'),
  ('Rejected')
ON CONFLICT (Status_Name) DO NOTHING;

-- Attendance_Method table
CREATE TABLE IF NOT EXISTS Attendance_Method (
  Method_ID SERIAL PRIMARY KEY,
  Method_Name TEXT NOT NULL UNIQUE,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default method values if not exists
INSERT INTO Attendance_Method (Method_Name) VALUES
  ('Face_Recognition'),
  ('Biometric'),
  ('QR_Code'),
  ('RFID'),
  ('Manual'),
  ('Mobile_App'),
  ('Geofence')
ON CONFLICT (Method_Name) DO NOTHING;

-- User_Type table
CREATE TABLE IF NOT EXISTS User_Type (
  User_Type_ID SERIAL PRIMARY KEY,
  Type_Name TEXT NOT NULL UNIQUE,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default user type values if not exists
INSERT INTO User_Type (Type_Name) VALUES
  ('Super_Admin'),
  ('Org_Admin'),
  ('Manager'),
  ('Employee'),
  ('Contractor'),
  ('Intern')
ON CONFLICT (Type_Name) DO NOTHING;

-- Org_Type table (for organization types)
CREATE TABLE IF NOT EXISTS Org_Type (
  Org_Type_ID SERIAL PRIMARY KEY,
  Type_Name TEXT NOT NULL UNIQUE,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default org type values if not exists
INSERT INTO Org_Type (Type_Name) VALUES
  ('Corporate'),
  ('SME'),
  ('Startup'),
  ('Non_Profit'),
  ('Government')
ON CONFLICT (Type_Name) DO NOTHING;

-- Region table
CREATE TABLE IF NOT EXISTS Region (
  Region_ID SERIAL PRIMARY KEY,
  Region_Name TEXT NOT NULL UNIQUE,
  Country_Code TEXT,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default region values if not exists
INSERT INTO Region (Region_Name, Country_Code) VALUES
  ('North_America', 'NA'),
  ('Europe', 'EU'),
  ('Asia_Pacific', 'APAC'),
  ('Middle_East', 'ME'),
  ('Africa', 'AF')
ON CONFLICT (Region_Name) DO NOTHING;

-- Device table
CREATE TABLE IF NOT EXISTS Device (
  Device_ID SERIAL PRIMARY KEY,
  Device_Name TEXT,
  Device_Model TEXT,
  Device_UUID TEXT UNIQUE,
  Device_Type TEXT,
  OS_Name TEXT,
  OS_Version TEXT,
  IP_Address TEXT,
  Last_Checkin TIMESTAMP,
  Is_Active BOOLEAN DEFAULT TRUE,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for Device table
CREATE INDEX IF NOT EXISTS idx_device_uuid ON Device(Device_UUID);
CREATE INDEX IF NOT EXISTS idx_device_active ON Device(Is_Active);

-- SubscriptionPlan table
CREATE TABLE IF NOT EXISTS SubscriptionPlan (
  Plan_ID SERIAL PRIMARY KEY,
  Plan_Name TEXT NOT NULL UNIQUE,
  Max_Users INTEGER DEFAULT 50,
  Max_Devices INTEGER DEFAULT 10,
  Price_Monthly NUMERIC(10, 2) DEFAULT 0,
  Is_Free BOOLEAN DEFAULT FALSE,
  Duration_Months INTEGER DEFAULT 1,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default plan values if not exists
INSERT INTO SubscriptionPlan (Plan_Name, Max_Users, Max_Devices, Price_Monthly, Is_Free, Duration_Months) VALUES
  ('Free', 5, 2, 0, TRUE, 1),
  ('Basic', 50, 5, 99.99, FALSE, 1),
  ('Professional', 200, 20, 499.99, FALSE, 1),
  ('Enterprise', 999, 999, 2999.99, FALSE, 1)
ON CONFLICT (Plan_Name) DO NOTHING;

-- ============================================================================
-- STEP 2: Create Main Tables (With FK to lookup tables)
-- ============================================================================

-- Organization table
CREATE TABLE IF NOT EXISTS Organization (
  Org_ID SERIAL PRIMARY KEY,
  Org_Name TEXT NOT NULL UNIQUE,
  Org_Slug TEXT UNIQUE,
  Org_Type_ID INTEGER,
  Region_ID INTEGER,
  Num_of_Employee INTEGER DEFAULT 0,
  Phone_Num TEXT,
  Email TEXT UNIQUE,
  Status TEXT DEFAULT 'ACTIVE',
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Org_Type_ID) REFERENCES Org_Type(Org_Type_ID) ON DELETE SET NULL,
  FOREIGN KEY (Region_ID) REFERENCES Region(Region_ID) ON DELETE SET NULL
);

-- Create indexes for Organization table
CREATE INDEX IF NOT EXISTS idx_org_email ON Organization(Email);
CREATE INDEX IF NOT EXISTS idx_org_status ON Organization(Status);
CREATE INDEX IF NOT EXISTS idx_org_type ON Organization(Org_Type_ID);

-- Department table
CREATE TABLE IF NOT EXISTS Department (
  Dep_ID SERIAL PRIMARY KEY,
  Depart_Name TEXT NOT NULL,
  Org_ID INTEGER NOT NULL,
  Status TEXT DEFAULT 'ACTIVE',
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID) ON DELETE CASCADE,
  UNIQUE(Depart_Name, Org_ID)
);

-- Create indexes for Department table
CREATE INDEX IF NOT EXISTS idx_department_org ON Department(Org_ID);

-- Super_Admin table
CREATE TABLE IF NOT EXISTS Super_Admin (
  Super_Admin_ID SERIAL PRIMARY KEY,
  Email TEXT NOT NULL UNIQUE,
  Password TEXT NOT NULL,
  Full_Name TEXT,
  Phone_Num TEXT,
  Is_Active BOOLEAN DEFAULT TRUE,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for Super_Admin table
CREATE INDEX IF NOT EXISTS idx_super_admin_email ON Super_Admin(Email);

-- User table
CREATE TABLE IF NOT EXISTS "User" (
  User_ID SERIAL PRIMARY KEY,
  First_Name TEXT NOT NULL,
  SurName TEXT NOT NULL,
  Email TEXT NOT NULL UNIQUE,
  Password TEXT NOT NULL,
  Org_ID INTEGER,
  Role_ID TEXT,
  User_Type_ID INTEGER,
  Phone_Num TEXT,
  Job_Title TEXT,
  Device_ID INTEGER,
  Depart_ID INTEGER,
  Is_Active BOOLEAN DEFAULT TRUE,
  Last_Login TIMESTAMP,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID) ON DELETE SET NULL,
  FOREIGN KEY (User_Type_ID) REFERENCES User_Type(User_Type_ID) ON DELETE SET NULL,
  FOREIGN KEY (Device_ID) REFERENCES Device(Device_ID) ON DELETE SET NULL,
  FOREIGN KEY (Depart_ID) REFERENCES Department(Dep_ID) ON DELETE SET NULL
);

-- Create indexes for User table
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(Email);
CREATE INDEX IF NOT EXISTS idx_user_org ON "User"(Org_ID);
CREATE INDEX IF NOT EXISTS idx_user_active ON "User"(Is_Active);
CREATE INDEX IF NOT EXISTS idx_user_type ON "User"(User_Type_ID);

-- ============================================================================
-- STEP 3: Create Attendance & Related Tables
-- ============================================================================

-- Geofence table
CREATE TABLE IF NOT EXISTS Geofence (
  Geo_ID SERIAL PRIMARY KEY,
  Org_ID INTEGER NOT NULL,
  Latitude NUMERIC(10, 8) NOT NULL,
  Longitude NUMERIC(11, 8) NOT NULL,
  Radius NUMERIC(10, 2) NOT NULL,
  Name TEXT NOT NULL,
  Is_Active BOOLEAN DEFAULT TRUE,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID) ON DELETE CASCADE,
  UNIQUE(Name, Org_ID)
);

-- Create indexes for Geofence table
CREATE INDEX IF NOT EXISTS idx_geofence_org ON Geofence(Org_ID);
CREATE INDEX IF NOT EXISTS idx_geofence_active ON Geofence(Is_Active);
CREATE INDEX IF NOT EXISTS idx_geofence_location ON Geofence(Latitude, Longitude);

-- Attendance table
CREATE TABLE IF NOT EXISTS Attendance (
  Attend_ID SERIAL PRIMARY KEY,
  User_ID INTEGER NOT NULL,
  user_Name TEXT,
  Org_ID INTEGER NOT NULL,
  Device_ID INTEGER,
  Check_in_time TIMESTAMP,
  Check_out_time TIMESTAMP,
  Status_ID INTEGER,
  Method_ID INTEGER,
  Latitude NUMERIC(10, 8),
  Longitude NUMERIC(11, 8),
  IP_Address TEXT,
  Notes TEXT,
  Total_Hours NUMERIC(10, 2),
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (User_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE,
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID) ON DELETE CASCADE,
  FOREIGN KEY (Device_ID) REFERENCES Device(Device_ID) ON DELETE SET NULL,
  FOREIGN KEY (Status_ID) REFERENCES Attendance_Status(Status_ID) ON DELETE SET NULL,
  FOREIGN KEY (Method_ID) REFERENCES Attendance_Method(Method_ID) ON DELETE SET NULL
);

-- Create indexes for Attendance table
CREATE INDEX IF NOT EXISTS idx_attendance_user ON Attendance(User_ID);
CREATE INDEX IF NOT EXISTS idx_attendance_org ON Attendance(Org_ID);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON Attendance(Check_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON Attendance(Status_ID);

-- Audit_Log table
CREATE TABLE IF NOT EXISTS Audit_Log (
  Log_ID SERIAL PRIMARY KEY,
  UserID INTEGER,
  Org_ID INTEGER,
  Action TEXT NOT NULL,
  Table_Name TEXT,
  Record_ID INTEGER,
  Old_Data JSONB,
  New_Data JSONB,
  IP_Address TEXT,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (UserID) REFERENCES "User"(User_ID) ON DELETE SET NULL,
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID) ON DELETE SET NULL
);

-- Create indexes for Audit_Log table
CREATE INDEX IF NOT EXISTS idx_audit_user ON Audit_Log(UserID);
CREATE INDEX IF NOT EXISTS idx_audit_org ON Audit_Log(Org_ID);
CREATE INDEX IF NOT EXISTS idx_audit_action ON Audit_Log(Action);
CREATE INDEX IF NOT EXISTS idx_audit_date ON Audit_Log(CREATED_AT);

-- ============================================================================
-- STEP 4: Create Subscription Table
-- ============================================================================

-- OrganizationSubscription table
CREATE TABLE IF NOT EXISTS OrganizationSubscription (
  Sub_ID SERIAL PRIMARY KEY,
  Org_ID INTEGER NOT NULL,
  Plan_ID INTEGER NOT NULL,
  Start_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  End_Date TIMESTAMP,
  Status TEXT DEFAULT 'ACTIVE',
  Payment_Status TEXT DEFAULT 'PENDING',
  Amount_Paid NUMERIC(10, 2),
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID) ON DELETE CASCADE,
  FOREIGN KEY (Plan_ID) REFERENCES SubscriptionPlan(Plan_ID) ON DELETE RESTRICT,
  UNIQUE(Org_ID, Plan_ID)
);

-- Create indexes for OrganizationSubscription table
CREATE INDEX IF NOT EXISTS idx_subscription_org ON OrganizationSubscription(Org_ID);
CREATE INDEX IF NOT EXISTS idx_subscription_plan ON OrganizationSubscription(Plan_ID);
CREATE INDEX IF NOT EXISTS idx_subscription_status ON OrganizationSubscription(Status);

-- ============================================================================
-- STEP 5: Add Comments/Documentation to Tables
-- ============================================================================

COMMENT ON TABLE Attendance IS 'Employee attendance records with check-in/out timestamps';
COMMENT ON TABLE Audit_Log IS 'System audit log for tracking all changes and actions';
COMMENT ON TABLE Department IS 'Organization departments';
COMMENT ON TABLE Attendance_Method IS 'Methods of attendance tracking';
COMMENT ON TABLE Attendance_Status IS 'Attendance status values';
COMMENT ON TABLE Device IS 'Registered devices for attendance tracking';
COMMENT ON TABLE User_Type IS 'User type categories';
COMMENT ON TABLE Geofence IS 'Geographic boundaries for location-based attendance';
COMMENT ON TABLE SubscriptionPlan IS 'Subscription plan definitions';
COMMENT ON TABLE Organization IS 'Organization/Company information';
COMMENT ON TABLE OrganizationSubscription IS 'Organization subscription details';
COMMENT ON TABLE Super_Admin IS 'System administrators';
COMMENT ON TABLE "User" IS 'System users';

-- ============================================================================
-- STEP 6: Verify Schema Creation
-- ============================================================================

SELECT * FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name IN (
  'Attendance', 'Audit_Log', 'Department', 'Attendance_Method', 'Attendance_Status',
  'Device', 'User_Type', 'Geofence', 'SubscriptionPlan', 'Organization', 
  'OrganizationSubscription', 'Super_Admin', 'User', 'Org_Type', 'Region'
);
