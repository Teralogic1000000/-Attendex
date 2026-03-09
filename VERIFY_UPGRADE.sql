-- Final Verification Report
SELECT 'DATABASE UPGRADE COMPLETE' AS Status;

-- Count tables
SELECT 'TABLES' AS Category, COUNT(*) as Count FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';

-- Count views
SELECT 'VIEWS' AS Category, COUNT(*) as Count FROM information_schema.views WHERE table_schema='public';

-- Lookup table records
SELECT 'Attendance_Status' AS Lookup_Table, COUNT(*) as Records FROM "Attendance_Status"
UNION ALL
SELECT 'Attendance_Method', COUNT(*) FROM "Attendance_Method"
UNION ALL
SELECT 'User_Type', COUNT(*) FROM "User_Type"
UNION ALL
SELECT 'Org_Type', COUNT(*) FROM "Org_Type"
UNION ALL
SELECT 'Region', COUNT(*) FROM "Region"
UNION ALL
SELECT 'Device', COUNT(*) FROM "Device";

-- Existing data
SELECT 'Original Data' AS Data_Type, COUNT(*) FROM "User" WHERE "id" IS NOT NULL UNION ALL
SELECT 'Attendance Records', COUNT(*) FROM "Attendance" UNION ALL
SELECT 'Organizations', COUNT(*) FROM "Organization";

-- List all views
SELECT 'VIEWS CREATED' AS Type, table_name FROM information_schema.views WHERE table_schema = 'public' ORDER BY table_name;
