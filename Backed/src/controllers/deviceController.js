/**
 * Device Controller
 * Handles device registration, validation, and management
 */

import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Register a device on user login
 * POST /devices/register
 * Body: { deviceId, deviceType, deviceModel, osVersion, appVersion }
 * Returns: { deviceId, isTrusted, message }
 */
export const registerDevice = asyncHandler(async (req, res) => {
  const { deviceId, deviceType, deviceModel, osVersion, appVersion } = req.body;
  const userId = req.user.id;
  const organizationId = req.user.orgId;

  // Validate required fields
  if (!deviceId || !deviceType) {
    return errorResponse(res, 'Device ID and device type are required', 400);
  }

  if (!userId || !organizationId) {
    return errorResponse(res, 'User must be authenticated with organization', 400);
  }

  try {
    // Check if device already exists for this user
    const existingDevice = await prisma.device.findUnique({
      where: { deviceId }
    });

    if (existingDevice) {
      // Device exists - return its info
      return successResponse(res, 'Device already registered', {
        deviceId: existingDevice.id,
        registeredDeviceId: existingDevice.deviceId,
        isTrusted: existingDevice.isTrusted,
        createdAt: existingDevice.createdAt
      }, 200);
    }

    // Check if this is the user's first device
    const userDeviceCount = await prisma.device.count({
      where: { userId }
    });

    const isFirstDevice = userDeviceCount === 0;

    // Create new device record
    const newDevice = await prisma.device.create({
      data: {
        userId,
        organizationId,
        deviceId, // Unique device identifier from client
        deviceType,
        deviceModel: deviceModel || null,
        osVersion: osVersion || null,
        appVersion: appVersion || null,
        isTrusted: isFirstDevice // First device is automatically trusted
      }
    });

    return successResponse(res, 'Device registered successfully', {
      deviceId: newDevice.id,
      registeredDeviceId: newDevice.deviceId,
      isTrusted: newDevice.isTrusted,
      message: isFirstDevice ? 'First device registered and marked as trusted' : 'Device registered'
    }, 201);
  } catch (error) {
    console.error('Device registration error:', error);
    
    // Handle duplicate device constraint
    if (error.code === 'P2002') {
      return errorResponse(res, 'Device ID already exists', 409);
    }

    return errorResponse(res, `Device registration failed: ${error.message}`, 500);
  }
});

/**
 * Get all devices for authenticated user
 * GET /devices/my-devices
 */
export const getUserDevices = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const [devices, total] = await Promise.all([
    prisma.device.findMany({
      where: { userId },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        deviceId: true,
        deviceType: true,
        deviceModel: true,
        osVersion: true,
        appVersion: true,
        isTrusted: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    prisma.device.count({ where: { userId } })
  ]);

  return successResponse(res, 'User devices retrieved', {
    data: devices,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get device by ID
 * GET /devices/:id
 */
export const getDeviceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const device = await prisma.device.findFirst({
    where: {
      id,
      userId // Ensure user can only see their own devices
    },
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

  if (!device) {
    return errorResponse(res, 'Device not found', 404);
  }

  return successResponse(res, 'Device details fetched', device);
});

/**
 * Mark device as trusted
 * PUT /devices/:id/trust
 */
export const trustDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const device = await prisma.device.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!device) {
    return errorResponse(res, 'Device not found', 404);
  }

  const updated = await prisma.device.update({
    where: { id },
    data: { isTrusted: true }
  });

  return successResponse(res, 'Device marked as trusted', {
    id: updated.id,
    deviceId: updated.deviceId,
    isTrusted: updated.isTrusted
  });
});

/**
 * Mark device as untrusted
 * PUT /devices/:id/untrust
 */
export const untrustDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const device = await prisma.device.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!device) {
    return errorResponse(res, 'Device not found', 404);
  }

  const updated = await prisma.device.update({
    where: { id },
    data: { isTrusted: false }
  });

  return successResponse(res, 'Device marked as untrusted', {
    id: updated.id,
    deviceId: updated.deviceId,
    isTrusted: updated.isTrusted
  });
});

/**
 * Delete device
 * DELETE /devices/:id
 */
export const deleteDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const device = await prisma.device.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!device) {
    return errorResponse(res, 'Device not found', 404);
  }

  await prisma.device.delete({ where: { id } });

  return successResponse(res, 'Device deleted successfully');
});

/**
 * Get organization devices (Admin only)
 * GET /devices/org/all
 */
export const getOrganizationDevices = asyncHandler(async (req, res) => {
  const organizationId = req.user.orgId;
  const { page = 1, limit = 10, trusted } = req.query;
  const skip = (page - 1) * limit;

  if (!organizationId) {
    return errorResponse(res, 'Organization ID required', 400);
  }

  const where = { organizationId };
  if (trusted !== undefined) {
    where.isTrusted = trusted === 'true';
  }

  const [devices, total] = await Promise.all([
    prisma.device.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
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
    }),
    prisma.device.count({ where })
  ]);

  return successResponse(res, 'Organization devices retrieved', {
    data: devices,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Update device last used timestamp
 * PUT /devices/:id/last-used
 */
export const updateDeviceLastUsed = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const device = await prisma.device.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!device) {
    return errorResponse(res, 'Device not found', 404);
  }

  const updated = await prisma.device.update({
    where: { id },
    data: { updatedAt: new Date() }
  });

  return successResponse(res, 'Device updated', {
    id: updated.id,
    lastUsed: updated.updatedAt
  });
});

/**
 * Get devices by IP (for attendance tracking)
 * GET /devices/search/ip?ipAddress=...
 */
export const getDevicesByIP = asyncHandler(async (req, res) => {
  const { ipAddress } = req.query;

  if (!ipAddress) {
    return errorResponse(res, 'IP address is required', 400);
  }

  // For now, this is a placeholder since we don't store IP in Device model
  // In a real scenario, you might store IP in a separate audit log or session table
  return successResponse(res, 'Devices search by IP', { message: 'Feature not yet implemented' });
});
