import prisma from '../config/prisma.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const orgAnalytics = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 6); // last 7 days

  // Fetch all attendance records for the date range using Prisma
  const attendances = await prisma.attendance.findMany({
    where: {
      orgId: req.user.orgId,
      date: {
        gte: startDate,
        lte: today
      }
    }
  });

  // Group by date
  const map = {};
  attendances.forEach(record => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    const key = recordDate.toISOString().slice(0, 10);

    if (!map[key]) {
      map[key] = {
        count: 0,
        totalHours: 0,
        recordCount: 0
      };
    }

    map[key].count += 1;
    map[key].totalHours += record.totalHours || 0;
    map[key].recordCount += 1;
  });

  // Generate data for each day of the 7-day period
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);

    const dayData = map[key] || { count: 0, totalHours: 0, recordCount: 0 };
    const avgHours = dayData.recordCount > 0
      ? Number((dayData.totalHours / dayData.recordCount).toFixed(2))
      : 0;

    days.push({
      date: key,
      attendanceCount: dayData.count,
      avgHours: avgHours
    });
  }

  // Calculate average hours for the 7-day period
  const totalHours = attendances.reduce((sum, r) => sum + (r.totalHours || 0), 0);
  const avgHoursLast7 = attendances.length > 0
    ? Number((totalHours / attendances.length).toFixed(2))
    : 0;

  return successResponse(res, 'Analytics fetched', {
    weekly: days,
    avgHoursLast7: avgHoursLast7
  });
});
