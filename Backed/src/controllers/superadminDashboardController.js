/**
 * Super Admin Dashboard Controller
 * Comprehensive system management and monitoring
 * 
 * Features:
 * - Dashboard statistics and overview
 * - Analytics and growth tracking
 * - Organization management
 * - User management across organizations
 * - Subscription plan management
 * - System monitoring and audit logs
 * - Search and filtering capabilities
 * - Profile management
 * 
 * Updated: March 8, 2026
 */

import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * ============================================================================
 * DASHBOARD STATISTICS & OVERVIEW
 * ============================================================================
 */

/**
 * GET /api/superadmin/dashboard/overview
 * Get comprehensive dashboard statistics
 */
export async function getDashboardOverview(req, res) {
  try {
    // Fetch counts using Prisma
    const [
      orgsCount,
      usersCount,
      activeSubscriptionsCount,
      attendanceCount
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.organizationSubscription.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.attendance.count()
    ]);

    // Get organization status breakdown
    const orgsByStatus = await prisma.organization.groupBy({
      by: ['status'],
      _count: true
    });

    const orgStatusMap = orgsByStatus.reduce((acc, group) => {
      acc[group.status || 'UNKNOWN'] = group._count;
      return acc;
    }, {});

    // Get user status breakdown
    const usersByStatus = await prisma.user.groupBy({
      by: ['status'],
      _count: true
    });

    const userStatusMap = usersByStatus.reduce((acc, group) => {
      acc[group.status || 'UNKNOWN'] = group._count;
      return acc;
    }, {});

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendanceCount = await prisma.attendance.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrgsCount = await prisma.organization.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    const recentUsersCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    return successResponse(res, 'Dashboard overview fetched', {
      organizations: {
        total: orgsCount,
        byStatus: orgStatusMap,
        recentCount: recentOrgsCount
      },
      users: {
        total: usersCount,
        byStatus: userStatusMap,
        recentCount: recentUsersCount
      },
      subscriptions: {
        activePaid: activeSubscriptionsCount
      },
      attendance: {
        total: attendanceCount,
        today: todayAttendanceCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getDashboardOverview:', error.message);
    return errorResponse(res, 'Failed to fetch dashboard overview: ' + error.message, 500);
  }
}

/**
 * ============================================================================
 * ANALYTICS & GROWTH TRACKING
 * ============================================================================
 */

/**
 * GET /api/superadmin/dashboard/analytics/organization-growth
 * Get organization growth over time (last N days)
 */
export async function getOrganizationGrowth(req, res) {
  try {
    const { days = '30' } = req.query;
    const daysCount = parseInt(days);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    // Get organizations created in the period
    const { data: organizations, error } = await supabase
      .from('Organization')
      .select('Org_ID, CreatedAt')
      .gte('CreatedAt', startDate.toISOString())
      .order('CreatedAt', { ascending: true });

    if (error) throw error;

    // Group by date
    const growthData = {};
    organizations?.forEach(org => {
      const date = new Date(org.CreatedAt).toLocaleDateString();
      growthData[date] = (growthData[date] || 0) + 1;
    });

    // Calculate cumulative growth
    let cumulative = 0;
    const cumulativeGrowth = {};
    Object.keys(growthData).sort().forEach(date => {
      cumulative += growthData[date];
      cumulativeGrowth[date] = cumulative;
    });

    return successResponse(res, 'Organization growth fetched', {
      period: { days: daysCount, startDate: startDate.toISOString() },
      dailyNew: growthData,
      cumulativeGrowth,
      totalNewOrganizations: cumulative
    });
  } catch (error) {
    console.log('Error in getOrganizationGrowth:', error.message);
    return errorResponse(res, 'Failed to fetch organization growth: ' + error.message, 500);
  }
}

/**
 * GET /api/superadmin/dashboard/analytics/user-growth
 * Get user growth over time (last N days)
 */
export async function getUserGrowth(req, res) {
  try {
    const { days = '30' } = req.query;
    const daysCount = parseInt(days);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    // Get users created in the period
    const { data: users } = await supabase
      .from('User')
      .select('User_ID, CreatedAt, user_type_name')
      .gte('CreatedAt', startDate.toISOString())
      .order('CreatedAt', { ascending: true });

    if (!users) return successResponse(res, 'User growth fetched', { dailyNew: {}, byUserType: {} });

    // Group by date
    const growthData = {};
    const byUserType = {};
    
    users.forEach(user => {
      const date = new Date(user.CreatedAt).toLocaleDateString();
      growthData[date] = (growthData[date] || 0) + 1;
      
      const type = user.user_type_name || 'Unknown';
      byUserType[type] = (byUserType[type] || 0) + 1;
    });

    // Calculate cumulative growth
    let cumulative = 0;
    const cumulativeGrowth = {};
    Object.keys(growthData).sort().forEach(date => {
      cumulative += growthData[date];
      cumulativeGrowth[date] = cumulative;
    });

    return successResponse(res, 'User growth fetched', {
      period: { days: daysCount, startDate: startDate.toISOString() },
      dailyNew: growthData,
      cumulativeGrowth,
      byUserType,
      totalNewUsers: cumulative
    });
  } catch (error) {
    console.log('Error in getUserGrowth:', error.message);
    return errorResponse(res, 'Failed to fetch user growth: ' + error.message, 500);
  }
}

/**
 * GET /api/superadmin/dashboard/analytics/attendance-trends
 * Get attendance trends over time
 */
export async function getAttendanceTrends(req, res) {
  try {
    const { days = '30' } = req.query;
    const daysCount = parseInt(days);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    // Get attendance records in the period
    const { data: attendanceRecords } = await supabase
      .from('Attendance')
      .select('CheckInTime, Status')
      .gte('CheckInTime', startDate.toISOString());

    if (!attendanceRecords) {
      return successResponse(res, 'Attendance trends fetched', {
        dailyStats: {},
        statusBreakdown: {}
      });
    }

    // Group by date and status
    const dailyStats = {};
    const statusBreakdown = {};

    attendanceRecords.forEach(record => {
      const date = new Date(record.CheckInTime).toLocaleDateString();
      const status = record.Status || 'Unknown';

      // Daily stats
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, present: 0, absent: 0, late: 0 };
      }
      dailyStats[date].total++;

      if (status === 'Present') dailyStats[date].present++;
      else if (status === 'Absent') dailyStats[date].absent++;
      else if (status === 'Late') dailyStats[date].late++;

      // Status breakdown
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    });

    return successResponse(res, 'Attendance trends fetched', {
      period: { days: daysCount, startDate: startDate.toISOString() },
      dailyStats,
      statusBreakdown,
      averageDailyPresence: Math.round(
        Object.values(dailyStats).reduce((sum, day) => sum + day.present, 0) / 
        Object.keys(dailyStats).length
      ) || 0
    });
  } catch (error) {
    console.log('Error in getAttendanceTrends:', error.message);
    return errorResponse(res, 'Failed to fetch attendance trends: ' + error.message, 500);
  }
}

