/**
 * Organization Admin Dashboard Routes
 * Organization-specific management and monitoring endpoints
 * 
 * All routes require Org_Admin role and are scoped to the admin's organization
 * Updated: March 6, 2026
 */

import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/rbacMiddleware.js';
import {
  // Dashboard Overview
  getDashboardOverview,
  
  // Analytics & Reporting
  getAttendanceTrends,
  getDepartmentAttendanceComparison,
  
  // User Management
  getOrganizationUsers,
  createUser,
  updateUser,
  resetUserPassword,
  assignUserToDepartment,
  
  // Department Management
  getOrganizationDepartments,
  createDepartment,
  updateDepartment,
  getDepartmentAttendanceReport,
  
  // Device Management
  getOrganizationDevices,
  registerDevice,
  assignDeviceToUser,
  
  // Geofence Management
  getOrganizationGeofences,
  createGeofence,
  updateGeofence,
  
  // Attendance Management
  getOrganizationAttendance,
  getEmployeeAttendanceReport,
  getMonthlyAttendanceReport,
  
  // Profile Management
  getOrganizationProfile,
  updateOrganizationProfile,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword
} from '../controllers/organizationAdminDashboardController.js';

const router = express.Router();

// All routes require Org_Admin role
router.use(verifyToken);
router.use(authorizeRoles('Org_Admin'));

/**
 * ============================================================================
 * DASHBOARD OVERVIEW & STATISTICS
 * ============================================================================
 */

/**
 * GET /api/org-dashboard/overview
 * Get organization dashboard overview with key metrics
 * 
 * Returns:
 * - Total users in organization
 * - Total departments
 * - Total devices
 * - Today's attendance (by status)
 * - All-time attendance statistics
 */
router.get('/overview', getDashboardOverview);

/**
 * ============================================================================
 * ANALYTICS & REPORTING
 * ============================================================================
 */

/**
 * GET /api/org-dashboard/analytics/attendance-trends
 * Get attendance trends over specified period
 * 
 * Query Params:
 * - days: Period to analyze (default: 30)
 */
router.get('/analytics/attendance-trends', getAttendanceTrends);

/**
 * GET /api/org-dashboard/analytics/department-comparison
 * Get attendance comparison between departments
 * 
 * Query Params:
 * - days: Period to analyze (default: 30)
 */
router.get('/analytics/department-comparison', getDepartmentAttendanceComparison);

/**
 * ============================================================================
 * USER MANAGEMENT
 * ============================================================================
 */

/**
 * GET /api/org-dashboard/users
 * Get all users in organization
 * 
 * Query Params:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 10)
 * - status: Filter by status (ACTIVE, INACTIVE)
 * - search: Search by name or email
 */
router.get('/users', getOrganizationUsers);

/**
 * POST /api/org-dashboard/users
 * Create new user in organization
 * 
 * Body:
 * - First_Name: User first name (required)
 * - Last_Name: User last name (required)
 * - Email: User email (required)
 * - Phone: User phone number
 * - user_type_name: Role type (required)
 * - Department_ID: Department ID (optional)
 */
router.post('/users', createUser);

/**
 * PUT /api/org-dashboard/users/:id
 * Update user details
 * 
 * Body: Any user fields to update
 */
router.put('/users/:id', updateUser);

/**
 * PUT /api/org-dashboard/users/:id/reset-password
 * Reset user password to temporary password
 * 
 * Body:
 * - newPassword: New password (optional, default: TempPassword123!)
 */
router.put('/users/:id/reset-password', resetUserPassword);

/**
 * PUT /api/org-dashboard/users/:id/assign-department
 * Assign user to department
 * 
 * Body:
 * - Department_ID: Department ID (required)
 */
router.put('/users/:id/assign-department', assignUserToDepartment);

/**
 * ============================================================================
 * DEPARTMENT MANAGEMENT
 * ============================================================================
 */

/**
 * GET /api/org-dashboard/departments
 * Get all departments in organization
 */
router.get('/departments', getOrganizationDepartments);

/**
 * POST /api/org-dashboard/departments
 * Create new department
 * 
 * Body:
 * - Dept_Name: Department name (required)
 * - Description: Department description
 * - Manager_ID: Manager user ID
 */
router.post('/departments', createDepartment);

/**
 * PUT /api/org-dashboard/departments/:id
 * Update department
 */
