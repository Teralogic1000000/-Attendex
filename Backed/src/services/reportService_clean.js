/**
 * Report Service - Prisma Version
 * Generates attendance and organization reports
 */

import prisma from '../config/prisma.js';

/**
 * Get daily attendance report
 */
export async function getDailyAttendanceReport(organizationId, startDate, endDate, departmentId = null, userId = null) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const where = {
      organization: { id: organizationId },
      date: { gte: start, lte: end }
    };

    if (departmentId) {
      where.user = { departmentId };
    }

    if (userId) {
      where.userId = userId;
    }

    const records = await prisma.attendance.findMany({
      where,
      include: { user: true },
      orderBy: { date: 'asc' }
    });

    return { data: records, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Get monthly attendance report
 */
export async function getMonthlyAttendanceReport(organizationId, month, year, departmentId = null, userId = null) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const where = {
      organizationId,
      date: { gte: startDate, lte: endDate }
    };

    if (departmentId) {
      where.user = { departmentId };
    }

    if (userId) {
      where.userId = userId;
    }

    const records = await prisma.attendance.findMany({
      where,
      include: { user: true },
      orderBy: { date: 'asc' }
    });

    return { data: records, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Get department attendance report
 */
export async function getDepartmentAttendanceReport(organizationId, departmentId, startDate, endDate) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const records = await prisma.attendance.findMany({
      where: {
        organizationId,
        user: { departmentId },
        date: { gte: start, lte: end }
      },
      include: { user: true },
      orderBy: { date: 'asc' }
    });

    return { data: records, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Get user attendance report
 */
export async function getUserAttendanceReport(userId, startDate, endDate) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const records = await prisma.attendance.findMany({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { date: 'desc' }
    });

    return { data: records, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Get organization statistics
 */
export async function getOrganizationStatistics(organizationId, startDate, endDate) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const records = await prisma.attendance.findMany({
      where: {
        organizationId,
        date: { gte: start, lte: end }
      },
      include: { user: true }
    });

    return { data: records, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Export attendance data
 */
export async function exportAttendanceData(organizationId, startDate, endDate, format = 'csv') {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const records = await prisma.attendance.findMany({
      where: {
        organizationId,
        date: { gte: start, lte: end }
      },
      include: { user: true }
    });

    return { data: records, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}
