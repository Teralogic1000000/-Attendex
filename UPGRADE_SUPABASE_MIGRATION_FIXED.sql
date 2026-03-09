-- ============================================================================
-- SUPABASE DATABASE UPGRADE - FIXED WITH QUOTED IDENTIFIERS
-- ============================================================================
-- This script upgrades the existing Supabase database with:
-- 1. Missing lookup tables
-- 2. Missing columns
-- 3. Foreign key constraints
-- 4. Performance indexes
-- 5. Display views for frontend
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE LOOKUP TABLES (if they don't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "Attendance_Status" (
    "Status_ID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Status_Name" VARCHAR(50) UNIQUE NOT NULL,
    "Description" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Attendance_Method" (
    "Method_ID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Method_Name" VARCHAR(100) UNIQUE NOT NULL,
    "Description" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "User_Type" (
    "User_Type_ID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Type_Name" VARCHAR(50) UNIQUE NOT NULL,
    "Description" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Org_Type" (
    "Org_Type_ID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Type_Name" VARCHAR(50) UNIQUE NOT NULL,
    "Description" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Region" (
    "Region_ID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Region_Name" VARCHAR(50) UNIQUE NOT NULL,
    "Description" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Device" (
    "Device_ID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Device_Name" VARCHAR(255),
    "Device_Model" VARCHAR(255),
    "OS_Type" VARCHAR(50),
    "OS_Version" VARCHAR(50),
    "IP_Address" INET,
    "Last_Used" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP
);

-- ============================================================================
-- STEP 2: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

DO $$ BEGIN
    -- Organization table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Organization' AND column_name = 'Org_Type_ID'
    ) THEN
        ALTER TABLE "Organization" ADD COLUMN "Org_Type_ID" UUID;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Organization' AND column_name = 'Region_ID'
    ) THEN
        ALTER TABLE "Organization" ADD COLUMN "Region_ID" UUID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Organization' AND column_name = 'Num_of_Employee'
    ) THEN
        ALTER TABLE "Organization" ADD COLUMN "Num_of_Employee" INT DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Organization' AND column_name = 'logoUrl'
    ) THEN
        ALTER TABLE "Organization" ADD COLUMN "logoUrl" TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Organization' AND column_name = 'theme'
    ) THEN
        ALTER TABLE "Organization" ADD COLUMN "theme" VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Organization' AND column_name = 'size'
    ) THEN
        ALTER TABLE "Organization" ADD COLUMN "size" VARCHAR(50);
    END IF;

    -- User table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'User_Type_ID'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "User_Type_ID" UUID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'Device_ID'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "Device_ID" UUID;
    END IF;

    -- Attendance table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Attendance' AND column_name = 'Status_ID'
    ) THEN
        ALTER TABLE "Attendance" ADD COLUMN "Status_ID" UUID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Attendance' AND column_name = 'Method_ID'
    ) THEN
        ALTER TABLE "Attendance" ADD COLUMN "Method_ID" UUID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Attendance' AND column_name = 'Device_ID'
    ) THEN
        ALTER TABLE "Attendance" ADD COLUMN "Device_ID" UUID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Attendance' AND column_name = 'Latitude'
    ) THEN
        ALTER TABLE "Attendance" ADD COLUMN "Latitude" NUMERIC(10, 8);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Attendance' AND column_name = 'Longitude'
    ) THEN
        ALTER TABLE "Attendance" ADD COLUMN "Longitude" NUMERIC(11, 8);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Attendance' AND column_name = 'IP_Address'
    ) THEN
        ALTER TABLE "Attendance" ADD COLUMN "IP_Address" INET;
    END IF;

    -- AuditLog table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'AuditLog' AND column_name = 'Action'
    ) THEN
        ALTER TABLE "AuditLog" ADD COLUMN "Action" VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'AuditLog' AND column_name = 'Table_Name'
    ) THEN
        ALTER TABLE "AuditLog" ADD COLUMN "Table_Name" VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'AuditLog' AND column_name = 'Record_ID'
    ) THEN
        ALTER TABLE "AuditLog" ADD COLUMN "Record_ID" TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'AuditLog' AND column_name = 'Old_Data'
    ) THEN
        ALTER TABLE "AuditLog" ADD COLUMN "Old_Data" JSONB;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'AuditLog' AND column_name = 'New_Data'
    ) THEN
        ALTER TABLE "AuditLog" ADD COLUMN "New_Data" JSONB;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'AuditLog' AND column_name = 'IP_Address'
    ) THEN
        ALTER TABLE "AuditLog" ADD COLUMN "IP_Address" INET;
    END IF;

    -- Department table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Department' AND column_name = 'status'
    ) THEN
        ALTER TABLE "Department" ADD COLUMN "status" VARCHAR(50) DEFAULT 'active';
    END IF;

