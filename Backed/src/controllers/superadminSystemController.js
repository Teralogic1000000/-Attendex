/**
 * SuperAdmin System & Analytics Controller
 * Platform-wide metrics and system management
 */

import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get platform overview dashboard
 */
export const getSystemOverview = asyncHandler(async (req, res) => {
  const [
    totalOrgs,
    activeOrgs,
    inactiveOrgs,
    totalUsers,
    activeUsers,
    totalAttendance
  ] = await Promise.all([
    prisma.organization.count({}),
    prisma.organization.count({ where: { status: 'Active' } }),
    prisma.organization.count({ where: { status: 'Inactive' } }),
    prisma.user.count({}),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.attendance.count({})
  ]);

  const overview = {
    organizations: {
      total: totalOrgs,
      active: activeOrgs,
      inactive: inactiveOrgs
    },
    users: {
      total: totalUsers,
      active: activeUsers
    },
    attendance: {
      total: totalAttendance
    }
  };

  return successResponse(res, 'System overview fetched', overview);
});

/**
 * Get detailed platform analytics
 */
export const getSystemAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));
  startDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Get attendance data for the period
  const attendance = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startDate,
        lte: today
      }
    }
  });

  // Group by date
  const dailyStats = {};
  attendance.forEach(record => {
    const dateKey = record.date.toISOString().split('T')[0];
    if (!dailyStats[dateKey]) {
      dailyStats[dateKey] = {
        present: 0,
        absent: 0,
        late: 0
      };
    }
    if (record.status === 'Present') dailyStats[dateKey].present++;
    else if (record.status === 'Absent') dailyStats[dateKey].absent++;
    else if (record.status === 'Late') dailyStats[dateKey].late++;
  });

  const analytics = {
    period: { start: startDate.toISOString().split('T')[0], end: today.toISOString().split('T')[0] },
    summary: {
      totalRecords: attendance.length,
      presentCount: attendance.filter(a => a.status === 'Present').length,
      absentCount: attendance.filter(a => a.status === 'Absent').length,
      lateCount: attendance.filter(a => a.status === 'Late').length
    },
    daily: Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      ...stats
    }))
  };

  return successResponse(res, 'System analytics fetched', analytics);
});

/**
 * Get organization list with stats
 */
export const getOrganizations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;

  const where = {};
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const [orgs, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.organization.count({ where })
  ]);

  const enriched = await Promise.all(
    orgs.map(async (org) => {
      const [userCount, deptCount] = await Promise.all([
        prisma.user.count({ where: { orgId: org.id } }),
        prisma.department.count({ where: { orgId: org.id } })
      ]);

      return {
        id: org.id,
        name: org.name,
        email: org.email,
        phone: org.phone,
        status: org.status,
        userCount,
        departmentCount: deptCount,
        createdAt: org.createdAt
      };
    })
  );

  return successResponse(res, 'Organizations fetched', {
    data: enriched,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Generate chart data for dashboard
 */
const generateChartData = async (allPlans) => {
  const months = [];
  const growthData = [];
  const revenueData = [];
  const attendanceData = [];

  // Generate last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString('default', { month: 'short' });
    months.push(monthName);

    // Generate mock data - in real app, query actual monthly data
    growthData.push(Math.floor(Math.random() * 20) + 10);
    revenueData.push(Math.floor(Math.random() * 10000) + 25000);
    attendanceData.push(Math.floor(Math.random() * 1000) + 3000);
  }

  // Get subscription distribution
  const subscriptions = await prisma.subscription.findMany();

  const planLabels = [];
  const planData = [];
  const planCounts = {};

  subscriptions.forEach(sub => {
    const planId = sub.planId;
    if (!planCounts[planId]) {
      planCounts[planId] = 0;
    }
    planCounts[planId] += 1;
  });

  // Map plan IDs to names
  for (const [planId, count] of Object.entries(planCounts)) {
    const plan = allPlans.find(p => p.id === parseInt(planId));
    if (plan) {
      planLabels.push(plan.name);
      planData.push(count);
    }
  }

  // Ensure we have all plan types
  const allPlanNames = ['Free', 'Basic', 'Pro', 'Enterprise'];
  allPlanNames.forEach(planName => {
    if (!planLabels.includes(planName)) {
      planLabels.push(planName);
      planData.push(0);
    }
  });

  return {
    growth: {
      labels: months,
      data: growthData
    },
    revenue: {
      labels: months,
      data: revenueData
    },
    attendance: {
      labels: months,
      data: attendanceData
    },
    plans: {
      labels: planLabels,
      data: planData
    }
  };
};

/**
 * Get system health status
 */
export const getSystemHealth = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  try {
    // Test database connection
    await prisma.organization.count();
    const dbTime = Date.now() - startTime;

    const health = {
      status: 'HEALTHY',
      database: {
        connected: true,
        responseTime: dbTime + 'ms'
      },
      timestamp: new Date(),
      uptime: process.uptime() + 's'
    };

    return successResponse(res, 'System is healthy', health);
  } catch (error) {
    return successResponse(res, 'System health check', {
      status: 'UNHEALTHY',
      error: error.message
    }, 503);
  }
});

