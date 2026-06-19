/**
 * Organization Admin Dashboard Controller
 * Manages organization-specific operations and reporting
 * 
 * All functions scoped to current admin's organization
 * Updated: March 21, 2026
 */

import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import bcrypt from 'bcrypt';

/**
 * ============================================================================
 * DASHBOARD OVERVIEW & STATISTICS
 * ============================================================================
 */

/**
 * Get organization dashboard overview
 * Returns key metrics for the organization
 */
export async function getDashboardOverview(req, res) {
  try {
    const orgId = req.user.orgId || req.user.organization_id;
    
    if (!orgId) {
      return errorResponse(res, 'Organization ID not found in token', null, 400);
    }

    // Get all aggregate data in parallel
    const [
      totalUsers,
      totalDepartments,
      totalShifts,
      todayAttendance,
      allAttendance,
      organization
    ] = await Promise.all([
      // Total users in organization
      prisma.user.count({
        where: {
          orgId: orgId,
          status: 'ACTIVE'
        }
      }),
      
      // Total departments
      prisma.department.count({
        where: { orgId: orgId }
      }),
      
      // Total shifts
      prisma.shift.count({
        where: { orgId: orgId }
      }),
      
      // Attendance today
      prisma.attendance.findMany({
        where: {
          orgId: orgId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      
      // All attendance records
      prisma.attendance.findMany({
        where: { orgId: orgId },
        select: { status: true }
      }),
      
      // Organization details
      prisma.organization.findUnique({
        where: { id: orgId },
        select: {
          id: true,
          name: true,
          email: true,
          industry: true,
          size: true
        }
      })
    ]);

    // Calculate attendance stats
    const attendanceStats = {};
    allAttendance.forEach(record => {
      attendanceStats[record.status] = (attendanceStats[record.status] || 0) + 1;
    });

    // Count today's attendance by status
    const todayByStatus = {};
    todayAttendance.forEach(record => {
      todayByStatus[record.status] = (todayByStatus[record.status] || 0) + 1;
    });

    // Calculate additional metrics
    const presentToday = todayByStatus['Present'] || 0;
    const absentToday = totalUsers - presentToday;
    const lateToday = todayByStatus['Late'] || 0;

    // Calculate average hours today
    let totalHours = 0;
    todayAttendance.forEach(record => {
      if (record.totalHours) {
        totalHours += record.totalHours;
      }
    });
    const avgHours = todayAttendance.length > 0 ? (totalHours / todayAttendance.length).toFixed(1) : '0.0';

    return successResponse(res, 'Dashboard overview fetched successfully', {
      organization: organization ? {
        id: organization.id,
        name: organization.name,
        email: organization.email,
        industry: organization.industry,
        size: organization.size
      } : null,
      statistics: {
        totalEmployees: totalUsers,
        totalDepartments: totalDepartments,
        totalShifts: totalShifts,
        presentToday: presentToday,
        absentToday: absentToday,
        lateToday: lateToday,
        avgHoursToday: avgHours,
        attendanceRate: totalUsers > 0 ? ((presentToday / totalUsers) * 100).toFixed(1) : '0.0',
        allTimeAttendance: {
          total: allAttendance.length,
          byStatus: attendanceStats
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    return errorResponse(res, 'Failed to fetch dashboard overview', error.message, 500);
  }
}

/**
 * ============================================================================
 * ANALYTICS & REPORTING
 * ============================================================================
 */

/**
 * Get attendance trend analysis
 */
export async function getAttendanceTrends(req, res) {
  try {
    const orgId = req.user.orgId || req.user.organization_id;
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const attendanceData = await prisma.attendance.findMany({
      where: {
        orgId: orgId,
        date: {
          gte: startDate
        }
      },
      select: {
        date: true,
        status: true,
        userId: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Group by date
    const trendsByDate = {};
    attendanceData.forEach(record => {
      const dateKey = new Date(record.date).toISOString().split('T')[0];
      if (!trendsByDate[dateKey]) {
        trendsByDate[dateKey] = {
          date: dateKey,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          onLeave: 0
        };
      }
      trendsByDate[dateKey].total++;
      if (record.status === 'Present') trendsByDate[dateKey].present++;
      else if (record.status === 'Absent') trendsByDate[dateKey].absent++;
      else if (record.status === 'Late') trendsByDate[dateKey].late++;
      else if (record.status === 'On_Leave') trendsByDate[dateKey].onLeave++;
    });

    const trends = Object.values(trendsByDate).sort((a, b) => new Date(a.date) - new Date(b.date));

    return successResponse(res, 'Attendance trends fetched successfully', {
      period: `Last ${days} days`,
      trends: trends
    });
  } catch (error) {
    console.error('Attendance trends error:', error);
    return errorResponse(res, 'Failed to fetch attendance trends', error.message, 500);
  }
}

/**
 * Get department attendance comparison
 */
export async function getDepartmentAttendanceComparison(req, res) {
  try {
    const orgId = req.user.orgId || req.user.organization_id;

    const departments = await prisma.department.findMany({
      where: { orgId: orgId },
      select: { id: true, name: true }
    });

    const comparison = [];

    for (const dept of departments) {
      const users = await prisma.user.findMany({
        where: { orgId: orgId }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deptAttendance = await prisma.attendance.count({
        where: {
          orgId: orgId,
          date: {
            gte: today
          },
          status: 'Present'
        }
      });

      comparison.push({
        department: dept.name,
        presentToday: deptAttendance,
        totalEmployees: users.length,
        attendanceRate: users.length > 0 ? ((deptAttendance / users.length) * 100).toFixed(1) : '0.0'
      });
    }

    return successResponse(res, 'Department comparison fetched successfully', comparison);
  } catch (error) {
    console.error('Department comparison error:', error);
    return errorResponse(res, 'Failed to fetch department comparison', error.message, 500);
  }
}

/**
 * ============================================================================
 * USER MANAGEMENT
 * ============================================================================
 */

/**
 * Get organization users
 */
export async function getOrganizationUsers(req, res) {
  try {
    const orgId = req.user.orgId || req.user.organization_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { orgId: orgId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          position: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          role: {
            select: { name: true }
          }
        },
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({
        where: { orgId: orgId }
      })
    ]);

    return successResponse(res, 'Organization users fetched successfully', {
      users: users,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse(res, 'Failed to fetch organization users', error.message, 500);
  }
}

/**
 * Create new user (employee)
 */
export async function createUser(req, res) {
  try {
    const orgId = req.user.orgId || req.user.organization_id;
    const { firstName, lastName, email, phone, position } = req.body;

    if (!firstName || !lastName || !email) {
      return errorResponse(res, 'Missing required fields', null, 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', null, 400);
    }

    // Get Employee role (should exist from seed)
    const employeeRole = await prisma.role.findUnique({
      where: { name: 'Employee' }
    });

    if (!employeeRole) {
      return errorResponse(res, 'Employee role not found', null, 500);
    }

    // Generate temporary password
    const temporaryPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        phone: phone || null,
        position: position || null,
        orgId: orgId,
        roleId: employeeRole.id,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        position: true,
        createdAt: true
      }
    });

    // TODO: Send email with temporary password

    return successResponse(res, 'User created successfully', {
      user: newUser,
      temporaryPassword: temporaryPassword,
      message: 'A temporary password has been generated and should be sent to the user'
    }, 201);
  } catch (error) {
    console.error('Create user error:', error);
    return errorResponse(res, 'Failed to create user', error.message, 500);
  }
}

/**
 * Update user
 */
export async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone, position, status } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        position: position || undefined,
        status: status || undefined
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        position: true,
        status: true
      }
    });

    return successResponse(res, 'User updated successfully', updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    return errorResponse(res, 'Failed to update user', error.message, 500);
  }
}

/**
 * Get organization attendance
 */
export async function getOrganizationAttendance(req, res) {
  try {
    const orgId = req.user.orgId || req.user.organization_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setDate(new Date().getDate() - 7));

    const where = {
      orgId: orgId,
      date: {
        gte: startDate
      }
    };

    if (status) {
      where.status = status;
    }

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where: where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              position: true
            }
          }
        },
        skip: skip,
        take: limit,
        orderBy: { date: 'desc' }
      }),
      prisma.attendance.count({ where: where })
    ]);

    return successResponse(res, 'Organization attendance fetched successfully', {
      attendance: attendance,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return errorResponse(res, 'Failed to fetch attendance records', error.message, 500);
  }
}

/**
 * Export default functions
 */
export async function resetUserPassword(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function assignUserToDepartment(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function getOrganizationDepartments(req, res) {
  try {
    const orgId = req.user.orgId || req.user.organization_id;

    const departments = await prisma.department.findMany({
      where: { orgId: orgId },
      select: {
        id: true,
        name: true,
        description: true,
        head: true,
        status: true,
        createdAt: true
      }
    });

    return successResponse(res, 'Departments fetched successfully', departments);
  } catch (error) {
    console.error('Get departments error:', error);
    return errorResponse(res, 'Failed to fetch departments', error.message, 500);
  }
}

export async function createDepartment(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function updateDepartment(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function getDepartmentAttendanceReport(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function getOrganizationDevices(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function registerDevice(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function assignDeviceToUser(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function getOrganizationGeofences(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function createGeofence(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function updateGeofence(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function getEmployeeAttendanceReport(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function getMonthlyAttendanceReport(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function getOrganizationProfile(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function updateOrganizationProfile(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function getAdminProfile(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function updateAdminProfile(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}

export async function changeAdminPassword(req, res) {
  return errorResponse(res, 'Not implemented', null, 501);
}