END $$;

-- ============================================================================
-- STEP 3: ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

DO $$ BEGIN
    -- Organization -> Org_Type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_organization_org_type'
    ) THEN
        ALTER TABLE "Organization"
            ADD CONSTRAINT "fk_organization_org_type"
            FOREIGN KEY ("Org_Type_ID") REFERENCES "Org_Type"("Org_Type_ID") 
            ON DELETE SET NULL;
    END IF;

    -- Organization -> Region  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_organization_region'
    ) THEN
        ALTER TABLE "Organization"
            ADD CONSTRAINT "fk_organization_region"
            FOREIGN KEY ("Region_ID") REFERENCES "Region"("Region_ID") 
            ON DELETE SET NULL;
    END IF;

    -- User -> User_Type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_user_user_type'
    ) THEN
        ALTER TABLE "User"
            ADD CONSTRAINT "fk_user_user_type"
            FOREIGN KEY ("User_Type_ID") REFERENCES "User_Type"("User_Type_ID") 
            ON DELETE SET NULL;
    END IF;

    -- User -> Device
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_user_device'
    ) THEN
        ALTER TABLE "User"
            ADD CONSTRAINT "fk_user_device"
            FOREIGN KEY ("Device_ID") REFERENCES "Device"("Device_ID") 
            ON DELETE SET NULL;
    END IF;

    -- Attendance -> Attendance_Status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_attendance_status'
    ) THEN
        ALTER TABLE "Attendance"
            ADD CONSTRAINT "fk_attendance_status"
            FOREIGN KEY ("Status_ID") REFERENCES "Attendance_Status"("Status_ID") 
            ON DELETE SET NULL;
    END IF;

    -- Attendance -> Attendance_Method
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_attendance_method'
    ) THEN
        ALTER TABLE "Attendance"
            ADD CONSTRAINT "fk_attendance_method"
            FOREIGN KEY ("Method_ID") REFERENCES "Attendance_Method"("Method_ID") 
            ON DELETE SET NULL;
    END IF;

    -- Attendance -> Device
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_attendance_device'
    ) THEN
        ALTER TABLE "Attendance"
            ADD CONSTRAINT "fk_attendance_device"
            FOREIGN KEY ("Device_ID") REFERENCES "Device"("Device_ID") 
            ON DELETE SET NULL;
    END IF;

END $$;

-- ============================================================================
-- STEP 4: CREATE PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS "idx_device_uuid" ON "Device"("Device_ID");
CREATE INDEX IF NOT EXISTS "idx_device_ip" ON "Device"("IP_Address");
CREATE INDEX IF NOT EXISTS "idx_org_type" ON "Organization"("Org_Type_ID");
CREATE INDEX IF NOT EXISTS "idx_org_region" ON "Organization"("Region_ID");
CREATE INDEX IF NOT EXISTS "idx_user_type" ON "User"("User_Type_ID");
CREATE INDEX IF NOT EXISTS "idx_user_device" ON "User"("Device_ID");
CREATE INDEX IF NOT EXISTS "idx_attendance_status" ON "Attendance"("Status_ID");
CREATE INDEX IF NOT EXISTS "idx_attendance_method" ON "Attendance"("Method_ID");
CREATE INDEX IF NOT EXISTS "idx_attendance_device" ON "Attendance"("Device_ID");
CREATE INDEX IF NOT EXISTS "idx_attendance_date" ON "Attendance"("date");
CREATE INDEX IF NOT EXISTS "idx_attendance_user_org" ON "Attendance"("userId", "orgId");
CREATE INDEX IF NOT EXISTS "idx_department_org" ON "Department"("orgId");
CREATE INDEX IF NOT EXISTS "idx_shift_org" ON "Shift"("orgId");
CREATE INDEX IF NOT EXISTS "idx_organization_name" ON "Organization"("name");
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_auditlog_action" ON "AuditLog"("Action");

-- ============================================================================
-- STEP 5: POPULATE LOOKUP TABLES
-- ============================================================================

