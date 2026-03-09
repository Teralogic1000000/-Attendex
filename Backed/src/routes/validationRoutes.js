/**
 * Validation Routes - STEP 21
 * Endpoints for system validation and testing
 */

import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/rbacMiddleware.js';
import * as validationService from '../services/validationService.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

/**
 * GET /api/validation/health
 * Quick health check
 */
router.get('/health', async (req, res) => {
  try {
    const result = await validationService.validateDatabaseConnection();
    
    if (result.passed) {
      return successResponse(res, 'System health check passed', { status: 'healthy' }, 200);
    } else {
      return errorResponse(res, result.message, 503);
    }
  } catch (err) {
    return errorResponse(res, `Health check failed: ${err.message}`, 500);
  }
});

/**
 * GET /api/validation/database
 * Validate database connectivity and schema
 */
router.get('/database', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin'), async (req, res) => {
  try {
    const result = await validationService.validateDatabaseConnection();
    
    if (result.passed) {
      return successResponse(res, 'Database validation successful', result);
    } else {
      return errorResponse(res, result.message, 400);
    }
  } catch (err) {
    return errorResponse(res, `Database validation error: ${err.message}`, 500);
  }
});

/**
 * GET /api/validation/auth
 * Validate authentication system
 */
router.get('/auth', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin'), async (req, res) => {
  try {
    const result = await validationService.validateAuthenticationSystem();
    
    if (result.passed) {
      return successResponse(res, 'Authentication system validated', result);
    } else {
      return errorResponse(res, result.message, 400);
    }
  } catch (err) {
    return errorResponse(res, `Auth validation error: ${err.message}`, 500);
  }
});

/**
 * GET /api/validation/rbac
 * Validate role-based access control
 */
router.get('/rbac', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin'), async (req, res) => {
  try {
    const result = await validationService.validateRBACSystem();
    
    if (result.passed) {
      return successResponse(res, 'RBAC system validated', result);
    } else {
      return errorResponse(res, result.message, 400);
    }
  } catch (err) {
    return errorResponse(res, `RBAC validation error: ${err.message}`, 500);
  }
});

/**
 * GET /api/validation/dashboard
 * Validate dashboard data availability
 */
router.get('/dashboard', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin', 'Manager'), async (req, res) => {
  try {
    const result = await validationService.validateDashboardData();
    
    if (result.passed) {
      return successResponse(res, 'Dashboard data validated', result);
    } else {
      return errorResponse(res, result.message, 400);
    }
  } catch (err) {
    return errorResponse(res, `Dashboard validation error: ${err.message}`, 500);
  }
});

/**
 * GET /api/validation/employee-restrictions
 * Validate employee permission restrictions
 */
router.get('/employee-restrictions', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin'), async (req, res) => {
  try {
    const result = await validationService.validateEmployeeRestrictions();
    
    if (result.passed) {
      return successResponse(res, 'Employee restrictions validated', result);
    } else {
      return errorResponse(res, result.message, 400);
    }
  } catch (err) {
    return errorResponse(res, `Employee restriction validation error: ${err.message}`, 500);
  }
});

/**
 * GET /api/validation/attendance
 * Validate attendance verification system
 */
router.get('/attendance', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin', 'Manager'), async (req, res) => {
  try {
    const result = await validationService.validateAttendanceVerification();
    
    if (result.passed) {
      return successResponse(res, 'Attendance verification system validated', result);
    } else {
      return errorResponse(res, result.message, 400);
    }
  } catch (err) {
    return errorResponse(res, `Attendance validation error: ${err.message}`, 500);
  }
});

/**
 * GET /api/validation/notifications
 * Validate notification system
 */
router.get('/notifications', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin', 'Manager'), async (req, res) => {
  try {
    const result = await validationService.validateNotificationSystem();
    
    if (result.passed) {
      return successResponse(res, 'Notification system validated', result);
    } else {
      return errorResponse(res, result.message, 400);
    }
  } catch (err) {
    return errorResponse(res, `Notification validation error: ${err.message}`, 500);
  }
});

