import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import authorizeRoles from '../Middleware/roleMiddleware.js';
import {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  updateDeviceLastUsed,
  deleteDevice,
  getDevicesByIP
} from '../controllers/deviceController.js';

const router = express.Router();

router.use(verifyToken);

/**
 * GET /api/devices
 * Get all devices in organization
 * SuperAdmin can see all devices across all organizations
 */
router.get('/', authorizeRoles('Super_Admin', 'Org_Admin'), getDevices);

/**
 * GET /api/devices/:id
 * Get device by ID
 */
router.get('/:id', getDeviceById);

/**
 * GET /api/devices/search/ip
 * Get devices by IP address
 * Query: ipAddress
 */
router.get('/search/ip', getDevicesByIP);

/**
 * POST /api/devices
 * Create new device
 * Body: { deviceName, deviceModel?, osType?, osVersion?, ipAddress }
 */
router.post('/', authorizeRoles('Org_Admin', 'Super_Admin'), createDevice);

/**
 * PUT /api/devices/:id
 * Update device information
 * Body: { deviceName?, deviceModel?, osType?, osVersion?, ipAddress? }
 */
router.put('/:id', authorizeRoles('Org_Admin', 'Super_Admin'), updateDevice);

/**
 * PUT /api/devices/:id/last-used
 * Update device last used timestamp
 * Called automatically on check-in/check-out
 */
router.put('/:id/last-used', updateDeviceLastUsed);

/**
 * DELETE /api/devices/:id
 * Delete device (must not be assigned to any user)
 */
router.delete('/:id', authorizeRoles('Org_Admin', 'Super_Admin'), deleteDevice);

export default router;
