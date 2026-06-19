/**
 * Enhanced Role-Based Access Control (RBAC) Middleware
 * Supports granular permission checking
 * 
 * Updated: March 6, 2026
 */

import { hasPermission, checkHierarchyLevel, USER_ROLES } from '../config/permissions.js';

/**
 * Enhanced authorization middleware with granular permission checking
 * Usage: authorizeRoles('Super_Admin', 'Org_Admin')
 * 
 * @param {...string} allowedRoles - Allowed roles
 * @returns {function} Middleware function
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = getUserRole(req);

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "User role not found",
        error: 'UNAUTHORIZED'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`,
        error: 'FORBIDDEN',
        requiredRoles: allowedRoles,
        userRole: userRole
      });
    }

    next();
  };
}

/**
 * Permission-based middleware with granular checking
 * Usage: checkPermission('users', 'create')
 * 
 * @param {string} resource - Resource name (e.g., 'users', 'attendance')
 * @param {string} action - Action name (e.g., 'create', 'read')
 * @returns {function} Middleware function
 */
export function checkPermission(resource, action) {
  return (req, res, next) => {
    const userRole = getUserRole(req);

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "User role not found",
        error: 'UNAUTHORIZED'
      });
    }

    if (!hasPermission(userRole, resource, action)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Your role (${userRole}) does not have permission to ${action} ${resource}`,
        error: 'FORBIDDEN_PERMISSION',
        resource,
        action,
        userRole
      });
    }

    next();
  };
}

/**
 * Hierarchy-based middleware - allows roles at or above specified level
 * Usage: checkHierarchy(ROLE_HIERARCHY[USER_ROLES.ORG_ADMIN])
 * 
 * @param {number} minimumLevel - Minimum hierarchy level required
 * @returns {function} Middleware function
 */
export function checkHierarchy(minimumLevel) {
  return (req, res, next) => {
    const userRole = getUserRole(req);

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "User role not found",
        error: 'UNAUTHORIZED'
      });
    }

    if (!checkHierarchyLevel(userRole, minimumLevel)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Your role (${userRole}) does not meet the minimum hierarchy level required`,
        error: 'INSUFFICIENT_HIERARCHY',
        userRole,
        minimumLevel
      });
    }

    next();
  };
}

/**
 * Multi-permission middleware - allows if user has ANY of the permissions
 * Usage: checkMultiPermission([
 *   { resource: 'users', action: 'create' },
 *   { resource: 'users', action: 'update' }
 * ])
 * 
 * @param {array} permissions - Array of {resource, action} objects
 * @returns {function} Middleware function
 */
export function checkMultiPermission(permissions) {
  return (req, res, next) => {
    const userRole = getUserRole(req);

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "User role not found",
        error: 'UNAUTHORIZED'
      });
    }

    const hasAnyPermission = permissions.some(perm =>
      hasPermission(userRole, perm.resource, perm.action)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Your role (${userRole}) does not have any of the required permissions`,
        error: 'FORBIDDEN_PERMISSION',
        requiredPermissions: permissions,
        userRole
      });
    }

    next();
  };
}

/**
 * Helper: Get user role from request (supports multiple formats)
 * 
 * @param {object} req - Express request object
 * @returns {string|null} User role or null
 */
export function getUserRole(req) {
  return (
    req.user?.user_type_name ||  // New system: from view
    req.user?.role?.name ||       // Old system: from role object
    req.user?.role ||             // Old system: role string
    req.user?.userType ||         // Alternative naming
    null
  );
}

/**
 * Helper: Get user organization ID (for org-scoped queries)
 * 
 * @param {object} req - Express request object
 * @returns {string|null} Organization ID or null
 */
export function getUserOrgId(req) {
  return req.user?.orgId || req.user?.org_id || req.user?.organizationId || null;
}

/**
 * Helper: Get user ID
 * 
 * @param {object} req - Express request object
 * @returns {string|null} User ID or null
 */
export function getUserId(req) {
  return req.user?.id || req.user?.userId || req.user?.user_id || null;
}

/**
 * Middleware to add role helpers to request object
 * Usage: app.use(attachRoleHelpers)
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware
 */
export function attachRoleHelpers(req, res, next) {
  req.userRole = getUserRole(req);
  req.userOrgId = getUserOrgId(req);
  req.userId = getUserId(req);
  req.isSuperAdmin = req.userRole === USER_ROLES.SUPER_ADMIN;
  req.isOrgAdmin = req.userRole === USER_ROLES.ORG_ADMIN;
  req.isManager = req.userRole === USER_ROLES.MANAGER;
  req.isEmployee = req.userRole === USER_ROLES.EMPLOYEE;
  next();
}

/**
 * Export middleware for backward compatibility
 */
export default authorizeRoles;
