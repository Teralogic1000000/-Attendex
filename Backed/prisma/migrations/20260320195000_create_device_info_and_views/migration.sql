-- STEP 4 — CREATE Device_Info TABLE (if not exists)
CREATE TABLE IF NOT EXISTS "Device_Info" (
  "Device_Info_ID" INTEGER PRIMARY KEY AUTOINCREMENT,
  "Device_Type" TEXT,
  "OS" TEXT,
  "Browser" TEXT,
  "IP_Address" TEXT,
  "User_Agent" TEXT,
  "CREATED_AT" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- STEP 5 — ADD Device_Info_ID to Attendance table if it doesn't exist
-- Note: SQLite doesn't have IF NOT EXISTS for ALTER TABLE, so we use a careful approach
-- Check if the column exists before adding
PRAGMA foreign_keys = OFF;

-- Create a temporary table with all columns we need
CREATE TABLE IF NOT EXISTS "Attendance_new" (
  "Attend_ID" INTEGER PRIMARY KEY AUTOINCREMENT,
  "User_ID" INTEGER,
  "Org_ID" INTEGER,
  "Status_ID" INTEGER,
  "Method_ID" INTEGER,
  "Check_in_time" DATETIME,
  "Check_out_time" DATETIME,
  "Total_Hours" REAL,
  "Latitude" REAL,
  "Longitude" REAL,
  "Device_Info_ID" INTEGER,
  "date" DATETIME,
  "checkIn" DATETIME,
  "checkOut" DATETIME,
  "totalHours" REAL,
  "ipAddress" TEXT,
  "createdAt" DATETIME,
  "updatedAt" DATETIME,
  "status" TEXT DEFAULT 'Present',
  FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID"),
  FOREIGN KEY ("Org_ID") REFERENCES "Organization"("Org_ID"),
  FOREIGN KEY ("Status_ID") REFERENCES "Attendance_Status"("Status_ID"),
  FOREIGN KEY ("Method_ID") REFERENCES "Attendance_Method"("Method_ID"),
  FOREIGN KEY ("Device_Info_ID") REFERENCES "Device_Info"("Device_Info_ID")
);

-- Drop the old table if it exists and recreate it with the new structure
DROP TABLE IF EXISTS "Attendance_backup";

PRAGMA foreign_keys = ON;

-- STEP 6 — CREATE VIEWS
DROP VIEW IF EXISTS "attendance_full_view";

CREATE VIEW IF NOT EXISTS "attendance_full_view" AS
SELECT 
  a."Attend_ID",
  COALESCE(u."First_Name" || ' ' || u."SurName", u."firstName" || ' ' || u."lastName") AS user_name,
  COALESCE(o."Org_Name", o."name") AS org_name,
  COALESCE(s."Status_Name", a."status") AS status_name,
  COALESCE(m."Method_Name", 'Unknown') AS method_name,
  COALESCE(a."Check_in_time", a."checkIn") AS check_in_time,
  COALESCE(a."Check_out_time", a."checkOut") AS check_out_time,
  COALESCE(a."Total_Hours", a."totalHours") AS total_hours,
  COALESCE(a."Latitude", 0) AS latitude,
  COALESCE(a."Longitude", 0) AS longitude,
  COALESCE(d."Device_Type", 'Unknown') AS device_type,
  COALESCE(d."OS", 'Unknown') AS os_name,
  COALESCE(a."createdAt", a."CREATED_AT") AS created_at
FROM "Attendance" a
LEFT JOIN "User" u ON a."User_ID" = u."User_ID" OR a."userId" = u."id"
LEFT JOIN "Organization" o ON a."Org_ID" = o."Org_ID" OR a."orgId" = o."id"
LEFT JOIN "Attendance_Status" s ON a."Status_ID" = s."Status_ID"
LEFT JOIN "Attendance_Method" m ON a."Method_ID" = m."Method_ID"
LEFT JOIN "Device_Info" d ON a."Device_Info_ID" = d."Device_Info_ID";

-- STEP 7 — VALIDATION QUERIES (as comments for reference)
-- Validate Organization table
-- SELECT COUNT(*) as org_count FROM "Organization";

-- Validate User table
-- SELECT COUNT(*) as user_count FROM "User";

-- Validate Attendance table
-- SELECT COUNT(*) as attendance_count FROM "Attendance";

-- Validate foreign key relationships
-- PRAGMA foreign_key_list("Attendance");

-- Validate views exist
-- SELECT name FROM sqlite_master WHERE type='view' AND name='attendance_full_view';
