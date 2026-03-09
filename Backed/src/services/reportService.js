/**
 * Report Service
 * Generates comprehensive attendance and organization reports
 */

import supabase from '../config/supabaseClient.js';

/**
 * Get daily attendance report
 * @param {string} organizationId - Organization ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {string} departmentId - Optional department filter
 * @param {string} userId - Optional user filter
 * @returns {Promise<{data, error}>}
 */
export async function getDailyAttendanceReport(organizationId, startDate, endDate, departmentId = null, userId = null) {
  try {
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        data: null,
        error: 'Invalid date format. Use YYYY-MM-DD'
      };
    }

    let query = supabase
      .from('attendance_full_view')
      .select('*', { count: 'exact' })
      .gte('Check_In_Time', `${startDate}T00:00:00`)
      .lte('Check_In_Time', `${endDate}T23:59:59`)
      .eq('Organization_ID', organizationId);

    if (departmentId) {
      query = query.eq('Department_ID', departmentId);
    }

    if (userId) {
      query = query.eq('User_ID', userId);
    }

    const { data: records, error } = await query;

    if (error) {
      return {
        data: null,
        error: error.message
      };
    }

    // Aggregate by date
    const dailyStats = {};
    records.forEach(record => {
      const date = record.Check_In_Time.split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          early: 0,
          onLeave: 0,
          records: []
        };
      }
      dailyStats[date].total++;
      dailyStats[date][record.Status.toLowerCase().replace(' ', '')] = 
        (dailyStats[date][record.Status.toLowerCase().replace(' ', '')] || 0) + 1;
      dailyStats[date].records.push(record);
    });

    // Convert to sorted array
    const dailyArray = Object.values(dailyStats).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Calculate summary
    const summary = {
      totalRecords: records.length,
      dateRange: {
        start: startDate,
        end: endDate
      },
      dailyBreakdown: dailyArray.map(day => ({
        date: day.date,
        stats: {
          total: day.total,
          present: day.present || 0,
          absent: day.absent || 0,
          late: day.late || 0,
          early: day.early || 0,
          onLeave: day.onLeave || 0
        },
        presentPercentage: day.total > 0 ? ((day.present || 0) / day.total * 100).toFixed(2) : 0
      })),
      totalStats: {
        totalRecords: records.length,
        present: records.filter(r => r.Status === 'Present').length,
        absent: records.filter(r => r.Status === 'Absent').length,
        late: records.filter(r => r.Status === 'Late').length,
        early: records.filter(r => r.Status === 'Early').length,
        onLeave: records.filter(r => r.Status === 'On Leave').length
      },
      filters: {
        organizationId,
        departmentId,
        userId
      }
    };

    return {
      data: summary,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: err.message
    };
  }
}

/**
 * Get monthly attendance report with trends
 * @param {string} organizationId - Organization ID
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2026)
 * @param {string} departmentId - Optional department filter
 * @param {string} userId - Optional user filter
 * @returns {Promise<{data, error}>}
 */
