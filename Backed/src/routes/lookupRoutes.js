import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import authorizeRoles from '../Middleware/roleMiddleware.js';
import {
  getAttendanceStatuses,
  getAttendanceStatusById,
  createAttendanceStatus,
  updateAttendanceStatus,
  deleteAttendanceStatus,
  getAttendanceMethods,
  getAttendanceMethodById,
  getUserTypes,
  getUserTypeById,
  getOrgTypes,
  getOrgTypeById,
  getRegions,
  getRegionById
} from '../controllers/lookupController.js';

const router = express.Router();

router.use(verifyToken);

// ============================================================================
// ATTENDANCE STATUS ROUTES
// ============================================================================

/**
 * GET /api/lookups/attendance-status
 * Get all attendance statuses (read-only lookup data)
 */
router.get('/attendance-status', getAttendanceStatuses);

/**
 * GET /api/lookups/attendance-status/:id
 * Get specific attendance status
 */
router.get('/attendance-status/:id', getAttendanceStatusById);

/**
 * POST /api/lookups/attendance-status
 * Create new attendance status (SuperAdmin only)
 */
router.post('/attendance-status', authorizeRoles('Super_Admin'), createAttendanceStatus);

/**
 * PUT /api/lookups/attendance-status/:id
 * Update attendance status (SuperAdmin only)
 */
router.put('/attendance-status/:id', authorizeRoles('Super_Admin'), updateAttendanceStatus);

/**
 * DELETE /api/lookups/attendance-status/:id
 * Delete attendance status (SuperAdmin only)
 */
router.delete('/attendance-status/:id', authorizeRoles('Super_Admin'), deleteAttendanceStatus);

// ============================================================================
// ATTENDANCE METHOD ROUTES
// ============================================================================

/**
 * GET /api/lookups/attendance-method
 * Get all attendance methods
 */
router.get('/attendance-method', getAttendanceMethods);

/**
 * GET /api/lookups/attendance-method/:id
 * Get specific attendance method
 */
router.get('/attendance-method/:id', getAttendanceMethodById);

// ============================================================================
// USER TYPE ROUTES
// ============================================================================

/**
 * GET /api/lookups/user-type
 * Get all user types
 */
router.get('/user-type', getUserTypes);

/**
 * GET /api/lookups/user-type/:id
 * Get specific user type
 */
router.get('/user-type/:id', getUserTypeById);

// ============================================================================
// ORGANIZATION TYPE ROUTES
// ============================================================================

/**
 * GET /api/lookups/org-type
 * Get all organization types
 */
router.get('/org-type', getOrgTypes);

/**
 * GET /api/lookups/org-type/:id
 * Get specific organization type
 */
router.get('/org-type/:id', getOrgTypeById);

// ============================================================================
// REGION ROUTES
// ============================================================================

/**
 * GET /api/lookups/region
 * Get all regions
 */
router.get('/region', getRegions);

/**
 * GET /api/lookups/region/:id
 * Get specific region
 */
router.get('/region/:id', getRegionById);

export default router;
