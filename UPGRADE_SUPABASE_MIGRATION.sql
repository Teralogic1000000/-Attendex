-- ============================================================================
-- SUPABASE DATABASE UPGRADE MIGRATION
-- Date: March 6, 2026
-- Purpose: Upgrade existing database with missing tables, columns, and views
-- Rules: No drops, no deletes, preserve all existing data
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE MISSING LOOKUP TABLES (IF NOT EXISTS)
-- ============================================================================

-- Attendance_Status lookup table
CREATE TABLE IF NOT EXISTS Attendance_Status (
  Status_ID SERIAL PRIMARY KEY,
  Status_Name TEXT NOT NULL UNIQUE,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance_Method lookup table
CREATE TABLE IF NOT EXISTS Attendance_Method (
  Method_ID SERIAL PRIMARY KEY,
  Method_Name TEXT NOT NULL UNIQUE,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User_Type lookup table
CREATE TABLE IF NOT EXISTS User_Type (
  User_Type_ID SERIAL PRIMARY KEY,
  Type_Name TEXT NOT NULL UNIQUE,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Org_Type lookup table
CREATE TABLE IF NOT EXISTS Org_Type (
  Org_Type_ID SERIAL PRIMARY KEY,
  Type_Name TEXT NOT NULL UNIQUE,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Region lookup table
CREATE TABLE IF NOT EXISTS Region (
  Region_ID SERIAL PRIMARY KEY,
  Region_Name TEXT NOT NULL UNIQUE,
  Country_Code TEXT,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- ============================================================================
-- STEP 2: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add missing columns to Organization table
ALTER TABLE Organization
ADD COLUMN IF NOT EXISTS Org_Type_ID INTEGER,
ADD COLUMN IF NOT EXISTS Region_ID INTEGER,
ADD COLUMN IF NOT EXISTS Num_of_Employee INTEGER DEFAULT 0;

-- Add missing columns to User table
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS User_Type_ID INTEGER,
ADD COLUMN IF NOT EXISTS Device_ID INTEGER;

-- Add missing columns to Attendance table
ALTER TABLE Attendance
ADD COLUMN IF NOT EXISTS Status_ID INTEGER,
ADD COLUMN IF NOT EXISTS Method_ID INTEGER,
ADD COLUMN IF NOT EXISTS Device_ID INTEGER,
ADD COLUMN IF NOT EXISTS Latitude NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS Longitude NUMERIC(11, 8),
ADD COLUMN IF NOT EXISTS IP_Address TEXT;

-- Add missing columns to AuditLog table
ALTER TABLE AuditLog
ADD COLUMN IF NOT EXISTS Action TEXT,
ADD COLUMN IF NOT EXISTS Table_Name TEXT,
ADD COLUMN IF NOT EXISTS Record_ID INTEGER,
ADD COLUMN IF NOT EXISTS Old_Data JSONB,
ADD COLUMN IF NOT EXISTS New_Data JSONB,
ADD COLUMN IF NOT EXISTS IP_Address TEXT;

-- Add missing columns to Department table
ALTER TABLE Department
ADD COLUMN IF NOT EXISTS Status TEXT DEFAULT 'ACTIVE';

-- ============================================================================
-- STEP 3: ADD FOREIGN KEY CONSTRAINTS (IF NOT EXISTS)
-- ============================================================================

-- Organization foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_organization_org_type'
  ) THEN
    ALTER TABLE Organization
    ADD CONSTRAINT fk_organization_org_type
    FOREIGN KEY (Org_Type_ID) REFERENCES Org_Type(Org_Type_ID) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_organization_region'
  ) THEN
    ALTER TABLE Organization
    ADD CONSTRAINT fk_organization_region
    FOREIGN KEY (Region_ID) REFERENCES Region(Region_ID) ON DELETE SET NULL;
  END IF;
END $$;

-- User foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_user_user_type'
  ) THEN
    ALTER TABLE "User"
    ADD CONSTRAINT fk_user_user_type
    FOREIGN KEY (User_Type_ID) REFERENCES User_Type(User_Type_ID) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_user_device'
  ) THEN
    ALTER TABLE "User"
    ADD CONSTRAINT fk_user_device
    FOREIGN KEY (Device_ID) REFERENCES Device(Device_ID) ON DELETE SET NULL;
  END IF;
END $$;

-- Attendance foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_attendance_status'
  ) THEN
    ALTER TABLE Attendance
    ADD CONSTRAINT fk_attendance_status
    FOREIGN KEY (Status_ID) REFERENCES Attendance_Status(Status_ID) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_attendance_method'
  ) THEN
    ALTER TABLE Attendance
    ADD CONSTRAINT fk_attendance_method
    FOREIGN KEY (Method_ID) REFERENCES Attendance_Method(Method_ID) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_attendance_device'
  ) THEN
    ALTER TABLE Attendance
    ADD CONSTRAINT fk_attendance_device
    FOREIGN KEY (Device_ID) REFERENCES Device(Device_ID) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- STEP 4: CREATE INDEXES (IF NOT EXISTS)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_org ON "User"(org_id);
