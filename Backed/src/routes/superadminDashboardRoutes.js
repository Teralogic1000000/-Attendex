/**
 * Super Admin Dashboard Routes
 * Comprehensive system management and monitoring endpoints
 * 
 * All routes require Super_Admin role
 * Updated: March 6, 2026
 */

import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/rbacMiddleware.js';
import {
  // Dashboard Overview
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
} from '../controllers/superadminDashboardController.js';

const router = express.Router();

// All routes require Super_Admin role
router.use(verifyToken);
router.use(authorizeRoles('Super_Admin'));

/**
 * ============================================================================
 * DASHBOARD OVERVIEW & STATISTICS
 * ============================================================================
 */

/**
 * GET /api/superadmin/dashboard/overview
 * Get comprehensive dashboard statistics
 * 
 * Returns:
 * - Total Organizations (with status breakdown)
 * - Total Users (with status breakdown)
 * - Active Subscriptions
 * - Registered Devices
 * - Total Attendance Records
 * - Recent registrations (last 7 days)
 */
router.get('/overview', getDashboardOverview);

/**
 * ============================================================================
 * ANALYTICS & GROWTH TRACKING
 * ============================================================================
 */

/**
 * GET /api/superadmin/analytics/organization-growth
 * Get organization growth over time
 * 
 * Query Params:
 * - days: Number of days to analyze (default: 30)
 * 
 * Returns:
 * - Daily new organizations
 * - Cumulative growth
 * - Total new organizations in period
 */
router.get('/analytics/organization-growth', getOrganizationGrowth);

/**
 * GET /api/superadmin/analytics/user-growth
 * Get user growth over time
 * 
 * Query Params:
 * - days: Number of days to analyze (default: 30)
 * 
 * Returns:
 * - Daily new users
 * - Cumulative growth
 * - Breakdown by user type
 * - Total new users in period
 */
router.get('/analytics/user-growth', getUserGrowth);

/**
 * GET /api/superadmin/analytics/attendance-trends
 * Get attendance trends over time
 * 
 * Query Params:
 * - days: Number of days to analyze (default: 30)
 * 
 * Returns:
 * - Daily attendance statistics
 * - Status breakdown (Present, Absent, Late)
 * - Average daily presence
 */
router.get('/analytics/attendance-trends', getAttendanceTrends);

/**
 * ============================================================================
 * ORGANIZATION MANAGEMENT
 * ============================================================================
 */

/**
 * GET /api/superadmin/organizations
 * Get all organizations with pagination and filtering
 * 
 * Query Params:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 10)
 * - status: Filter by status (ACTIVE, SUSPENDED, INACTIVE)
 * - search: Search by name or email
 */
router.get('/organizations', getAllOrganizations);

/**
 * POST /api/superadmin/organizations
 * Create new organization
 * 
 * Body:
 * - Org_Name: Organization name (required)
 * - email: Organization email (required)
 * - phone: Organization phone number
 * - address: Organization address
 * - org_type_id: Organization type ID
 * - region_id: Region ID
 * - industry: Industry type
 * - num_employees: Number of employees
 */
router.post('/organizations', createOrganization);

/**
 * GET /api/superadmin/organizations/:id
 * Get single organization details with statistics
 * 
 * Returns:
 * - Organization full details
 * - User count
 * - Device count
 * - Subscription information
 * - Attendance record count
 */
router.get('/organizations/:id', getOrganizationDetails);

/**
 * PUT /api/superadmin/organizations/:id
 * Update organization
 * 
 * Body: Any organization fields to update
 */
router.put('/organizations/:id', updateOrganization);

/**
 * ============================================================================
 * SUBSCRIPTION PLAN MANAGEMENT
 * ============================================================================
 */

/**
 * GET /api/superadmin/subscription-plans
 * Get all subscription plans
 */
router.get('/subscription-plans', getSubscriptionPlans);

/**
 * POST /api/superadmin/subscription-plans
 * Create new subscription plan
 * 
 * Body:
 * - Plan_Name: Plan name (required)
 * - Price: Plan price (required)
 * - Description: Plan description
 * - Billing_Cycle: MONTHLY or YEARLY (default: MONTHLY)
 * - MaxUsers: Maximum users allowed
 * - Features: Array of plan features
 */
