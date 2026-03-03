import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const checkIn = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findFirst({
    where: {
      userId: req.user.id,
      date: today
    }
  });

  if (existing) {
    return errorResponse(res, 'Already checked in today', 400);
  }

  const attendance = await prisma.attendance.create({
    data: {
      userId: req.user.id,
      orgId: req.user.orgId,
      date: today,
      checkIn: new Date()
    }
  });

  return successResponse(res, 'Checked in successfully', { record: attendance }, 201);
});

export const checkOut = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: req.user.id,
      date: today
    }
  });

  if (!attendance) {
    return errorResponse(res, 'You must check in first', 400);
  }

  if (attendance.checkOut) {
    return errorResponse(res, 'Already checked out', 400);
  }

  const checkOutTime = new Date();
  const diffMs = checkOutTime - attendance.checkIn;
  const hours = diffMs / (1000 * 60 * 60);

  const updated = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      checkOut: checkOutTime,
      totalHours: parseFloat(hours.toFixed(2))
    }
  });

  return successResponse(res, 'Checked out successfully', { record: updated });
});

export const getMyAttendance = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const records = await prisma.attendance.findMany({
    where: { userId },
    orderBy: { date: 'desc' }
  });

  // Get today's record
  const todayRecord = records.find(r => {
    const recordDate = new Date(r.date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  });

  // Calculate stats for the month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  const monthRecords = records.filter(r => new Date(r.date) >= monthStart);
  
  const daysPresent = monthRecords.length;
  const totalHours = monthRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
  const avgHours = daysPresent > 0 ? (totalHours / daysPresent).toFixed(1) : '0.0';

  // Calculate streak (consecutive working days present)
  let streak = 0;
  const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  for (const record of sortedRecords) {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - streak);
    expectedDate.setHours(0, 0, 0, 0);
    
    if (recordDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return successResponse(res, 'Attendance fetched', {
    records,
    todayRecord: todayRecord || null,
    stats: {
      daysPresent,
      avgHours: parseFloat(avgHours),
      streak
    }
  });
});

export const getOrgAttendance = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const records = await prisma.attendance.findMany({
    where: { orgId },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true }
      }
    },
    orderBy: { date: 'desc' }
  });

  // Get today's attendance for org stats
  const todayRecords = records.filter(r => {
    const recordDate = new Date(r.date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  });

  // Get unique employees in org
  const totalEmployees = await prisma.user.count({
    where: { orgId }
  });

  const presentToday = new Set(todayRecords.map(r => r.userId)).size;
  const totalHoursToday = todayRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
  const avgHours = presentToday > 0 ? (totalHoursToday / presentToday).toFixed(1) : '0.0';

  return successResponse(res, 'Organization attendance fetched', {
    records,
    stats: {
      totalEmployees,
      presentToday,
      avgHours: parseFloat(avgHours),
      todayDateTime: today
    }
  });
});