INSERT INTO "Attendance_Status" ("Status_Name", "Description") VALUES
    ('Present', 'Employee is present'),
    ('Absent', 'Employee is absent'),
    ('Late', 'Employee arrived late'),
    ('On_Leave', 'Employee is on leave'),
    ('Pending_Approval', 'Attendance pending approval'),
    ('Rejected', 'Attendance record rejected')
ON CONFLICT ("Status_Name") DO NOTHING;

INSERT INTO "Attendance_Method" ("Method_Name", "Description") VALUES
    ('Face_Recognition', 'Facial recognition attendance'),
    ('Biometric', 'Biometric fingerprint or iris scan'),
    ('QR_Code', 'QR code scanning'),
    ('RFID', 'RFID card or tag scan'),
    ('Manual', 'Manually entered by manager'),
    ('Mobile_App', 'Mobile app check-in'),
    ('Geofence', 'Geofence-based automatic check-in')
ON CONFLICT ("Method_Name") DO NOTHING;

INSERT INTO "User_Type" ("Type_Name", "Description") VALUES
    ('Super_Admin', 'System administrator with full access'),
    ('Org_Admin', 'Organization administrator'),
    ('Manager', 'Department or team manager'),
    ('Employee', 'Regular employee'),
    ('Contractor', 'External contractor'),
    ('Intern', 'Intern or trainee')
ON CONFLICT ("Type_Name") DO NOTHING;

INSERT INTO "Org_Type" ("Type_Name", "Description") VALUES
    ('Corporate', 'Large corporate organization'),
    ('SME', 'Small to medium enterprise'),
    ('Startup', 'Early-stage startup'),
    ('Non_Profit', 'Non-profit organization'),
    ('Government', 'Government or public sector')
ON CONFLICT ("Type_Name") DO NOTHING;

INSERT INTO "Region" ("Region_Name", "Description") VALUES
    ('North_America', 'North America region'),
    ('Europe', 'Europe region'),
    ('Asia_Pacific', 'Asia Pacific region'),
    ('Middle_East', 'Middle East region'),
    ('Africa', 'Africa region')
ON CONFLICT ("Region_Name") DO NOTHING;

-- ============================================================================
-- STEP 6: CREATE DISPLAY VIEWS
-- ============================================================================

-- attendance_full_view: Attendance with readable names
DROP VIEW IF EXISTS "attendance_full_view" CASCADE;
CREATE OR REPLACE VIEW "attendance_full_view" AS
SELECT 
    a."id" AS "Attend_ID",
    CONCAT(u."firstName", ' ', u."lastName") AS "user_name",
    o."name" AS "org_name",
    d."Device_Name" AS "device_name",
    s."Status_Name" AS "status_name",
    m."Method_Name" AS "method_name",
    a."checkIn" AS "check_in_time",
    a."checkOut" AS "check_out_time",
    a."totalHours" AS "total_hours",
    a."Latitude" AS "latitude",
    a."Longitude" AS "longitude",
    a."IP_Address" AS "ip_address",
    a."date" AS "attendance_date",
    a."createdAt" AS "created_at",
    a."updatedAt" AS "updated_at"
FROM "Attendance" a
LEFT JOIN "User" u ON a."userId" = u."id"
LEFT JOIN "Organization" o ON a."orgId" = o."id"
LEFT JOIN "Device" d ON a."Device_ID" = d."Device_ID"
LEFT JOIN "Attendance_Status" s ON a."Status_ID" = s."Status_ID"
LEFT JOIN "Attendance_Method" m ON a."Method_ID" = m."Method_ID"
ORDER BY a."date" DESC;

-- user_full_view: User with organization and department
DROP VIEW IF EXISTS "user_full_view" CASCADE;
CREATE OR REPLACE VIEW "user_full_view" AS
SELECT 
    u."id" AS "User_ID",
    u."firstName" AS "First_Name",
    u."lastName" AS "Last_Name",
    u."email" AS "Email",
    u."phone" AS "Phone",
    u."position" AS "Job_Title",
    o."name" AS "org_name",
    d."name" AS "department_name",
    ut."Type_Name" AS "user_type_name",
    u."status" AS "is_active",
    u."createdAt" AS "created_at",
    u."updatedAt" AS "updated_at"
FROM "User" u
LEFT JOIN "Organization" o ON u."orgId" = o."id"
LEFT JOIN "Department" d ON u."departmentId" = d."id"
LEFT JOIN "User_Type" ut ON u."User_Type_ID" = ut."User_Type_ID"
ORDER BY u."firstName", u."lastName";

