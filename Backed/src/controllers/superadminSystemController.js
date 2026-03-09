/**
 * SuperAdmin System & Analytics Controller
 * Platform-wide metrics and system management
 */

import { count, findMany, findOne, create, update, upsert } from '../config/supabaseMapper.js'
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
    count('organization', {}),
    count('organization', { status: 'ACTIVE' }),
    count('organization', { status: 'SUSPENDED' }),
    count('user', {}),
    count('user', { status: 'ACTIVE' }),
    count('attendance', {}),
    count('organization_subscription', {}),
    (async () => {
      const subs = await findMany('organization_subscription', { status: 'ACTIVE' }, { limit: 10000 })
      const plans = await Promise.all(
        subs.map(sub => findOne('subscription_plan', { id: sub.planId }))
      )
      return subs.filter((_, i) => plans[i]?.price > 0).length
    })()
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

  // Fetch all data in parallel
  const [
    newOrgsData,
    newUsersData,
    newAttendanceData,
    allActiveUsers,
    allOrganizations,
    allSubscriptions,
    allSubscriptionPlans,
    allAttendanceToday
  ] = await Promise.all([
    findMany('organization', {}, { limit: 10000 }),
    findMany('user', {}, { limit: 10000 }),
    findMany('attendance', {}, { limit: 100000 }),
    findMany('user', { status: 'ACTIVE' }, { limit: 10000 }),
    findMany('organization', { status: 'ACTIVE' }, { limit: 10000 }),
    findMany('organization_subscription', { status: 'ACTIVE' }, { limit: 10000 }),
    findMany('subscription_plan', {}, { limit: 100 }),
    findMany('attendance', {}, { limit: 10000 })
  ])

  // Filter by date range on client
  const newOrgsCount = newOrgsData.filter(org => {
    const orgDate = new Date(org.createdAt)
    return orgDate >= startDate
  }).length

  const newUsersCount = newUsersData.filter(user => {
    const userDate = new Date(user.createdAt)
    return userDate >= startDate
  }).length

  const newAttendanceCount = newAttendanceData.filter(att => {
    const attDate = new Date(att.createdAt)
    return attDate >= startDate
  }).length

  // Group users by userTypeId (client-side)
  const usersByType = {}
  allActiveUsers.forEach(user => {
    if (!usersByType[user.userTypeId]) {
      usersByType[user.userTypeId] = 0
    }
    usersByType[user.userTypeId] += 1
  })

  // Group organizations by size (client-side)
  const orgsBySize = {}
  allOrganizations.forEach(org => {
    const size = org.size || 'Unknown'
    if (!orgsBySize[size]) {
      orgsBySize[size] = 0
    }
    orgsBySize[size] += 1
  })

  // Group subscriptions by plan (client-side)
  const subscriptionByPlan = {}
  allSubscriptions.forEach(sub => {
    const planId = sub.planId
    if (!subscriptionByPlan[planId]) {
      subscriptionByPlan[planId] = 0
    }
    subscriptionByPlan[planId] += 1
  })

  const todayCheckingToday = allAttendanceToday.filter(att => {
    const attDate = new Date(att.checkInTime || att.createdAt)
    attDate.setHours(0, 0, 0, 0)
    return attDate.getTime() === today.getTime() && (att.statusId === 1 || att.statusId === 3) // Present or Late
  }).length

  // Calculate revenue
  const totalRevenue = allSubscriptions.reduce((sum, sub) => {
    const plan = allSubscriptionPlans.find(p => p.id === sub.planId)
    return sum + (plan?.price || 0)
  }, 0)

  // Generate chart data for last 6 months
  const chartData = await generateChartData(allSubscriptionPlans)

  const analytics = {
    periodDays: parseInt(period),
    todayCheckins: todayCheckingToday,
    mrr: totalRevenue,
    mrrGrowth: 12, // Mock growth percentage
    churnRate: 2.3, // Mock churn rate
    activeSessions: 342, // Mock value
    failedLogins: 8, // Mock value
    dbConnections: 156, // Mock DB connections
    metrics: {
      newOrganizations: newOrgsCount,
      newUsers: newUsersCount,
      newAttendanceRecords: newAttendanceCount,
      activeSubscriptions: allSubscriptions.length
    },
    distribution: {
      usersByRole: usersByType,
      organizationsBySize: orgsBySize,
      subscriptionsByPlan: subscriptionByPlan
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
const generateChartData = async (allPlans) => {
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
  const subscriptions = await findMany('organization_subscription', { status: 'ACTIVE' }, { limit: 10000 })

  const planLabels = []
  const planData = []
  const planCounts = {}

  subscriptions.forEach(sub => {
    const planId = sub.planId
    if (!planCounts[planId]) {
      planCounts[planId] = 0
    }
    planCounts[planId] += 1
  })

  // Map plan IDs to names
  for (const [planId, count] of Object.entries(planCounts)) {
    const plan = allPlans.find(p => p.id === parseInt(planId))
    if (plan) {
      planLabels.push(plan.planName)
      planData.push(count)
    }
  }

  // Ensure we have all plan types
  const allPlanNames = ['Free', 'Basic', 'Pro', 'Enterprise']
  allPlanNames.forEach(planName => {
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
    // Test database connection - fetch a single subscription record
    await findMany('organization_subscription', {}, { limit: 1 })
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

  // Fetch all audit logs (client-side filtering since mapper doesn't support complex where)
  const allLogs = await findMany('audit_log', {}, { limit: 100000 })
  
  // Filter by action and resource
  let filteredLogs = allLogs
  if (action) {
    filteredLogs = filteredLogs.filter(log => 
      log.action?.toLowerCase().includes(action.toLowerCase())
    )
  }
  if (resource) {
    filteredLogs = filteredLogs.filter(log => 
      log.resource?.toLowerCase().includes(resource.toLowerCase())
    )
  }

  // Apply pagination
  const total = filteredLogs.length
  const paginatedLogs = filteredLogs.slice(skip, skip + parseInt(limit))

  // Note: Audit logs might not have full user/organization details in the new schema
  const enrichedLogs = paginatedLogs.map(log => ({
    id: log.id,
    action: log.action,
    resource: log.resource,
    resourceId: log.resourceId,
    details: log.reason || 'N/A',
    createdAt: log.createdAt,
    user: { id: log.userId || 'unknown', email: 'N/A' },
    organization: { id: log.orgId || 'unknown', name: 'N/A' }
  }))

  return successResponse(res, 'Audit logs fetched', {
    data: enrichedLogs,
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
  const settings = await findMany('system_setting', {}, { limit: 100 })

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

  const setting = await upsert('system_setting', 
    { key }, 
    { value: String(value), dataType },
    'key'
  )

  // Log action
  await create('audit_log', {
    action: 'UPDATE_SETTING',
    resource: 'SystemSettings',
    resourceId: setting.id || key,
    userId: req.user.id,
    reason: `Updated setting: ${key}`,
    ipAddress: req.ip
  }).catch(err => console.warn('Audit log creation failed:', err))

  return successResponse(res, 'Setting updated', setting)
})

/**
 * GET /api/superadmin/billing/overview
 * Get billing overview
 */
export const getBillingOverview = asyncHandler(async (req, res) => {
  const subscriptions = await findMany('organization_subscription', { status: 'ACTIVE' }, { limit: 10000 })
  const allPlans = await findMany('subscription_plan', {}, { limit: 100 })
  const allOrgs = await findMany('organization', {}, { limit: 10000 })

  const totalMRR = subscriptions.reduce((sum, sub) => {
    const plan = allPlans.find(p => p.id === sub.planId)
    return sum + (plan?.price || 0)
  }, 0)

  const byStatus = {}
  subscriptions.forEach(sub => {
    const status = sub.paymentStatus || 'UNKNOWN'
    byStatus[status] = (byStatus[status] || 0) + 1
  })

  const byPlan = {}
  subscriptions.forEach(sub => {
    const plan = allPlans.find(p => p.id === sub.planId)
    const planName = plan?.planName || 'Unknown'
    byPlan[planName] = (byPlan[planName] || 0) + (plan?.price || 0)
  })

  const billing = {
    totalMRR: Math.round(totalMRR * 100) / 100,
    activeSubscriptions: subscriptions.length,
    paymentStatus: byStatus,
    revenueByPlan: byPlan
  }

  return successResponse(res, 'Billing overview fetched', billing)
})
