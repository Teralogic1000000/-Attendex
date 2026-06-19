/**
 * Global Search Service
 * Provides unified search functionality across Users, Departments, and Attendance records using Prisma ORM
 */

import prisma from '../config/prisma.js';

/**
 * Search users by name, email, or phone
 */
export async function searchUsers(query, organizationId = null, userType = null, limit = 30, offset = 0) {
  try {
    const where = {};

    // Organization filter
    if (organizationId) {
      where.orgId = organizationId;
    }

    // User type filter (by role)
    if (userType) {
      where.role = {
        name: userType
      };
    }

    // Search query
    if (query && query.trim()) {
      const searchTerm = query.trim();
      where.OR = [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    const [data, count] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { role: true },
        orderBy: { firstName: 'asc' },
        take: limit,
        skip: offset
      }),
      prisma.user.count({ where })
    ]);

    return {
      data: data || [],
      error: null,
      count: count || 0
    };
  } catch (err) {
    return {
      data: null,
      error: err.message,
      count: 0
    };
  }
}

/**
 * Search departments by name or organization
 */
export async function searchDepartments(query, organizationId = null, limit = 30, offset = 0) {
  try {
    const where = {};

    if (organizationId) {
      where.orgId = organizationId;
    }

    if (query && query.trim()) {
      const searchTerm = query.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    const [data, count] = await Promise.all([
      prisma.department.findMany({
        where,
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset
      }),
      prisma.department.count({ where })
    ]);

    return {
      data: data || [],
      error: null,
      count: count || 0
    };
  } catch (err) {
    return {
      data: null,
      error: err.message,
      count: 0
    };
  }
}

/**
 * Search attendance records
 */
export async function searchAttendance (query, organizationId = null, limit = 30, offset = 0) {
  try {
    const where = {
      orgId: organizationId
    };

    if (query && query.trim()) {
      const searchTerm = query.trim();
      where.user = {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ]
      };
    }

    const [data, count] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: { user: true, organization: true },
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.attendance.count({ where })
    ]);

    return {
      data: data || [],
      error: null,
      count: count || 0
    };
  } catch (err) {
    return {
      data: null,
      error: err.message,
      count: 0
    };
  }
}

/**
 * Global unified search across all entities
 * Returns results grouped by entity type
 * @param {string} query - Search query
 * @param {string} organizationId - Optional organization filter
 * @param {number} limit - Results limit per entity
 * @returns {Promise<{users, departments, organizations, attendance, error}>}
 */
export async function globalSearch(query, organizationId = null, limit = 10) {
  try {
    if (!query || !query.trim()) {
      return {
        users: [],
        departments: [],
        organizations: [],
        attendance: [],
        error: null
      };
    }

    const searchTerm = `%${query.trim()}%`;

    // Execute all searches in parallel
    const [usersResult, deptsResult, orgsResult, attendanceResult] = await Promise.all([
      searchUsers(query, organizationId, null, limit, 0),
      searchDepartments(query, organizationId, limit, 0),
      searchOrganizations(query, limit, 0),
      searchAttendance(query, organizationId, null, null, null, null, limit, 0)
    ]);

    return {
      users: usersResult.data || [],
      departments: deptsResult.data || [],
      organizations: orgsResult.data || [],
      attendance: attendanceResult.data || [],
      error: null,
      summary: {
        usersCount: usersResult.count || 0,
        departmentsCount: deptsResult.count || 0,
        organizationsCount: orgsResult.count || 0,
        attendanceCount: attendanceResult.count || 0,
        totalResults:
          (usersResult.count || 0) +
          (deptsResult.count || 0) +
          (orgsResult.count || 0) +
          (attendanceResult.count || 0)
      }
    };
  } catch (err) {
    return {
      users: [],
      departments: [],
      organizations: [],
      attendance: [],
      error: err.message,
      summary: {
        usersCount: 0,
        departmentsCount: 0,
        organizationsCount: 0,
        attendanceCount: 0,
        totalResults: 0
      }
    };
  }
}