router.post('/subscription-plans', createSubscriptionPlan);

/**
 * PUT /api/superadmin/subscription-plans/:id
 * Update subscription plan
 * 
 * Body: Any plan fields to update
 */
router.put('/subscription-plans/:id', updateSubscriptionPlan);

/**
 * ============================================================================
 * SYSTEM MONITORING & AUDIT LOGS
 * ============================================================================
 */

/**
 * GET /api/superadmin/audit-logs
 * Get system-wide audit logs
 * 
 * Query Params:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 50)
 * - action: Filter by action (CREATE, UPDATE, DELETE)
 * - tableName: Filter by table name
 * - startDate: Start date (ISO format)
 * - endDate: End date (ISO format)
 */
router.get('/audit-logs', getSystemAuditLogs);

/**
 * GET /api/superadmin/system-activity
 * Get recent system activity logs
 * 
 * Query Params:
 * - limit: Number of records (default: 50)
 */
router.get('/system-activity', getSystemActivity);

/**
 * GET /api/superadmin/recent-registrations
 * Get recent organization and user registrations
 * 
 * Query Params:
 * - days: Number of days to look back (default: 7)
 */
router.get('/recent-registrations', getRecentRegistrations);

/**
 * ============================================================================
 * SEARCH FEATURES
 * ============================================================================
 */

/**
 * GET /api/superadmin/search/organizations
 * Search organizations globally
 * 
 * Query Params:
 * - query: Search query (minimum 2 characters) (required)
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 10)
 * 
 * Searches:
 * - Organization name
 * - Email
 * - Address
 */
router.get('/search/organizations', searchOrganizations);

/**
 * GET /api/superadmin/search/users
 * Search users globally across all organizations
 * 
 * Query Params:
 * - query: Search query (minimum 2 characters) (required)
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 10)
 * - orgId: Filter by organization ID (optional)
 * 
 * Searches:
 * - First name
 * - Last name
 * - Email
 */
router.get('/search/users', searchUsers);

/**
 * GET /api/superadmin/search/attendance
 * Search attendance records globally
 * 
 * Query Params:
 * - query: Search query (minimum 2 characters) (required)
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 10)
 * - startDate: Start date filter (optional)
 * - endDate: End date filter (optional)
 * - status: Filter by status (optional)
 * 
 * Searches:
 * - User name
 * - Organization name
 */
router.get('/search/attendance', searchAttendanceRecords);

/**
 * ============================================================================
 * PROFILE MANAGEMENT
 * ============================================================================
 */

/**
 * GET /api/superadmin/profile
 * Get current super admin profile
 */
router.get('/profile', getSuperAdminProfile);

/**
 * PUT /api/superadmin/profile
 * Update super admin profile
 * 
 * Body:
 * - First_Name: First name
 * - Last_Name: Last name
 * - Email: Email address
 * - Phone: Phone number
 * - Job_Title: Job title
 */
router.put('/profile', updateSuperAdminProfile);

/**
 * PUT /api/superadmin/change-password
 * Change super admin password
 * 
 * Body:
 * - currentPassword: Current password (required)
 * - newPassword: New password (required, min 8 characters)
 */
router.put('/change-password', changeSuperAdminPassword);

/**
 * ============================================================================
 * SYSTEM CONFIGURATION
 * ============================================================================
 */

/**
 * GET /api/superadmin/regions
 * Get all system regions
 */
router.get('/regions', getRegions);

/**
 * POST /api/superadmin/regions
 * Create new region
 * 
 * Body:
 * - Region_Name: Region name (required)
 * - Code: Region code (required)
 * - Description: Region description
 */
router.post('/regions', createRegion);

/**
 * GET /api/superadmin/organization-types
 * Get all organization types
 */
router.get('/organization-types', getOrganizationTypes);

/**
 * POST /api/superadmin/organization-types
 * Create new organization type
 * 
 * Body:
 * - Type_Name: Type name (required)
 * - Description: Type description
 */
router.post('/organization-types', createOrganizationType);

export default router;
