import {
  findOne,
  findMany,
  create,
  update,
  deleteById,
  count,
} from '../config/supabaseMapper.js';
import supabase from '../config/supabaseClient.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const checkIn = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find existing check-in for today
  const allRecords = await findMany('attendance', { userId: req.user.id }, { limit: 100 });
  const existing = allRecords.find(r => {
    const recordDate = new Date(r.checkInTime);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  });

  if (existing) {
    return errorResponse(res, 'Already checked in today', 400);
  }

  const attendance = await create('attendance', {
    userId: req.user.id,
    orgId: req.user.orgId,
    checkInTime: new Date(),
    methodId: 2 // Default to mobile app
  });

  return successResponse(res, 'Checked in successfully', { record: attendance }, 201);
});

export const checkOut = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find today's record without checkout
  const allRecords = await findMany('attendance', { userId: req.user.id }, { limit: 100 });
  const attendance = allRecords.find(r => {
    const recordDate = new Date(r.checkInTime);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime() && !r.checkOutTime;
  });

  if (!attendance) {
    return errorResponse(res, 'You must check in first', 400);
  }

  if (attendance.checkOutTime) {
    return errorResponse(res, 'Already checked out', 400);
  }

  const checkOutTime = new Date();
  const checkInDate = new Date(attendance.checkInTime);
  const diffMs = checkOutTime - checkInDate;
  const hours = diffMs / (1000 * 60 * 60);

  const updated = await update('attendance', attendance.id, {
    checkOutTime,
    totalHours: parseFloat(hours.toFixed(2))
  }, 'id');

  return successResponse(res, 'Checked out successfully', { record: updated });
});

export const getMyAttendance = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Use attendance_full_view for readable data
  const { data: records, error, count } = await supabase
    .from('attendance_full_view')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('check_in_time', { ascending: false })
    .range(skip, skip + limit - 1);

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  // Get today's record
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayRecord = records?.find(r => {
    const recordDate = new Date(r.attendance_date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  });

  // Get all records for stats calculation
  const { data: allRecords } = await supabase
    .from('attendance_full_view')
    .select('*')
    .eq('user_id', userId);

  // Calculate month stats
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthRecords = allRecords?.filter(r => {
    const recordDate = new Date(r.attendance_date);
    return recordDate >= monthStart;
  }) || [];

  const daysPresent = monthRecords.length;
  const totalHours = monthRecords.reduce((sum, r) => sum + parseFloat(r.total_hours || 0), 0);
  const avgHours = daysPresent > 0 ? (totalHours / daysPresent).toFixed(1) : '0.0';

  return successResponse(res, 'Attendance fetched', {
    records: records || [],
    pagination: {
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    },
    todayRecord: todayRecord || null,
    stats: {
      daysPresent,
      avgHours: parseFloat(avgHours),
      totalHours: totalHours.toFixed(2)
    }
  });
});

export const getOrgAttendance = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  // Use attendance_full_view for readable data
  const { data: records, error, count } = await supabase
    .from('attendance_full_view')
    .select('*', { count: 'exact' })
    .eq('orgId', orgId)
    .order('check_in_time', { ascending: false })
    .range(skip, skip + limit - 1);

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  // Get today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayRecords } = await supabase
    .from('attendance_full_view')
    .select('*')
    .eq('orgId', orgId)
    .gte('attendance_date', today.toISOString().split('T')[0])
    .lte('attendance_date', today.toISOString().split('T')[0]);

  const presentToday = new Set(todayRecords?.map(r => r.user_name)).size;
  const totalHoursToday = todayRecords?.reduce((sum, r) => sum + parseFloat(r.total_hours || 0), 0) || 0;
  const avgHours = presentToday > 0 ? (totalHoursToday / presentToday).toFixed(1) : '0.0';

  return successResponse(res, 'Organization attendance fetched', {
    records: records || [],
    pagination: {
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    },
    stats: {
      presentToday,
      avgHours: parseFloat(avgHours),
      totalHoursToday: totalHoursToday.toFixed(2),
      today: today.toISOString().split('T')[0]
    }
  });
});