CREATE INDEX IF NOT EXISTS idx_user_active ON "User"(status);
CREATE INDEX IF NOT EXISTS idx_user_type ON "User"(User_Type_ID);

CREATE INDEX IF NOT EXISTS idx_organization_email ON Organization(email);
CREATE INDEX IF NOT EXISTS idx_organization_status ON Organization(status);
CREATE INDEX IF NOT EXISTS idx_organization_type ON Organization(Org_Type_ID);

CREATE INDEX IF NOT EXISTS idx_attendance_user ON Attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_org ON Attendance(org_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON Attendance("date");
CREATE INDEX IF NOT EXISTS idx_attendance_status ON Attendance(Status_ID);
CREATE INDEX IF NOT EXISTS idx_attendance_checkin ON Attendance(check_in);

CREATE INDEX IF NOT EXISTS idx_department_org ON Department(org_id);

CREATE INDEX IF NOT EXISTS idx_device_uuid ON Device(Device_UUID);
CREATE INDEX IF NOT EXISTS idx_device_active ON Device(Is_Active);

CREATE INDEX IF NOT EXISTS idx_subscription_org ON OrganizationSubscription(org_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plan ON OrganizationSubscription(plan_id);

CREATE INDEX IF NOT EXISTS idx_auditlog_user ON AuditLog(user_id);
CREATE INDEX IF NOT EXISTS idx_auditlog_org ON AuditLog(org_id);

-- ============================================================================
-- STEP 5: POPULATE LOOKUP TABLES (AVOID DUPLICATES)
-- ============================================================================

-- Populate Attendance_Status
INSERT INTO Attendance_Status (Status_Name) VALUES
  ('Present'),
  ('Absent'),
  ('Late'),
  ('On_Leave'),
  ('Pending_Approval'),
  ('Rejected')
ON CONFLICT (Status_Name) DO NOTHING;

-- Populate Attendance_Method
INSERT INTO Attendance_Method (Method_Name) VALUES
  ('Face_Recognition'),
  ('Biometric'),
  ('QR_Code'),
  ('RFID'),
  ('Manual'),
  ('Mobile_App'),
  ('Geofence')
ON CONFLICT (Method_Name) DO NOTHING;

-- Populate User_Type
INSERT INTO User_Type (Type_Name) VALUES
  ('Super_Admin'),
  ('Org_Admin'),
  ('Manager'),
  ('Employee'),
  ('Contractor'),
  ('Intern')
ON CONFLICT (Type_Name) DO NOTHING;

-- Populate Org_Type
INSERT INTO Org_Type (Type_Name) VALUES
  ('Corporate'),
  ('SME'),
  ('Startup'),
  ('Non_Profit'),
  ('Government')
ON CONFLICT (Type_Name) DO NOTHING;

-- Populate Region
INSERT INTO Region (Region_Name, Country_Code) VALUES
  ('North_America', 'NA'),
  ('Europe', 'EU'),
  ('Asia_Pacific', 'APAC'),
  ('Middle_East', 'ME'),
  ('Africa', 'AF')
ON CONFLICT (Region_Name) DO NOTHING;

-- ============================================================================
-- STEP 6: CREATE DISPLAY VIEWS (REPLACE IF EXISTS)
-- ============================================================================

-- Attendance Full View (with readable names)
CREATE OR REPLACE VIEW attendance_full_view AS
SELECT
  a.id AS Attend_ID,
  a.user_id AS User_ID,
  COALESCE(u.first_name || ' ' || u.last_name, 'Unknown') AS user_name,
  a.org_id AS Org_ID,
  COALESCE(o.name, 'Unknown') AS org_name,
  a.Device_ID,
  COALESCE(d.Device_Name, 'Unknown') AS device_name,
  COALESCE(s.Status_Name, 'Unknown') AS status_name,
  COALESCE(m.Method_Name, 'Unknown') AS method_name,
  a.check_in AS Check_in_time,
  a.check_out AS Check_out_time,
  a.total_hours AS Total_Hours,
  a.Latitude,
  a.Longitude,
  a.IP_Address,
  a."date" AS attendance_date,
  a.created_at,
  a.updated_at
FROM Attendance a
LEFT JOIN "User" u ON a.user_id = u.id
LEFT JOIN Organization o ON a.org_id = o.id
LEFT JOIN Device d ON a.Device_ID = d.Device_ID
LEFT JOIN Attendance_Status s ON a.Status_ID = s.Status_ID
LEFT JOIN Attendance_Method m ON a.Method_ID = m.Method_ID;

-- User Full View (with readable names)
CREATE OR REPLACE VIEW user_full_view AS
SELECT
  u.id AS User_ID,
  u.first_name AS First_Name,
  u.last_name AS Last_Name,
  u.email AS Email,
  COALESCE(o.name, 'Unknown') AS org_name,
  COALESCE(d.name, 'Unknown') AS department_name,
  COALESCE(ut.Type_Name, 'Unknown') AS user_type_name,
  u.position AS Job_Title,
  u.phone AS Phone_Num,
  u.status AS Is_Active,
  u.created_at,
  u.updated_at
FROM "User" u
LEFT JOIN Organization o ON u.org_id = o.id
LEFT JOIN Department d ON u.department_id = d.id
LEFT JOIN User_Type ut ON u.User_Type_ID = ut.User_Type_ID;

-- Organization Full View (with readable names)
CREATE OR REPLACE VIEW organization_full_view AS
SELECT
  o.id AS Org_ID,
  o.name AS Org_Name,
  COALESCE(ot.Type_Name, 'Unknown') AS Organization_Type,
  COALESCE(r.Region_Name, 'Unknown') AS Region,
  o.size AS Organization_Size,
  COALESCE(o.Num_of_Employee, 0) AS Num_Employees,
  o.email AS Email,
  o.phone AS Phone,
  o.status AS Status,
  o.created_at,
  o.updated_at
FROM Organization o
LEFT JOIN Org_Type ot ON o.Org_Type_ID = ot.Org_Type_ID
LEFT JOIN Region r ON o.Region_ID = r.Region_ID;

-- Department Full View
CREATE OR REPLACE VIEW department_full_view AS
SELECT
  d.id AS Dep_ID,
  d.name AS Depart_Name,
  d.description,
  d.org_id AS Org_ID,
  o.name AS Org_Name,
  d.status AS Status,
  d.created_at,
  d.updated_at
FROM Department d
LEFT JOIN Organization o ON d.org_id = o.id;

-- Shift Full View
CREATE OR REPLACE VIEW shift_full_view AS
SELECT
  s.id AS Shift_ID,
  s.name AS Shift_Name,
  s.start_time AS Start_Time,
  s.end_time AS End_Time,
  s.org_id AS Org_ID,
  o.name AS Org_Name,
  s.status AS Status,
  s.created_at,
  s.updated_at
FROM Shift s
LEFT JOIN Organization o ON s.org_id = o.id;

-- Subscription Plan Full View
CREATE OR REPLACE VIEW subscription_plan_full_view AS
SELECT
  sp.id AS Plan_ID,
  sp.name AS Plan_Name,
  sp.description,
  sp.max_employees AS Max_Employees,
  sp.max_attendance_records AS Max_Records,
  sp.price AS Price,
  sp.interval AS Interval,
  sp.features AS Features,
  sp.created_at,
  sp.updated_at
FROM SubscriptionPlan sp;

-- Subscription Full View
CREATE OR REPLACE VIEW subscription_full_view AS
SELECT
  os.id AS Sub_ID,
  os.org_id AS Org_ID,
  o.name AS Org_Name,
  os.plan_id AS Plan_ID,
  sp.name AS Plan_Name,
  os.status AS Status,
  os.payment_status AS Payment_Status,
  os.start_date AS Start_Date,
  os.next_billing_date AS Next_Billing_Date,
  os.end_date AS End_Date,
  os.created_at,
  os.updated_at
FROM OrganizationSubscription os
LEFT JOIN Organization o ON os.org_id = o.id
LEFT JOIN SubscriptionPlan sp ON os.plan_id = sp.id;

-- ============================================================================
-- STEP 7: DATABASE VERIFICATION QUERIES
-- ============================================================================

-- Count tables created
SELECT 'INSTALLED_TABLES' as check_type, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Count views created
SELECT 'INSTALLED_VIEWS' as check_type, COUNT(*) as count 
FROM information_schema.views 
WHERE table_schema = 'public';

-- Verify lookup data
SELECT 'Attendance_Status_Records' as check_type, COUNT(*) as count FROM Attendance_Status
UNION ALL
SELECT 'Attendance_Method_Records', COUNT(*) FROM Attendance_Method
UNION ALL
SELECT 'User_Type_Records', COUNT(*) FROM User_Type
UNION ALL
SELECT 'Org_Type_Records', COUNT(*) FROM Org_Type
UNION ALL
SELECT 'Region_Records', COUNT(*) FROM Region;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Summary:
-- ✅ All missing lookup tables created
-- ✅ All missing columns added to existing tables
-- ✅ All foreign key constraints added
-- ✅ All indexes created for performance
-- ✅ All lookup data populated
-- ✅ All display views created
-- ✅ No existing data was deleted or dropped
-- ✅ All existing tables preserved
-- ============================================================================
