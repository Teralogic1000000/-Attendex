// Backed/src/services/attendanceValidationService.js

import supabase from '../config/supabaseClient.js';

/**
 * Attendance Validation Service
 * Provides validation functions for attendance check-in/check-out
 * 
 * Validations:
 * - Device verification (device exists and assigned to user)
 * - User verification (user exists and is active)
 * - Geofence validation (location within organization geofence)
 */

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
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
 * @param {string} userId - User ID to verify
 * @returns {Promise<{valid: boolean, error: string|null, data: object|null}>}
 */
export async function validateUser(userId) {
  try {
    const { data: user, error } = await supabase
      .from('User')
      .select('User_ID, First_Name, Last_Name, Status, Organization_ID')
      .eq('User_ID', userId)
      .single();

    // User not found
    if (error && error.code === 'PGRST116') {
      return {
        valid: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
        data: null,
      };
    }

    // Database error
    if (error) throw error;

    // User found but inactive
    if (user.Status !== 'Active') {
      return {
        valid: false,
        error: `User account is ${user.Status.toLowerCase()}`,
        code: 'USER_INACTIVE',
        data: null,
      };
    }

    // User valid
    return {
      valid: true,
      error: null,
      code: 'USER_VALID',
      data: {
        userId: user.User_ID,
        name: `${user.First_Name} ${user.Last_Name}`,
        organizationId: user.Organization_ID,
      },
    };
  } catch (error) {
    console.error('Error validating user:', error);
    return {
      valid: false,
      error: 'User validation failed',
      code: 'VALIDATION_ERROR',
      data: null,
    };
  }
}

/**
 * VALIDATION 2: Verify Device matches user's assigned device and is active
 * @param {string} userId - User ID
 * @param {string} deviceId - Device ID to verify
 * @returns {Promise<{valid: boolean, error: string|null, data: object|null}>}
 */
