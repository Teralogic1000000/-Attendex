/**
 * Geofence Validation Service
 * Handles geofence distance calculations and validation for attendance
 */

import prisma from '../config/prisma.js';

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 * 
 * @param {number} lat1 - User's latitude
 * @param {number} lon1 - User's longitude
 * @param {number} lat2 - Geofence center latitude
 * @param {number} lon2 - Geofence center longitude
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters

  const π = Math.PI;
  const φ1 = (lat1 * π) / 180;
  const φ2 = (lat2 * π) / 180;
  const Δφ = ((lat2 - lat1) * π) / 180;
  const Δλ = ((lon2 - lon1) * π) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance); // Return distance in meters, rounded
};

/**
 * Check if user's location is within organization's geofence
 * 
 * @param {string} organizationId - Organization ID
 * @param {number} userLatitude - User's current latitude
 * @param {number} userLongitude - User's current longitude
 * @returns {Promise<object>} { isWithinGeofence, distance, geofenceConfig }
 */
export const checkGeofence = async (organizationId, userLatitude, userLongitude) => {
  try {
    // Validate coordinates
    if (typeof userLatitude !== 'number' || typeof userLongitude !== 'number') {
      return {
        isWithinGeofence: false,
        error: 'Invalid coordinates provided',
        distance: null,
        geofenceConfig: null
      };
    }

    // Validate coordinate ranges
    if (
      userLatitude < -90 ||
      userLatitude > 90 ||
      userLongitude < -180 ||
      userLongitude > 180
    ) {
      return {
        isWithinGeofence: false,
        error: 'Coordinates out of valid range',
        distance: null,
        geofenceConfig: null
      };
    }

    // Fetch organization with geofence settings
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        geofenceLatitude: true,
        geofenceLongitude: true,
        geofenceRadius: true
      }
    });

    if (!organization) {
      return {
        isWithinGeofence: false,
        error: 'Organization not found',
        distance: null,
        geofenceConfig: null
      };
    }

    // Check if geofence is configured
    if (
      !organization.geofenceLatitude ||
      !organization.geofenceLongitude ||
      !organization.geofenceRadius
    ) {
      return {
        isWithinGeofence: true, // If geofence not configured, allow check-in
        message: 'No geofence configured for organization',
        distance: null,
        geofenceConfig: null,
        isConfigured: false
      };
    }

    // Calculate distance
    const distance = calculateDistance(
      userLatitude,
      userLongitude,
      organization.geofenceLatitude,
      organization.geofenceLongitude
    );

    const isWithinGeofence = distance <= organization.geofenceRadius;

    return {
      isWithinGeofence,
      distance,
      geofenceConfig: {
        centerLatitude: organization.geofenceLatitude,
        centerLongitude: organization.geofenceLongitude,
        radius: organization.geofenceRadius,
        organizationName: organization.name
      },
      isConfigured: true
    };
  } catch (error) {
    console.error('Geofence validation error:', error);
    return {
      isWithinGeofence: false,
      error: `Geofence validation failed: ${error.message}`,
      distance: null,
      geofenceConfig: null
    };
  }
};

/**
 * Validate attendance check-in based on geofence
 * Used in attendance controller
 * 
 * @param {string} organizationId - Organization ID
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {string} method - Attendance method (e.g., 'Geofence')
 * @returns {Promise<object>} { isValid, message, distance, details }
 */
export const validateCheckInGeofence = async (
  organizationId,
  latitude,
  longitude,
  method = 'Geofence'
) => {
  try {
    const geofenceResult = await checkGeofence(organizationId, latitude, longitude);

    if (geofenceResult.error) {
      return {
        isValid: false,
        message: geofenceResult.error,
        distance: geofenceResult.distance,
        details: geofenceResult
      };
    }

    if (!geofenceResult.isConfigured) {
      return {
        isValid: true,
        message: 'No geofence configured - check-in allowed',
        distance: null,
        details: geofenceResult
      };
    }

    if (geofenceResult.isWithinGeofence) {
      return {
        isValid: true,
        message: `Check-in successful. Location verified within ${geofenceResult.geofenceConfig.radius}m radius.`,
        distance: geofenceResult.distance,
        details: geofenceResult
      };
    } else {
      const outsideBy = geofenceResult.distance - geofenceResult.geofenceConfig.radius;
      return {
        isValid: false,
        message: `You are ${outsideBy}m outside the permitted geofence area.`,
        distance: geofenceResult.distance,
        details: geofenceResult
      };
    }
  } catch (error) {
    console.error('Check-in geofence validation error:', error);
    return {
      isValid: false,
      message: `Geofence validation error: ${error.message}`,
      distance: null,
      details: { error: error.message }
    };
  }
};

/**
 * Configure geofence for an organization
 * 
 * @param {string} organizationId - Organization ID
 * @param {number} latitude - Geofence center latitude
 * @param {number} longitude - Geofence center longitude
 * @param {number} radius - Geofence radius in meters (minimum 100m, maximum 5000m)
 * @returns {Promise<object>} Updated organization with geofence
 */
export const configureGeofence = async (organizationId, latitude, longitude, radius) => {
  try {
    // Validate coordinates
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      typeof radius !== 'number'
    ) {
      throw new Error('Latitude, longitude, and radius must be numbers');
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error('Invalid coordinate values');
    }

    // Validate radius (100m to 5000m)
    if (radius < 100 || radius > 5000) {
      throw new Error('Geofence radius must be between 100m and 5000m');
    }

    // Update organization
    const updatedOrg = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        geofenceLatitude: latitude,
        geofenceLongitude: longitude,
        geofenceRadius: radius
      },
      select: {
        id: true,
        name: true,
        geofenceLatitude: true,
        geofenceLongitude: true,
        geofenceRadius: true,
        updatedAt: true
      }
    });

    return {
      success: true,
      message: 'Geofence configured successfully',
      data: updatedOrg
    };
  } catch (error) {
    console.error('Geofence configuration error:', error);
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};

/**
 * Get geofence configuration for organization
 * 
 * @param {string} organizationId - Organization ID
 * @returns {Promise<object>} Geofence configuration or null if not configured
 */
export const getGeofenceConfig = async (organizationId) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        geofenceLatitude: true,
        geofenceLongitude: true,
        geofenceRadius: true
      }
    });

    if (!org) {
      return null;
    }

    // Check if geofence is configured
    if (!org.geofenceLatitude || !org.geofenceLongitude || !org.geofenceRadius) {
      return {
        organizationId: org.id,
        organizationName: org.name,
        isConfigured: false,
        message: 'Geofence not configured'
      };
    }

    return {
      organizationId: org.id,
      organizationName: org.name,
      isConfigured: true,
      centerLatitude: org.geofenceLatitude,
      centerLongitude: org.geofenceLongitude,
      radius: org.geofenceRadius
    };
  } catch (error) {
    console.error('Error fetching geofence config:', error);
    throw error;
  }
};

/**
 * Remove geofence configuration
 * 
 * @param {string} organizationId - Organization ID
 * @returns {Promise<boolean>} Success status
 */
export const removeGeofence = async (organizationId) => {
  try {
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        geofenceLatitude: null,
        geofenceLongitude: null,
        geofenceRadius: null
      }
    });

    return true;
  } catch (error) {
    console.error('Error removing geofence:', error);
    throw error;
  }
};

export default {
  calculateDistance,
  checkGeofence,
  validateCheckInGeofence,
  configureGeofence,
  getGeofenceConfig,
  removeGeofence
};
