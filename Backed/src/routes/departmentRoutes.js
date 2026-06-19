import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/rbacMiddleware.js';

import {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentsController.js';

const router = express.Router();

router.use(verifyToken);

/**
 * GET /api/departments
 * Get all departments
 * Allowed Roles: All authenticated users
 * Super_Admin: all departments, Org_Admin: own organization, Manager: own department
 */
router.get('/', getDepartments);

/**
 * GET /api/departments/:id
 * Get specific department
 */
router.get('/:id', getDepartment);

/**
 * POST /api/departments
 * Create new department
 * Allowed Roles: Super_Admin, Org_Admin
 */
router.post('/', 
  authorizeRoles('Super_Admin', 'Org_Admin'),
  createDepartment
);

/**
 * PUT /api/departments/:id
 * Update department
 * Allowed Roles: Super_Admin, Org_Admin (own org)
 */
router.put('/:id',
  authorizeRoles('Super_Admin', 'Org_Admin'),
  updateDepartment
);

/**
 * DELETE /api/departments/:id
 * Delete department
 * Allowed Roles: Super_Admin only
 */
router.delete('/:id',
  authorizeRoles('Super_Admin'),
  deleteDepartment
);

export default router;
