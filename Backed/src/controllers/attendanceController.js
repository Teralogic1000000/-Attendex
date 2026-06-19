import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { validateCheckInGeofence } from '../services/geofenceValidationService.js';
import { validateDeviceForCheckIn } from '../services/deviceValidationService.js';
import { validateUserShift } from '../services/shiftValidationService.js';

export const checkIn = asyncHandler(async (req, res) => {
  const { latitude, longitude, deviceType, deviceId, deviceModel, osVersion, appVersion } = req.body;
  const userId = req.user.id;
  const orgId = req.user.orgId;

  // ===== CAPTURE REQUEST METADATA =====
  // Extract IP address from request
  const ipAddress = 
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'UNKNOWN';

  const checkInTime = new Date();
  const checkInTimeString = checkInTime.toLocaleTimeString();

  // Validate required fields
  if (!latitude || !longitude) {
    return errorResponse(res, 'Latitude and longitude are required for check-in', 400);
  }

  if (!deviceId || !deviceType) {
    return errorResponse(res, 'Device ID and device type are required', 400);
  }

  // ===== DEVICE VALIDATION =====
  const deviceValidation = await validateDeviceForCheckIn(userId, deviceId);
  
  if (!deviceValidation.canCheckIn) {
    return errorResponse(res, deviceValidation.message, 403, {
      error: 'DEVICE_VALIDATION_FAILED',
      device: deviceValidation.device,
      reasons: deviceValidation.reasons
    });
  }

  // ===== GEOFENCE VALIDATION =====
  const geofenceValidation = await validateCheckInGeofence(orgId, latitude, longitude, 'Mobile_App');
  
  if (!geofenceValidation.isValid) {
    return errorResponse(res, geofenceValidation.message, 403, {
      error: 'GEOFENCE_VALIDATION_FAILED',
      distance: geofenceValidation.distance,
      geofenceDetails: geofenceValidation.details.geofenceConfig
    });
  }

  // ===== SHIFT VALIDATION =====
  const shiftValidation = await validateUserShift(userId, orgId);
  
  // Note: Shift validation does not block check-in by default
  // It's informational - can be made mandatory by changing the condition below
  // For now, we log it but continue if shifts are configured
  let shiftStatus = {
    isScheduled: shiftValidation.isConfigured,
    isWithinShift: shiftValidation.isWithinShift,
    currentShift: shiftValidation.currentShift,
    message: shiftValidation.message
  };

  // Optional: Block check-in if outside shift (uncomment to enable strict enforcement)
  // if (shiftValidation.isConfigured && !shiftValidation.isWithinShift) {
  //   return errorResponse(res, shiftValidation.message, 403, {
  //     error: 'OUTSIDE_SHIFT_HOURS',
  //     shifts: shiftValidation.allShifts
  //   });
  // }

  // ===== DUPLICATE CHECK-IN VALIDATION =====
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findFirst({
    where: {
      userId,
      orgId,
      checkIn: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  if (existing) {
    return errorResponse(res, 'Already checked in today', 400);
  }

  // ===== CREATE ATTENDANCE RECORD =====
  const attendance = await prisma.attendance.create({
    data: {
      userId,
      orgId,
      date: new Date(),
      checkIn: checkInTime,
      status: 'Present',
      method: 'Mobile_App',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      deviceId: deviceValidation.device.id,
      deviceType: deviceType,
      deviceModel: deviceModel || deviceValidation.device.deviceModel || null,
      osVersion: osVersion || deviceValidation.device.osVersion || null,
      appVersion: appVersion || null,
      ipAddress: ipAddress,
      notes: shiftValidation.isConfigured && !shiftValidation.isWithinShift 
        ? `Early check-in: ${shiftValidation.message}` 
        : null
    }
  });

  // ===== BUILD RESPONSE =====
  return successResponse(
    res,
    `Check-in successful at ${checkInTimeString}`,
    {
      record: {
        id: attendance.id,
        timestamp: attendance.checkIn,
        coordinates: {
          latitude: attendance.latitude,
          longitude: attendance.longitude
        },
        device: {
          id: attendance.deviceId,
          type: attendance.deviceType,
          model: attendance.deviceModel,
          osVersion: attendance.osVersion,
          appVersion: attendance.appVersion,
          isTrusted: deviceValidation.device.isTrusted
        },
        metadata: {
          ipAddress: ipAddress,
          method: attendance.method,
          status: attendance.status
        },
        validations: {
          device: {
            validated: true,
            isTrusted: deviceValidation.device.isTrusted,
            deviceType: deviceValidation.device.deviceType
          },
          geofence: {
            validated: true,
            withinRadius: geofenceValidation.isValid,
            distance: geofenceValidation.distance,
            radius: geofenceValidation.details.geofenceConfig?.radius
          },
          shift: shiftStatus
        }
      }
    },
    201
  );
});

export const checkOut = asyncHandler(async (req, res) => {
  const { latitude, longitude, deviceId } = req.body;
  const userId = req.user.id;
  const orgId = req.user.orgId;

  // ===== CAPTURE REQUEST METADATA =====
  const ipAddress = 
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'UNKNOWN';

  const checkOutTime = new Date();

  // Validate required fields
  if (!deviceId) {
    return errorResponse(res, 'Device ID is required for check-out', 400);
  }

  // ===== DEVICE VALIDATION =====
  const deviceValidation = await validateDeviceForCheckIn(userId, deviceId);
  
  if (!deviceValidation.canCheckIn) {
    return errorResponse(res, 'Device validation failed for check-out', 403, {
      error: 'DEVICE_VALIDATION_FAILED'
    });
  }

  // ===== OPTIONAL GEOFENCE VALIDATION (if location provided) =====
  let geofenceValidation = null;
  if (latitude && longitude) {
    geofenceValidation = await validateCheckInGeofence(orgId, latitude, longitude, 'Mobile_App');
    
    if (!geofenceValidation.isValid) {
      return errorResponse(res, geofenceValidation.message, 403, {
        error: 'GEOFENCE_VALIDATION_FAILED',
        distance: geofenceValidation.distance
      });
    }
  }

  // ===== FIND TODAY'S CHECK-IN RECORD =====
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId,
      orgId,
      checkIn: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      checkOut: null
    }
  });

  if (!attendance) {
    return errorResponse(res, 'No check-in record found for today', 404);
  }

  // ===== CALCULATE HOURS AND UPDATE RECORD =====
  const checkInTime = new Date(attendance.checkIn);
  const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

  const updated = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      checkOut: checkOutTime,
      totalHours: Math.round(totalHours * 100) / 100,
      latitude: latitude ? parseFloat(latitude) : attendance.latitude,
      longitude: longitude ? parseFloat(longitude) : attendance.longitude,
      ipAddress: ipAddress
    }
  });

  // ===== BUILD RESPONSE =====
  return successResponse(
    res,
    `Check-out successful. You worked ${updated.totalHours.toFixed(2)} hours`,
    {
      record: {
        id: updated.id,
        checkIn: updated.checkIn,
        checkOut: updated.checkOut,
        totalHours: updated.totalHours,
        coordinates: {
          latitude: updated.latitude,
          longitude: updated.longitude
        },
        device: {
          type: updated.deviceType,
          model: updated.deviceModel,
          osVersion: updated.osVersion
        },
        metadata: {
          ipAddress: ipAddress,
          method: updated.method,
          status: updated.status,
          date: updated.date
        },
        validations: {
          device: {
            validated: true,
            isTrusted: deviceValidation.device.isTrusted
          },
          geofence: geofenceValidation ? {
            validated: true,
            withinRadius: geofenceValidation.isValid,
            distance: geofenceValidation.distance
          } : {
            validated: false,
            message: 'Location not provided for check-out'
          }
        }
      }
    },
    200
  );
});

