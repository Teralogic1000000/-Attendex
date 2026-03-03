import prisma from '../config/prisma.js'
import { successResponse } from '../utils/response.js'

export const orgAnalytics = async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 6); // last 7 days

  const grouped = await prisma.attendance.groupBy({
    by: ['date'],
    where: {
      orgId: req.user.orgId,
      date: {
        gte: startDate,
        lte: today
      }
    },
    _count: {
      id: true
    },
    _avg: {
      totalHours: true
    }
  });

  const map = {};
  grouped.forEach(g => {
    const d = new Date(g.date);
    d.setHours(0,0,0,0);
    map[d.toISOString().slice(0,10)] = {
      count: g._count.id,
      avgHours: g._avg.totalHours || 0
    };
  });

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    d.setHours(0,0,0,0);
    const key = d.toISOString().slice(0,10);
    days.push({
      date: key,
      attendanceCount: map[key] ? map[key].count : 0,
      avgHours: map[key] ? Number(map[key].avgHours.toFixed(2)) : 0
    });
  }

  const avgResult = await prisma.attendance.aggregate({
    where: { orgId: req.user.orgId, date: { gte: startDate, lte: today } },
    _avg: { totalHours: true }
  });

  return successResponse(res, 'Analytics fetched', {
    weekly: days,
    avgHoursLast7: avgResult._avg.totalHours || 0
  });
}