/**
 * Advanced search with filters and aggregation
 * Useful for generating reports and analytics
 * @param {object} filters - Filter object with multiple criteria
 * @returns {Promise<{results, totalCount, error}>}
 */
export async function advancedSearch(filters = {}) {
  try {
    const {
      query = null,
      entityType = 'all', // 'user', 'department', 'organization', 'attendance', 'all'
      organizationId = null,
      departmentId = null,
      userType = null,
      attendanceStatus = null,
      startDate = null,
      endDate = null,
      limit = 30,
      offset = 0
    } = filters;

    const results = {};
    let totalCount = 0;

    // Search users if requested
    if (entityType === 'all' || entityType === 'user') {
      const usersResult = await searchUsers(query, organizationId, userType, limit, offset);
      results.users = usersResult.data;
      totalCount += usersResult.count;
    }

    // Search departments if requested
    if (entityType === 'all' || entityType === 'department') {
      const deptsResult = await searchDepartments(query, organizationId, limit, offset);
      results.departments = deptsResult.data;
      totalCount += deptsResult.count;
    }

    // Search organizations if requested
    if (entityType === 'all' || entityType === 'organization') {
      const orgsResult = await searchOrganizations(query, limit, offset);
      results.organizations = orgsResult.data;
      totalCount += orgsResult.count;
    }

    // Search attendance if requested
    if (entityType === 'all' || entityType === 'attendance') {
      const attendanceResult = await searchAttendance(
        query,
        organizationId,
        departmentId,
        attendanceStatus,
        startDate,
        endDate,
        limit,
        offset
      );
      results.attendance = attendanceResult.data;
      totalCount += attendanceResult.count;
    }

    return {
      results,
      totalCount,
      error: null,
      filters: {
        query,
        entityType,
        organizationId,
        departmentId,
        userType,
        attendanceStatus,
        startDate,
        endDate
      }
    };
  } catch (err) {
    return {
      results: {},
      totalCount: 0,
      error: err.message,
      filters
    };
  }
}

/**
 * Autocomplete search for quick suggestions
 * Used for typeahead UI components
 * @param {string} query - Search query (min 2 characters)
 * @param {string} entityType - Entity type to autocomplete ('user', 'department', 'organization')
 * @param {string} organizationId - Optional organization filter
 * @param {number} limit - Results limit (max 20)
 * @returns {Promise<{suggestions, error}>}
 */
export async function autocomplete(query, entityType = 'user', organizationId = null, limit = 20) {
  try {
    // Minimum 2 characters required
    if (!query || query.trim().length < 2) {
      return {
        suggestions: [],
        error: null
      };
    }

    // Limit results to 20 max
    limit = Math.min(limit, 20);

    let suggestions = [];

    if (entityType === 'user') {
      const result = await searchUsers(query, organizationId, null, limit, 0);
      suggestions = (result.data || []).map(user => ({
        id: user.User_ID,
        label: `${user.First_Name} ${user.Last_Name}`,
        value: user.Email,
        type: 'user',
        metadata: {
          email: user.Email,
          organization: user.Organization_Name,
          userType: user.User_Type_Name
        }
      }));
    } else if (entityType === 'department') {
      const result = await searchDepartments(query, organizationId, limit, 0);
      suggestions = (result.data || []).map(dept => ({
        id: dept.Department_ID,
        label: dept.Department_Name,
        value: dept.Department_ID,
        type: 'department',
        metadata: {
          organization: dept.Organization_Name,
          description: dept.Description
        }
      }));
    } else if (entityType === 'organization') {
      const result = await searchOrganizations(query, limit, 0);
      suggestions = (result.data || []).map(org => ({
        id: org.Organization_ID,
        label: org.Organization_Name,
        value: org.Organization_ID,
        type: 'organization',
        metadata: {
          email: org.Email,
          phone: org.Phone,
          address: org.Address
        }
      }));
    }

    return {
      suggestions,
      error: null
    };
  } catch (err) {
    return {
      suggestions: [],
      error: err.message
    };
  }
}
