/**
 * Global Search Routes
 * Provides endpoints for searching Users, Departments, Organizations, and Attendance records
 */

import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/rbacMiddleware.js';
import {
  searchUsers,
  searchDepartments,
  searchOrganizations,
  searchAttendance,
  globalSearch,
  advancedSearch,
  autocomplete
} from '../services/searchService.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

/**
 * POST /search/users
 * Search users by name, email, or department
 * Query params: query, organizationId, userType, limit, offset
 * Accessible to: Org_Admin, Manager, Employee (with org scoping), Super_Admin
 */
router.post('/users', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin', 'Manager', 'Employee'), async (req, res) => {
  try {
    const { query = '', organizationId = null, userType = null, limit = 30, offset = 0 } = req.body;

    // Validate limit
    const validLimit = Math.min(Math.max(1, limit), 100);
    const validOffset = Math.max(0, offset);

    // For non-Super_Admin, filter by their organization
    let orgId = organizationId;
    if (req.user.user_type_name !== 'Super_Admin' && req.user.organization_id) {
      orgId = req.user.organization_id;
    }

    const result = await searchUsers(query, orgId, userType, validLimit, validOffset);

    if (result.error) {
      return errorResponse(res, `Search failed: ${result.error}`, null, 500);
    }

    return successResponse(res, 'Users search successful', {
      results: result.data,
      pagination: {
        limit: validLimit,
        offset: validOffset,
        total: result.count
      },
      query
    });
  } catch (err) {
    console.error('Search users error:', err);
    return errorResponse(res, 'Server error during user search', null, 500);
  }
});

/**
 * POST /search/departments
 * Search departments by name or organization
 * Query params: query, organizationId, limit, offset
 * Accessible to: Org_Admin, Manager, Employee, Super_Admin
 */
router.post('/departments', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin', 'Manager', 'Employee'), async (req, res) => {
  try {
    const { query = '', organizationId = null, limit = 30, offset = 0 } = req.body;

    const validLimit = Math.min(Math.max(1, limit), 100);
    const validOffset = Math.max(0, offset);

    let orgId = organizationId;
    if (req.user.user_type_name !== 'Super_Admin' && req.user.organization_id) {
      orgId = req.user.organization_id;
    }

    const result = await searchDepartments(query, orgId, validLimit, validOffset);

    if (result.error) {
      return errorResponse(res, `Search failed: ${result.error}`, null, 500);
    }

    return successResponse(res, 'Departments search successful', {
      results: result.data,
      pagination: {
        limit: validLimit,
        offset: validOffset,
        total: result.count
      },
      query
    });
  } catch (err) {
    console.error('Search departments error:', err);
    return errorResponse(res, 'Server error during department search', null, 500);
  }
});

/**
 * POST /search/organizations
 * Search organizations by name, address, or contact info
 * Query params: query, limit, offset
 * Accessible to: Super_Admin, Org_Admin
 */
router.post('/organizations', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin'), async (req, res) => {
  try {
    const { query = '', limit = 30, offset = 0 } = req.body;

    const validLimit = Math.min(Math.max(1, limit), 100);
    const validOffset = Math.max(0, offset);

    const result = await searchOrganizations(query, validLimit, validOffset);

    if (result.error) {
      return errorResponse(res, `Search failed: ${result.error}`, null, 500);
    }

    return successResponse(res, 'Organizations search successful', {
      results: result.data,
      pagination: {
        limit: validLimit,
        offset: validOffset,
        total: result.count
      },
      query
    });
  } catch (err) {
    console.error('Search organizations error:', err);
    return errorResponse(res, 'Server error during organization search', null, 500);
  }
});

/**
 * POST /search/attendance
 * Search attendance records by user, date range, status, or department
 * Query params: query, organizationId, departmentId, status, startDate, endDate, limit, offset
 * Accessible to: Org_Admin, Manager, Super_Admin
 */
