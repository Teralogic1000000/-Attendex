import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/rbacMiddleware.js';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePassword,
  getUserStats
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

/**
 * POST /api/users
 * Create new user in organization
 * Allowed Roles: Super_Admin, Org_Admin
 * Body: { firstName, lastName, email, password, roleId? }
 */
router.post('/', authorizeRoles('Super_Admin', 'Org_Admin'), createUser);

/**
 * GET /api/users
 * Get all users in organization with pagination
 * Allowed Roles: Super_Admin (all users), Org_Admin (org users), Manager (dept users)
 * Query: page?, limit?
 */
router.get('/', getUsers);

/**
 * GET /api/users/:id
 * Get specific user by ID
 * Allowed Roles: Super_Admin, Org_Admin, and User (viewing self)
 */
router.get('/:id', getUserById);

/**
 * PUT /api/users/:id
 * Update user information
 * Allowed Roles: Super_Admin, Org_Admin (org users), User (own profile)
 * Body: { firstName?, lastName?, roleId? }
 */
router.put('/:id', authorizeRoles('Super_Admin', 'Org_Admin'), updateUser);

/**
 * DELETE /api/users/:id
 * Delete user from organization
 * Allowed Roles: Super_Admin only
 */
router.delete('/:id', authorizeRoles('Super_Admin'), deleteUser);

/**
 * PUT /api/users/:id/password
 * Update user password
 * Allowed Roles: All (self), Super_Admin, Org_Admin (org users)
 * Body: { currentPassword, newPassword }
 */
router.put('/:id/password', updatePassword);

/**
 * GET /api/users/:id/stats
 * Get user statistics (attendance, activity, etc.)
 * Allowed Roles: Super_Admin, Org_Admin, Manager
 */
router.get('/:id/stats', authorizeRoles('Super_Admin', 'Org_Admin', 'Manager'), getUserStats);

export default router;