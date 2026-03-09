/**
 * SuperAdmin Authorization Middleware
 * Verifies user is SuperAdmin role
 */

import { errorResponse } from '../utils/response.js'

const superAdminMiddleware = (req, res, next) => {
  try {
    // User must be authenticated first (via authMiddleware)
    if (!req.user) {
      return errorResponse(res, 'Unauthorized: No user context', 401)
    }

    // Check if user has SuperAdmin role
    if (req.user.role?.name !== 'Super_Admin') {
      return errorResponse(res, 'Forbidden: SuperAdmin access required', 403)
    }

    // User is a valid SuperAdmin
    next()
  } catch (error) {
    errorResponse(res, 'Authorization error', 500)
  }
}

export default superAdminMiddleware