router.post('/attendance', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin', 'Manager'), async (req, res) => {
  try {
    const {
      query = '',
      organizationId = null,
      departmentId = null,
      status = null,
      startDate = null,
      endDate = null,
      limit = 30,
      offset = 0
    } = req.body;

    const validLimit = Math.min(Math.max(1, limit), 100);
    const validOffset = Math.max(0, offset);

    let orgId = organizationId;
    if (req.user.user_type_name !== 'Super_Admin' && req.user.organization_id) {
      orgId = req.user.organization_id;
    }

    // Validate status if provided
    const validStatuses = ['Present', 'Absent', 'Late', 'Early', 'On Leave'];
    const validStatus = status && validStatuses.includes(status) ? status : null;

    const result = await searchAttendance(
      query,
      orgId,
      departmentId,
      validStatus,
      startDate,
      endDate,
      validLimit,
      validOffset
    );

    if (result.error) {
      return errorResponse(res, `Search failed: ${result.error}`, null, 500);
    }

    return successResponse(res, 'Attendance search successful', {
      results: result.data,
      pagination: {
        limit: validLimit,
        offset: validOffset,
        total: result.count
      },
      query,
      filters: {
        status: validStatus,
        startDate,
        endDate
      }
    });
  } catch (err) {
    console.error('Search attendance error:', err);
    return errorResponse(res, 'Server error during attendance search', null, 500);
  }
});

/**
 * POST /search/global
 * Unified global search across all entities
 * Returns results grouped by type with summary counts
 * Query params: query, organizationId, limit
 * Accessible to: All authenticated users (with org scoping)
 */
router.post('/global', verifyToken, async (req, res) => {
  try {
    const { query = '', organizationId = null, limit = 10 } = req.body;

    if (!query || query.trim().length === 0) {
      return errorResponse(res, 'Search query is required', null, 400);
    }

    let orgId = organizationId;
    if (req.user.user_type_name !== 'Super_Admin' && req.user.organization_id) {
      orgId = req.user.organization_id;
    }

    const validLimit = Math.min(Math.max(5, limit), 50);

    const result = await globalSearch(query.trim(), orgId, validLimit);

    if (result.error) {
      return errorResponse(res, `Search failed: ${result.error}`, null, 500);
    }

    return successResponse(res, 'Global search completed', {
      results: {
        users: result.users,
        departments: result.departments,
        organizations: result.organizations,
        attendance: result.attendance
      },
      summary: result.summary,
      query: query.trim()
    });
  } catch (err) {
    console.error('Global search error:', err);
    return errorResponse(res, 'Server error during global search', null, 500);
  }
});

/**
 * POST /search/advanced
 * Advanced search with multiple filters and entity type selection
 * Body params: query, entityType, organizationId, departmentId, userType, attendanceStatus, startDate, endDate, limit, offset
 * Accessible to: Org_Admin, Manager, Super_Admin
 */
router.post('/advanced', verifyToken, authorizeRoles('Super_Admin', 'Org_Admin', 'Manager'), async (req, res) => {
  try {
    const {
      query = '',
      entityType = 'all',
      organizationId = null,
      departmentId = null,
      userType = null,
      attendanceStatus = null,
      startDate = null,
      endDate = null,
      limit = 30,
      offset = 0
    } = req.body;

    let orgId = organizationId;
    if (req.user.user_type_name !== 'Super_Admin' && req.user.organization_id) {
      orgId = req.user.organization_id;
    }

    const validLimit = Math.min(Math.max(1, limit), 100);
    const validOffset = Math.max(0, offset);

    const filters = {
      query: query.trim() || null,
      entityType,
      organizationId: orgId,
      departmentId,
      userType,
      attendanceStatus,
      startDate,
      endDate,
      limit: validLimit,
      offset: validOffset
    };

    const result = await advancedSearch(filters);

    if (result.error) {
      return errorResponse(res, `Search failed: ${result.error}`, null, 500);
    }

    return successResponse(res, 'Advanced search completed', {
      results: result.results,
      totalCount: result.totalCount,
      pagination: {
        limit: validLimit,
        offset: validOffset
      },
      appliedFilters: filters
    });
  } catch (err) {
    console.error('Advanced search error:', err);
    return errorResponse(res, 'Server error during advanced search', null, 500);
  }
});

/**
 * POST /search/autocomplete
 * Autocomplete suggestions for typeahead UI components
 * Min 2 characters required for query
 * Query params: query, entityType, organizationId, limit
 * Accessible to: All authenticated users
 */