-- organization_full_view: Organization with type and region
DROP VIEW IF EXISTS "organization_full_view" CASCADE;
CREATE OR REPLACE VIEW "organization_full_view" AS
SELECT 
    o."id" AS "Org_ID",
    o."name" AS "Org_Name",
    ot."Type_Name" AS "organization_type",
    r."Region_Name" AS "region",
    o."size" AS "org_size",
    o."Num_of_Employee" AS "num_employees",
    o."email" AS "email",
    o."phone" AS "phone",
    o."address" AS "address",
    o."industry" AS "industry",
    o."status" AS "status",
    o."logoUrl" AS "logo_url",
    o."theme" AS "theme",
    o."createdAt" AS "created_at",
    o."updatedAt" AS "updated_at"
FROM "Organization" o
LEFT JOIN "Org_Type" ot ON o."Org_Type_ID" = ot."Org_Type_ID"
LEFT JOIN "Region" r ON o."Region_ID" = r."Region_ID"
ORDER BY o."name";

-- department_full_view: Department with organization
DROP VIEW IF EXISTS "department_full_view" CASCADE;
CREATE OR REPLACE VIEW "department_full_view" AS
SELECT 
    d."id" AS "Dept_ID",
    d."name" AS "Department_Name",
    d."description" AS "Description",
    d."head" AS "Department_Head",
    o."name" AS "org_name",
    d."status" AS "status",
    d."createdAt" AS "created_at",
    d."updatedAt" AS "updated_at"
FROM "Department" d
LEFT JOIN "Organization" o ON d."orgId" = o."id"
ORDER BY d."name";

-- shift_full_view: Shift with organization
DROP VIEW IF EXISTS "shift_full_view" CASCADE;
CREATE OR REPLACE VIEW "shift_full_view" AS
SELECT 
    s."id" AS "Shift_ID",
    s."name" AS "Shift_Name",
    s."startTime" AS "start_time",
    s."endTime" AS "end_time",
    o."name" AS "org_name",
    s."status" AS "status",
    s."createdAt" AS "created_at",
    s."updatedAt" AS "updated_at"
FROM "Shift" s
LEFT JOIN "Organization" o ON s."orgId" = o."id"
ORDER BY s."name";

-- subscription_plan_full_view: Subscription plans
DROP VIEW IF EXISTS "subscription_plan_full_view" CASCADE;
CREATE OR REPLACE VIEW "subscription_plan_full_view" AS
SELECT 
    sp."id" AS "Plan_ID",
    sp."name" AS "Plan_Name",
    sp."description" AS "Description",
    sp."features" AS "features",
    sp."price" AS "price",
    sp."createdAt" AS "created_at",
    sp."updatedAt" AS "updated_at"
FROM "SubscriptionPlan" sp
ORDER BY sp."name";

-- subscription_full_view: Organization subscriptions
DROP VIEW IF EXISTS "subscription_full_view" CASCADE;
CREATE OR REPLACE VIEW "subscription_full_view" AS
SELECT 
    os."id" AS "Subscription_ID",
    o."name" AS "org_name",
    sp."name" AS "plan_name",
    os."status" AS "subscription_status",
    os."startDate" AS "start_date",
    os."endDate" AS "end_date",
    os."createdAt" AS "created_at",
    os."updatedAt" AS "updated_at"
FROM "OrganizationSubscription" os
LEFT JOIN "Organization" o ON os."organizationId" = o."id"
LEFT JOIN "SubscriptionPlan" sp ON os."subscriptionPlanId" = sp."id"
ORDER BY o."name";

-- ============================================================================
-- STEP 7: VERIFICATION
-- ============================================================================

-- Tables created
SELECT 'INSTALLED_TABLES' as check_type, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Views created
SELECT 'INSTALLED_VIEWS' as check_type, COUNT(*) as count 
FROM information_schema.views 
WHERE table_schema = 'public';

-- Lookup records
SELECT 'Attendance_Status_Records' as check_type, COUNT(*) as count FROM "Attendance_Status"
UNION ALL
SELECT 'Attendance_Method_Records', COUNT(*) FROM "Attendance_Method"
UNION ALL
SELECT 'User_Type_Records', COUNT(*) FROM "User_Type"
UNION ALL
SELECT 'Org_Type_Records', COUNT(*) FROM "Org_Type"
UNION ALL
SELECT 'Region_Records', COUNT(*) FROM "Region";