export const getAttendance = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const search = req.query.search;

  console.log('🔍 getAttendance DEBUG:', {
    page,
    limit,
    status,
    startDate,
    endDate,
    search,
    orgId: req.user.orgId
  });

  const where = {
    orgId: req.user.orgId
  };

  // Only add status filter if provided and not empty
  if (status && status !== 'all' && status !== '') {
    where.status = status;
  }

  // Only add date range filter if dates are provided
  if (startDate && startDate !== '') {
    if (!where.date) where.date = {};
    where.date.gte = new Date(startDate);
  }

  if (endDate && endDate !== '') {
    if (!where.date) where.date = {};
    where.date.lte = new Date(endDate);
  }

  // Note: Search for user name would require joining with users table
  // For now, we'll skip search if provided (can be implemented with include)

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit
    }),
    prisma.attendance.count({ where })
  ]);

  console.log('✅ getAttendance SUCCESS:', { recordCount: records.length, total });

  return successResponse(res, 'Attendance records fetched', {
    attendance: records,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getAttendanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const attendance = await prisma.attendance.findFirst({
    where: { id, orgId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  if (!attendance) {
    return errorResponse(res, 'Attendance record not found', 404);
  }

  return successResponse(res, 'Attendance record retrieved', attendance);
});

export const getAttendanceRecord = asyncHandler(async (req, res) => {
  return getAttendanceById(req, res);
});

export const getOrgAttendance = asyncHandler(async (req, res) => {
  return getAttendance(req, res);
});

export const getMyAttendance = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where: {
        userId: req.user.id,
        orgId: req.user.orgId
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit
    }),
    prisma.attendance.count({
      where: {
        userId: req.user.id,
        orgId: req.user.orgId
      }
    })
  ]);

  return successResponse(res, 'My attendance records fetched', {
    attendance: records,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getTodayStatus = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: req.user.id,
      orgId: req.user.orgId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  return successResponse(res, 'Today status retrieved', {
    checkedIn: !!attendance?.checkIn,
    checkedOut: !!attendance?.checkOut,
    status: attendance?.status || 'Not checked in'
  });
});