/**
 * GET /api/validation/search
 * Validate search system
 */
router.get('/search', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin', 'Manager', 'Employee'), async (req, res) => {
  try {
    const result = await validationService.validateSearchSystem();
    
    if (result.passed) {
      return successResponse(res, 'Search system validated', result);
    } else {
      return errorResponse(res, result.message, 400);
    }
  } catch (err) {
    return errorResponse(res, `Search validation error: ${err.message}`, 500);
  }
});

/**
 * GET /api/validation/reporting
 * Validate reporting system
 */
router.get('/reporting', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin', 'Manager'), async (req, res) => {
  try {
    const result = await validationService.validateReportingSystem();
    
    if (result.passed) {
      return successResponse(res, 'Reporting system validated', result);
    } else {
      return errorResponse(res, result.message, 400);
    }
  } catch (err) {
    return errorResponse(res, `Reporting validation error: ${err.message}`, 500);
  }
});

/**
 * GET /api/validation/data-integrity
 * Validate data integrity
 */
router.get('/data-integrity', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin'), async (req, res) => {
  try {
    const result = await validationService.validateDataIntegrity();
    
    if (result.passed) {
      return successResponse(res, 'Data integrity validated', result);
    } else {
      return errorResponse(res, result.message, 400);
    }
  } catch (err) {
    return errorResponse(res, `Data integrity validation error: ${err.message}`, 500);
  }
});

/**
 * GET /api/validation/complete
 * Run complete validation suite
 */
router.get('/complete', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin'), async (req, res) => {
  try {
    const report = await validationService.runCompleteValidation();
    
    if (report.status === 'PASSED') {
      return successResponse(res, 'Complete validation suite passed', report, 200);
    } else if (report.status === 'FAILED') {
      return successResponse(res, 'Complete validation suite completed with failures', report, 200);
    } else {
      return errorResponse(res, `Validation suite error: ${report.error}`, 500);
    }
  } catch (err) {
    return errorResponse(res, `Validation suite error: ${err.message}`, 500);
  }
});

/**
 * GET /api/validation/results
 * Get last validation results
 */
router.get('/results', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin'), async (req, res) => {
  try {
    const results = validationService.getValidationResults();
    return successResponse(res, 'Validation results retrieved', results);
  } catch (err) {
    return errorResponse(res, `Cannot retrieve results: ${err.message}`, 500);
  }
});

/**
 * POST /api/validation/reset
 * Reset validation results
 */
router.post('/reset', verifyToken, authorizeRoles('Super_Admin'), async (req, res) => {
  try {
    validationService.resetValidationResults();
    return successResponse(res, 'Validation results reset', { timestamp: new Date().toISOString() });
  } catch (err) {
    return errorResponse(res, `Cannot reset results: ${err.message}`, 500);
  }
});

/**
 * GET /api/validation/help
 * Get validation endpoint documentation
 */