/**
 * ============================================================================
 * ORGANIZATION MANAGEMENT
 * ============================================================================
 */

/**
 * GET /api/superadmin/organizations
 * Get all organizations with pagination and filtering
 */
export async function getAllOrganizations(req, res) {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('Organization')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('Status', status);
    }

    if (search) {
      query = query.or(`Name.ilike.%${search}%,Email.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .range(skip, skip + parseInt(limit) - 1)
      .order('Org_ID', { ascending: false });

    if (error) throw error;

    return successResponse(res, 'Organizations fetched', {
      data,
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil((count || 0) / parseInt(limit))
      }
    });
  } catch (error) {
    console.log('Error in getAllOrganizations:', error.message);
    return errorResponse(res, 'Failed to fetch organizations: ' + error.message, 500);
  }
}

/**
 * POST /api/superadmin/organizations
 * Create new organization
 */
export async function createOrganization(req, res) {
  try {
    const {
      Org_Name,
      email,
      phone,
      address,
      org_type_id,
      region_id,
      industry,
      num_employees
    } = req.body;

    if (!Org_Name || !email) {
      return errorResponse(res, 'Missing required fields: Org_Name, email', null, 400);
    }

    const { data, error } = await supabase
      .from('Organization')
      .insert([{
        Org_Name,
        email,
        phone,
        address,
        org_type_id,
        region_id,
        industry,
        num_employees,
        status: 'ACTIVE',
        CreatedAt: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    return successResponse(res, 'Organization created successfully', data[0], 201);
  } catch (error) {
    console.log('Error in createOrganization:', error.message);
    return errorResponse(res, 'Failed to create organization: ' + error.message, 500);
  }
}

/**
 * PUT /api/superadmin/organizations/:id
 * Update organization
 */
export async function updateOrganization(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from('Organization')
      .update({ ...updateData, UpdatedAt: new Date().toISOString() })
      .eq('Org_ID', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return errorResponse(res, 'Organization not found', null, 404);
    }

    return successResponse(res, 'Organization updated successfully', data[0]);
  } catch (error) {
    console.log('Error in updateOrganization:', error.message);
    return errorResponse(res, 'Failed to update organization: ' + error.message, 500);
  }
}

/**
 * GET /api/superadmin/organizations/:id
 * Get single organization details
 */
export async function getOrganizationDetails(req, res) {
  try {
    const { id } = req.params;

    const { data: org, error: orgError } = await supabase
      .from('Organization')
      .select('*')
      .eq('Org_ID', id)
      .single();

    if (orgError) throw orgError;
    if (!org) {
      return errorResponse(res, 'Organization not found', null, 404);
    }

    // Get organization users count
    const { count: usersCount } = await supabase
      .from('User')
      .select('*', { count: 'exact', head: true })
      .eq('Org_ID', id);

    // Get organization devices count
    const { count: devicesCount } = await supabase
      .from('Device')
      .select('*', { count: 'exact', head: true });

    // Get subscription info
    const { data: subscription } = await supabase
      .from('OrganizationSubscription')
      .select('*')
      .eq('Org_ID', id)
      .single();

    // Get attendance count
    const { count: attendanceCount } = await supabase
      .from('Attendance')
      .select('*', { count: 'exact', head: true })
      .eq('Org_ID', id);

    return successResponse(res, 'Organization details fetched', {
      ...org,
      stats: {
        users: usersCount || 0,
        devices: devicesCount || 0,
        attendanceRecords: attendanceCount || 0,
        subscription: subscription || null
      }
    });
  } catch (error) {
    console.log('Error in getOrganizationDetails:', error.message);
    return errorResponse(res, 'Failed to fetch organization details: ' + error.message, 500);
  }
}

/**
 * ============================================================================
 * SUBSCRIPTION PLAN MANAGEMENT
 * ============================================================================
 */

/**
 * GET /api/superadmin/subscription-plans
 * Get all subscription plans
 */
export async function getSubscriptionPlans(req, res) {
  try {
    const { data, error } = await supabase
      .from('SubscriptionPlan')
      .select('*')
      .order('Price', { ascending: true });

    if (error) throw error;

    return successResponse(res, 'Subscription plans fetched', data || []);
  } catch (error) {
    console.log('Error in getSubscriptionPlans:', error.message);
    return errorResponse(res, 'Failed to fetch subscription plans: ' + error.message, 500);
  }
}

/**
 * POST /api/superadmin/subscription-plans
 * Create subscription plan
 */
export async function createSubscriptionPlan(req, res) {
  try {
    const {
      Plan_Name,
      Description,
      Price,
      Billing_Cycle,
      MaxUsers,
      Features
    } = req.body;

    if (!Plan_Name || Price === undefined) {
      return errorResponse(res, 'Missing required fields: Plan_Name, Price', null, 400);
    }

    const { data, error } = await supabase
      .from('SubscriptionPlan')
      .insert([{
        Plan_Name,
        Description,
        Price,
        Billing_Cycle: Billing_Cycle || 'MONTHLY',
        MaxUsers: MaxUsers || 0,
        Features: Features || [],
        CreatedAt: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    return successResponse(res, 'Subscription plan created', data[0], 201);
  } catch (error) {
    console.log('Error in createSubscriptionPlan:', error.message);
    return errorResponse(res, 'Failed to create subscription plan: ' + error.message, 500);
  }
}

/**
 * PUT /api/superadmin/subscription-plans/:id
 * Update subscription plan
 */
export async function updateSubscriptionPlan(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from('SubscriptionPlan')
      .update({ ...updateData, UpdatedAt: new Date().toISOString() })
      .eq('Plan_ID', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return errorResponse(res, 'Subscription plan not found', null, 404);
    }

    return successResponse(res, 'Subscription plan updated', data[0]);
  } catch (error) {
    console.log('Error in updateSubscriptionPlan:', error.message);
    return errorResponse(res, 'Failed to update subscription plan: ' + error.message, 500);
  }
}

/**
 * ============================================================================
 * SYSTEM MONITORING & AUDIT LOGS
 * ============================================================================
 */

/**
 * GET /api/superadmin/audit-logs
 * Get system-wide audit logs
 */
export async function getSystemAuditLogs(req, res) {
  try {
    const { page = 1, limit = 50, action, tableName, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('AuditLog')
      .select('*', { count: 'exact' });

    if (action) {
      query = query.eq('Action', action);
    }

    if (tableName) {
      query = query.eq('Table_Name', tableName);
    }

    if (startDate) {
      query = query.gte('ChangedAt', startDate);
    }

    if (endDate) {
      query = query.lte('ChangedAt', endDate);
    }

    const { data, count, error } = await query
      .range(skip, skip + parseInt(limit) - 1)
      .order('ChangedAt', { ascending: false });

    if (error) throw error;

    return successResponse(res, 'Audit logs fetched', {
      data,
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil((count || 0) / parseInt(limit))
      }
    });
  } catch (error) {
    console.log('Error in getSystemAuditLogs:', error.message);
    return errorResponse(res, 'Failed to fetch audit logs: ' + error.message, 500);
  }
}

/**
 * GET /api/superadmin/system-activity
 * Get recent system activity
 */
export async function getSystemActivity(req, res) {
  try {
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('AuditLog')
      .select('*')
      .order('ChangedAt', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    return successResponse(res, 'System activity fetched', data || []);
  } catch (error) {
    console.log('Error in getSystemActivity:', error.message);
    return errorResponse(res, 'Failed to fetch system activity: ' + error.message, 500);
  }
}

/**
 * GET /api/superadmin/recent-registrations
 * Get recent organization and user registrations
 */
export async function getRecentRegistrations(req, res) {
  try {
    const { days = '7' } = req.query;
    const daysCount = parseInt(days);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    const [
      { data: recentOrgs },
      { data: recentUsers }
    ] = await Promise.all([
      supabase
        .from('organization_full_view')
        .select('Org_ID, Org_Name, CreatedAt, status')
        .gte('CreatedAt', startDate.toISOString())
        .order('CreatedAt', { ascending: false })
        .limit(50),
      supabase
        .from('user_full_view')
        .select('User_ID, First_Name, Last_Name, Email, org_name, CreatedAt')
        .gte('CreatedAt', startDate.toISOString())
        .order('CreatedAt', { ascending: false })
        .limit(50)
    ]);

    return successResponse(res, 'Recent registrations fetched', {
      organizations: recentOrgs || [],
      users: recentUsers || [],
      period: { days: daysCount }
    });
  } catch (error) {
    console.log('Error in getRecentRegistrations:', error.message);
    return errorResponse(res, 'Failed to fetch recent registrations: ' + error.message, 500);
  }
}

/**
 * ============================================================================
 * SEARCH FEATURES
 * ============================================================================
 */

/**
 * GET /api/superadmin/search/organizations
 * Search organizations globally
 */
export async function searchOrganizations(req, res) {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query || query.length < 2) {
      return errorResponse(res, 'Search query must be at least 2 characters', null, 400);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const { data, count, error } = await supabase
      .from('organization_full_view')
      .select('*', { count: 'exact' })
      .or(`Org_Name.ilike.%${query}%,email.ilike.%${query}%,address.ilike.%${query}%`)
      .range(skip, skip + parseInt(limit) - 1);

    if (error) throw error;

    return successResponse(res, 'Organizations found', {
      results: data || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.log('Error in searchOrganizations:', error.message);
    return errorResponse(res, 'Search failed: ' + error.message, 500);
  }
}

/**
 * GET /api/superadmin/search/users
 * Search users globally across all organizations
 */
export async function searchUsers(req, res) {
  try {
    const { query, page = 1, limit = 10, orgId } = req.query;

    if (!query || query.length < 2) {
      return errorResponse(res, 'Search query must be at least 2 characters', null, 400);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let dbQuery = supabase
      .from('user_full_view')
      .select('*', { count: 'exact' })
      .or(`First_Name.ilike.%${query}%,Last_Name.ilike.%${query}%,Email.ilike.%${query}%`);

    if (orgId) {
      dbQuery = dbQuery.eq('org_id', orgId);
    }

    const { data, count, error } = await dbQuery
      .range(skip, skip + parseInt(limit) - 1);

    if (error) throw error;

    return successResponse(res, 'Users found', {
      results: data || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.log('Error in searchUsers:', error.message);
    return errorResponse(res, 'Search failed: ' + error.message, 500);
  }
}

/**
 * GET /api/superadmin/search/attendance
 * Search attendance records globally
 */
export async function searchAttendanceRecords(req, res) {
  try {
    const { 
      query, 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate,
      status 
    } = req.query;

    if (!query || query.length < 2) {
      return errorResponse(res, 'Search query must be at least 2 characters', null, 400);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let dbQuery = supabase
      .from('attendance_full_view')
      .select('*', { count: 'exact' })
      .or(`user_name.ilike.%${query}%,org_name.ilike.%${query}%`);

    if (startDate) {
      dbQuery = dbQuery.gte('attendance_date', startDate);
    }

    if (endDate) {
      dbQuery = dbQuery.lte('attendance_date', endDate);
    }

    if (status) {
      dbQuery = dbQuery.eq('status_name', status);
    }

    const { data, count, error } = await dbQuery
      .range(skip, skip + parseInt(limit) - 1)
      .order('attendance_date', { ascending: false });

    if (error) throw error;

    return successResponse(res, 'Attendance records found', {
      results: data || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.log('Error in searchAttendanceRecords:', error.message);
    return errorResponse(res, 'Search failed: ' + error.message, 500);
  }
}

/**
 * ============================================================================
 * PROFILE MANAGEMENT
 * ============================================================================
 */

/**
 * GET /api/superadmin/profile
 * Get current super admin profile
 */
export async function getSuperAdminProfile(req, res) {
  try {
    const userId = req.user?.User_ID || req.user?.id;

    const { data, error } = await supabase
      .from('user_full_view')
      .select('*')
      .eq('User_ID', userId)
      .single();

    if (error) throw error;
    if (!data) {
      return errorResponse(res, 'Profile not found', null, 404);
    }

    // Remove sensitive data
    const profile = { ...data };
    delete profile.password;

    return successResponse(res, 'Profile fetched', profile);
  } catch (error) {
    console.log('Error in getSuperAdminProfile:', error.message);
    return errorResponse(res, 'Failed to fetch profile: ' + error.message, 500);
  }
}

/**
 * PUT /api/superadmin/profile
 * Update super admin profile
 */
export async function updateSuperAdminProfile(req, res) {
  try {
    const userId = req.user?.User_ID || req.user?.id;
    const { First_Name, Last_Name, Email, Phone, Job_Title } = req.body;

    const { data, error } = await supabase
      .from('User')
      .update({
        First_Name,
        Last_Name,
        Email,
        Phone,
        Job_Title,
        UpdatedAt: new Date().toISOString()
      })
      .eq('User_ID', userId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return errorResponse(res, 'User not found', null, 404);
    }

    const profile = { ...data[0] };
    delete profile.password;

    return successResponse(res, 'Profile updated successfully', profile);
  } catch (error) {
    console.log('Error in updateSuperAdminProfile:', error.message);
    return errorResponse(res, 'Failed to update profile: ' + error.message, 500);
  }
}

/**
 * PUT /api/superadmin/change-password
 * Change super admin password
 */
export async function changeSuperAdminPassword(req, res) {
  try {
    const userId = req.user?.User_ID || req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Missing required fields: currentPassword, newPassword', null, 400);
    }

    if (newPassword.length < 8) {
      return errorResponse(res, 'Password must be at least 8 characters', null, 400);
    }

    // Note: In production, verify current password using auth service
    // For now, just update password
    const { data, error } = await supabase
      .from('User')
      .update({
        Password: newPassword, // Note: Should be hashed in production
        UpdatedAt: new Date().toISOString()
      })
      .eq('User_ID', userId)
      .select();

    if (error) throw error;

    return successResponse(res, 'Password changed successfully', {
      message: 'Your password has been changed'
    });
  } catch (error) {
    console.log('Error in changeSuperAdminPassword:', error.message);
    return errorResponse(res, 'Failed to change password: ' + error.message, 500);
  }
}

/**
 * ============================================================================
 * SYSTEM CONFIGURATION
 * ============================================================================
 */

/**
 * GET /api/superadmin/regions
 * Get all system regions
 */
export async function getRegions(req, res) {
  try {
    const { data, error } = await supabase
      .from('Region')
      .select('*')
      .order('Region_Name', { ascending: true });

    if (error) throw error;

    return successResponse(res, 'Regions fetched', data || []);
  } catch (error) {
    console.log('Error in getRegions:', error.message);
    return errorResponse(res, 'Failed to fetch regions: ' + error.message, 500);
  }
}

/**
 * POST /api/superadmin/regions
 * Create new region
 */
export async function createRegion(req, res) {
  try {
    const { Region_Name, Code, Description } = req.body;

    if (!Region_Name || !Code) {
      return errorResponse(res, 'Missing required fields: Region_Name, Code', null, 400);
    }

    const { data, error } = await supabase
      .from('Region')
      .insert([{
        Region_Name,
        Code,
        Description,
        CreatedAt: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    return successResponse(res, 'Region created successfully', data[0], 201);
  } catch (error) {
    console.log('Error in createRegion:', error.message);
    return errorResponse(res, 'Failed to create region: ' + error.message, 500);
  }
}

/**
 * GET /api/superadmin/organization-types
 * Get all organization types
 */
export async function getOrganizationTypes(req, res) {
  try {
    const { data, error } = await supabase
      .from('Org_Type')
      .select('*')
      .order('Type_Name', { ascending: true });

    if (error) throw error;

    return successResponse(res, 'Organization types fetched', data || []);
  } catch (error) {
    console.log('Error in getOrganizationTypes:', error.message);
    return errorResponse(res, 'Failed to fetch organization types: ' + error.message, 500);
  }
}

/**
 * POST /api/superadmin/organization-types
 * Create new organization type
 */
export async function createOrganizationType(req, res) {
  try {
    const { Type_Name, Description } = req.body;

    if (!Type_Name) {
      return errorResponse(res, 'Missing required field: Type_Name', null, 400);
    }

    const { data, error } = await supabase
      .from('Org_Type')
      .insert([{
        Type_Name,
        Description,
        CreatedAt: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    return successResponse(res, 'Organization type created successfully', data[0], 201);
  } catch (error) {
    console.log('Error in createOrganizationType:', error.message);
    return errorResponse(res, 'Failed to create organization type: ' + error.message, 500);
  }
}

export default {
  // Overview
  getDashboardOverview,
  
  // Analytics
  getOrganizationGrowth,
  getUserGrowth,
  getAttendanceTrends,
  
  // Organization Management
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  getOrganizationDetails,
  
  // Subscription Management
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  
  // System Monitoring
  getSystemAuditLogs,
  getSystemActivity,
  getRecentRegistrations,
  
  // Search
  searchOrganizations,
  searchUsers,
  searchAttendanceRecords,
  
  // Profile Management
  getSuperAdminProfile,
  updateSuperAdminProfile,
  changeSuperAdminPassword,
  
  // System Configuration
  getRegions,
  createRegion,
  getOrganizationTypes,
  createOrganizationType
};