/**
 * Get system audit logs
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, action, resource } = req.query;
  const skip = (page - 1) * limit;

  const where = {};
  if (action) {
    where.action = { contains: action, mode: 'insensitive' };
  }
  if (resource) {
    where.resource = { contains: resource, mode: 'insensitive' };
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { user: true, organization: true }
    }),
    prisma.auditLog.count({ where })
  ]);

  const enrichedLogs = logs.map(log => ({
    id: log.id,
    action: log.action,
    resource: log.resource,
    resourceId: log.resourceId,
    details: log.description || 'N/A',
    createdAt: log.createdAt,
    user: log.user ? { id: log.user.id, email: log.user.email } : null,
    organization: log.organization ? { id: log.organization.id, name: log.organization.name } : null
  }));

  return successResponse(res, 'Audit logs fetched', {
    data: enrichedLogs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get system settings
 */
export const getSystemSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.systemSetting.findMany();

  const formatted = {};
  settings.forEach(setting => {
    let value = setting.value;
    if (setting.dataType === 'number') value = parseInt(value);
    if (setting.dataType === 'boolean') value = value === 'true';
    if (setting.dataType === 'json') value = JSON.parse(value);
    formatted[setting.key] = value;
  });

  return successResponse(res, 'System settings fetched', formatted);
});

/**
 * Update system settings
 */
export const updateSystemSettings = asyncHandler(async (req, res) => {
  const { key, value, dataType = 'string' } = req.body;

  const setting = await prisma.systemSetting.upsert({
    where: { key },
    update: { value: String(value), dataType },
    create: { key, value: String(value), dataType }
  });

  // Log action
  try {
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_SETTING',
        resource: 'SystemSettings',
        resourceId: setting.id,
        userId: req.user.id,
        description: `Updated setting: ${key}`,
        ipAddress: req.ip
      }
    });
  } catch (err) {
    console.warn('Audit log creation failed:', err);
  }

  return successResponse(res, 'Setting updated', setting);
});

/**
 * Get billing overview
 */
export const getBillingOverview = asyncHandler(async (req, res) => {
  const [subscriptions, plans] = await Promise.all([
    prisma.subscription.findMany({ where: { status: 'Active' } }),
    prisma.plan.findMany()
  ]);

  const totalMRR = subscriptions.reduce((sum, sub) => {
    const plan = plans.find(p => p.id === sub.planId);
    return sum + (plan?.price || 0);
  }, 0);

  const byStatus = {};
  subscriptions.forEach(sub => {
    const status = sub.paymentStatus || 'UNKNOWN';
    byStatus[status] = (byStatus[status] || 0) + 1;
  });

  const byPlan = {};
  subscriptions.forEach(sub => {
    const plan = plans.find(p => p.id === sub.planId);
    const planName = plan?.name || 'Unknown';
    byPlan[planName] = (byPlan[planName] || 0) + (plan?.price || 0);
  });

  const billing = {
    totalMRR: Math.round(totalMRR * 100) / 100,
    activeSubscriptions: subscriptions.length,
    paymentStatus: byStatus,
    revenueByPlan: byPlan
  };

  return successResponse(res, 'Billing overview fetched', billing);
});