export async function validateDevice(userId, deviceId) {
  try {
    // Get user's assigned device
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('Device_ID')
      .eq('User_ID', userId)
      .single();

    if (userError) throw userError;

    // User has no device assigned
    if (!user.Device_ID) {
      return {
        valid: false,
        error: 'No device assigned to user',
        code: 'NO_DEVICE_ASSIGNED',
        data: null,
      };
    }

    // Device ID doesn't match assigned device
    if (deviceId && user.Device_ID !== deviceId) {
      return {
        valid: false,
        error: `Device mismatch. Expected ${user.Device_ID}, received ${deviceId}`,
        code: 'DEVICE_MISMATCH',
        data: null,
      };
    }

    // Get device details
    const { data: device, error: deviceError } = await supabase
      .from('Device')
      .select('Device_ID, Device_MAC, Device_Model, Device_Type, Status')
      .eq('Device_ID', user.Device_ID)
      .single();

    if (deviceError) throw deviceError;

    // Device not found (shouldn't happen, but double-check)
    if (!device) {
      return {
        valid: false,
        error: 'Assigned device not found',
        code: 'DEVICE_NOT_FOUND',
        data: null,
      };
    }

    // Device is not active
    if (device.Status !== 'Active') {
      return {
        valid: false,
        error: `Device is ${device.Status.toLowerCase()}`,
        code: 'DEVICE_INACTIVE',
        data: null,
      };
    }

    // Device valid
    return {
      valid: true,
      error: null,
      code: 'DEVICE_VALID',
      data: {
        deviceId: device.Device_ID,
        mac: device.Device_MAC,
        model: device.Device_Model,
        type: device.Device_Type,
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
 * VALIDATION 3: Verify user location is within organization's geofence
 * @param {string} organizationId - Organization ID
 * @param {number} latitude - User's current latitude
 * @param {number} longitude - User's current longitude
 * @param {string} geofenceId - Optional: specific geofence to check (if provided, only check this one)
 * @returns {Promise<{valid: boolean, error: string|null, data: object|null}>}
 */
export async function validateGeofence(organizationId, latitude, longitude, geofenceId = null) {
  try {
    // Validate coordinates
    if (!latitude || !longitude) {
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

    // Build geofence query
    let query = supabase
      .from('Geofence')
      .select('Geofence_ID, Geofence_Name, Latitude, Longitude, Radius_Meters')
      .eq('Organization_ID', organizationId);

    // If specific geofence provided, filter to that one
    if (geofenceId) {
      query = query.eq('Geofence_ID', geofenceId);
    }

    const { data: geofences, error } = await query;

    if (error) throw error;

    // No geofences configured for organization
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
        geofence.Latitude,
        geofence.Longitude
      );

      const distanceMeters = distanceKm * 1000;
      const radiusMeters = geofence.Radius_Meters;

      if (distanceMeters <= radiusMeters) {
        // Location is within this geofence
        return {
          valid: true,
          error: null,
          code: 'GEOFENCE_VALID',
          data: {
            geofenceId: geofence.Geofence_ID,
            geofenceName: geofence.Geofence_Name,
            distanceMeters: Math.round(distanceMeters),
            radiusMeters: radiusMeters,
            withinRadius: true,
          },
        };
      }
    }

    // Location not within any geofence
    const closestGeofence = geofences.reduce((prev, curr) => {
      const prevDist = calculateDistance(
        latitude,
        longitude,
        prev.Latitude,
        prev.Longitude
      );
      const currDist = calculateDistance(
        latitude,
        longitude,
        curr.Latitude,
        curr.Longitude
      );
      return currDist < prevDist ? curr : prev;
    });

    const closestDistance = calculateDistance(
      latitude,
      longitude,
      closestGeofence.Latitude,
      closestGeofence.Longitude
    );

    return {
      valid: false,
      error: `Location outside geofence. Closest: ${closestGeofence.Geofence_Name} (${Math.round(closestDistance * 1000)}m away)`,
      code: 'GEOFENCE_OUT_OF_RANGE',
      data: {
        userLocation: { latitude, longitude },
        closestGeofence: {
          name: closestGeofence.Geofence_Name,
          distance: Math.round(closestDistance * 1000),
        },
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
 * VALIDATION 4: Comprehensive attendance validation
 * Validates user, device, and geofence all at once
 * @param {string} userId - User ID
 * @param {string} organizationId - Organization ID
 * @param {string} deviceId - Device ID (optional - uses assigned device if not provided)
 * @param {number} latitude - User's current latitude
 * @param {number} longitude - User's current longitude
 * @param {string} geofenceId - Specific geofence (optional)
 * @returns {Promise<{valid: boolean, errors: array, warnings: array, data: object|null}>}
 */
export async function validateAttendance(userId, organizationId, deviceId, latitude, longitude, geofenceId = null) {
  try {
    const errors = [];
    const warnings = [];
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

    // Return comprehensive validation result
    return {
      valid: errors.length === 0,
      errors,
      warnings,
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
          message: 'Attendance validation failed',
        },
      ],
      warnings: [],
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
 * VALIDATION 5: Validate geofence exists (for test/verification)
 * @param {string} geofenceId - Geofence ID
 * @returns {Promise<{exists: boolean, data: object|null}>}
 */
export async function getGeofenceInfo(geofenceId) {
  try {
    const { data: geofence, error } = await supabase
      .from('Geofence')
      .select('Geofence_ID, Geofence_Name, Organization_ID, Latitude, Longitude, Radius_Meters, Description')
      .eq('Geofence_ID', geofenceId)
      .single();

    if (error || !geofence) {
      return {
        exists: false,
        data: null,
      };
    }

    return {
      exists: true,
      data: {
        geofenceId: geofence.Geofence_ID,
        name: geofence.Geofence_Name,
        organizationId: geofence.Organization_ID,
        latitude: geofence.Latitude,
        longitude: geofence.Longitude,
        radiusMeters: geofence.Radius_Meters,
        description: geofence.Description,
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
 * @param {string} organizationId - Organization ID
 * @returns {Promise<array>}
 */
export async function getOrganizationGeofences(organizationId) {
  try {
    const { data: geofences, error } = await supabase
      .from('Geofence')
      .select('Geofence_ID, Geofence_Name, Latitude, Longitude, Radius_Meters')
      .eq('Organization_ID', organizationId);

    if (error) throw error;

    return geofences || [];
  } catch (error) {
    console.error('Error fetching organization geofences:', error);
    return [];
  }
}

/**
 * Test validation with sample data (for debugging)
 * @param {object} testData - Test data object
 * @returns {Promise<object>} Validation result
 */
export async function validateWithTestData(testData) {
  const { userId, organizationId, deviceId, latitude, longitude, geofenceId } = testData;

  return await validateAttendance(userId, organizationId, deviceId, latitude, longitude, geofenceId);
}
