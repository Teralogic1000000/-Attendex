/**
 * Global Search Service
 * Provides unified search functionality across Users, Departments, Organizations, and Attendance records
 */

import supabase from '../config/supabaseClient.js';

/**
 * Search users by name, email, or user type
 * @param {string} query - Search query
 * @param {string} organizationId - Optional filter by organization
 * @param {string} userType - Optional filter by user type
 * @param {number} limit - Results limit (max 100)
 * @param {number} offset - Pagination offset
 * @returns {Promise<{data, error, count}>}
 */
export async function searchUsers(query, organizationId = null, userType = null, limit = 30, offset = 0) {
  try {
    let dbQuery = supabase
      .from('user_full_view')
      .select('*', { count: 'exact' });

    // Apply search filters using ILIKE for case-insensitive search
    if (query && query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      dbQuery = dbQuery.or(
        `First_Name.ilike.${searchTerm},Last_Name.ilike.${searchTerm},Email.ilike.${searchTerm},Phone.ilike.${searchTerm}`
      );
    }

    // Apply organization filter
    if (organizationId) {
      dbQuery = dbQuery.eq('Organization_ID', organizationId);
    }

    // Apply user type filter
    if (userType) {
      dbQuery = dbQuery.eq('User_Type_Name', userType);
    }

    // Apply pagination
    const { data, error, count } = await dbQuery
      .order('First_Name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        data: null,
        error: error.message,
        count: 0
      };
    }

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
 * @param {string} query - Search query
 * @param {string} organizationId - Optional filter by organization
 * @param {number} limit - Results limit
 * @param {number} offset - Pagination offset
 * @returns {Promise<{data, error, count}>}
 */
export async function searchDepartments(query, organizationId = null, limit = 30, offset = 0) {
  try {
    let dbQuery = supabase
      .from('department_full_view')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (query && query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      dbQuery = dbQuery.or(
        `Department_Name.ilike.${searchTerm},Description.ilike.${searchTerm}`
      );
    }

    // Apply organization filter
    if (organizationId) {
      dbQuery = dbQuery.eq('Organization_ID', organizationId);
    }

    // Apply pagination
    const { data, error, count } = await dbQuery
      .order('Department_Name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        data: null,
        error: error.message,
        count: 0
      };
    }

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
 * Search organizations by name or location
 * @param {string} query - Search query
 * @param {number} limit - Results limit
 * @param {number} offset - Pagination offset
 * @returns {Promise<{data, error, count}>}
 */
export async function searchOrganizations(query, limit = 30, offset = 0) {
  try {
    let dbQuery = supabase
      .from('organization_full_view')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (query && query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      dbQuery = dbQuery.or(
        `Organization_Name.ilike.${searchTerm},Address.ilike.${searchTerm},Email.ilike.${searchTerm},Phone.ilike.${searchTerm}`
      );
    }

    // Apply pagination
    const { data, error, count } = await dbQuery
      .order('Organization_Name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        data: null,
        error: error.message,
        count: 0
      };
    }

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
 * Search attendance records by user name, email, organization, or department
 * @param {string} query - Search query
 * @param {string} organizationId - Optional filter by organization
 * @param {string} departmentId - Optional filter by department
 * @param {string} status - Optional filter by status (Present, Absent, Late, Early)
 * @param {string} startDate - Optional filter by start date (YYYY-MM-DD)
 * @param {string} endDate - Optional filter by end date (YYYY-MM-DD)
 * @param {number} limit - Results limit
 * @param {number} offset - Pagination offset
 * @returns {Promise<{data, error, count}>}
 */
export async function searchAttendance(
  query = null,
  organizationId = null,
  departmentId = null,
  status = null,
  startDate = null,
  endDate = null,
  limit = 30,
  offset = 0
) {
  try {
    let dbQuery = supabase
      .from('attendance_full_view')
      .select('*', { count: 'exact' });

    // Apply search filter - matches on user name, email, department
    if (query && query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      dbQuery = dbQuery.or(
        `First_Name.ilike.${searchTerm},Last_Name.ilike.${searchTerm},Email.ilike.${searchTerm},Department_Name.ilike.${searchTerm}`
      );
    }

    // Apply organization filter
    if (organizationId) {
      dbQuery = dbQuery.eq('Organization_ID', organizationId);
    }

    // Apply department filter
    if (departmentId) {
      dbQuery = dbQuery.eq('Department_ID', departmentId);
    }

    // Apply status filter
    if (status) {
      dbQuery = dbQuery.eq('Status', status);
    }

    // Apply date range filters
    if (startDate) {
      dbQuery = dbQuery.gte('Check_In_Time', `${startDate}T00:00:00`);
    }

    if (endDate) {
      dbQuery = dbQuery.lte('Check_In_Time', `${endDate}T23:59:59`);
    }

    // Apply pagination and ordering
    const { data, error, count } = await dbQuery
      .order('Check_In_Time', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        data: null,
        error: error.message,
        count: 0
      };
    }

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
