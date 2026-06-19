/**
 * Device Validation Middleware
 * Validates that a request comes from a trusted device
 * 
 * Usage: router.post('/check-in', verifyToken, validateDevice, checkIn);
 * 
 * Expects deviceId in request header:
 * headers: { 'x-device-id': 'device-identifier' }
 * OR
 * headers: { 'deviceid': 'device-identifier' }
 */

import prisma from '../config/prisma.js';

/**
 * Device Validation Middleware
 * Validates device is registered, belongs to user, and is trusted
 */
export const validateDevice = async (req, res, next) => {
  try {
    // Get userId from authenticated user (added by authMiddleware)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated',
        error: 'UNAUTHORIZED'
      });
    }

    // Extract deviceId from headers (case insensitive)
    const deviceId = 
      req.headers['x-device-id'] || 
      req.headers['deviceid'] ||
      req.headers['device-id'];

    if (!deviceId) {
      return res.status(400).json({
        message: 'Device ID is required in request headers (x-device-id)',
        error: 'MISSING_DEVICE_ID'
      });
    }

    // Find device in database
    const device = await prisma.device.findUnique({
      where: { deviceId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Check if device exists
    if (!device) {
      return res.status(404).json({
        message: 'Device not found. Please register your device first.',
        error: 'DEVICE_NOT_FOUND',
        hint: 'Call POST /api/devices/register with device information'
      });
    }

    // Verify device belongs to the logged-in user
    if (device.userId !== userId) {
      return res.status(403).json({
        message: 'Device does not belong to this user',
        error: 'DEVICE_MISMATCH',
        deviceOwner: device.user.firstName + ' ' + device.user.lastName
      });
    }

    // Check if device is trusted
    if (!device.isTrusted) {
      return res.status(403).json({
        message: 'Device is not trusted. Please verify this device first.',
        error: 'UNTRUSTED_DEVICE',
        hint: 'Device must be marked as trusted before it can be used for attendance'
      });
    }

    // Device is valid and trusted - attach to request for use in controller
    req.device = {
      id: device.id,
      deviceId: device.deviceId,
      deviceType: device.deviceType,
      deviceModel: device.deviceModel,
      osVersion: device.osVersion,
      appVersion: device.appVersion,
      isTrusted: device.isTrusted,
      userId: device.userId
    };

    // Call next middleware/route handler
    next();
  } catch (error) {
    console.error('Device validation middleware error:', error);
    return res.status(500).json({
      message: 'Device validation failed',
      error: 'INTERNAL_SERVER_ERROR',
      details: error.message
    });
  }
};

/**
 * Optional: Device Validation with Trust Enforcement
 * Stricter version - requires device to be explicitly trusted
 * Used for sensitive operations
 */
export const validateTrustedDeviceOnly = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated',
        error: 'UNAUTHORIZED'
      });
    }

    // Check if user has at least one trusted device
    const trustedDevice = await prisma.device.findFirst({
      where: {
        userId,
        isTrusted: true
      }
    });

    if (!trustedDevice) {
      return res.status(403).json({
        message: 'No trusted devices found. Please register and verify a device first.',
        error: 'NO_TRUSTED_DEVICE'
      });
    }

    // If specific deviceId is provided, validate it matches
    const deviceId = 
      req.headers['x-device-id'] || 
      req.headers['deviceid'] ||
      req.headers['device-id'];

    if (deviceId && deviceId !== trustedDevice.deviceId) {
      const device = await prisma.device.findUnique({
        where: { deviceId }
      });

      if (!device || device.userId !== userId || !device.isTrusted) {
        return res.status(403).json({
          message: 'Device is not trusted or does not belong to this user',
          error: 'INVALID_DEVICE'
        });
      }

      req.device = {
        id: device.id,
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        deviceModel: device.deviceModel,
        isTrusted: device.isTrusted
      };
    } else {
      req.device = {
        id: trustedDevice.id,
        deviceId: trustedDevice.deviceId,
        deviceType: trustedDevice.deviceType,
        isTrusted: trustedDevice.isTrusted
      };
    }

    next();
  } catch (error) {
    console.error('Trusted device validation error:', error);
    return res.status(500).json({
      message: 'Device validation failed',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

/**
 * Optional: Verify Device Exists (but doesn't require trust)
 * Less strict - just ensures device is registered to user
 * Useful for logging device usage without blocking untrusted devices
 */
export const verifyDeviceExists = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const deviceId = 
      req.headers['x-device-id'] || 
      req.headers['deviceid'] ||
      req.headers['device-id'];

    if (deviceId && userId) {
      const device = await prisma.device.findUnique({
        where: { deviceId }
      });

      if (device && device.userId === userId) {
        req.device = {
          id: device.id,
          deviceId: device.deviceId,
          isTrusted: device.isTrusted
        };
      }
    }

    // Continue regardless - device info is optional here
    next();
  } catch (error) {
    console.error('Device verification error:', error);
    // Don't block - just skip device info
    next();
  }
};

export default validateDevice;
