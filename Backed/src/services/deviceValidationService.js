/**
 * Device Validation Service
 * Handles device security validation and trust management
 */

import prisma from '../config/prisma.js';

/**
 * Register or verify a device for attendance
 * Called on each check-in to ensure device is still trusted
 * 
 * @param {string} userId - User ID
 * @param {string} deviceId - Device identifier from client
 * @param {string} deviceType - Device type (iOS, Android, Web)
 * @param {string} deviceModel - Device model
 * @param {string} osVersion - OS version
 * @param {string} organizationId - Organization ID
 * @returns {Promise<object>} { success, device, message }
 */
export const validateAndRegisterDevice = async (
  userId,
  deviceId,
  deviceType,
  deviceModel,
  osVersion,
  organizationId
) => {
  try {
    // Validate required fields
    if (!userId || !deviceId || !deviceType || !organizationId) {
      return {
        success: false,
        message: 'Missing required device information',
        device: null
      };
    }

    // Check if device already exists
    let device = await prisma.device.findUnique({
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

    if (device) {
      // Device exists - verify it belongs to this user
      if (device.userId !== userId) {
        return {
          success: false,
          message: 'Device already registered to another user',
          device: null,
          error: 'DEVICE_OWNER_MISMATCH'
        };
      }

      return {
        success: true,
        message: 'Device verified',
        device: {
          id: device.id,
          deviceId: device.deviceId,
          deviceType: device.deviceType,
          deviceModel: device.deviceModel,
          osVersion: device.osVersion,
          isTrusted: device.isTrusted,
          createdAt: device.createdAt,
          lastUsed: device.updatedAt
        }
      };
    }

    // Create new device
    const newDevice = await prisma.device.create({
      data: {
        userId,
        organizationId,
        deviceId,
        deviceType,
        deviceModel: deviceModel || null,
        osVersion: osVersion || null,
        isTrusted: false // New devices start as untrusted
      }
    });

    return {
      success: true,
      message: 'Device registered. Please verify this device before using for attendance.',
      device: {
        id: newDevice.id,
        deviceId: newDevice.deviceId,
        deviceType: newDevice.deviceType,
        isTrusted: newDevice.isTrusted
      },
      requiresVerification: true
    };
  } catch (error) {
    console.error('Device registration/validation error:', error);
    return {
      success: false,
      message: `Device validation failed: ${error.message}`,
      device: null
    };
  }
};

/**
 * Mark a device as trusted after user verification
 * Called when user confirms device verification
 * 
 * @param {string} deviceId - Device ID
 * @param {string} userId - User ID (for security)
 * @returns {Promise<object>} { success, device, message }
 */
export const markDeviceTrusted = async (deviceId, userId) => {
  try {
    const device = await prisma.device.findUnique({
      where: { deviceId }
    });

    if (!device) {
      return {
        success: false,
        message: 'Device not found',
        device: null
      };
    }

    // Verify device belongs to user
    if (device.userId !== userId) {
      return {
        success: false,
        message: 'Cannot verify device for another user',
        device: null,
        error: 'UNAUTHORIZED'
      };
    }

    // Mark as trusted
    const updatedDevice = await prisma.device.update({
      where: { deviceId },
      data: { isTrusted: true }
    });

    return {
      success: true,
      message: 'Device marked as trusted',
      device: {
        id: updatedDevice.id,
        deviceId: updatedDevice.deviceId,
        isTrusted: updatedDevice.isTrusted
      }
    };
  } catch (error) {
    console.error('Error marking device trusted:', error);
    return {
      success: false,
      message: `Failed to trust device: ${error.message}`,
      device: null
    };
  }
};

/**
 * Check device compatibility with organization requirements
 * 
 * @param {string} organizationId - Organization ID
 * @param {string} deviceType - Device type
 * @param {string} osVersion - OS version
 * @returns {Promise<object>} { isCompatible, requirements, message }
 */
export const checkDeviceCompatibility = async (organizationId, deviceType, osVersion) => {
  try {
    // For now, basic compatibility check
    // In production, you might store device requirements per org
    const supportedDeviceTypes = ['iOS', 'Android', 'Web'];

    if (!supportedDeviceTypes.includes(deviceType)) {
      return {
        isCompatible: false,
        message: `Device type '${deviceType}' is not supported`,
        requirements: {
          supportedDeviceTypes
        }
      };
    }

    return {
      isCompatible: true,
      message: 'Device is compatible with organization requirements',
      requirements: {
        supportedDeviceTypes
      }
    };
  } catch (error) {
    console.error('Device compatibility check error:', error);
    return {
      isCompatible: false,
      message: `Compatibility check failed: ${error.message}`,
      requirements: null
    };
  }
};

/**
 * Get all trusted devices for a user
 * 
 * @param {string} userId - User ID
 * @returns {Promise<array>} Array of trusted devices
 */
export const getUserTrustedDevices = async (userId) => {
  try {
    const devices = await prisma.device.findMany({
      where: {
        userId,
        isTrusted: true
      },
      select: {
        id: true,
        deviceId: true,
        deviceType: true,
        deviceModel: true,
        osVersion: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    return devices;
  } catch (error) {
    console.error('Error fetching trusted devices:', error);
    return [];
  }
};

/**
 * Get all devices for a user (trusted and untrusted)
 * 
 * @param {string} userId - User ID
 * @returns {Promise<object>} { trusted, untrusted, total }
 */
export const getUserDevices = async (userId) => {
  try {
    const devices = await prisma.device.findMany({
      where: { userId },
      select: {
        id: true,
        deviceId: true,
        deviceType: true,
        deviceModel: true,
        isTrusted: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const trusted = devices.filter((d) => d.isTrusted);
    const untrusted = devices.filter((d) => !d.isTrusted);

    return {
      trusted,
      untrusted,
      total: devices.length,
      canCheckIn: trusted.length > 0 // Can only check in with trusted device
    };
  } catch (error) {
    console.error('Error fetching user devices:', error);
    return {
      trusted: [],
      untrusted: [],
      total: 0,
      canCheckIn: false
    };
  }
};

/**
 * Revoke trust on a device
 * Mark device as untrusted (soft delete)
 * 
 * @param {string} deviceId - Device ID
 * @param {string} userId - User ID (for security)
 * @returns {Promise<object>} { success, message }
 */
export const revokeTrust = async (deviceId, userId) => {
  try {
    const device = await prisma.device.findUnique({
      where: { deviceId }
    });

    if (!device) {
      return {
        success: false,
        message: 'Device not found'
      };
    }

    if (device.userId !== userId) {
      return {
        success: false,
        message: 'Cannot revoke trust on another user device',
        error: 'UNAUTHORIZED'
      };
    }

    await prisma.device.update({
      where: { deviceId },
      data: { isTrusted: false }
    });

    return {
      success: true,
      message: 'Device trust revoked. Re-verify to use again.'
    };
  } catch (error) {
    console.error('Error revoking device trust:', error);
    return {
      success: false,
      message: `Failed to revoke trust: ${error.message}`
    };
  }
};

/**
 * Delete device permanently
 * Hard delete from database
 * 
 * @param {string} deviceId - Device ID
 * @param {string} userId - User ID (for security)
 * @returns {Promise<object>} { success, message }
 */
export const deleteDevice = async (deviceId, userId) => {
  try {
    const device = await prisma.device.findUnique({
      where: { deviceId }
    });

    if (!device) {
      return {
        success: false,
        message: 'Device not found'
      };
    }

    if (device.userId !== userId) {
      return {
        success: false,
        message: 'Cannot delete another user device',
        error: 'UNAUTHORIZED'
      };
    }

    await prisma.device.delete({
      where: { deviceId }
    });

    return {
      success: true,
      message: 'Device deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting device:', error);
    return {
      success: false,
      message: `Failed to delete device: ${error.message}`
    };
  }
};

/**
 * Verify device can be used for attendance check-in
 * Comprehensive validation
 * 
 * @param {string} userId - User ID
 * @param {string} deviceId - Device ID
 * @returns {Promise<object>} { canCheckIn, message, device, reasons }
 */
export const validateDeviceForCheckIn = async (userId, deviceId) => {
  try {
    const device = await prisma.device.findUnique({
      where: { deviceId }
    });

    const reasons = [];

    // Check 1: Device exists
    if (!device) {
      reasons.push('Device not found');
      return {
        canCheckIn: false,
        message: 'Device not registered',
        device: null,
        reasons
      };
    }

    // Check 2: Device belongs to user
    if (device.userId !== userId) {
      reasons.push('Device belongs to another user');
      return {
        canCheckIn: false,
        message: 'Device does not belong to this user',
        device: null,
        reasons
      };
    }

    // Check 3: Device is trusted
    if (!device.isTrusted) {
      reasons.push('Device is not marked as trusted');
      return {
        canCheckIn: false,
        message: 'Device must be marked as trusted for attendance',
        device: {
          id: device.id,
          deviceId: device.deviceId,
          isTrusted: false
        },
        reasons
      };
    }

    return {
      canCheckIn: true,
      message: 'Device verified and ready for check-in',
      device: {
        id: device.id,
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        deviceModel: device.deviceModel,
        osVersion: device.osVersion,
        isTrusted: true
      },
      reasons: []
    };
  } catch (error) {
    console.error('Error validating device for check-in:', error);
    return {
      canCheckIn: false,
      message: `Validation failed: ${error.message}`,
      device: null,
      reasons: [error.message]
    };
  }
};

export default {
  validateAndRegisterDevice,
  markDeviceTrusted,
  checkDeviceCompatibility,
  getUserTrustedDevices,
  getUserDevices,
  revokeTrust,
  deleteDevice,
  validateDeviceForCheckIn
};