router.get('/help', (req, res) => {
  const documentation = {
    description: 'Validation System - STEP 21',
    baseUrl: '/api/validation',
    endpoints: [
      {
        method: 'GET',
        path: '/health',
        description: 'Quick system health check (no auth required)',
        accessLevel: 'Public'
      },
      {
        method: 'GET',
        path: '/database',
        description: 'Validate database connectivity and schema',
        accessLevel: 'Super_Admin, Org_Admin',
        response: {
          status: 'success',
          message: 'Database validation successful',
          data: {
            passed: true,
            message: 'All critical tables exist and are accessible',
            details: ['table1', 'table2']
          }
        }
      },
      {
        method: 'GET',
        path: '/auth',
        description: 'Validate authentication system',
        accessLevel: 'Super_Admin, Org_Admin',
        response: {
          status: 'success',
          message: 'Authentication system validated',
          data: {
            passed: true,
            message: 'Authentication system is properly configured'
          }
        }
      },
      {
        method: 'GET',
        path: '/rbac',
        description: 'Validate role-based access control configuration',
        accessLevel: 'Super_Admin, Org_Admin',
        response: {
          status: 'success',
          message: 'RBAC system validated'
        }
      },
      {
        method: 'GET',
        path: '/dashboard',
        description: 'Validate dashboard data availability',
        accessLevel: 'Super_Admin, Org_Admin, Manager',
        response: {
          status: 'success',
          message: 'Dashboard data validated',
          data: {
            passed: true,
            details: ['✓ View user_full_view is accessible', '✓ View organization_full_view is accessible']
          }
        }
      },
      {
        method: 'GET',
        path: '/employee-restrictions',
        description: 'Validate employee permission restrictions',
        accessLevel: 'Super_Admin, Org_Admin',
        response: {
          status: 'success',
          message: 'Employee restrictions validated'
        }
      },
      {
        method: 'GET',
        path: '/attendance',
        description: 'Validate attendance verification system (geofence, device, user)',
        accessLevel: 'Super_Admin, Org_Admin, Manager',
        response: {
          status: 'success',
          message: 'Attendance verification system validated',
          data: {
            passed: true,
            details: ['✓ Found 5 attendance records', '✓ 5/5 records have required verification fields']
          }
        }
      },
      {
        method: 'GET',
        path: '/notifications',
        description: 'Validate notification system',
        accessLevel: 'Super_Admin, Org_Admin, Manager',
        response: {
          status: 'success',
          message: 'Notification system validated'
        }
      },
      {
        method: 'GET',
        path: '/search',
        description: 'Validate search system (users, departments, organizations, attendance)',
        accessLevel: 'Super_Admin, Org_Admin, Manager, Employee',
        response: {
          status: 'success',
          message: 'Search system validated',
          data: {
            passed: true,
            details: ['✓ User search capability verified', '✓ Department search capability verified']
          }
        }
      },
      {
        method: 'GET',
        path: '/reporting',
        description: 'Validate reporting system (daily, monthly, department, organization, user reports)',
        accessLevel: 'Super_Admin, Org_Admin, Manager',
        response: {
          status: 'success',
          message: 'Reporting system validated'
        }
      },
      {
        method: 'GET',
        path: '/data-integrity',
        description: 'Validate data integrity (check for orphaned records, invalid statuses)',
        accessLevel: 'Super_Admin, Org_Admin',
        response: {
          status: 'success',
          message: 'Data integrity validated',
          data: {
            passed: true,
            issues: ['⚠ 5 users have no organization assignment']
          }
        }
      },
      {
        method: 'GET',
        path: '/complete',
        description: 'Run complete validation suite (all validations)',
        accessLevel: 'Super_Admin, Org_Admin',
        response: {
          status: 'success',
          message: 'Complete validation suite passed',
          data: {
            timestamp: '2025-03-15T10:30:00Z',
            totalTests: 10,
            passedTests: 10,
            failedTests: 0,
            duration: '5.23s',
            successRate: '100.00',
            status: 'PASSED',
            results: []
          }
        }
      },
      {
        method: 'GET',
        path: '/results',
        description: 'Get last validation results',
        accessLevel: 'Super_Admin, Org_Admin',
        response: {
          status: 'success',
          message: 'Validation results retrieved',
          data: {
            timestamp: '2025-03-15T10:30:00Z',
            totalTests: 10,
            passedTests: 10,
            failedTests: 0,
            results: []
          }
        }
      },
      {
        method: 'POST',
        path: '/reset',
        description: 'Reset validation results (Super_Admin only)',
        accessLevel: 'Super_Admin',
        response: {
          status: 'success',
          message: 'Validation results reset',
          data: {
            timestamp: '2025-03-15T10:31:00Z'
          }
        }
      },
      {
        method: 'GET',
        path: '/help',
        description: 'Get validation endpoint documentation',
        accessLevel: 'Public'
      }
    ]
  };

  return successResponse(res, 'Validation endpoints documentation', documentation);
});

export default router;
