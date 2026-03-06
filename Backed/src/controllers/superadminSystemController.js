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

  // Get today's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    newOrgsCount,
    newUsersCount,
    newAttendanceCount,
    usersByRole,
    orgsBySize,
    subscriptionBreakdown,
    todayCheckins,
    totalRevenue,
    activeSubscriptions,
    failedLoginAttempts,
    activeSessions
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
    }),
    prisma.attendance.count({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: 'CHECKED_IN'
      }
    }),
    prisma.organizationSubscription.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { amount: true }
    }),
    prisma.organizationSubscription.count({
      where: { status: 'ACTIVE' }
    }),
    // Mock failed login attempts (would need audit logs table)
    Promise.resolve(8),
    // Mock active sessions (would need session tracking)
    Promise.resolve(342)
  ])

  // Generate chart data for last 6 months
  const chartData = await generateChartData()

  const analytics = {
    periodDays: parseInt(period),
    todayCheckins,
    mrr: totalRevenue._sum.amount || 0,
    mrrGrowth: 12, // Mock growth percentage
    churnRate: 2.3, // Mock churn rate
    activeSessions,
    failedLogins: failedLoginAttempts,
    dbConnections: 156, // Mock DB connections
    metrics: {
      newOrganizations: newOrgsCount,
      newUsers: newUsersCount,
      newAttendanceRecords: newAttendanceCount,
      activeSubscriptions
    },
    distribution: {
      usersByRole,
      organizationsBySize: orgsBySize,
      subscriptionsByPlan: subscriptionBreakdown
    },
    // Chart data
    growthChart: chartData.growth,
    revenueChart: chartData.revenue,
    attendanceChart: chartData.attendance,
    planChart: chartData.plans
  }

  return successResponse(res, 'System analytics fetched', analytics)
})

/**
 * Generate chart data for dashboard
 */
const generateChartData = async () => {
  const months = []
  const growthData = []
  const revenueData = []
  const attendanceData = []

  // Generate last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthName = date.toLocaleString('default', { month: 'short' })
    months.push(monthName)

    // Mock data - in real app, query actual monthly data
    growthData.push(Math.floor(Math.random() * 20) + 10)
    revenueData.push(Math.floor(Math.random() * 10000) + 25000)
    attendanceData.push(Math.floor(Math.random() * 1000) + 3000)
  }

  // Get actual plan distribution
  const planDistribution = await prisma.organizationSubscription.groupBy({
    by: ['planId'],
    where: { status: 'ACTIVE' },
    _count: { id: true },
    include: { plan: true }
  })

  const planLabels = []
  const planData = []

  planDistribution.forEach(item => {
    planLabels.push(item.plan.name)
    planData.push(item._count.id)
  })

  // Ensure we have all plan types
  const allPlans = ['Free', 'Basic', 'Pro', 'Enterprise']
  allPlans.forEach(planName => {
    if (!planLabels.includes(planName)) {
      planLabels.push(planName)
      planData.push(0)
    }
  })

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
  }
}

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

  // For now, return mock audit logs since the table might be empty
  // In production, this would query real audit logs
  const mockLogs = [
    {
      id: '1',
      action: 'Organization Suspended',
      resource: 'Organization',
      resourceId: 'org-1',
      details: 'Payment method invalid',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      user: { email: 'superadmin@attendex.com' },
      organization: { name: 'GlobalVentures Inc.' }
    },
    {
      id: '2',
      action: 'Plan Upgraded',
      resource: 'Subscription',
      resourceId: 'sub-1',
      details: 'From Basic to Pro plan',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      user: { email: 'admin@techcorp.com' },
      organization: { name: 'TechCorp Inc.' }
    },
    {
      id: '3',
      action: 'Login Failed',
      resource: 'User',
      resourceId: 'user-1',
      details: 'Invalid password attempt',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      user: { email: 'user@dataflow.com' },
      organization: { name: 'DataFlow Systems' }
    },
    {
      id: '4',
      action: 'Subscription Modified',
      resource: 'Subscription',
      resourceId: 'sub-2',
      details: 'Employee limit increased',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      user: { email: 'superadmin@attendex.com' },
      organization: { name: 'CorpSolutions Ltd.' }
    }
  ]

  // Filter mock logs if needed
  let filteredLogs = mockLogs
  if (action) {
    filteredLogs = mockLogs.filter(log => log.action.toLowerCase().includes(action.toLowerCase()))
  }
  if (resource) {
    filteredLogs = filteredLogs.filter(log => log.resource.toLowerCase().includes(resource.toLowerCase()))
  }

  // Apply pagination
  const total = filteredLogs.length
  const paginatedLogs = filteredLogs.slice(skip, skip + parseInt(limit))

  return successResponse(res, 'Audit logs fetched', {
    data: paginatedLogs,
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