export const createAttendanceRecord = asyncHandler(async (req, res) => {
  const { userId, date, status, method, latitude, longitude } = req.body;
  const orgId = req.user.orgId;

  // Verify user exists in org
  const user = await prisma.user.findFirst({
    where: { id: userId, orgId }
  });

  if (!user) {
    return errorResponse(res, 'User not found in organization', 404);
  }

  const attendance = await prisma.attendance.create({
    data: {
      userId,
      orgId,
      date: new Date(date),
      status,
      method,
      latitude,
      longitude
    }
  });

  return successResponse(res, 'Attendance record created', attendance, 201);
});

export const updateAttendanceRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, checkIn, checkOut } = req.body;
  const orgId = req.user.orgId;

  const attendance = await prisma.attendance.findFirst({
    where: { id, orgId }
  });

  if (!attendance) {
    return errorResponse(res, 'Attendance record not found', 404);
  }

  const updateData = {};
  if (status !== undefined) updateData.status = status;
  if (checkIn !== undefined) updateData.checkIn = new Date(checkIn);
  if (checkOut !== undefined) {
    updateData.checkOut = new Date(checkOut);
    // Calculate total hours
    const checkInTime = new Date(checkIn) || attendance.checkIn;
    const checkOutTime = new Date(checkOut);
    const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    updateData.totalHours = Math.round(totalHours * 100) / 100;
  }

  const updated = await prisma.attendance.update({
    where: { id },
    data: updateData
  });

  return successResponse(res, 'Attendance record updated', updated);
});

export const deleteAttendanceRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const attendance = await prisma.attendance.findFirst({
    where: { id, orgId }
  });

  if (!attendance) {
    return errorResponse(res, 'Attendance record not found', 404);
  }

  await prisma.attendance.delete({
    where: { id }
  });

  return successResponse(res, 'Attendance record deleted');
});

export const getAttendanceStatistics = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const days = parseInt(req.query.days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const records = await prisma.attendance.findMany({
    where: {
      orgId,
      date: { gte: startDate }
    }
  });

  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'Present').length,
    absent: records.filter(r => r.status === 'Absent').length,
    late: records.filter(r => r.status === 'Late').length,
    onLeave: records.filter(r => r.status === 'On_Leave').length
  };

  return successResponse(res, 'Attendance statistics retrieved', stats);
});

export const createAttendance = asyncHandler(async (req, res) => {
  return createAttendanceRecord(req, res);
});

export const updateAttendance = asyncHandler(async (req, res) => {
  return updateAttendanceRecord(req, res);
});

export const deleteAttendance = asyncHandler(async (req, res) => {
  return deleteAttendanceRecord(req, res);
});

export const approveAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const attendance = await prisma.attendance.findFirst({
    where: { id, orgId }
  });

  if (!attendance) {
    return errorResponse(res, 'Attendance record not found', 404);
  }

  const updated = await prisma.attendance.update({
    where: { id },
    data: { status: 'Present' }
  });

  return successResponse(res, 'Attendance approved successfully', updated);
});

export const rejectAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const orgId = req.user.orgId;

  const attendance = await prisma.attendance.findFirst({
    where: { id, orgId }
  });

  if (!attendance) {
    return errorResponse(res, 'Attendance record not found', 404);
  }

  const updated = await prisma.attendance.update({
    where: { id },
    data: { status: 'Rejected' }
  });

  return successResponse(res, 'Attendance rejected successfully', updated);
});