router.put('/departments/:id', updateDepartment);

/**
 * GET /api/org-dashboard/departments/:id/attendance-report
 * Get department attendance report
 * 
 * Query Params:
 * - days: Period to analyze (default: 30)
 */
router.get('/departments/:id/attendance-report', getDepartmentAttendanceReport);

/**
 * ============================================================================
 * DEVICE MANAGEMENT
 * ============================================================================
 */

/**
 * GET /api/org-dashboard/devices
 * Get all devices in organization
 * 
 * Query Params:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 10)
 * - status: Filter by status (ACTIVE, INACTIVE)
 */
router.get('/devices', getOrganizationDevices);

/**
 * POST /api/org-dashboard/devices
 * Register new device
 * 
 * Body:
 * - Device_MAC: Device MAC address (required)
 * - Device_Model: Device model name (required)
 * - Device_Type: Device type (optional, default: Mobile)
 */
router.post('/devices', registerDevice);

/**
 * PUT /api/org-dashboard/devices/:id/assign-user
 * Assign device to user
 * 
 * Body:
 * - User_ID: User ID (required)
 */
router.put('/devices/:id/assign-user', assignDeviceToUser);

/**
 * ============================================================================
 * GEOFENCE MANAGEMENT
 * ============================================================================
 */

/**
 * GET /api/org-dashboard/geofences
 * Get all geofences in organization
 */
router.get('/geofences', getOrganizationGeofences);

/**
 * POST /api/org-dashboard/geofences
 * Create new geofence location
 * 
 * Body:
 * - Geofence_Name: Location name (required)
 * - Latitude: Location latitude (required)
 * - Longitude: Location longitude (required)
 * - Radius_Meters: Geofence radius in meters (required)
 * - Description: Location description
 */
router.post('/geofences', createGeofence);

/**
 * PUT /api/org-dashboard/geofences/:id
 * Update geofence location
 */
router.put('/geofences/:id', updateGeofence);

/**
 * ============================================================================
 * ATTENDANCE MANAGEMENT
 * ============================================================================
 */

/**
 * GET /api/org-dashboard/attendance
 * Get organization attendance records
 * 
 * Query Params:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 10)
 * - departmentId: Filter by department
 * - status: Filter by attendance status (Present, Absent, Late)
 * - startDate: Filter from date (ISO format)
 * - endDate: Filter to date (ISO format)
 */
router.get('/attendance', getOrganizationAttendance);

/**
 * GET /api/org-dashboard/employees/:id/attendance-report
 * Get individual employee attendance report
 * 
 * Query Params:
 * - days: Period to analyze (default: 90)
 */
router.get('/employees/:id/attendance-report', getEmployeeAttendanceReport);

/**
 * GET /api/org-dashboard/reports/monthly-attendance
 * Get monthly attendance report for organization
 * 
 * Query Params:
 * - month: Month number 1-12 (default: current month)
 * - year: Year (default: current year)
 */
router.get('/reports/monthly-attendance', getMonthlyAttendanceReport);

/**
 * ============================================================================
 * PROFILE MANAGEMENT
 * ============================================================================
 */

/**
 * GET /api/org-dashboard/organization/profile
 * Get organization profile
 */
router.get('/organization/profile', getOrganizationProfile);

/**
 * PUT /api/org-dashboard/organization/profile
 * Update organization profile
 * 
 * Body:
 * - Org_Name: Organization name
 * - email: Organization email
 * - phone: Organization phone
 * - address: Organization address
 */
router.put('/organization/profile', updateOrganizationProfile);

/**
 * GET /api/org-dashboard/admin/profile
 * Get current admin's profile
 */
router.get('/admin/profile', getAdminProfile);

/**
 * PUT /api/org-dashboard/admin/profile
 * Update current admin's profile
 * 
 * Body:
 * - First_Name: First name
 * - Last_Name: Last name
 * - Email: Email address
 * - Phone: Phone number
 * - Job_Title: Job title
 */
router.put('/admin/profile', updateAdminProfile);

/**
 * PUT /api/org-dashboard/admin/change-password
 * Change admin password
 * 
 * Body:
 * - currentPassword: Current password (required)
 * - newPassword: New password (required, min 8 characters)
 */
router.put('/admin/change-password', changeAdminPassword);

export default router;
