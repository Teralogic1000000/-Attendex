/**
 * SuperAdmin Routes
 * Protected routes for system administration
 */

import express from 'express'
import verifyToken from '../Middleware/authMiddleware.js'
import superAdminMiddleware from '../Middleware/superAdminMiddleware.js'

import {
  getAllOrganizations,
  getOrganizationDetail,
  createOrganization,
  updateOrganization,
  suspendOrganization,
  reactivateOrganization,
  deleteOrganization
} from '../controllers/superadminOrgController.js'

import {
  getAllUsers,
  getUserDetail,
  disableUser,
  enableUser,
  resetUserPassword,
  createUserInOrg
} from '../controllers/superadminUserController.js'

import {
  getSystemOverview,
  getSystemAnalytics,
  getSystemHealth,
  getAuditLogs,
  getSystemSettings,
  updateSystemSettings,
  getBillingOverview
} from '../controllers/superadminSystemController.js'

const router = express.Router()

// Apply authentication and SuperAdmin check to all routes
router.use(verifyToken)
router.use(superAdminMiddleware)

// ===== ORGANIZATION ROUTES =====
router.get('/organizations', getAllOrganizations)
router.get('/organizations/:id', getOrganizationDetail)
router.post('/organizations', createOrganization)
router.put('/organizations/:id', updateOrganization)
router.post('/organizations/:id/suspend', suspendOrganization)
router.post('/organizations/:id/reactivate', reactivateOrganization)
router.delete('/organizations/:id', deleteOrganization)

// ===== USER ROUTES =====
router.get('/users', getAllUsers)
router.get('/users/:id', getUserDetail)
router.post('/users/:id/disable', disableUser)
router.post('/users/:id/enable', enableUser)
router.post('/users/:id/reset-password', resetUserPassword)
router.post('/organizations/:orgId/users', createUserInOrg)

// ===== SYSTEM & ANALYTICS ROUTES =====
router.get('/system/overview', getSystemOverview)
router.get('/system/analytics', getSystemAnalytics)
router.get('/system/health', getSystemHealth)
router.get('/system/audit-logs', getAuditLogs)
router.get('/system/settings', getSystemSettings)
router.put('/system/settings', updateSystemSettings)

// ===== BILLING ROUTES =====
router.get('/billing/overview', getBillingOverview)

export default router
