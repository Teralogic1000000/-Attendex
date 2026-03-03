/**
 * SuperAdmin System & Analytics Controller
 * Platform-wide metrics and system management
 */

import prisma from '../config/prisma.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * GET /api/superadmin/system/overview
 * Get platform overview dashboard
 */
export const getSystemOverview = asyncHandler(async (req, res) => {
  const [
    totalOrgs,
    activeOrgs,
    suspendedOrgs,
    totalUsers,
    activeUsers,
    totalAttendance,
    totalSubscriptions,
    activePaidSubscriptions
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({ where: { status: 'ACTIVE' } }),
    prisma.organization.count({ where: { status: 'SUSPENDED' } }),
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.attendance.count(),
    prisma.organizationSubscription.count(),
    prisma.organizationSubscription.count({
      where: { status: 'ACTIVE', plan: { price: { gt: 0 } } }
    })
  ])

  const overview = {
    organizations: {
      total: totalOrgs,
      active: activeOrgs,
      suspended: suspendedOrgs
    },
    users: {
      total: totalUsers,
      active: activeUsers
    },
    attendance: {
      total: totalAttendance
    },
    subscriptions: {
      total: totalSubscriptions,
      activePaid: activePaidSubscriptions
    }
  }

  return successResponse(res, 'System overview fetched', overview)
})

/**
 * GET /api/superadmin/system/analytics
 * Get detailed platform analytics
 */
export const getSystemAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query // days
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(period))

  const [
    newOrgsCount,
    newUsersCount,
    newAttendanceCount,
    usersByRole,
    orgsBySize,
    subscriptionBreakdown
  ] = await Promise.all([
    prisma.organization.count({
      where: { createdAt: { gte: startDate } }
    }),
    prisma.user.count({
      where: { createdAt: { gte: startDate } }
    }),
    prisma.attendance.count({
      where: { createdAt: { gte: startDate } }
    }),
    prisma.user.groupBy({
      by: ['roleId'],
      where: { status: 'ACTIVE' },
      _count: { id: true }
    }),
    prisma.organization.groupBy({
      by: ['size'],
      where: { status: 'ACTIVE' },
      _count: { id: true }
    }),
    prisma.organizationSubscription.groupBy({
      by: ['planId'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
      include: { plan: true }
    })
  ])

  const analytics = {
    periodDays: parseInt(period),
    metrics: {
      newOrganizations: newOrgsCount,
      newUsers: newUsersCount,
      newAttendanceRecords: newAttendanceCount
    },
    distribution: {
      usersByRole,
      organizationsBySize,
      subscriptionsByPlan: subscriptionBreakdown
    }
  }

  return successResponse(res, 'System analytics fetched', analytics)
})

/**
 * GET /api/superadmin/system/health
 * Get system health status
 */
export const getSystemHealth = asyncHandler(async (req, res) => {
  const startTime = Date.now()

  try {
    // Test database connection
    await prisma.organizationSubscription.findFirst({ take: 1 })
    const dbTime = Date.now() - startTime

    const health = {
      status: 'HEALTHY',
      database: {
        connected: true,
        responseTime: dbTime + 'ms'
      },
      timestamp: new Date(),
      uptime: process.uptime() + 's'
    }

    return successResponse(res, 'System is healthy', health)
  } catch (error) {
    return successResponse(res, 'System health check', {
      status: 'UNHEALTHY',
      error: error.message
    }, 503)
  }
})

/**
 * GET /api/superadmin/system/audit-logs
 * Get system audit logs
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, action, resource } = req.query
  const skip = (page - 1) * limit

  const where = {}
  if (action) where.action = action
  if (resource) where.resource = resource

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        organization: { select: { id: true, name: true } }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.auditLog.count({ where })
  ])

  return successResponse(res, 'Audit logs fetched', {
    data: logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

/**
 * GET /api/superadmin/system/settings
 * Get system settings
 */
export const getSystemSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.systemSettings.findMany()

  const formatted = {}
  settings.forEach(setting => {
    let value = setting.value
    if (setting.dataType === 'number') value = parseInt(value)
    if (setting.dataType === 'boolean') value = value === 'true'
    if (setting.dataType === 'json') value = JSON.parse(value)
    formatted[setting.key] = value
  })

  return successResponse(res, 'System settings fetched', formatted)
})

/**
 * PUT /api/superadmin/system/settings
 * Update system settings
 */
export const updateSystemSettings = asyncHandler(async (req, res) => {
  const { key, value, dataType = 'string' } = req.body

  if (!key || value === undefined) {
    return errorResponse(res, 'Key and value are required', 400)
  }

  const setting = await prisma.systemSettings.upsert({
    where: { key },
    update: { value: String(value), dataType },
    create: { key, value: String(value), dataType }
  })

  // Log action
  await prisma.auditLog.create({
    data: {
      action: 'UPDATE_SETTING',
      resource: 'SystemSettings',
      resourceId: setting.id,
      userId: req.user.id,
      reason: `Updated setting: ${key}`,
      ipAddress: req.ip
    }
  })

  return successResponse(res, 'Setting updated', setting)
})

/**
 * GET /api/superadmin/billing/overview
 * Get billing overview
 */
export const getBillingOverview = asyncHandler(async (req, res) => {
  const subscriptions = await prisma.organizationSubscription.findMany({
    where: { status: 'ACTIVE' },
    include: { plan: true, organization: { select: { id: true, name: true } } }
  })

  const totalMRR = subscriptions.reduce((sum, sub) => sum + (sub.plan.price / 100), 0)

  const byStatus = {}
  subscriptions.forEach(sub => {
    const status = sub.paymentStatus || 'UNKNOWN'
    byStatus[status] = (byStatus[status] || 0) + 1
  })

  const byPlan = {}
  subscriptions.forEach(sub => {
    const planName = sub.plan.name
    byPlan[planName] = (byPlan[planName] || 0) + (sub.plan.price / 100)
  })

  const billing = {
    totalMRR: Math.round(totalMRR * 100) / 100,
    activeSubscriptions: subscriptions.length,
    paymentStatus: byStatus,
    revenueByPlan: byPlan
  }

  return successResponse(res, 'Billing overview fetched', billing)
})
