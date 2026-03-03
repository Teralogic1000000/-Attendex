/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `maxDevices` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,date]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgId]` on the table `OrganizationSubscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `SubscriptionPlan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationSubscription" DROP CONSTRAINT "OrganizationSubscription_orgId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_orgId_fkey";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "createdAt",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "totalHours" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "OrganizationSubscription" ALTER COLUMN "startDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "SubscriptionPlan" DROP COLUMN "maxDevices",
ADD COLUMN     "features" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_date_key" ON "Attendance"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSubscription_orgId_key" ON "OrganizationSubscription"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSubscription" ADD CONSTRAINT "OrganizationSubscription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
