-- Add GPS and device information fields to Attendance table
ALTER TABLE "Attendance" ADD COLUMN "latitude" REAL;
ALTER TABLE "Attendance" ADD COLUMN "longitude" REAL;
ALTER TABLE "Attendance" ADD COLUMN "method" TEXT;
ALTER TABLE "Attendance" ADD COLUMN "deviceType" TEXT;
ALTER TABLE "Attendance" ADD COLUMN "deviceModel" TEXT;
ALTER TABLE "Attendance" ADD COLUMN "osVersion" TEXT;
ALTER TABLE "Attendance" ADD COLUMN "appVersion" TEXT;
ALTER TABLE "Attendance" ADD COLUMN "notes" TEXT;

-- Create indexes for better query performance
CREATE INDEX "idx_Attendance_date" ON "Attendance"("date");
CREATE INDEX "idx_Attendance_status" ON "Attendance"("status");
