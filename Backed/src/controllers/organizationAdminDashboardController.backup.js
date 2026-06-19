/**
 * Organization Admin Dashboard Controller
 * Manages organization-specific operations and reporting
 * 
 * All functions scoped to current admin's organization
 * Updated: March 6, 2026
 */

import supabase from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import bcrypt from 'bcrypt';

/**
 * ============================================================================
 * DASHBOARD OVERVIEW & STATISTICS
 * ============================================================================
 */

/**
 * Get organization dashboard overview
 * Returns key metrics for the organization
 */
export async function getDashboardOverview(req, res) {
  try {
    const orgId = req.user.organization_id;
    
    if (!orgId) {
      return errorResponse(res, 'Organization ID not found in token', null, 400);
    }

    // Get all aggregate data in parallel
    const [
      usersResult,
      departmentsResult,
      devicesResult,
      attendanceTodayResult,
      attendanceStatsResult,
      organizationResult
    ] = await Promise.all([
      // Total users in organization
      supabase
        .from('User')
        .select('*', { count: 'exact' })
        .eq('Organization_ID', orgId)
        .eq('Status', 'ACTIVE'),
      
      // Total departments
      supabase
        .from('Department')
        .select('*', { count: 'exact' })
        .eq('Organization_ID', orgId),
      
      // Total devices registered
      supabase
        .from('Device')
        .select('*', { count: 'exact' })
        .eq('Organization_ID', orgId)
        .eq('Status', 'ACTIVE'),
      
      // Attendance today
      supabase
        .from('Attendance')
        .select('*, user_full_view:User(First_Name, Last_Name, Email)', { count: 'exact' })
        .eq('Organization_ID', orgId)
        .eq('Attendance_Date', new Date().toISOString().split('T')[0]),
      
      // Attendance statistics (all-time)
      supabase
        .from('Attendance')
        .select('Status')
        .eq('Organization_ID', orgId),
      
      // Organization details
      supabase
        .from('organization_full_view')
        .select('*')
        .eq('Organization_ID', orgId)
        .single()
    ]);

    // Calculate attendance stats
    const attendanceStats = {};
    if (attendanceStatsResult.data) {
      attendanceStatsResult.data.forEach(record => {
        attendanceStats[record.Status] = (attendanceStats[record.Status] || 0) + 1;
      });
    }

    // Count today's attendance by status
    const todayByStatus = {};
    if (attendanceTodayResult.data) {
      attendanceTodayResult.data.forEach(record => {
        todayByStatus[record.Status] = (todayByStatus[record.Status] || 0) + 1;
      });
    }

    return successResponse(res, 'Dashboard overview fetched', {
      organization: organizationResult.data ? {
        Organization_ID: organizationResult.data.Organization_ID,
        Org_Name: organizationResult.data.Org_Name,
        email: organizationResult.data.email
      } : null,
      statistics: {
        totalUsers: usersResult.count || 0,
        totalDepartments: departmentsResult.count || 0,
        totalDevices: devicesResult.count || 0,
        TodayAttendance: {
          total: attendanceTodayResult.count || 0,
          byStatus: todayByStatus
        },
        allTimeAttendance: {
          total: attendanceStatsResult.data?.length || 0,
          byStatus: attendanceStats
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch dashboard overview', error.message, 500);
  }
}

/**
 * ============================================================================
 * ANALYTICS & REPORTING
 * ============================================================================
 */

/**
 * Get attendance trend analysis
 */
export async function getAttendanceTrends(req, res) {
  try {
    const orgId = req.user.organization_id;
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data: attendanceData, error } = await supabase
      .from('Attendance')
      .select('Attendance_Date, Status, User_ID, Attendance_ID')
      .eq('Organization_ID', orgId)
      .gte('Attendance_Date', startDateStr)
      .order('Attendance_Date', { ascending: true });

    if (error) throw error;

    // Aggregate by date and status
    const trendMap = {};
    let totalPresent = 0, totalAbsent = 0, totalLate = 0;

    attendanceData?.forEach(record => {
      if (!trendMap[record.Attendance_Date]) {
        trendMap[record.Attendance_Date] = { date: record.Attendance_Date, Present: 0, Absent: 0, Late: 0 };
      }
      trendMap[record.Attendance_Date][record.Status] = (trendMap[record.Attendance_Date][record.Status] || 0) + 1;

      if (record.Status === 'Present') totalPresent++;
      if (record.Status === 'Absent') totalAbsent++;
      if (record.Status === 'Late') totalLate++;
    });

    const dailyData = Object.values(trendMap);

    return successResponse(res, 'Attendance trends fetched', {
      period: days,
      totalRecords: attendanceData?.length || 0,
      dailyData,
      summary: {
        totalPresent,
        totalAbsent,
        totalLate,
        presentRate: totalPresent > 0 ? ((totalPresent / (totalPresent + totalAbsent + totalLate)) * 100).toFixed(2) : 0,
        absentRate: totalAbsent > 0 ? ((totalAbsent / (totalPresent + totalAbsent + totalLate)) * 100).toFixed(2) : 0,
        lateRate: totalLate > 0 ? ((totalLate / (totalPresent + totalAbsent + totalLate)) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch attendance trends', error.message, 500);
  }
}

/**
 * Get department attendance comparison
 */
export async function getDepartmentAttendanceComparison(req, res) {
  try {
    const orgId = req.user.organization_id;
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Get all departments in organization
    const { data: departments, error: deptError } = await supabase
      .from('Department')
      .select('*')
      .eq('Organization_ID', orgId);

    if (deptError) throw deptError;

    // Get attendance records with department info
    const { data: attendanceData, error: attError } = await supabase
      .from('Attendance')
      .select('User_ID, Status, Attendance_Date, users(Department_ID)')
      .eq('Organization_ID', orgId)
      .gte('Attendance_Date', startDateStr);

    if (attError) throw attError;

    // Aggregate by department
    const deptStats = {};
    departments?.forEach(dept => {
      deptStats[dept.Department_ID] = {
        departmentId: dept.Department_ID,
        departmentName: dept.Dept_Name,
        total: 0,
        present: 0,
        absent: 0,
        late: 0
      };
    });

    attendanceData?.forEach(record => {
      const deptId = record.users?.Department_ID;
      if (deptId && deptStats[deptId]) {
        deptStats[deptId].total++;
        if (record.Status === 'Present') deptStats[deptId].present++;
        if (record.Status === 'Absent') deptStats[deptId].absent++;
        if (record.Status === 'Late') deptStats[deptId].late++;
      }
    });

    const comparison = Object.values(deptStats).map(dept => ({
      ...dept,
      attendanceRate: dept.total > 0 ? ((dept.present / dept.total) * 100).toFixed(2) : 0
    }));

    return successResponse(res, 'Department attendance comparison fetched', {
      period: days,
      departments: comparison
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch department comparison', error.message, 500);
  }
}

/**
 * ============================================================================
 * USER MANAGEMENT
 * ============================================================================
 */

/**
 * Get all users in organization
 */
export async function getOrganizationUsers(req, res) {
  try {
    const orgId = req.user.organization_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'ACTIVE';
    const search = req.query.search || '';

    const offset = (page - 1) * limit;

    let query = supabase
      .from('user_full_view')
      .select('*', { count: 'exact' })
      .eq('Organization_ID', orgId);

    if (status) query = query.eq('Status', status);
    if (search) query = query.or(`First_Name.ilike.%${search}%,Last_Name.ilike.%${search}%,Email.ilike.%${search}%`);

    const { data, count, error } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return successResponse(res, 'Users fetched', {
      users: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch users', error.message, 500);
  }
}

/**
 * Create new user in organization
 */
export async function createUser(req, res) {
  try {
    const orgId = req.user.organization_id;
    const { First_Name, Last_Name, Email, Phone, user_type_name, Department_ID } = req.body;

    if (!First_Name || !Last_Name || !Email || !user_type_name) {
      return errorResponse(res, 'Missing required fields', { required: ['First_Name', 'Last_Name', 'Email', 'user_type_name'] }, 400);
    }

    // Generate default password
    const defaultPassword = 'TempPassword123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const { data, error } = await supabase
      .from('User')
      .insert({
        First_Name,
        Last_Name,
        Email,
        Phone: Phone || null,
        Organization_ID: orgId,
        Department_ID: Department_ID || null,
        user_type_name,
        Password: hashedPassword,
        Status: 'ACTIVE',
        Created_At: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, 'User created successfully', {
      User_ID: data.User_ID,
      First_Name: data.First_Name,
      Last_Name: data.Last_Name,
      Email: data.Email,
      message: `Default password: ${defaultPassword} (User must change on first login)`
    }, 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create user', error.message, 500);
  }
}

/**
 * Update user details
 */
export async function updateUser(req, res) {
  try {
    const orgId = req.user.organization_id;
    const userId = parseInt(req.params.id);

    // Verify user belongs to this organization
    const { data: userCheck, error: checkError } = await supabase
      .from('User')
      .select('Organization_ID')
      .eq('User_ID', userId)
      .single();

    if (checkError || !userCheck || userCheck.Organization_ID !== orgId) {
      return errorResponse(res, 'User not found or unauthorized', null, 404);
    }

    const { data, error } = await supabase
      .from('User')
      .update({
        ...req.body,
        Updated_At: new Date().toISOString()
      })
      .eq('User_ID', userId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, 'User updated successfully', {
      User_ID: data.User_ID,
      First_Name: data.First_Name,
      Last_Name: data.Last_Name,
      Updated_At: data.Updated_At
    });
  } catch (error) {
    return errorResponse(res, 'Failed to update user', error.message, 500);
  }
}

/**
 * Reset user password
 */
export async function resetUserPassword(req, res) {
  try {
    const orgId = req.user.organization_id;
    const userId = parseInt(req.params.id);
    const newPassword = req.body.newPassword || 'TempPassword123!';

    // Verify user belongs to this organization
    const { data: userCheck, error: checkError } = await supabase
      .from('User')
      .select('Organization_ID, Email')
      .eq('User_ID', userId)
      .single();

    if (checkError || !userCheck || userCheck.Organization_ID !== orgId) {
      return errorResponse(res, 'User not found or unauthorized', null, 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
      .from('User')
      .update({
        Password: hashedPassword,
        Updated_At: new Date().toISOString()
      })
      .eq('User_ID', userId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, 'User password reset successfully', {
      User_ID: data.User_ID,
      Email: userCheck.Email,
      newPassword,
      message: `Password reset to: ${newPassword}`
    });
  } catch (error) {
    return errorResponse(res, 'Failed to reset password', error.message, 500);
  }
}

/**
 * Assign user to department
 */
export async function assignUserToDepartment(req, res) {
  try {
    const orgId = req.user.organization_id;
    const userId = parseInt(req.params.id);
    const { Department_ID } = req.body;

    if (!Department_ID) {
      return errorResponse(res, 'Department_ID is required', null, 400);
    }

    // Verify department belongs to this organization
    const { data: deptCheck, error: deptError } = await supabase
      .from('Department')
      .select('Organization_ID')
      .eq('Department_ID', Department_ID)
      .single();

    if (deptError || !deptCheck || deptCheck.Organization_ID !== orgId) {
      return errorResponse(res, 'Department not found or unauthorized', null, 404);
    }

    const { data, error } = await supabase
      .from('User')
      .update({ Department_ID })
      .eq('User_ID', userId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, 'User assigned to department', {
      User_ID: data.User_ID,
      Department_ID: data.Department_ID
    });
  } catch (error) {
    return errorResponse(res, 'Failed to assign user to department', error.message, 500);
  }
}

/**
 * ============================================================================
 * DEPARTMENT MANAGEMENT
 * ============================================================================
 */

/**
 * Get all departments in organization
 */
export async function getOrganizationDepartments(req, res) {
  try {
    const orgId = req.user.organization_id;

    const { data, error } = await supabase
      .from('department_full_view')
      .select('*')
      .eq('Organization_ID', orgId)
      .order('Dept_Name', { ascending: true });

    if (error) throw error;

    return successResponse(res, 'Departments fetched', {
      departments: data || []
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch departments', error.message, 500);
  }
}

/**
 * Create department
 */
export async function createDepartment(req, res) {
  try {
    const orgId = req.user.organization_id;
    const { Dept_Name, Description, Manager_ID } = req.body;

    if (!Dept_Name) {
      return errorResponse(res, 'Department name is required', null, 400);
    }

    const { data, error } = await supabase
      .from('Department')
      .insert({
        Dept_Name,
        Description: Description || null,
        Organization_ID: orgId,
        Manager_ID: Manager_ID || null,
        Created_At: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, 'Department created successfully', {
      Department_ID: data.Department_ID,
      Dept_Name: data.Dept_Name
    }, 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create department', error.message, 500);
  }
}

/**
 * Update department
 */
export async function updateDepartment(req, res) {
  try {
    const orgId = req.user.organization_id;
    const deptId = parseInt(req.params.id);

    // Verify department belongs to this organization
    const { data: deptCheck, error: checkError } = await supabase
      .from('Department')
      .select('Organization_ID')
      .eq('Department_ID', deptId)
      .single();

    if (checkError || !deptCheck || deptCheck.Organization_ID !== orgId) {
      return errorResponse(res, 'Department not found or unauthorized', null, 404);
    }

    const { data, error } = await supabase
      .from('Department')
      .update(req.body)
      .eq('Department_ID', deptId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, 'Department updated successfully', {
      Department_ID: data.Department_ID,
      Dept_Name: data.Dept_Name
    });
  } catch (error) {
    return errorResponse(res, 'Failed to update department', error.message, 500);
  }
}

/**
 * Get department attendance report
 */
export async function getDepartmentAttendanceReport(req, res) {
  try {
    const orgId = req.user.organization_id;
    const deptId = parseInt(req.params.id);
    const days = parseInt(req.query.days) || 30;

    // Verify department belongs to this organization
    const { data: deptCheck } = await supabase
      .from('Department')
      .select('*')
      .eq('Department_ID', deptId)
      .eq('Organization_ID', orgId)
      .single();

    if (!deptCheck) {
      return errorResponse(res, 'Department not found', null, 404);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Get attendance for department users
    const { data: attendanceData, error } = await supabase
      .from('Attendance')
      .select('*, users(User_ID, First_Name, Last_Name, Department_ID)')
      .eq('Organization_ID', orgId)
      .gte('Attendance_Date', startDateStr);

    if (error) throw error;

    // Filter by department and aggregate
    const reportData = {};
    attendanceData?.forEach(record => {
      if (record.users?.Department_ID === deptId) {
        const userId = record.users.User_ID;
        if (!reportData[userId]) {
          reportData[userId] = {
            User_ID: userId,
            User_Name: `${record.users.First_Name} ${record.users.Last_Name}`,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            attendanceRate: 0
          };
        }
        reportData[userId].total++;
        if (record.Status === 'Present') reportData[userId].present++;
        if (record.Status === 'Absent') reportData[userId].absent++;
        if (record.Status === 'Late') reportData[userId].late++;
      }
    });

    // Calculate attendance rates
    Object.values(reportData).forEach(record => {
      record.attendanceRate = record.total > 0 ? ((record.present / record.total) * 100).toFixed(2) : 0;
    });

    return successResponse(res, 'Department attendance report fetched', {
      department: deptCheck,
      period: days,
      employees: Object.values(reportData)
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch department report', error.message, 500);
  }
}

/**
 * ============================================================================
 * DEVICE MANAGEMENT
 * ============================================================================
 */

/**
 * Get all devices in organization
 */
export async function getOrganizationDevices(req, res) {
  try {
    const orgId = req.user.organization_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'ACTIVE';

    const offset = (page - 1) * limit;

    let query = supabase
      .from('Device')
      .select('*', { count: 'exact' })
      .eq('Organization_ID', orgId);

    if (status) query = query.eq('Status', status);

    const { data, count, error } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return successResponse(res, 'Devices fetched', {
      devices: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch devices', error.message, 500);
  }
}

/**
 * Register new device
 */
export async function registerDevice(req, res) {
  try {
    const orgId = req.user.organization_id;
    const { Device_MAC, Device_Model, Device_Type } = req.body;

    if (!Device_MAC || !Device_Model) {
      return errorResponse(res, 'Device_MAC and Device_Model are required', null, 400);
    }

    const { data, error } = await supabase
      .from('Device')
      .insert({
        Device_MAC,
        Device_Model,
        Device_Type: Device_Type || 'Mobile',
        Organization_ID: orgId,
        Status: 'ACTIVE',
        Created_At: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, 'Device registered successfully', {
      Device_ID: data.Device_ID,
      Device_MAC: data.Device_MAC,
      Device_Model: data.Device_Model
    }, 201);
  } catch (error) {
    return errorResponse(res, 'Failed to register device', error.message, 500);
  }
}

/**
 * Assign device to user
 */
export async function assignDeviceToUser(req, res) {
  try {
    const orgId = req.user.organization_id;
    const deviceId = parseInt(req.params.id);
    const { User_ID } = req.body;

    if (!User_ID) {
      return errorResponse(res, 'User_ID is required', null, 400);
    }

    // Verify device belongs to this organization
    const { data: deviceCheck } = await supabase
      .from('Device')
      .select('Organization_ID')
      .eq('Device_ID', deviceId)
      .single();

    if (!deviceCheck || deviceCheck.Organization_ID !== orgId) {
      return errorResponse(res, 'Device not found or unauthorized', null, 404);
    }

    const { data, error } = await supabase
      .from('Device')
      .update({ User_ID })
      .eq('Device_ID', deviceId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, 'Device assigned to user', {
      Device_ID: data.Device_ID,
      User_ID: data.User_ID
    });
  } catch (error) {
    return errorResponse(res, 'Failed to assign device', error.message, 500);
  }
}

/**
 * ============================================================================
 * GEOFENCE MANAGEMENT
 * ============================================================================
 */

/**
 * Get all geofences in organization
 */
export async function getOrganizationGeofences(req, res) {
  try {
    const orgId = req.user.organization_id;

    const { data, error } = await supabase
      .from('Geofence')
      .select('*')
      .eq('Organization_ID', orgId)
      .order('Geofence_Name', { ascending: true });

    if (error) throw error;

    return successResponse(res, 'Geofences fetched', {
      geofences: data || []
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch geofences', error.message, 500);
  }
}

/**
 * Create geofence
 */
export async function createGeofence(req, res) {
  try {
    const orgId = req.user.organization_id;
    const { Geofence_Name, Latitude, Longitude, Radius_Meters, Description } = req.body;

    if (!Geofence_Name || !Latitude || !Longitude || !Radius_Meters) {
      return errorResponse(res, 'Missing required fields', { 
        required: ['Geofence_Name', 'Latitude', 'Longitude', 'Radius_Meters'] 
      }, 400);
    }

    const { data, error } = await supabase
      .from('Geofence')
      .insert({
        Geofence_Name,
        Latitude,
        Longitude,
        Radius_Meters,
        Description: Description || null,
        Organization_ID: orgId,
        Created_At: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, 'Geofence created successfully', {
      Geofence_ID: data.Geofence_ID,
      Geofence_Name: data.Geofence_Name,
      Latitude: data.Latitude,
      Longitude: data.Longitude
    }, 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create geofence', error.message, 500);
  }
}

/**
 * Update geofence
 */
export async function updateGeofence(req, res) {
  try {
    const orgId = req.user.organization_id;
    const geofenceId = parseInt(req.params.id);

    // Verify geofence belongs to this organization
    const { data: geoCheck } = await supabase
      .from('Geofence')
      .select('Organization_ID')
      .eq('Geofence_ID', geofenceId)
      .single();

    if (!geoCheck || geoCheck.Organization_ID !== orgId) {
      return errorResponse(res, 'Geofence not found or unauthorized', null, 404);
    }

    const { data, error } = await supabase
      .from('Geofence')
      .update(req.body)
      .eq('Geofence_ID', geofenceId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, 'Geofence updated successfully', {
      Geofence_ID: data.Geofence_ID,
      Geofence_Name: data.Geofence_Name
    });
  } catch (error) {
    return errorResponse(res, 'Failed to update geofence', error.message, 500);
  }
}

/**
 * ============================================================================
 * ATTENDANCE MANAGEMENT
 * ============================================================================
 */

/**
 * Get organization attendance records
 */
export async function getOrganizationAttendance(req, res) {
  try {
    const orgId = req.user.organization_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const deptId = req.query.departmentId ? parseInt(req.query.departmentId) : null;
    const status = req.query.status || null;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('attendance_full_view')
      .select('*', { count: 'exact' })
      .eq('Organization_ID', orgId);

    if (status) query = query.eq('Status', status);
    if (startDate) query = query.gte('Attendance_Date', startDate);
    if (endDate) query = query.lte('Attendance_Date', endDate);

    const { data, count, error } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    // Filter by department if provided
    let filteredData = data || [];
    if (deptId && data) {
      // Get department user IDs
      const { data: deptUsers } = await supabase
        .from('User')
        .select('User_ID')
        .eq('Department_ID', deptId);

      const userIds = deptUsers?.map(u => u.User_ID) || [];
      filteredData = data.filter(att => userIds.includes(att.User_ID));
    }

    return successResponse(res, 'Attendance records fetched', {
      records: filteredData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch attendance records', error.message, 500);
  }
}

/**
 * Get employee attendance report
 */
export async function getEmployeeAttendanceReport(req, res) {
  try {
    const orgId = req.user.organization_id;
    const userId = parseInt(req.params.id);
    const days = parseInt(req.query.days) || 90;

    // Verify user belongs to this organization
    const { data: userCheck } = await supabase
      .from('User')
      .select('*')
      .eq('User_ID', userId)
      .eq('Organization_ID', orgId)
      .single();

    if (!userCheck) {
      return errorResponse(res, 'User not found', null, 404);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data: attendanceData, error } = await supabase
      .from('Attendance')
      .select('*')
      .eq('User_ID', userId)
      .gte('Attendance_Date', startDateStr)
      .order('Attendance_Date', { ascending: false });

    if (error) throw error;

    // Calculate statistics
    const stats = {
      total: attendanceData?.length || 0,
      present: 0,
      absent: 0,
      late: 0
    };

    attendanceData?.forEach(record => {
      if (record.Status === 'Present') stats.present++;
      if (record.Status === 'Absent') stats.absent++;
      if (record.Status === 'Late') stats.late++;
    });

    stats.attendanceRate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0;

    return successResponse(res, 'Employee attendance report fetched', {
      employee: {
        User_ID: userCheck.User_ID,
        First_Name: userCheck.First_Name,
        Last_Name: userCheck.Last_Name,
        Email: userCheck.Email
      },
      period: days,
      statistics: stats,
      records: attendanceData || []
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch employee report', error.message, 500);
  }
}

/**
 * Get monthly attendance report
 */
export async function getMonthlyAttendanceReport(req, res) {
  try {
    const orgId = req.user.organization_id;
    const month = req.query.month || new Date().getMonth() + 1;
    const year = req.query.year || new Date().getFullYear();

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: attendanceData, error } = await supabase
      .from('attendance_full_view')
      .select('*')
      .eq('Organization_ID', orgId)
      .gte('Attendance_Date', startDate)
      .lte('Attendance_Date', endDate);

    if (error) throw error;

    // Aggregate by date
    const dailyStats = {};
    attendanceData?.forEach(record => {
      if (!dailyStats[record.Attendance_Date]) {
        dailyStats[record.Attendance_Date] = {
          date: record.Attendance_Date,
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
      dailyStats[record.Attendance_Date].total++;
      if (record.Status === 'Present') dailyStats[record.Attendance_Date].present++;
      if (record.Status === 'Absent') dailyStats[record.Attendance_Date].absent++;
      if (record.Status === 'Late') dailyStats[record.Attendance_Date].late++;
    });

    const monthlyStats = {
      total: attendanceData?.length || 0,
      present: attendanceData?.filter(r => r.Status === 'Present').length || 0,
      absent: attendanceData?.filter(r => r.Status === 'Absent').length || 0,
      late: attendanceData?.filter(r => r.Status === 'Late').length || 0
    };

    return successResponse(res, 'Monthly attendance report fetched', {
      month,
      year,
      monthlyStats,
      dailyData: Object.values(dailyStats)
    });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch monthly report', error.message, 500);
  }
}

/**
 * ============================================================================
 * PROFILE MANAGEMENT
 * ============================================================================
 */

/**
 * Get organization profile
 */
export async function getOrganizationProfile(req, res) {
  try {
    const orgId = req.user.organization_id;

    const { data, error } = await supabase
      .from('organization_full_view')
      .select('*')
      .eq('Organization_ID', orgId)
      .single();

    if (error) throw error;

    return successResponse(res, 'Organization profile fetched', data);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch organization profile', error.message, 500);
  }
}

/**
 * Update organization profile
 */
export async function updateOrganizationProfile(req, res) {
  try {
    const orgId = req.user.organization_id;

    const { Org_Name, email, phone, address } = req.body;

    const { data, error } = await supabase
      .from('Organization')
      .update({
        Org_Name,
        email,
        phone,
        address,
        Updated_At: new Date().toISOString()
      })
      .eq('Organization_ID', orgId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, 'Organization profile updated', {
      Organization_ID: data.Organization_ID,
      Org_Name: data.Org_Name,
      Updated_At: data.Updated_At
    });
  } catch (error) {
    return errorResponse(res, 'Failed to update organization profile', error.message, 500);
  }
}

/**
 * Get admin profile
 */
export async function getAdminProfile(req, res) {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_full_view')
      .select('*')
      .eq('User_ID', userId)
      .single();

    if (error) throw error;

    // Don't return password
    const { Password, ...profile } = data;
    return successResponse(res, 'Admin profile fetched', profile);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch admin profile', error.message, 500);
  }
}

/**
 * Update admin profile
 */
export async function updateAdminProfile(req, res) {
  try {
    const userId = req.user.id;
    const { First_Name, Last_Name, Email, Phone, Job_Title } = req.body;

    const { data, error } = await supabase
      .from('User')
      .update({
        First_Name,
        Last_Name,
        Email,
        Phone,
        Job_Title,
        Updated_At: new Date().toISOString()
      })
      .eq('User_ID', userId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, 'Profile updated successfully', {
      User_ID: data.User_ID,
      First_Name: data.First_Name,
      Last_Name: data.Last_Name,
      Updated_At: data.Updated_At
    });
  } catch (error) {
    return errorResponse(res, 'Failed to update profile', error.message, 500);
  }
}

/**
 * Change admin password
 */
export async function changeAdminPassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current and new passwords are required', null, 400);
    }

    if (newPassword.length < 8) {
      return errorResponse(res, 'New password must be at least 8 characters', null, 400);
    }

    // Get current password hash
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('Password')
      .eq('User_ID', userId)
      .single();

    if (userError) throw userError;

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, userData.Password);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', null, 401);
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from('User')
      .update({
        Password: hashedPassword,
        Updated_At: new Date().toISOString()
      })
      .eq('User_ID', userId);

    if (updateError) throw updateError;

    return successResponse(res, 'Password changed successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to change password', error.message, 500);
  }
}
