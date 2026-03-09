// Backed/src/controllers/employeeDashboardController.js

import supabase from '../config/supabaseClient.js';
import { validateAttendance, validateUser, validateDevice, validateGeofence } from '../services/attendanceValidationService.js';

/**
 * Standardized success response
 */
const successResponse = (res, message, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Standardized error response
 */
const errorResponse = (res, message, error, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get employee dashboard overview
 * Returns: personal info, department, assigned device, today's attendance status
 */
export async function getEmployeeDashboardOverview(req, res) {
  try {
    const userId = req.user.id;

    // Get user profile with organization
    const { data: userProfile, error: userError } = await supabase
      .from('user_full_view')
      .select('User_ID, First_Name, Last_Name, Email, Phone, user_type_name, Department_ID, Device_ID, Organization_ID, Status')
      .eq('User_ID', userId)
      .single();

    if (userError || !userProfile) {
      return errorResponse(res, 'User profile not found', null, 404);
    }

    if (userProfile.Status !== 'Active') {
      return errorResponse(res, 'User account is inactive', null, 403);
    }

    // Get department information
    let departmentInfo = null;
    if (userProfile.Department_ID) {
      const { data: dept } = await supabase
        .from('department_full_view')
        .select('Department_ID, Dept_Name, Description, Manager_ID')
        .eq('Department_ID', userProfile.Department_ID)
        .single();
      departmentInfo = dept;
    }

    // Get assigned device information
    let deviceInfo = null;
    if (userProfile.Device_ID) {
      const { data: device } = await supabase
        .from('Device')
        .select('Device_ID, Device_MAC, Device_Model, Device_Type, Status, Last_Sync')
        .eq('Device_ID', userProfile.Device_ID)
        .single();
      deviceInfo = device;
    }

    // Get organization information
    const { data: orgInfo } = await supabase
      .from('organization_full_view')
      .select('Organization_ID, Org_Name, Org_Email, Org_Phone, Org_Address, Org_Type, Region, Status')
      .eq('Organization_ID', userProfile.Organization_ID)
      .single();

    // Get today's attendance status
    const today = new Date().toISOString().split('T')[0];
    const { data: todayAttendance } = await supabase
      .from('Attendance')
      .select('Attendance_ID, Check_In_Time, Check_Out_Time, Status')
      .eq('User_ID', userId)
      .gte('Check_In_Time', `${today}T00:00:00`)
      .lt('Check_In_Time', `${today}T23:59:59`)
      .single();

    const dashboardData = {
      profile: {
        userId: userProfile.User_ID,
        name: `${userProfile.First_Name} ${userProfile.Last_Name}`,
        email: userProfile.Email,
        phone: userProfile.Phone,
        role: userProfile.user_type_name,
        status: userProfile.Status,
      },
      department: departmentInfo,
      device: deviceInfo,
      organization: orgInfo
        ? {
            id: orgInfo.Organization_ID,
            name: orgInfo.Org_Name,
            email: orgInfo.Org_Email,
            phone: orgInfo.Org_Phone,
            address: orgInfo.Org_Address,
            type: orgInfo.Org_Type,
            region: orgInfo.Region,
          }
        : null,
      todayAttendance: {
        checkedIn: todayAttendance ? todayAttendance.Check_In_Time !== null : false,
        checkedOut: todayAttendance ? todayAttendance.Check_Out_Time !== null : false,
        status: todayAttendance?.Status || 'Not Marked',
        checkInTime: todayAttendance?.Check_In_Time || null,
        checkOutTime: todayAttendance?.Check_Out_Time || null,
      },
    };

    return successResponse(res, 'Dashboard overview retrieved successfully', dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return errorResponse(res, 'Failed to retrieve dashboard overview', error.message, 500);
  }
}

/**
 * Get employee profile (limited information - no sensitive data)
 */
export async function getEmployeeProfile(req, res) {
  try {
    const userId = req.user.id;

    const { data: profile, error } = await supabase
      .from('user_full_view')
      .select('User_ID, First_Name, Last_Name, Email, Phone, user_type_name, Department_ID, Device_ID, Status, Created_At')
      .eq('User_ID', userId)
      .single();

    if (error || !profile) {
      return errorResponse(res, 'Profile not found', null, 404);
    }

    // Get department name
    let departmentName = null;
    if (profile.Department_ID) {
      const { data: dept } = await supabase
        .from('Department')
        .select('Dept_Name')
        .eq('Department_ID', profile.Department_ID)
        .single();
      departmentName = dept?.Dept_Name;
    }

    const profileData = {
      userId: profile.User_ID,
      firstName: profile.First_Name,
      lastName: profile.Last_Name,
      email: profile.Email,
      phone: profile.Phone,
      role: profile.user_type_name,
      department: departmentName,
      status: profile.Status,
      joinedDate: profile.Created_At,
    };

    return successResponse(res, 'Profile retrieved successfully', profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return errorResponse(res, 'Failed to retrieve profile', error.message, 500);
  }
}

/**
 * Update employee profile (LIMITED: only phone number)
 * RESTRICTION: Employees can only update their own phone number
 */
export async function updateEmployeeProfile(req, res) {
  try {
    const userId = req.user.id;
    const { phone } = req.body;

    // Validate phone number
    if (!phone || phone.trim() === '') {
      return errorResponse(res, 'Phone number is required', null, 400);
    }

    // Update only phone number
    const { data, error } = await supabase
      .from('User')
      .update({ Phone: phone })
      .eq('User_ID', userId)
      .select();

    if (error) throw error;

    return successResponse(res, 'Profile updated successfully', { phone: data[0].Phone }, 200);
  } catch (error) {
    console.error('Error updating profile:', error);
    return errorResponse(res, 'Failed to update profile', error.message, 500);
  }
}

/**
 * Get department information (view-only)
 */
export async function getDepartmentInfo(req, res) {
  try {
    const userId = req.user.id;

    // Get user's department ID
    const { data: user } = await supabase
      .from('User')
      .select('Department_ID')
      .eq('User_ID', userId)
      .single();

    if (!user || !user.Department_ID) {
      return errorResponse(res, 'No department assigned', null, 404);
    }

    // Get department details
    const { data: department, error } = await supabase
      .from('department_full_view')
      .select('Department_ID, Dept_Name, Description, Manager_ID, Created_At')
      .eq('Department_ID', user.Department_ID)
      .single();

    if (error || !department) {
      return errorResponse(res, 'Department not found', null, 404);
    }

    // Get manager name if assigned
    let managerName = null;
    if (department.Manager_ID) {
      const { data: manager } = await supabase
        .from('User')
        .select('First_Name, Last_Name')
        .eq('User_ID', department.Manager_ID)
        .single();
      managerName = manager ? `${manager.First_Name} ${manager.Last_Name}` : null;
    }

    const deptData = {
      departmentId: department.Department_ID,
      name: department.Dept_Name,
      description: department.Description,
      manager: managerName,
      createdDate: department.Created_At,
    };

    return successResponse(res, 'Department information retrieved successfully', deptData);
  } catch (error) {
    console.error('Error fetching department info:', error);
    return errorResponse(res, 'Failed to retrieve department information', error.message, 500);
  }
}

/**
 * Get assigned device information (view-only)
 */
export async function getAssignedDevice(req, res) {
  try {
    const userId = req.user.id;

    // Get user's device ID
    const { data: user } = await supabase
      .from('User')
      .select('Device_ID')
      .eq('User_ID', userId)
      .single();

    if (!user || !user.Device_ID) {
      return errorResponse(res, 'No device assigned', null, 404);
    }

    // Get device details
    const { data: device, error } = await supabase
      .from('Device')
      .select('Device_ID, Device_MAC, Device_Model, Device_Type, Status, Last_Sync, Created_At')
      .eq('Device_ID', user.Device_ID)
      .single();

    if (error || !device) {
      return errorResponse(res, 'Device not found', null, 404);
    }

    const deviceData = {
      deviceId: device.Device_ID,
      mac: device.Device_MAC,
      model: device.Device_Model,
      type: device.Device_Type,
      status: device.Status,
      lastSync: device.Last_Sync,
      assignedDate: device.Created_At,
    };

    return successResponse(res, 'Device information retrieved successfully', deviceData);
  } catch (error) {
    console.error('Error fetching device info:', error);
    return errorResponse(res, 'Failed to retrieve device information', error.message, 500);
  }
}

/**
 * Get organization information (view-only)
 */
export async function getOrganizationInfo(req, res) {
  try {
    const userId = req.user.id;
    const orgId = req.user.organization_id;

    // Get organization details
    const { data: organization, error } = await supabase
      .from('organization_full_view')
      .select('Organization_ID, Org_Name, Org_Email, Org_Phone, Org_Address, Org_Type, Region, Status')
      .eq('Organization_ID', orgId)
      .single();

    if (error || !organization) {
      return errorResponse(res, 'Organization not found', null, 404);
    }

    const orgData = {
      organizationId: organization.Organization_ID,
      name: organization.Org_Name,
      email: organization.Org_Email,
      phone: organization.Org_Phone,
      address: organization.Org_Address,
      type: organization.Org_Type,
      region: organization.Region,
      status: organization.Status,
    };

    return successResponse(res, 'Organization information retrieved successfully', orgData);
  } catch (error) {
    console.error('Error fetching organization info:', error);
    return errorResponse(res, 'Failed to retrieve organization information', error.message, 500);
  }
}

/**
 * Check-in attendance with validation
 * Validates: user exists, device assigned, location within geofence
 * Only records if all validations pass
 */
export async function checkInAttendance(req, res) {
  try {
    const userId = req.user.id;
    const orgId = req.user.organization_id;
    const { deviceId, latitude, longitude, geofenceId, notes } = req.body;

    // Validate latitude and longitude are provided
    if (!latitude || !longitude) {
      return errorResponse(res, 'Location coordinates required for check-in', null, 400);
    }

    // VALIDATION STEP: Comprehensive attendance validation
    const validationResult = await validateAttendance(
      userId,
      orgId,
      deviceId,
      latitude,
      longitude,
      geofenceId
    );

    // If validation failed, return error with details
    if (!validationResult.valid) {
      return errorResponse(
        res,
        `Check-in validation failed: ${validationResult.errors[0]?.message || 'Unknown error'}`,
        {
          validationErrors: validationResult.errors,
          summary: validationResult.summary,
        },
        400
      );
    }

    // Check if employee already checked in today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingAttendance } = await supabase
      .from('Attendance')
      .select('Attendance_ID, Check_In_Time')
      .eq('User_ID', userId)
      .gte('Check_In_Time', `${today}T00:00:00`)
      .lt('Check_In_Time', `${today}T23:59:59`)
      .single();

    if (existingAttendance && existingAttendance.Check_In_Time) {
      return errorResponse(res, 'Already checked in today', null, 400);
    }

    const checkInTime = new Date().toISOString();

    // All validations passed, record attendance
    if (existingAttendance) {
      // Update existing record for today
      const { data, error } = await supabase
        .from('Attendance')
        .update({
          Check_In_Time: checkInTime,
          Device_ID: validationResult.data.device?.deviceId || null,
          Geofence_ID: validationResult.data.geofence?.geofenceId || null,
          Latitude: latitude,
          Longitude: longitude,
          Status: 'Present',
          Notes: notes || null,
        })
        .eq('Attendance_ID', existingAttendance.Attendance_ID)
        .select();

      if (error) throw error;

      return successResponse(res, 'Check-in recorded successfully (after validation passed)', {
        attendanceId: data[0].Attendance_ID,
        checkInTime: data[0].Check_In_Time,
        status: data[0].Status,
        validationPassed: true,
        device: validationResult.data.device,
        geofence: validationResult.data.geofence,
      }, 201);
    } else {
      // Create new attendance record
      const { data, error } = await supabase
        .from('Attendance')
        .insert({
          User_ID: userId,
          Check_In_Time: checkInTime,
          Device_ID: validationResult.data.device?.deviceId || null,
          Geofence_ID: validationResult.data.geofence?.geofenceId || null,
          Latitude: latitude,
          Longitude: longitude,
          Status: 'Present',
          Notes: notes || null,
        })
        .select();

      if (error) throw error;

      return successResponse(res, 'Check-in recorded successfully (after validation passed)', {
        attendanceId: data[0].Attendance_ID,
        checkInTime: data[0].Check_In_Time,
        status: data[0].Status,
        validationPassed: true,
        device: validationResult.data.device,
        geofence: validationResult.data.geofence,
      }, 201);
    }
  } catch (error) {
    console.error('Error checking in:', error);
    return errorResponse(res, 'Failed to record check-in', error.message, 500);
  }
}

/**
 * Check-out attendance with optional re-validation
 * Records employee check-out with current timestamp
 * RESTRICTION: Can only check out if already checked in
 * Optional: Re-validate device and geofence on checkout
 */
export async function checkOutAttendance(req, res) {
  try {
    const userId = req.user.id;
    const orgId = req.user.organization_id;
    const { deviceId, latitude, longitude, notes, validateAgain } = req.body;

    // Get today's attendance record
    const today = new Date().toISOString().split('T')[0];
    const { data: todayAttendance, error: searchError } = await supabase
      .from('Attendance')
      .select('Attendance_ID, Check_In_Time, Check_Out_Time, Device_ID')
      .eq('User_ID', userId)
      .gte('Check_In_Time', `${today}T00:00:00`)
      .lt('Check_In_Time', `${today}T23:59:59`)
      .single();

    if (searchError || !todayAttendance) {
      return errorResponse(res, 'No check-in found for today', null, 404);
    }

    if (!todayAttendance.Check_In_Time) {
      return errorResponse(res, 'Please check in first', null, 400);
    }

    if (todayAttendance.Check_Out_Time) {
      return errorResponse(res, 'Already checked out today', null, 400);
    }

    // Optional: Re-validate on check-out if requested
    if (validateAgain && latitude && longitude) {
      const validationResult = await validateAttendance(
        userId,
        orgId,
        deviceId || todayAttendance.Device_ID,
        latitude,
        longitude
      );

      if (!validationResult.valid) {
        return errorResponse(
          res,
          `Check-out validation failed: ${validationResult.errors[0]?.message || 'Unknown error'}`,
          {
            validationErrors: validationResult.errors,
            summary: validationResult.summary,
          },
          400
        );
      }
    }

    const checkOutTime = new Date().toISOString();

    // Update attendance with check-out
    const { data, error } = await supabase
      .from('Attendance')
      .update({
        Check_Out_Time: checkOutTime,
        Latitude: latitude || null,
        Longitude: longitude || null,
        Notes: notes || null,
      })
      .eq('Attendance_ID', todayAttendance.Attendance_ID)
      .select();

    if (error) throw error;

    return successResponse(res, 'Check-out recorded successfully', {
      attendanceId: data[0].Attendance_ID,
      checkInTime: data[0].Check_In_Time,
      checkOutTime: data[0].Check_Out_Time,
      status: data[0].Status,
      validationPassed: validateAgain ? true : undefined,
    }, 200);
  } catch (error) {
    console.error('Error checking out:', error);
    return errorResponse(res, 'Failed to record check-out', error.message, 500);
  }
}

/**
 * Get today's attendance status
 * Returns current check-in/check-out status for today
 */
export async function getTodayAttendanceStatus(req, res) {
  try {
    const userId = req.user.id;

    const today = new Date().toISOString().split('T')[0];
    const { data: todayAttendance, error } = await supabase
      .from('Attendance')
      .select('Attendance_ID, Check_In_Time, Check_Out_Time, Status, Latitude, Longitude')
      .eq('User_ID', userId)
      .gte('Check_In_Time', `${today}T00:00:00`)
      .lt('Check_In_Time', `${today}T23:59:59`)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    if (!todayAttendance) {
      return successResponse(res, 'No attendance record for today', {
        checkedIn: false,
        checkedOut: false,
        status: 'Not Marked',
        checkInTime: null,
        checkOutTime: null,
      });
    }

    const statusData = {
      attendanceId: todayAttendance.Attendance_ID,
      checkedIn: todayAttendance.Check_In_Time !== null,
      checkedOut: todayAttendance.Check_Out_Time !== null,
      status: todayAttendance.Status,
      checkInTime: todayAttendance.Check_In_Time,
      checkOutTime: todayAttendance.Check_Out_Time,
      checkInLocation: todayAttendance.Latitude ? { lat: todayAttendance.Latitude, lng: todayAttendance.Longitude } : null,
    };

    return successResponse(res, 'Today attendance status retrieved successfully', statusData);
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    return errorResponse(res, 'Failed to retrieve attendance status', error.message, 500);
  }
}

/**
 * Get attendance history (paginated)
 * Returns employee's attendance records with filtering
 * RESTRICTION: Can only view own attendance records
 */
export async function getAttendanceHistory(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 30, startDate, endDate, status } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 30));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('attendance_full_view')
      .select('Attendance_ID, Check_In_Time, Check_Out_Time, Status, Latitude, Longitude, Notes, Geofence_ID', { count: 'exact' })
      .eq('User_ID', userId);

    // Apply filters
    if (startDate) {
      query = query.gte('Check_In_Time', `${startDate}T00:00:00`);
    }

    if (endDate) {
      query = query.lte('Check_In_Time', `${endDate}T23:59:59`);
    }

    if (status) {
      query = query.eq('Status', status);
    }

    // Apply pagination and sorting
    const { data, error, count } = await query
      .order('Check_In_Time', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    const attendanceRecords = data.map(record => ({
      attendanceId: record.Attendance_ID,
      date: record.Check_In_Time ? record.Check_In_Time.split('T')[0] : null,
      checkInTime: record.Check_In_Time,
      checkOutTime: record.Check_Out_Time,
      status: record.Status,
      location: record.Latitude ? { lat: record.Latitude, lng: record.Longitude } : null,
      notes: record.Notes,
    }));

    return successResponse(res, 'Attendance history retrieved successfully', {
      records: attendanceRecords,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    return errorResponse(res, 'Failed to retrieve attendance history', error.message, 500);
  }
}

/**
 * Get attendance statistics (monthly/weekly summary for employee)
 */
export async function getAttendanceStatistics(req, res) {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    const currentDate = new Date();
    const queryMonth = parseInt(month) || currentDate.getMonth() + 1;
    const queryYear = parseInt(year) || currentDate.getFullYear();

    // Get all attendance records for the month
    const startDate = new Date(queryYear, queryMonth - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(queryYear, queryMonth, 0).toISOString().split('T')[0];

    const { data: records, error } = await supabase
      .from('Attendance')
      .select('Attendance_ID, Check_In_Time, Check_Out_Time, Status')
      .eq('User_ID', userId)
      .gte('Check_In_Time', `${startDate}T00:00:00`)
      .lte('Check_In_Time', `${endDate}T23:59:59`);

    if (error) throw error;

    // Calculate statistics
    const present = records.filter(r => r.Status === 'Present').length;
    const absent = records.filter(r => r.Status === 'Absent').length;
    const late = records.filter(r => r.Status === 'Late').length;
    const onTime = records.filter(r => r.Status === 'Present' && r.Check_In_Time).length;

    const stats = {
      month: queryMonth,
      year: queryYear,
      totalWorkDays: Math.max(present + absent + late, 20), // Assuming 20 work days per month
      presentDays: present,
      absentDays: absent,
      lateDays: late,
      onTimeDays: onTime,
      attendanceRate: Math.round(((present + onTime) / Math.max(present + absent + late, 20)) * 100),
    };

    return successResponse(res, 'Attendance statistics retrieved successfully', stats);
  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    return errorResponse(res, 'Failed to retrieve attendance statistics', error.message, 500);
  }
}