router.post('/autocomplete', verifyToken, async (req, res) => {
  try {
    const { query = '', entityType = 'user', organizationId = null, limit = 20 } = req.body;

    if (!query || query.trim().length < 2) {
      return successResponse(res, 'Minimum 2 characters required', {
        suggestions: []
      });
    }

    let orgId = organizationId;
    if (req.user.user_type_name !== 'Super_Admin' && req.user.organization_id) {
      orgId = req.user.organization_id;
    }

    const validLimit = Math.min(Math.max(5, limit), 20);

    const result = await autocomplete(query.trim(), entityType, orgId, validLimit);

    if (result.error) {
      return errorResponse(res, `Autocomplete failed: ${result.error}`, null, 500);
    }

    return successResponse(res, 'Autocomplete suggestions retrieved', {
      suggestions: result.suggestions,
      query: query.trim(),
      entityType,
      count: result.suggestions.length
    });
  } catch (err) {
    console.error('Autocomplete error:', err);
    return errorResponse(res, 'Server error during autocomplete', null, 500);
  }
});

/**
 * GET /search/help
 * Help endpoint showing available search endpoints and usage
 * Accessible to: All authenticated users
 */
router.get('/help', verifyToken, (req, res) => {
  return successResponse(res, 'Search API Help', {
    endpoints: [
      {
        path: 'POST /search/users',
        description: 'Search users by name, email, or user type',
        params: {
          query: 'string - search term',
          organizationId: 'string - optional org filter',
          userType: 'string - optional user type filter',
          limit: 'number - results per page (1-100, default 30)',
          offset: 'number - pagination offset (default 0)'
        },
        roles: ['Super_Admin', 'Org_Admin', 'Manager', 'Employee']
      },
      {
        path: 'POST /search/departments',
        description: 'Search departments by name',
        params: {
          query: 'string - search term',
          organizationId: 'string - optional org filter',
          limit: 'number - results per page (1-100, default 30)',
          offset: 'number - pagination offset (default 0)'
        },
        roles: ['Super_Admin', 'Org_Admin', 'Manager', 'Employee']
      },
      {
        path: 'POST /search/organizations',
        description: 'Search organizations by name or location',
        params: {
          query: 'string - search term',
          limit: 'number - results per page (1-100, default 30)',
          offset: 'number - pagination offset (default 0)'
        },
        roles: ['Super_Admin', 'Org_Admin']
      },
      {
        path: 'POST /search/attendance',
        description: 'Search attendance records with advanced filtering',
        params: {
          query: 'string - search users/departments',
          organizationId: 'string - optional org filter',
          departmentId: 'string - optional dept filter',
          status: 'string - Present|Absent|Late|Early|On Leave',
          startDate: 'string - YYYY-MM-DD format',
          endDate: 'string - YYYY-MM-DD format',
          limit: 'number - results per page (1-100, default 30)',
          offset: 'number - pagination offset (default 0)'
        },
        roles: ['Super_Admin', 'Org_Admin', 'Manager']
      },
      {
        path: 'POST /search/global',
        description: 'Unified search across all entities, returns grouped results',
        params: {
          query: 'string - required search term',
          organizationId: 'string - optional org filter',
          limit: 'number - results per entity (5-50, default 10)'
        },
        roles: ['All authenticated users']
      },
      {
        path: 'POST /search/advanced',
        description: 'Advanced search with multiple filters',
        params: {
          query: 'string - search term',
          entityType: 'string - user|department|organization|attendance|all',
          organizationId: 'string - optional org filter',
          departmentId: 'string - optional dept filter',
          userType: 'string - optional user type filter',
          attendanceStatus: 'string - optional status filter',
          startDate: 'string - YYYY-MM-DD format',
          endDate: 'string - YYYY-MM-DD format',
          limit: 'number - results per page (1-100, default 30)',
          offset: 'number - pagination offset (default 0)'
        },
        roles: ['Super_Admin', 'Org_Admin', 'Manager']
      },
      {
        path: 'POST /search/autocomplete',
        description: 'Autocomplete suggestions for typeahead (min 2 chars)',
        params: {
          query: 'string - search term (min 2 chars)',
          entityType: 'string - user|department|organization',
          organizationId: 'string - optional org filter',
          limit: 'number - suggestions count (5-20, default 20)'
        },
        roles: ['All authenticated users']
      }
    ],
    notes: {
      searchFields: {
        users: ['First Name', 'Last Name', 'Email', 'Phone'],
        departments: ['Department Name', 'Description'],
        organizations: ['Organization Name', 'Address', 'Email', 'Phone'],
        attendance: ['User Name', 'Email', 'Department', 'Status', 'Date Range']
      },
      pagination: 'All endpoints support limit (1-100) and offset (0-based) parameters',
      caseInsensitive: 'All searches are case-insensitive',
      orgScoping: 'Non-Super_Admin users automatically filtered to their organization',
      performance: 'Max 100 results per request to optimize response times'
    }
  });
});

export default router;
