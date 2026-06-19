// Backed/src/services/attendanceValidationService.js - Clean Prisma Version

import prisma from '../config/prisma.js';

/**
 * Attendance Validation Service
 * Provides validation functions for attendance check-in/check-out using Prisma ORM
 */

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * VALIDATION 1: Verify User exists and is active
 */
export async function validateUser(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        valid: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
        data: null,
      };
    }

    if (user.status !== 'ACTIVE') {
      return {
        valid: false,
        error: `User account is ${user.status.toLowerCase()}`,
        code: 'USER_INACTIVE',
        data: null,
      };
    }

    return {
      valid: true,
      error: null,
      code: 'USER_VALID',
      data: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        orgId: user.orgId,
      },
    };
  } catch (error) {
    console.error('Error validating user:', error);
    return {
      valid: false,
      error: error.message,
      code: 'VALIDATION_ERROR',
      data: null,
    };
  }
}

/**
 * VALIDATION 2: Verify Device exists and is assigned to user
 */
export async function validateDevice(userId, deviceId) {
  try {
    // Get user's assigned device if exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { deviceId: true }
    });

    if (!user) {
      return {
        valid: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
        data: null,
      };
    }

    if (!user.deviceId && !deviceId) {
      return {
        valid: false,
        error: 'No device assigned or provided',
        code: 'NO_DEVICE_ASSIGNED',
        data: null,
      };
    }

    const deviceToCheck = deviceId || user.deviceId;

    const device = await prisma.deviceInfo.findUnique({
      where: { id: deviceToCheck }
    });

    if (!device) {
      return {
        valid: false,
        error: 'Device not found',
        code: 'DEVICE_NOT_FOUND',
        data: null,
      };
    }

    if (device.activeStatus !== true) {
      return {
        valid: false,
        error: 'Device is not active',
        code: 'DEVICE_INACTIVE',
        data: null,
      };
    }

    return {
      valid: true,
      error: null,
      code: 'DEVICE_VALID',
      data: {
        deviceId: device.id,
        name: device.name,
        model: device.model,
        macAddress: device.macAddress,
      },
    };
  } catch (error) {
    console.error('Error validating device:', error);
    return {
      valid: false,
      error: 'Device validation failed',
      code: 'VALIDATION_ERROR',
      data: null,
    };
  }
}

/**
 * VALIDATION 3: Verify Geofence (location within organization geofence)
 */
export async function validateGeofence(organizationId, latitude, longitude, geofenceId = null) {
  try {
    // Validate coordinates
    if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
      return {
        valid: false,
        error: 'Location coordinates not provided',
        code: 'LOCATION_MISSING',
        data: null,
      };
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      return {
        valid: false,
        error: 'Invalid location coordinates',
        code: 'INVALID_COORDINATES',
        data: null,
      };
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return {
        valid: false,
        error: 'Location coordinates out of range',
        code: 'COORDINATES_OUT_OF_RANGE',
        data: null,
      };
    }

    // Query geofences for organization
    const geofences = await prisma.geofence.findMany({
      where: { organizationId }
    });

    if (!geofences || geofences.length === 0) {
      return {
        valid: false,
        error: 'No geofences configured for organization',
        code: 'NO_GEOFENCES',
        data: null,
      };
    }

    // Check if location is within any geofence
    for (const geofence of geofences) {
      const distanceKm = calculateDistance(
        latitude,
        longitude,
        geofence.latitude,
        geofence.longitude
      );

      const distanceMeters = distanceKm * 1000;
      const radiusMeters = geofence.radiusInMeters;

      if (distanceMeters <= radiusMeters) {
        return {
          valid: true,
          error: null,
          code: 'GEOFENCE_VALID',
          data: {
            geofenceId: geofence.id,
            geofenceName: geofence.name,
            distanceMeters: Math.round(distanceMeters),
            radiusMeters: radiusMeters,
            withinRadius: true,
          },
        };
      }
    }

    // Location not within any geofence - find closest
    let closestGeofence = null;
    let closestDistance = Infinity;

    for (const geofence of geofences) {
      const distanceKm = calculateDistance(
        latitude,
        longitude,
        geofence.latitude,
        geofence.longitude
      );
      if (distanceKm < closestDistance) {
        closestDistance = distanceKm;
        closestGeofence = geofence;
      }
    }

    return {
      valid: false,
      error: `Location outside all geofences. Closest: ${closestGeofence?.name || 'N/A'} (${Math.round(closestDistance * 1000)}m away)`,
      code: 'GEOFENCE_OUT_OF_RANGE',
      data: {
        userLocation: { latitude, longitude },
        closestGeofence: closestGeofence ? {
          name: closestGeofence.name,
          distance: Math.round(closestDistance * 1000),
        } : null,
      },
    };
  } catch (error) {
    console.error('Error validating geofence:', error);
    return {
      valid: false,
      error: 'Geofence validation failed',
      code: 'VALIDATION_ERROR',
      data: null,
    };
  }
}

