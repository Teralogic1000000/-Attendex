import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import authorizeRoles from '../Middleware/roleMiddleware.js';
import {
  createGeofence,
  getGeofences,
  getGeofenceById,
  updateGeofence,
  deleteGeofence,
  checkLocationInGeofence,
  isPointInGeofence
} from '../controllers/geofenceController.js';

const router = express.Router();

router.use(verifyToken);

/**
 * GET /api/geofence
 * Get all geofences for organization
 */
router.get('/', getGeofences);

/**
 * GET /api/geofence/:id
 * Get specific geofence by ID
 */
router.get('/:id', getGeofenceById);

/**
 * GET /api/geofence/check/location
 * Check if user location is within any geofence
 * Query: latitude, longitude
 */
router.get('/check/location', checkLocationInGeofence);

/**
 * GET /api/geofence/check/point
 * Check if a specific point is within a geofence
 * Query: geofenceId, latitude, longitude
 */
router.get('/check/point', isPointInGeofence);

/**
 * POST /api/geofence
 * Create new geofence
 * Body: { name?, latitude, longitude, radius }
 * latitude, longitude: decimal coordinates
 * radius: radius in meters
 */
router.post('/', authorizeRoles('Org_Admin', 'Super_Admin'), createGeofence);

/**
 * PUT /api/geofence/:id
 * Update geofence
 * Body: { name?, latitude?, longitude?, radius? }
 */
router.put('/:id', authorizeRoles('Org_Admin', 'Super_Admin'), updateGeofence);

/**
 * DELETE /api/geofence/:id
 * Delete geofence
 */
router.delete('/:id', authorizeRoles('Org_Admin', 'Super_Admin'), deleteGeofence);

export default router;
