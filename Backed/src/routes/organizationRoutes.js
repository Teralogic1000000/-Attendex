import express from 'express'
import verifyToken from '../Middleware/authMiddleware.js'
import authorizeRoles from '../Middleware/roleMiddleware.js'

import {
  getOrganizationInfo,
  updateOrganizationSettings,
} from '../controllers/organizationController.js'

const router = express.Router()

// all routes require valid login
router.use(verifyToken)

// GET /api/organization - fetch current org
router.get('/', getOrganizationInfo)

// PUT /api/organization - update settings (org admin or higher)
router.put('/', authorizeRoles('OrgAdmin'), updateOrganizationSettings)

export default router
