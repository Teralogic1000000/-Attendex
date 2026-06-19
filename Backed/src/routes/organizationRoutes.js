import express from 'express'
import verifyToken from '../Middleware/authMiddleware.js'
import { authorizeRoles } from '../Middleware/rbacMiddleware.js'

import {
  getOrganizationInfo,
  updateOrganizationSettings,
} from '../controllers/organizationController.js'

const router = express.Router()

// all routes require valid login
router.use(verifyToken)

/**
 * GET /api/organization
 * Get current organization info (read-only)
 * Allowed Roles: All authenticated users (own org)
 */
router.get('/', getOrganizationInfo)

/**
 * PUT /api/organization
 * Update organization settings
 * Allowed Roles: Super_Admin, Org_Admin (own org only)
 */
router.put('/', authorizeRoles('Super_Admin', 'Org_Admin'), updateOrganizationSettings)

export default router
