-- Attendance_Status lookup table
CREATE TABLE IF NOT EXISTS "Attendance_Status" (
  "Status_ID" INTEGER PRIMARY KEY AUTOINCREMENT,
  "Status_Name" TEXT UNIQUE NOT NULL,
  "CREATED_AT" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO "Attendance_Status" ("Status_Name") VALUES
('Present'),
('Absent'),
('Late'),
('On_Leave'),
('Pending_Approval'),
('Rejected');

-- Attendance_Method lookup table
CREATE TABLE IF NOT EXISTS "Attendance_Method" (
  "Method_ID" INTEGER PRIMARY KEY AUTOINCREMENT,
  "Method_Name" TEXT UNIQUE NOT NULL,
  "CREATED_AT" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO "Attendance_Method" ("Method_Name") VALUES
('Face_Recognition'),
('Biometric'),
('QR_Code'),
('RFID'),
('Manual'),
('Mobile_App'),
('Geofence');

-- User_Type lookup table
CREATE TABLE IF NOT EXISTS "User_Type" (
  "User_Type_ID" INTEGER PRIMARY KEY AUTOINCREMENT,
  "Type_Name" TEXT UNIQUE NOT NULL,
  "CREATED_AT" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO "User_Type" ("Type_Name") VALUES
('Super_Admin'),
('Org_Admin'),
('Manager'),
('Employee');

-- Org_Type lookup table
CREATE TABLE IF NOT EXISTS "Org_Type" (
  "Org_Type_ID" INTEGER PRIMARY KEY AUTOINCREMENT,
  "Type_Name" TEXT UNIQUE NOT NULL,
  "CREATED_AT" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO "Org_Type" ("Type_Name") VALUES
('Corporate'),
('SME'),
('Startup'),
('Non_Profit'),
('Government');

-- Region lookup table
CREATE TABLE IF NOT EXISTS "Region" (
  "Region_ID" INTEGER PRIMARY KEY AUTOINCREMENT,
  "Region_Name" TEXT UNIQUE NOT NULL,
  "Country_Code" TEXT,
  "CREATED_AT" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO "Region" ("Region_Name", "Country_Code") VALUES
('Africa', 'AF'),
('Europe', 'EU'),
('Asia', 'APAC');