/**
 * VALIDATION 4: Verify today's attendance status
 */
export async function validateAttendance(userId, organizationId, deviceId, latitude, longitude, geofenceId = null) {
  try {
    const errors = [];
    let validationData = {
      user: null,
      device: null,
      geofence: null,
    };

    // 1. Validate user
    const userValidation = await validateUser(userId);
    if (!userValidation.valid) {
      errors.push({
        field: 'user',
        code: userValidation.code,
        message: userValidation.error,
      });
    } else {
      validationData.user = userValidation.data;
    }

    // 2. Validate device
    const deviceValidation = await validateDevice(userId, deviceId);
    if (!deviceValidation.valid) {
      errors.push({
        field: 'device',
        code: deviceValidation.code,
        message: deviceValidation.error,
      });
    } else {
      validationData.device = deviceValidation.data;
    }

    // 3. Validate geofence
    const geofenceValidation = await validateGeofence(organizationId, latitude, longitude, geofenceId);
    if (!geofenceValidation.valid) {
      errors.push({
        field: 'geofence',
        code: geofenceValidation.code,
        message: geofenceValidation.error,
      });
    } else {
      validationData.geofence = geofenceValidation.data;
    }

    return {
      valid: errors.length === 0,
      errors,
      data: validationData,
      summary: {
        totalValidations: 3,
        passed: 3 - errors.length,
        failed: errors.length,
      },
    };
  } catch (error) {
    console.error('Error in comprehensive validation:', error);
    return {
      valid: false,
      errors: [
        {
          field: 'validation',
          code: 'VALIDATION_ERROR',
          message: 'Attendance validation failed: ' + error.message,
        },
      ],
      data: null,
      summary: {
        totalValidations: 3,
        passed: 0,
        failed: 3,
      },
    };
  }
}

/**
 * Get geofence details
 */
export async function getGeofenceInfo(geofenceId) {
  try {
    const geofence = await prisma.geofence.findUnique({
      where: { id: geofenceId }
    });

    if (!geofence) {
      return {
        exists: false,
        data: null,
      };
    }

    return {
      exists: true,
      data: {
        geofenceId: geofence.id,
        name: geofence.name,
        organizationId: geofence.organizationId,
        latitude: geofence.latitude,
        longitude: geofence.longitude,
        radiusMeters: geofence.radiusInMeters,
        description: geofence.description,
      },
    };
  } catch (error) {
    console.error('Error fetching geofence info:', error);
    return {
      exists: false,
      data: null,
    };
  }
}

/**
 * Get all organization geofences
 */
export async function getOrganizationGeofences(organizationId) {
  try {
    const geofences = await prisma.geofence.findMany({
      where: { organizationId }
    });

    return geofences || [];
  } catch (error) {
    console.error('Error fetching organization geofences:', error);
    return [];
  }
}