// Admin CRUD Operations
export const getAttendance = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const skip = parseInt(req.query.skip) || 0;
  const take = parseInt(req.query.take) || 10;
  const { userId, statusName, dateFrom, dateTo } = req.query;

  // Use attendance_full_view for readable data
  let query = supabase
    .from('attendance_full_view')
    .select('*', { count: 'exact' })
    .eq('orgId', orgId);

  if (userId) {
    query = query.eq('user_id', userId);
  }
  if (statusName) {
    query = query.eq('status_name', statusName);
  }
  if (dateFrom) {
    query = query.gte('attendance_date', dateFrom);
  }
  if (dateTo) {
    query = query.lte('attendance_date', dateTo);
  }

  const { data: records, error, count } = await query
    .order('check_in_time', { ascending: false })
    .range(skip, skip + take - 1);

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Attendance records fetched', {
    records: records || [],
    pagination: {
      total: count || 0,
      skip,
      take,
      totalPages: Math.ceil((count || 0) / take)
    }
  });
});

export const getAttendanceRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Use attendance_full_view for readable data
  const { data: record, error } = await supabase
    .from('attendance_full_view')
    .select('*')
    .eq('Attend_ID', id)
    .single();

  if (error || !record) {
    return errorResponse(res, 'Attendance record not found', 404);
  }

  return successResponse(res, 'Attendance record fetched', { record });
});

export const createAttendance = asyncHandler(async (req, res) => {
  const { userId, checkInTime, checkOutTime, statusId = 1, totalHours } = req.body;
  const orgId = req.user.orgId;

  if (!userId || !checkInTime) {
    return errorResponse(res, 'User ID and check-in time are required', 400);
  }

  // Check if user exists in org
  const user = await findOne('user', { id: userId, orgId });

  if (!user) {
    return errorResponse(res, 'User not found in this organization', 404);
  }

  // Check for duplicate date record
  const checkInDate = new Date(checkInTime);
  checkInDate.setHours(0, 0, 0, 0);
  const allRecords = await findMany('attendance', { userId, orgId }, { limit: 100 });
  const existing = allRecords.find(r => {
    const recordDate = new Date(r.checkInTime);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === checkInDate.getTime();
  });

  if (existing) {
    return errorResponse(res, 'Attendance record already exists for this date', 400);
  }

  const record = await create('attendance', {
    userId,
    orgId,
    checkInTime,
    checkOutTime: checkOutTime || null,
    statusId,
    totalHours: totalHours ? parseFloat(totalHours) : null
  });

  return successResponse(res, 'Attendance record created', { record }, 201);
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;
  const { checkInTime, checkOutTime, statusId, totalHours } = req.body;

  const allRecords = await findMany('attendance', { orgId }, { limit: 10000 });
  const record = allRecords.find(r => r.id === parseInt(id));

  if (!record) {
    return errorResponse(res, 'Attendance record not found', 404);
  }

  const updateData = {};
  if (checkInTime !== undefined) updateData.checkInTime = checkInTime;
  if (checkOutTime !== undefined) updateData.checkOutTime = checkOutTime;
  if (statusId !== undefined) updateData.statusId = statusId;
  if (totalHours !== undefined) updateData.totalHours = parseFloat(totalHours);

  const updated = await update('attendance', id, updateData, 'id');

  return successResponse(res, 'Attendance record updated', { record: updated });
});

export const deleteAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const allRecords = await findMany('attendance', { orgId }, { limit: 10000 });
  const record = allRecords.find(r => r.id === parseInt(id));

  if (!record) {
    return errorResponse(res, 'Attendance record not found', 404);
  }

  await deleteById('attendance', id, 'id');

  return successResponse(res, 'Attendance record deleted');
});

export const approveAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const allRecords = await findMany('attendance', { orgId }, { limit: 10000 });
  const record = allRecords.find(r => r.id === parseInt(id));

  if (!record) {
    return errorResponse(res, 'Attendance record not found', 404);
  }

  // Find the "Approved" status ID (assuming it's 2)
  const updated = await update('attendance', id, { statusId: 2 }, 'id');

  return successResponse(res, 'Attendance record approved', { record: updated });
});

export const rejectAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const allRecords = await findMany('attendance', { orgId }, { limit: 10000 });
  const record = allRecords.find(r => r.id === parseInt(id));

  if (!record) {
    return errorResponse(res, 'Attendance record not found', 404);
  }

  // Find the "Rejected" status ID (assuming it's 3)
  const updated = await update('attendance', id, { statusId: 3 }, 'id');

  return successResponse(res, 'Attendance record rejected', { record: updated });
});