export async function getMonthlyAttendanceReport(organizationId, month, year, departmentId = null, userId = null) {
  try {
    // Validate month and year
    if (month < 1 || month > 12) {
      return {
        data: null,
        error: 'Month must be between 1 and 12'
      };
    }

    const monthStr = String(month).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-${new Date(year, month, 0).getDate()}`;

    let query = supabase
      .from('attendance_full_view')
      .select('*', { count: 'exact' })
      .gte('Check_In_Time', `${startDate}T00:00:00`)
      .lte('Check_In_Time', `${endDate}T23:59:59`)
      .eq('Organization_ID', organizationId);

    if (departmentId) {
      query = query.eq('Department_ID', departmentId);
    }

    if (userId) {
      query = query.eq('User_ID', userId);
    }

    const { data: records, error } = await query;

    if (error) {
      return {
        data: null,
        error: error.message
      };
    }

    // Group by week
    const weeks = {};
    records.forEach(record => {
      const date = new Date(record.Check_In_Time);
      const weekNum = Math.ceil(date.getDate() / 7);
      const weekKey = `Week ${weekNum}`;

      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          week: weekNum,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          early: 0,
          onLeave: 0
        };
      }

      weeks[weekKey].total++;
      const status = record.Status.toLowerCase().replace(' ', '');
      weeks[weekKey][status] = (weeks[weekKey][status] || 0) + 1;
    });

    // Calculate averages and summary
    const weekArray = Object.values(weeks).sort((a, b) => a.week - b.week);
    const totalDays = new Date(year, month, 0).getDate();
    const totalRecords = records.length;

    const summary = {
      month: {
        name: new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' }),
        number: month,
        year,
        totalDays,
        startDate,
        endDate
      },
      stats: {
        totalRecords,
        present: records.filter(r => r.Status === 'Present').length,
        absent: records.filter(r => r.Status === 'Absent').length,
        late: records.filter(r => r.Status === 'Late').length,
        early: records.filter(r => r.Status === 'Early').length,
        onLeave: records.filter(r => r.Status === 'On Leave').length
      },
      averageAttendanceRate: totalRecords > 0 
        ? ((records.filter(r => r.Status === 'Present').length / totalRecords) * 100).toFixed(2)
        : 0,
      weeklyBreakdown: weekArray.map(week => ({
        week: `Week ${week.week}`,
        stats: {
          total: week.total,
          present: week.present || 0,
          absent: week.absent || 0,
          late: week.late || 0,
          early: week.early || 0,
          onLeave: week.onLeave || 0
        },
        attendanceRate: week.total > 0 ? ((week.present || 0) / week.total * 100).toFixed(2) : 0
      })),
      filters: {
        organizationId,
        departmentId,
        userId
      }
    };

    return {
      data: summary,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: err.message
    };
  }
}

/**
 * Get department attendance report
 * @param {string} organizationId - Organization ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {string} departmentId - Department ID
 * @returns {Promise<{data, error}>}
 */
export async function getDepartmentAttendanceReport(organizationId, startDate, endDate, departmentId) {
  try {
    // Validate dates
    if (!startDate || !endDate || !departmentId) {
      return {
        data: null,
        error: 'Start date, end date, and department ID are required'
      };
    }

    // Get attendance records for department
    const { data: records, error } = await supabase
      .from('attendance_full_view')
      .select('*')
      .gte('Check_In_Time', `${startDate}T00:00:00`)
      .lte('Check_In_Time', `${endDate}T23:59:59`)
      .eq('Organization_ID', organizationId)
      .eq('Department_ID', departmentId);

    if (error) {
      return {
        data: null,
        error: error.message
      };
    }

    // Get department info
    const { data: deptData, error: deptError } = await supabase
      .from('department_full_view')
      .select('*')
      .eq('Department_ID', departmentId)
      .single();

    if (deptError) {
      return {
        data: null,
        error: 'Department not found'
      };
    }

    // Get unique users in department
    const { data: deptUsers, error: usersError } = await supabase
      .from('user_full_view')
      .select('User_ID, First_Name, Last_Name, Email')
      .eq('Organization_ID', organizationId)
      .eq('Department_ID', departmentId);

    if (usersError) {
      return {
        data: null,
        error: usersError.message
      };
    }

    // Calculate per-user stats
    const userStats = {};
    deptUsers.forEach(user => {
      userStats[user.User_ID] = {
        userId: user.User_ID,
        name: `${user.First_Name} ${user.Last_Name}`,
        email: user.Email,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        early: 0,
        onLeave: 0
      };
    });

    records.forEach(record => {
      if (userStats[record.User_ID]) {
        userStats[record.User_ID].total++;
        const status = record.Status.toLowerCase().replace(' ', '');
        userStats[record.User_ID][status] = (userStats[record.User_ID][status] || 0) + 1;
      }
    });

    const userStatsArray = Object.values(userStats).map(user => ({
      ...user,
      attendanceRate: user.total > 0 ? ((user.present / user.total) * 100).toFixed(2) : 0
    }));

    // Calculate department summary
    const deptSummary = {
      department: {
        id: deptData.Department_ID,
        name: deptData.Department_Name,
        description: deptData.Description,
        manager: deptData.Manager_Name,
        organization: deptData.Organization_Name
      },
      dateRange: {
        start: startDate,
        end: endDate
      },
      totalEmployees: deptUsers.length,
      stats: {
        totalRecords: records.length,
        present: records.filter(r => r.Status === 'Present').length,
        absent: records.filter(r => r.Status === 'Absent').length,
        late: records.filter(r => r.Status === 'Late').length,
        early: records.filter(r => r.Status === 'Early').length,
        onLeave: records.filter(r => r.Status === 'On Leave').length
      },
      averageAttendanceRate: records.length > 0
        ? ((records.filter(r => r.Status === 'Present').length / records.length) * 100).toFixed(2)
        : 0,
      employeeBreakdown: userStatsArray.sort((a, b) => b.attendanceRate - a.attendanceRate)
    };

    return {
      data: deptSummary,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: err.message
    };
  }
}

/**
 * Get organization-wide statistics
 * @param {string} organizationId - Organization ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<{data, error}>}
 */
export async function getOrganizationStatistics(organizationId, startDate, endDate) {
  try {
    const { data: records, error } = await supabase
      .from('attendance_full_view')
      .select('*')
      .gte('Check_In_Time', `${startDate}T00:00:00`)
      .lte('Check_In_Time', `${endDate}T23:59:59`)
      .eq('Organization_ID', organizationId);

    if (error) {
      return {
        data: null,
        error: error.message
      };
    }

    // Get organization info
    const { data: orgData, error: orgError } = await supabase
      .from('organization_full_view')
      .select('*')
      .eq('Organization_ID', organizationId)
      .single();

    if (orgError) {
      return {
        data: null,
        error: 'Organization not found'
      };
    }

    // Get total employees
    const { data: employees, error: empError } = await supabase
      .from('user_full_view')
      .select('User_ID')
      .eq('Organization_ID', organizationId)
      .eq('Status', 'Active');

    if (empError) {
      return {
        data: null,
        error: empError.message
      };
    }

    // Get departments
    const { data: departments, error: deptError } = await supabase
      .from('department_full_view')
      .select('Department_ID')
      .eq('Organization_ID', organizationId);

    if (deptError) {
      return {
        data: null,
        error: deptError.message
      };
    }

    // Department-wise breakdown
    const deptStats = {};
    records.forEach(record => {
      if (!deptStats[record.Department_Name]) {
        deptStats[record.Department_Name] = {
          department: record.Department_Name,
          departmentId: record.Department_ID,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          early: 0,
          onLeave: 0
        };
      }
      deptStats[record.Department_Name].total++;
      const status = record.Status.toLowerCase().replace(' ', '');
      deptStats[record.Department_Name][status] = 
        (deptStats[record.Department_Name][status] || 0) + 1;
    });

    const deptArray = Object.values(deptStats).map(dept => ({
      ...dept,
      attendanceRate: dept.total > 0 ? ((dept.present / dept.total) * 100).toFixed(2) : 0
    }));

    // Status breakdown
    const statusBreakdown = {
      present: records.filter(r => r.Status === 'Present').length,
      absent: records.filter(r => r.Status === 'Absent').length,
      late: records.filter(r => r.Status === 'Late').length,
      early: records.filter(r => r.Status === 'Early').length,
      onLeave: records.filter(r => r.Status === 'On Leave').length
    };

    // Calculate daily average
    const dailyStats = {};
    records.forEach(record => {
      const date = record.Check_In_Time.split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { present: 0, total: 0 };
      }
      dailyStats[date].total++;
      if (record.Status === 'Present') {
        dailyStats[date].present++;
      }
    });

    const dailyAveragePresent = Object.values(dailyStats).length > 0
      ? (Object.values(dailyStats).reduce((sum, day) => sum + (day.total > 0 ? (day.present / day.total * 100) : 0), 0) / 
        Object.values(dailyStats).length).toFixed(2)
      : 0;

    const stats = {
      organization: {
        id: orgData.Organization_ID,
        name: orgData.Organization_Name,
        email: orgData.Email,
        phone: orgData.Phone,
        address: orgData.Address,
        totalEmployees: employees.length,
        totalDepartments: departments.length
      },
      dateRange: {
        start: startDate,
        end: endDate
      },
      overallStats: {
        totalRecords: records.length,
        presentCount: statusBreakdown.present,
        absentCount: statusBreakdown.absent,
        lateCount: statusBreakdown.late,
        earlyCount: statusBreakdown.early,
        onLeaveCount: statusBreakdown.onLeave
      },
      rates: {
        presentRate: records.length > 0 ? ((statusBreakdown.present / records.length) * 100).toFixed(2) : 0,
        absentRate: records.length > 0 ? ((statusBreakdown.absent / records.length) * 100).toFixed(2) : 0,
        lateRate: records.length > 0 ? ((statusBreakdown.late / records.length) * 100).toFixed(2) : 0,
        dailyAveragePresence: dailyAveragePresent
      },
      departmentBreakdown: deptArray.sort((a, b) => b.attendanceRate - a.attendanceRate),
      topPerformingDepartment: deptArray.length > 0 ? deptArray[0] : null,
      lowestPerformingDepartment: deptArray.length > 0 ? deptArray[deptArray.length - 1] : null
    };

    return {
      data: stats,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: err.message
    };
  }
}

/**
 * Get user attendance history/report
 * @param {string} userId - User ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<{data, error}>}
 */
export async function getUserAttendanceReport(userId, startDate, endDate) {
  try {
    // Get user info
    const { data: userData, error: userError } = await supabase
      .from('user_full_view')
      .select('*')
      .eq('User_ID', userId)
      .single();

    if (userError) {
      return {
        data: null,
        error: 'User not found'
      };
    }

    // Get attendance records
    const { data: records, error } = await supabase
      .from('attendance_full_view')
      .select('*')
      .eq('User_ID', userId)
      .gte('Check_In_Time', `${startDate}T00:00:00`)
      .lte('Check_In_Time', `${endDate}T23:59:59`)
      .order('Check_In_Time', { ascending: false });

    if (error) {
      return {
        data: null,
        error: error.message
      };
    }

    // Calculate summary
    const summary = {
      user: {
        id: userData.User_ID,
        name: `${userData.First_Name} ${userData.Last_Name}`,
        email: userData.Email,
        phone: userData.Phone,
        department: userData.Department_Name,
        organization: userData.Organization_Name,
        userType: userData.User_Type_Name
      },
      dateRange: {
        start: startDate,
        end: endDate
      },
      stats: {
        totalRecords: records.length,
        present: records.filter(r => r.Status === 'Present').length,
        absent: records.filter(r => r.Status === 'Absent').length,
        late: records.filter(r => r.Status === 'Late').length,
        early: records.filter(r => r.Status === 'Early').length,
        onLeave: records.filter(r => r.Status === 'On Leave').length
      },
      attendanceRate: records.length > 0
        ? ((records.filter(r => r.Status === 'Present').length / records.length) * 100).toFixed(2)
        : 0,
      detailedRecords: records.map(r => ({
        date: r.Check_In_Time.split('T')[0],
        checkInTime: r.Check_In_Time,
        checkOutTime: r.Check_Out_Time,
        status: r.Status,
        device: r.Device_ID,
        location: {
          latitude: r.Latitude,
          longitude: r.Longitude
        }
      }))
    };

    return {
      data: summary,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: err.message
    };
  }
}
