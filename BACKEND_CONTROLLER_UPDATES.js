// ============================================================================
// BACKEND CONTROLLER UPDATES - USE VIEWS INSTEAD OF RAW TABLES
// ============================================================================
// This guide shows how to update each controller to use the new views
// All views return readable names instead of raw IDs
// ============================================================================

// ============================================================================
// 1. attendanceController.js - Use attendance_full_view
// ============================================================================

// OLD QUERY (returns raw IDs):
// SELECT a.id, a.checkIn, a.userId, a.orgId FROM "Attendance" a WHERE a.date = ...

// NEW QUERY (returns readable names):
// SELECT * FROM attendance_full_view WHERE attendance_date = ... AND user_name IS NOT NULL

// Example controller update:
async getAttendanceRecords(req, res) {
  try {
    const { orgId, date } = req.query;
    
    // Using the new view
    const result = await supabase
      .from('attendance_full_view')
      .select('*')
      .eq('orgId', orgId)
      .eq('attendance_date', date)
      .order('created_at', { ascending: false });
    
    if (result.error) throw result.error;
    
    // Frontend now receives:
    // - Attend_ID (UUID)
    // - user_name (readable name like "John Doe")
    // - org_name (readable org name)
    // - device_name (readable device name)
    // - status_name (readable status like "Present")
    // - method_name (readable method like "Face_Recognition")
    // - check_in_time, check_out_time, total_hours, coordinates
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ============================================================================
// 2. userController.js - Use user_full_view
// ============================================================================

// OLD QUERY (returns raw IDs and no org/dept names):
// SELECT u.id, u.firstName, u.lastName, u.orgId FROM "User" u

// NEW QUERY (returns readable names):
// SELECT * FROM user_full_view WHERE org_name = ...

async getUsers(req, res) {
  try {
    const { orgId } = req.query;
    
    // Using the new view
    const result = await supabase
      .from('user_full_view')
      .select('*')
      .order('First_Name', { ascending: true });
    
    if (result.error) throw result.error;
    
    // Frontend now receives:
    // - User_ID (UUID)
    // - First_Name, Last_Name
    // - Email, Phone, Job_Title
    // - org_name (readable organization name)
    // - department_name (readable department name)
    // - user_type_name (readable type like "Employee", "Manager")
    // - is_active (status)
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ============================================================================
// 3. organizationController.js - Use organization_full_view
// ============================================================================

// OLD QUERY (returns raw IDs for type and region):
// SELECT o.id, o.name, o.Org_Type_ID FROM "Organization" o

// NEW QUERY (returns readable names):
// SELECT * FROM organization_full_view WHERE organization_type = 'Corporate'

async getOrganizations(req, res) {
  try {
    const result = await supabase
      .from('organization_full_view')
      .select('*')
      .order('Org_Name', { ascending: true });
    
    if (result.error) throw result.error;
    
    // Frontend now receives:
    // - Org_ID (UUID)
    // - Org_Name
    // - organization_type (readable like "Corporate")
    // - region (readable like "Europe")
    // - org_size, num_employees
    // - email, phone, address, industry
    // - status, logo_url, theme
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ============================================================================
// 4. departmentsController.js - Use department_full_view
// ============================================================================

async getDepartments(req, res) {
  try {
    const { orgId } = req.query;
    
    const result = await supabase
      .from('department_full_view')
      .select('*')
      .order('Department_Name', { ascending: true });
    
    if (result.error) throw result.error;
    
    // Frontend receives:
    // - Dept_ID (UUID)
    // - Department_Name
    // - Description
    // - Department_Head
    // - org_name (readable organization name)
    // - status
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ============================================================================
// 5. shiftsController.js - Use shift_full_view
// ============================================================================

async getShifts(req, res) {
  try {
    const result = await supabase
      .from('shift_full_view')
      .select('*')
      .order('Shift_Name', { ascending: true });
    
    if (result.error) throw result.error;
    
    // Frontend receives:
    // - Shift_ID (UUID)
    // - Shift_Name
    // - start_time, end_time
    // - org_name (readable organization name)
    // - status
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ============================================================================
// 6. subscriptionController.js - Use subscription_full_view
// ============================================================================

async getSubscriptions(req, res) {
  try {
    const result = await supabase
      .from('subscription_full_view')
      .select('*')
      .order('org_name', { ascending: true });
    
    if (result.error) throw result.error;
    
    // Frontend receives:
    // - Subscription_ID (UUID)
    // - org_name (readable organization name)
    // - plan_name (readable plan name)
    // - subscription_status
    // - start_date, end_date
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ============================================================================
// 7. dashboardController.js - Mixed queries
// ============================================================================

// For dashboard summaries, you can mix raw table queries with views
// Example:

async getDashboardStats(req, res) {
  try {
    const { orgId } = req.query;
    
    // Get today's attendance from the view (for readable data)
    const attendanceResult = await supabase
      .from('attendance_full_view')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Get summary counts from raw tables (for aggregations)
    const summaryResult = await supabase
      .from('Attendance')
      .select('id', { count: 'exact', head: false })
      .eq('orgId', orgId);
    
    res.json({
      recentRecords: attendanceResult.data,
      totalRecords: summaryResult.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ============================================================================
// 8. analyticsController.js - Use views for detailed analysis
// ============================================================================

async getAttendanceAnalytics(req, res) {
  try {
    const { orgId, startDate, endDate } = req.query;
    
    // Use view for detailed analytics
    const result = await supabase
      .from('attendance_full_view')
      .select('*')
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate)
      .order('attendance_date', { ascending: false });
    
    if (result.error) throw result.error;
    
    // Process the readable data for analytics
    const analytics = {
      totalRecords: result.data.length,
      presentCount: result.data.filter(a => a.status_name === 'Present').length,
      absentCount: result.data.filter(a => a.status_name === 'Absent').length,
      lateCount: result.data.filter(a => a.status_name === 'Late').length,
      averageHours: result.data.reduce((sum, a) => sum + parseFloat(a.total_hours || 0), 0) / result.data.length,
      records: result.data
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ============================================================================
// IMPORTANT NOTES FOR FRONTEND DEVELOPERS
// ============================================================================

/*
ADVANTAGES OF USING VIEWS:

1. NO MORE ID MAPPING NEEDED
   - Before: Frontend received { userId: "uuid123", orgId: "uuid456" }
   - After: Frontend receives { user_name: "John Doe", org_name: "Acme Corp" }
   
2. CLEANER FRONTEND CODE
   - Before: Need mapped objects to convert IDs to names in components
   - After: Display data directly from view
   
3. SQL EFFICIENT
   - Views use JOINs on the database (server-side filtering)
   - Reduces data transfer and frontend processing
   
4. CONSISTENT DATA FORMAT
   - All readable names follow the same pattern
   - "_name" suffix for all human-readable fields
   - Timestamps are clearly named (created_at, updated_at, check_in_time, etc.)

VIEW SCHEMA REFERENCE:

attendance_full_view:
  - Attend_ID, user_name, org_name, device_name, status_name, method_name
  - check_in_time, check_out_time, total_hours
  - latitude, longitude, ip_address
  - attendance_date, created_at, updated_at

user_full_view:
  - User_ID, First_Name, Last_Name, Email, Phone, Job_Title
  - org_name, department_name, user_type_name
  - is_active, created_at, updated_at

organization_full_view:
  - Org_ID, Org_Name, organization_type, region
  - org_size, num_employees, email, phone, address, industry
  - status, logo_url, theme, created_at, updated_at

department_full_view:
  - Dept_ID, Department_Name, Description, Department_Head
  - org_name, status, created_at, updated_at

shift_full_view:
  - Shift_ID, Shift_Name, start_time, end_time
  - org_name, status, created_at, updated_at

subscription_plan_full_view:
  - Plan_ID, Plan_Name, Description, features, price
  - created_at, updated_at

subscription_full_view:
  - Subscription_ID, org_name, plan_name
  - subscription_status, start_date, end_date
  - created_at, updated_at

FILTERING AND ORDERING:

// Filter by readable names:
const result = await supabase
  .from('attendance_full_view')
  .select('*')
  .eq('status_name', 'Present')
  .order('user_name', { ascending: true });

// Date range queries:
const result = await supabase
  .from('attendance_full_view')
  .select('*')
  .gte('attendance_date', '2026-03-01')
  .lte('attendance_date', '2026-03-31')
  .order('attendance_date', { ascending: false });

// Organization filtering:
const result = await supabase
  .from('user_full_view')
  .select('*')
  .eq('org_name', 'Demo Corporation')
  .order('Last_Name', { ascending: true });

NEXT STEPS:

1. Update each controller to use the appropriate view
2. Test that frontend receives readable data
3. Update frontend components to display data directly (no mapping needed)
4. Test filters, sorting, and pagination with views
5. Run performance tests to verify JOINs are optimized
6. Update API documentation with new response formats
*/
