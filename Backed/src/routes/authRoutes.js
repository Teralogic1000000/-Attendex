import express from 'express';
import { register, login, refresh, logout } from '../controllers/authController.js';
import verifyToken from '../Middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register new organization and user
 * Body: { firstName, lastName, email, password, orgName }
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login with email and password
 * Body: { email, password }
 */
router.post('/login', login);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * Body: { refreshToken }
 */
router.post('/refresh', refresh);

/**
 * POST /api/auth/logout
 * Logout user (requires authentication)
 */
router.post('/logout', verifyToken, logout);

export default router;