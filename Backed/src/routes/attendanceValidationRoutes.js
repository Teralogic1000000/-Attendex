// Backed/src/routes/attendanceValidationRoutes.js

import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/rbacMiddleware.js';
import {
  validateUser,
  validateDevice,
  validateGeofence,
  validateAttendance,
  getGeofenceInfo,
  getOrganizationGeofences,
} from '../services/attendanceValidationService.js';

const router = express.Router();

/**
 * All validation endpoints require authentication
 * Most require Manager role or higher (for testing/debugging)
 * Some endpoints accessible to all authenticated users
 */

/**
 * POST /validate/user
 * Validate a user exists and is active
 * Access: All authenticated users
 * Request body: { userId }
 */
router.post('/validate/user', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    const result = await validateUser(userId);

    return res.status(result.valid ? 200 : 400).json({
      success: result.valid,
      message: result.valid ? 'User is valid' : 'User validation failed',
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error validating user:', error);
    return res.status(500).json({
      success: false,
      message: 'User validation failed',
      error: error.message,
    });
  }
});

/**
 * POST /validate/device
 * Validate device matches user's assigned device and is active
 * Access: All authenticated users
 * Request body: { userId, deviceId }
 */
router.post('/validate/device', verifyToken, async (req, res) => {
  try {
    const { userId, deviceId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    const result = await validateDevice(userId, deviceId);

    return res.status(result.valid ? 200 : 400).json({
      success: result.valid,
      message: result.valid ? 'Device is valid' : 'Device validation failed',
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error validating device:', error);
    return res.status(500).json({
      success: false,
      message: 'Device validation failed',
      error: error.message,
    });
  }
});

/**
 * POST /validate/geofence
 * Validate user location is within organization's geofence
 * Access: All authenticated users
 * Request body: { organizationId, latitude, longitude, geofenceId? }
 */
router.post('/validate/geofence', verifyToken, async (req, res) => {
  try {
    const { organizationId, latitude, longitude, geofenceId } = req.body;

    if (!organizationId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'organizationId, latitude, and longitude are required',
      });
    }

    const result = await validateGeofence(organizationId, latitude, longitude, geofenceId);

    return res.status(result.valid ? 200 : 400).json({
      success: result.valid,
      message: result.valid ? 'Location is within geofence' : 'Location validation failed',
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error validating geofence:', error);
    return res.status(500).json({
      success: false,
      message: 'Geofence validation failed',
      error: error.message,
    });
  }
});

/**
 * POST /validate/attendance
 * Comprehensive attendance validation (user + device + geofence)
 * Access: All authenticated users
 * Request body: { userId, organizationId, deviceId?, latitude, longitude, geofenceId? }
 */
router.post('/validate/attendance', verifyToken, async (req, res) => {
  try {
    const { userId, organizationId, deviceId, latitude, longitude, geofenceId } = req.body;

    if (!userId || !organizationId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'userId, organizationId, latitude, and longitude are required',
      });
    }

    const result = await validateAttendance(userId, organizationId, deviceId, latitude, longitude, geofenceId);

    return res.status(result.valid ? 200 : 400).json({
      success: result.valid,
      message: result.valid
        ? 'All validations passed - attendance can be recorded'
        : 'Attendance validation failed',
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error validating attendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Attendance validation failed',
      error: error.message,
    });
  }
});

/**
 * GET /geofences/:geofenceId
 * Get geofence information (for testing/debugging)
 * Access: All authenticated users
 */
router.get('/geofences/:geofenceId', verifyToken, async (req, res) => {
  try {
    const { geofenceId } = req.params;

    const result = await getGeofenceInfo(geofenceId);

    if (!result.exists) {
      return res.status(404).json({
        success: false,
        message: 'Geofence not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Geofence information retrieved',
      data: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching geofence info:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch geofence info',
      error: error.message,
    });
  }
});

/**
 * GET /organizations/:organizationId/geofences
 * Get all geofences for an organization
 * Access: All authenticated users
 */
router.get(
  '/organizations/:organizationId/geofences',
  verifyToken,
  async (req, res) => {
    try {
      const { organizationId } = req.params;

      const geofences = await getOrganizationGeofences(organizationId);

      return res.status(200).json({
        success: true,
        message: `Retrieved ${geofences.length} geofences for organization`,
        data: geofences,
        count: geofences.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching organization geofences:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch geofences',
        error: error.message,
      });
    }
  }
);

/**
 * POST /validate/batch
 * Validate multiple items in one request (for testing)
 * Access: Manager role or higher
 * Request body: { validations: [ { type: 'user'|'device'|'geofence'|'attendance', data: {...} } ] }
 */
router.post(
  '/validate/batch',
  verifyToken,
  authorizeRoles('Manager', 'Org_Admin', 'Super_Admin'),
  async (req, res) => {
    try {
      const { validations } = req.body;

      if (!Array.isArray(validations)) {
        return res.status(400).json({
          success: false,
          message: 'validations must be an array',
        });
      }

      const results = [];

      for (const validation of validations) {
        const { type, data } = validation;

        try {
          let result;

          switch (type) {
            case 'user':
              result = await validateUser(data.userId);
              break;
            case 'device':
              result = await validateDevice(data.userId, data.deviceId);
              break;
            case 'geofence':
              result = await validateGeofence(
                data.organizationId,
                data.latitude,
                data.longitude,
                data.geofenceId
              );
              break;
            case 'attendance':
              result = await validateAttendance(
                data.userId,
                data.organizationId,
                data.deviceId,
                data.latitude,
                data.longitude,
                data.geofenceId
              );
              break;
            default:
              result = {
                valid: false,
                error: `Unknown validation type: ${type}`,
              };
          }

          results.push({
            type,
            ...result,
          });
        } catch (error) {
          results.push({
            type,
            valid: false,
            error: error.message,
          });
        }
      }

      const allValid = results.every(r => r.valid);

      return res.status(allValid ? 200 : 400).json({
        success: allValid,
        message: allValid ? 'All validations passed' : 'Some validations failed',
        results,
        summary: {
          total: results.length,
          passed: results.filter(r => r.valid).length,
          failed: results.filter(r => !r.valid).length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in batch validation:', error);
      return res.status(500).json({
        success: false,
        message: 'Batch validation failed',
        error: error.message,
      });
    }
  }
);

export default router;
