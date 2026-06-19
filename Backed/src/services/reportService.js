import prisma from '../config/prisma.js';

export async function getDailyAttendanceReport(organizationId, startDate, endDate) {
  try {
    const records = await prisma.attendance.findMany({
      where: {
        orgId: organizationId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: { user: true }
    });

    return { data: records, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function getDepartmentAttendanceReport(organizationId, departmentId, startDate, endDate) {
  try {
    const records = await prisma.attendance.findMany({
      where: {
        orgId: organizationId,
        user: { departmentId: departmentId },
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: { user: true }
    });

    return { data: records, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function getUserAttendanceReport(userId, startDate, endDate) {
  try {
    const records = await prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: { date: 'desc' }
    });

    return { data: records, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function getOrganizationStatistics(organizationId) {
  try {
    const totalUsers = await prisma.user.count({
      where: { orgId: organizationId }
    });

    const totalAttendance = await prisma.attendance.count({
      where: { orgId: organizationId }
    });

    return {
      data: {
        totalUsers,
        totalAttendance
      },
      error: null
    };
  } catch (err) {
    return { data: null, error: err.message };
  }
}