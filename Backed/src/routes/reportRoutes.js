/**
 * Report Routes
 * Provides endpoints for attendance and organization reports
 */

import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/rbacMiddleware.js';
import {
  getDailyAttendanceReport,
  getMonthlyAttendanceReport,
  getDepartmentAttendanceReport,
  getOrganizationStatistics,
  getUserAttendanceReport
} from '../services/reportService.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

/**
 * POST /reports/daily-attendance
 * Get daily attendance report with breakdown by date
 * Query params: startDate, endDate, departmentId, userId
 * Accessible to: Org_Admin, Manager, Super_Admin
 */
router.post('/daily-attendance', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin', 'Manager'), async (req, res) => {
  try {
    const { startDate, endDate, departmentId = null, userId = null } = req.body;

    // Validate required fields
    if (!startDate || !endDate) {
      return errorResponse(res, 'Start date and end date are required', null, 400);
    }

    // Get organization ID
    let organizationId = req.body.organizationId;
    if (!organizationId && req.user.user_type_name !== 'Super_Admin') {
      organizationId = req.user.organization_id;
    }

    if (!organizationId) {
      return errorResponse(res, 'Organization ID is required', null, 400);
    }

    const result = await getDailyAttendanceReport(organizationId, startDate, endDate, departmentId, userId);

    if (result.error) {
      return errorResponse(res, `Report generation failed: ${result.error}`, null, 400);
    }

    return successResponse(res, 'Daily attendance report generated successfully', {
      report: result.data,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Daily attendance report error:', err);
    return errorResponse(res, 'Server error generating report', null, 500);
  }
});

/**
 * POST /reports/monthly-attendance
 * Get monthly attendance report with weekly breakdown
 * Query params: month, year, departmentId, userId
 * Accessible to: Org_Admin, Manager, Super_Admin
 */
router.post('/monthly-attendance', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin', 'Manager'), async (req, res) => {
  try {
    const { month, year, departmentId = null, userId = null } = req.body;

    // Validate required fields
    if (month === undefined || month === null || !year) {
      return errorResponse(res, 'Month and year are required', null, 400);
    }

    // Get organization ID
    let organizationId = req.body.organizationId;
    if (!organizationId && req.user.user_type_name !== 'Super_Admin') {
      organizationId = req.user.organization_id;
    }

    if (!organizationId) {
      return errorResponse(res, 'Organization ID is required', null, 400);
    }

    const result = await getMonthlyAttendanceReport(organizationId, month, year, departmentId, userId);

    if (result.error) {
      return errorResponse(res, `Report generation failed: ${result.error}`, null, 400);
    }

    return successResponse(res, 'Monthly attendance report generated successfully', {
      report: result.data,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Monthly attendance report error:', err);
    return errorResponse(res, 'Server error generating report', null, 500);
  }
});

/**
 * POST /reports/department-attendance
 * Get department-wide attendance report with per-employee breakdown
 * Query params: organizationId, startDate, endDate, departmentId
 * Accessible to: Org_Admin, Manager, Super_Admin
 */
router.post('/department-attendance', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin', 'Manager'), async (req, res) => {
  try {
    const { startDate, endDate, departmentId, organizationId: reqOrgId = null } = req.body;

    // Validate required fields
    if (!startDate || !endDate || !departmentId) {
      return errorResponse(res, 'Start date, end date, and department ID are required', null, 400);
    }

    // Get organization ID
    let organizationId = reqOrgId;
    if (!organizationId && req.user.user_type_name !== 'Super_Admin') {
      organizationId = req.user.organization_id;
    }

    if (!organizationId) {
      return errorResponse(res, 'Organization ID is required', null, 400);
    }

    const result = await getDepartmentAttendanceReport(organizationId, startDate, endDate, departmentId);

    if (result.error) {
      return errorResponse(res, `Report generation failed: ${result.error}`, null, 400);
    }

    return successResponse(res, 'Department attendance report generated successfully', {
      report: result.data,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Department attendance report error:', err);
    return errorResponse(res, 'Server error generating report', null, 500);
  }
});

/**
 * POST /reports/organization-statistics
 * Get organization-wide statistics and performance metrics
 * Query params: organizationId, startDate, endDate
 * Accessible to: Super_Admin, Org_Admin
 */
router.post('/organization-statistics', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin'), async (req, res) => {
  try {
    const { startDate, endDate, organizationId: reqOrgId = null } = req.body;

    // Validate required fields
    if (!startDate || !endDate) {
      return errorResponse(res, 'Start date and end date are required', null, 400);
    }

    // Get organization ID
    let organizationId = reqOrgId;
    if (!organizationId && req.user.user_type_name !== 'Super_Admin') {
      organizationId = req.user.organization_id;
    }

    if (!organizationId) {
      return errorResponse(res, 'Organization ID is required', null, 400);
    }

    const result = await getOrganizationStatistics(organizationId, startDate, endDate);

    if (result.error) {
      return errorResponse(res, `Report generation failed: ${result.error}`, null, 400);
    }

    return successResponse(res, 'Organization statistics generated successfully', {
      report: result.data,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Organization statistics error:', err);
    return errorResponse(res, 'Server error generating report', null, 500);
  }
});

/**
 * POST /reports/user-attendance
 * Get user-specific attendance report with detailed records
 * Query params: userId, startDate, endDate
 * Accessible to: Org_Admin, Manager, Employee (own record), Super_Admin
 */
router.post('/user-attendance', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin', 'Manager', 'Employee'), async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.body;

    // Validate required fields
    if (!userId || !startDate || !endDate) {
      return errorResponse(res, 'User ID, start date, and end date are required', null, 400);
    }

    // Check access control for Employee role
    if (req.user.user_type_name === 'Employee' && req.user.id !== userId) {
      return errorResponse(res, 'You can only view your own attendance report', null, 403);
    }

    const result = await getUserAttendanceReport(userId, startDate, endDate);

    if (result.error) {
      return errorResponse(res, `Report generation failed: ${result.error}`, null, 400);
    }

    return successResponse(res, 'User attendance report generated successfully', {
      report: result.data,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('User attendance report error:', err);
    return errorResponse(res, 'Server error generating report', null, 500);
  }
});

/**
 * GET /reports/help
 * Help endpoint showing available report endpoints and usage
 * Accessible to: All authenticated users
 */
router.get('/help', verifyToken, (req, res) => {
  return successResponse(res, 'Reports API Help', {
    endpoints: [
      {
        path: 'POST /reports/daily-attendance',
        description: 'Daily attendance report with breakdown by date',
        params: {
          startDate: 'string - YYYY-MM-DD (required)',
          endDate: 'string - YYYY-MM-DD (required)',
          departmentId: 'string - optional department filter',
          userId: 'string - optional user filter',
          organizationId: 'string - required for Super_Admin, optional for others'
        },
        roles: ['Super_Admin', 'Org_Admin', 'Manager'],
        example: {
          startDate: '2026-03-01',
          endDate: '2026-03-06',
          departmentId: 'dept-123'
        }
      },
      {
        path: 'POST /reports/monthly-attendance',
        description: 'Monthly attendance report with weekly breakdown',
        params: {
          month: 'number - 1-12 (required)',
          year: 'number - e.g., 2026 (required)',
          departmentId: 'string - optional department filter',
          userId: 'string - optional user filter',
          organizationId: 'string - required for Super_Admin, optional for others'
        },
        roles: ['Super_Admin', 'Org_Admin', 'Manager'],
        example: {
          month: 3,
          year: 2026,
          departmentId: 'dept-123'
        }
      },
      {
        path: 'POST /reports/department-attendance',
        description: 'Department attendance report with per-employee breakdown',
        params: {
          startDate: 'string - YYYY-MM-DD (required)',
          endDate: 'string - YYYY-MM-DD (required)',
          departmentId: 'string - (required)',
          organizationId: 'string - required for Super_Admin, optional for others'
        },
        roles: ['Super_Admin', 'Org_Admin', 'Manager'],
        example: {
          startDate: '2026-03-01',
          endDate: '2026-03-06',
          departmentId: 'dept-123'
        }
      },
      {
        path: 'POST /reports/organization-statistics',
        description: 'Organization-wide statistics and performance metrics',
        params: {
          startDate: 'string - YYYY-MM-DD (required)',
          endDate: 'string - YYYY-MM-DD (required)',
          organizationId: 'string - required for Super_Admin, optional for Org_Admin'
        },
        roles: ['Super_Admin', 'Org_Admin'],
        example: {
          startDate: '2026-03-01',
          endDate: '2026-03-06'
        }
      },
      {
        path: 'POST /reports/user-attendance',
        description: 'User-specific attendance report with detailed records',
        params: {
          userId: 'string - (required)',
          startDate: 'string - YYYY-MM-DD (required)',
          endDate: 'string - YYYY-MM-DD (required)'
        },
        roles: ['Super_Admin', 'Org_Admin', 'Manager', 'Employee (own record only)'],
        example: {
          userId: 'user-123',
          startDate: '2026-03-01',
          endDate: '2026-03-06'
        }
      }
    ],
    reportTypes: {
      dailyAttendance: 'Breakdown by individual days with daily attendance stats',
      monthlyAttendance: 'Monthly view with weekly trends and average attendance rate',
      departmentAttendance: 'Department-wide view with per-employee breakdown',
      organizationStatistics: 'Organization-wide metrics, department comparison, top/bottom performers',
      userAttendance: 'Individual attendance records with full details'
    },
    filters: {
      dateRange: 'All reports support startDate and endDate filters',
      department: 'Daily, monthly, and user reports can be filtered by department',
      user: 'Daily and monthly reports can be filtered by specific user',
      organization: 'Required for Super_Admin, auto-scoped for org-specific roles'
    },
    notes: {
      dateFormat: 'All dates must be in YYYY-MM-DD format',
      organization: 'Non-Super_Admin users automatically scoped to their organization',
      employeeAccess: 'Employee role can only access their own attendance report',
      monthCalculation: 'Monthly reports calculate weeks based on calendar days (7-day weeks)',
      performance: 'Reports are generated on-demand and may take 1-5 seconds for large date ranges'
    }
  });
});

export default router;
