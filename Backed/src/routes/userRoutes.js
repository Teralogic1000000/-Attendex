import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import authorizeRoles from '../Middleware/roleMiddleware.js';
import { checkSubscriptionActive, checkUserLimit } from '../Middleware/planMiddleware.js';
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

// All routes require authentication and active subscription
router.use(verifyToken);
router.use(checkSubscriptionActive);

/**
 * POST /api/users
 * Create new user in organization
 * Body: { firstName, lastName, email, password, roleId? }
 */
router.post('/', authorizeRoles('OrgAdmin'), checkUserLimit, createUser);

/**
 * GET /api/users
 * Get all users in organization with pagination
 * Query: page?, limit?
 */
router.get('/', getUsers);

/**
 * GET /api/users/:id
 * Get specific user by ID
 */
router.get('/:id', getUserById);

/**
 * PUT /api/users/:id
 * Update user information
 * Body: { firstName?, lastName?, roleId? }
 */
router.put('/:id', authorizeRoles('OrgAdmin'), updateUser);

/**
 * DELETE /api/users/:id
 * Delete user from organization
 */
router.delete('/:id', authorizeRoles('OrgAdmin'), deleteUser);

/**
 * PUT /api/users/:id/password
 * Update user password
 * Body: { currentPassword, newPassword }
 */
router.put('/:id/password', updatePassword);

/**
 * GET /api/users/stats/overview
 * Get user statistics for organization
 */
router.get('/stats/overview', authorizeRoles('OrgAdmin'), getUserStats);

export default router;