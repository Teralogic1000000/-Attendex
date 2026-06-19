import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get organization dashboard analytics
 */
export const orgDashboard = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;

  if (!orgId) {
    return errorResponse(res, 'Organization not found', 400);
  }

  // Get total active users in organization
  const totalUsers = await prisma.user.count({
    where: { orgId, status: 'ACTIVE' }
  });

  // Get total departments
  const totalDepartments = await prisma.department.count({
    where: { orgId, status: 'Active' }
  });

  // Get total shifts
  const totalShifts = await prisma.shift.count({
    where: { orgId }
  });

  // Get today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get yesterday's attendance
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(yesterday);
  yesterdayStart.setHours(0, 0, 0, 0);

  // Query today's attendance records
  const todayAttendances = await prisma.attendance.findMany({
    where: {
      orgId,
      date: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  // Query yesterday's attendance records
  const yesterdayAttendances = await prisma.attendance.findMany({
    where: {
      orgId,
      date: {
        gte: yesterdayStart,
        lt: today
      }
    }
  });

  // Count by status for today
  const presentToday = todayAttendances.filter(r => r.status === 'Present').length;
  const absentToday = todayAttendances.filter(r => r.status === 'Absent').length;
  const lateToday = todayAttendances.filter(r => r.status === 'Late').length;

  // Count by status for yesterday
  const presentYesterday = yesterdayAttendances.filter(r => r.status === 'Present').length;
  const absentYesterday = yesterdayAttendances.filter(r => r.status === 'Absent').length;

  const presentChange = presentToday - presentYesterday;
  const absentChange = absentToday - absentYesterday;

  return successResponse(res, 'Dashboard metrics fetched', {
    totalUsers,
    totalDepartments,
    totalShifts,
    presentToday,
    absentToday,
    lateToday,
    presentChange,
    absentChange
  });
});

/**
 * Get organization dashboard with full attendance summary
 */
export const getDashboardData = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;

  if (!orgId) {
    return errorResponse(res, 'Organization not found', 400);
  }

  // Get KPI metrics
  const totalUsers = await prisma.user.count({
    where: { orgId, status: 'ACTIVE' }
  });

  const totalDepartments = await prisma.department.count({
    where: { orgId, status: 'Active' }
  });

  const totalShifts = await prisma.shift.count({
    where: { orgId }
  });

  // Get today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAttendance = await prisma.attendance.findMany({
    where: {
      orgId,
      date: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  const presentToday = todayAttendance.filter(r => r.status === 'Present').length;
  const absentToday = todayAttendance.filter(r => r.status === 'Absent').length;
  const lateToday = todayAttendance.filter(r => r.status === 'Late').length;
  const onLeaveToday = todayAttendance.filter(r => r.status === 'On_Leave').length;

  // Get last 7 days attendance summary for chart
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayAttendance = await prisma.attendance.findMany({
      where: {
        orgId,
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    });

    last7Days.push({
      date: date.toISOString().split('T')[0],
      present: dayAttendance.filter(r => r.status === 'Present').length,
      absent: dayAttendance.filter(r => r.status === 'Absent').length,
      late: dayAttendance.filter(r => r.status === 'Late').length
    });
  }

  return successResponse(res, 'Dashboard data fetched', {
    kpis: {
      totalUsers,
      totalDepartments,
      totalShifts,
      presentToday,
      absentToday,
      lateToday,
      onLeaveToday
    },
    attendance: {
      today: {
        present: presentToday,
        absent: absentToday,
        late: lateToday,
        onLeave: onLeaveToday
      },
      last7Days
    }
  });
});

/**
 * Get attendance trend data
 */
export const getAttendanceTrend = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { days = 30 } = req.query;

  if (!orgId) {
    return errorResponse(res, 'Organization not found', 400);
  }

  const trend = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = parseInt(days) - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const count = await prisma.attendance.count({
      where: {
        orgId,
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    });

    trend.push({
      date: date.toISOString().split('T')[0],
      count
    });
  }

  return successResponse(res, 'Attendance trend data fetched', { trend });
});

/**
 * Get department-wise attendance summary
 */
export const getDepartmentAttendanceSummary = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;

  if (!orgId) {
    return errorResponse(res, 'Organization not found', 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const departments = await prisma.department.findMany({
    where: { orgId, status: 'Active' },
    include: {
      employees: {
        include: {
          attendance: {
            where: {
              date: {
                gte: today,
                lt: tomorrow
              }
            }
          }
        }
      }
    }
  });

  const summary = departments.map(dept => ({
    id: dept.id,
    name: dept.name,
    totalEmployees: dept.employees.length,
    presentCount: dept.employees.filter(emp => 
      emp.attendance?.length > 0 && emp.attendance[0]?.status === 'Present'
    ).length,
    absentCount: dept.employees.filter(emp => 
      emp.attendance?.length > 0 && emp.attendance[0]?.status === 'Absent'
    ).length,
    lateCount: dept.employees.filter(emp => 
      emp.attendance?.length > 0 && emp.attendance[0]?.status === 'Late'
    ).length
  }));

  return successResponse(res, 'Department attendance summary fetched', { 
    summary 
  });
});
