import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import authorizeRoles from '../Middleware/roleMiddleware.js';
import {
  registerDevice,
  getUserDevices,
  getDeviceById,
  trustDevice,
  untrustDevice,
  deleteDevice,
  getOrganizationDevices,
  updateDeviceLastUsed,
  getDevicesByIP
} from '../controllers/deviceController.js';

const router = express.Router();

router.use(verifyToken);

/**
 * POST /api/devices/register
 * Register a device on login
 * Body: { deviceId, deviceType, deviceModel?, osVersion?, appVersion? }
 * Called right after successful login with device information
 */
router.post('/register', registerDevice);

/**
 * GET /api/devices/my-devices
 * Get all devices for the authenticated user
 * Query: page=1, limit=10
 */
router.get('/my-devices', getUserDevices);

/**
 * GET /api/devices/org/all
 * Get all devices in organization (Admin only)
 * Query: page=1, limit=10, trusted=true|false
 */
router.get('/org/all', authorizeRoles('Org_Admin', 'Super_Admin'), getOrganizationDevices);

/**
 * GET /api/devices/search/ip
 * Get devices by IP address
 * Query: ipAddress
 */
router.get('/search/ip', getDevicesByIP);

/**
 * GET /api/devices/:id
 * Get device by ID
 */
router.get('/:id', getDeviceById);

/**
 * PUT /api/devices/:id/trust
 * Mark device as trusted
 */
router.put('/:id/trust', trustDevice);

/**
 * PUT /api/devices/:id/untrust
 * Mark device as untrusted
 */
router.put('/:id/untrust', untrustDevice);

/**
 * PUT /api/devices/:id/last-used
 * Update device last used timestamp
 * Called automatically on check-in/check-out
 */
router.put('/:id/last-used', updateDeviceLastUsed);

/**
 * DELETE /api/devices/:id
 * Delete device
 */
router.delete('/:id', deleteDevice);

export default router;
