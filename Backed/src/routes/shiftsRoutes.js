import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/rbacMiddleware.js';

import {
  createShift,
  getShifts,
  getShift,
  updateShift,
  deleteShift,
  assignUserToShift,
  removeUserFromShift
} from '../controllers/shiftsController.js';

const router = express.Router();

router.use(verifyToken);

/**
 * GET /api/shifts
 * Get all shifts
 * Allowed Roles: All authenticated users
 * Super_Admin: all, Org_Admin: own organization
 */
router.get('/', getShifts);

/**
 * GET /api/shifts/:id
 * Get specific shift
 */
router.get('/:id', getShift);

/**
 * POST /api/shifts
 * Create new shift
 * Allowed Roles: Super_Admin, Org_Admin
 */
router.post('/',
  authorizeRoles('Super_Admin', 'Org_Admin'),
  createShift
);

/**
 * PUT /api/shifts/:id
 * Update shift
 * Allowed Roles: Super_Admin, Org_Admin (own org)
 */
router.put('/:id',
  authorizeRoles('Super_Admin', 'Org_Admin'),
  updateShift
);

/**
 * DELETE /api/shifts/:id
 * Delete shift
 * Allowed Roles: Super_Admin only
 */
router.delete('/:id',
  authorizeRoles('Super_Admin'),
  deleteShift
);

/**
 * POST /api/shifts/:shiftId/employees/:userId
 * Assign user to shift
 * Allowed Roles: Super_Admin, Org_Admin
 */
router.post('/:shiftId/employees/:userId',
  authorizeRoles('Super_Admin', 'Org_Admin'),
  assignUserToShift
);

/**
 * DELETE /api/shifts/:shiftId/employees/:userId
 * Remove user from shift
 * Allowed Roles: Super_Admin, Org_Admin
 */
router.delete('/:shiftId/employees/:userId',
  authorizeRoles('Super_Admin', 'Org_Admin'),
  removeUserFromShift
);

export default router;
