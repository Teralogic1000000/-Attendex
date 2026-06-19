// Backed/src/routes/employeeDashboardRoutes.js

import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/rbacMiddleware.js';
import {
  getEmployeeDashboardOverview,
  getEmployeeProfile,
  updateEmployeeProfile,
  getDepartmentInfo,
  getAssignedDevice,
  getOrganizationInfo,
  checkInAttendance,
  checkOutAttendance,
  getTodayAttendanceStatus,
  getAttendanceHistory,
  getAttendanceStatistics,
} from '../controllers/employeeDashboardController.js';

const router = express.Router();

/**
 * All employee dashboard routes require authentication and Employee role or higher
 * Employee can only access their own data (scoped to req.user.id)
 */

/**
 * GET /overview
 * Get employee dashboard overview (profile, department, device, org, today's status)
 * Access: Employee, Manager, Org_Admin, Super_Admin
 */
router.get('/overview', verifyToken, authorizeRoles('Employee', 'Manager', 'Org_Admin', 'Super_Admin'), getEmployeeDashboardOverview);

/**
 * GET /profile
 * Get employee's own profile (limited information)
 * Access: Employee and above
 */
router.get('/profile', verifyToken, authorizeRoles('Employee', 'Manager', 'Org_Admin', 'Super_Admin'), getEmployeeProfile);

/**
 * PUT /profile
 * Update employee's own profile (RESTRICTED: only phone number)
 * Request body: { phone }
 * Access: Employee and above
 * RESTRICTION: Employees can only update their own phone number
 */
router.put('/profile', verifyToken, authorizeRoles('Employee', 'Manager', 'Org_Admin', 'Super_Admin'), updateEmployeeProfile);

/**
 * GET /department
 * Get assigned department information (view-only)
 * Access: Employee and above
 */
router.get('/department', verifyToken, authorizeRoles('Employee', 'Manager', 'Org_Admin', 'Super_Admin'), getDepartmentInfo);

/**
 * GET /device
 * Get assigned device information (view-only)
 * Access: Employee and above
 */
router.get('/device', verifyToken, authorizeRoles('Employee', 'Manager', 'Org_Admin', 'Super_Admin'), getAssignedDevice);

/**
 * GET /organization
 * Get organization information (view-only)
 * Access: Employee and above
 */
router.get('/organization', verifyToken, authorizeRoles('Employee', 'Manager', 'Org_Admin', 'Super_Admin'), getOrganizationInfo);

// ============= ATTENDANCE ENDPOINTS =============

/**
 * POST /attendance/checkin
 * Record employee check-in
 * Request body: { geofenceId?, latitude?, longitude?, notes? }
 * Access: Employee and above
 * RESTRICTION: Can only check in once per day
 */
router.post(
  '/attendance/checkin',
  verifyToken,
  authorizeRoles('Employee', 'Manager', 'Org_Admin', 'Super_Admin'),
  checkInAttendance
);

/**
 * POST /attendance/checkout
 * Record employee check-out
 * Request body: { latitude?, longitude?, notes? }
 * Access: Employee and above
 * RESTRICTION: Must check in first; can only check out once per day
 */
router.post(
  '/attendance/checkout',
  verifyToken,
  authorizeRoles('Employee', 'Manager', 'Org_Admin', 'Super_Admin'),
  checkOutAttendance
);

/**
 * GET /attendance/today
 * Get today's attendance status
 * Returns: checked-in status, checked-out status, current status
 * Access: Employee and above
 */
router.get(
  '/attendance/today',
  verifyToken,
  authorizeRoles('Employee', 'Manager', 'Org_Admin', 'Super_Admin'),
  getTodayAttendanceStatus
);

/**
 * GET /attendance/history
 * Get employee's attendance history with pagination and filters
 * Query params: page (default 1), limit (default 30, max 100), startDate, endDate, status
 * Access: Employee and above
 * RESTRICTION: Employees can only view their own attendance records
 */
router.get(
  '/attendance/history',
  verifyToken,
  authorizeRoles('Employee', 'Manager', 'Org_Admin', 'Super_Admin'),
  getAttendanceHistory
);

/**
 * GET /attendance/statistics
 * Get employee's attendance statistics for a month
 * Query params: month (1-12), year
 * Returns: present days, absent days, late days, attendance rate
 * Access: Employee and above
 */
router.get(
  '/attendance/statistics',
  verifyToken,
  authorizeRoles('Employee', 'Manager', 'Org_Admin', 'Super_Admin'),
  getAttendanceStatistics
);

export default router;
