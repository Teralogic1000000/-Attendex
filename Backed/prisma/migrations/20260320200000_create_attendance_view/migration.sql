-- Create Device_Info table if it doesn't exist
CREATE TABLE IF NOT EXISTS Device_Info (
  id TEXT PRIMARY KEY,
  deviceType TEXT,
  os TEXT,
  browser TEXT,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create attendance view with readable column names
DROP VIEW IF EXISTS attendance_full_view;

CREATE VIEW attendance_full_view AS
SELECT 
  a.id as attend_id,
  u.firstName || ' ' || u.lastName as user_name,
  u.email as user_email,
  u.position as user_position,
  o.name as org_name,
  a.status as status_name,
  'Unknown' as method_name,
  a.checkIn as check_in_time,
  a.checkOut as check_out_time,
  a.totalHours as total_hours,
  a.ipAddress as ip_address,
  'Unknown' as device_type,
  'Unknown' as os_name,
  a.date as attendance_date,
  a.createdAt as created_at
FROM Attendance a
LEFT JOIN User u ON a.userId = u.id
LEFT JOIN Organization o ON a.orgId = o.id
ORDER BY a.date DESC;
