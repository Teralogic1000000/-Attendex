import express from 'express';
import {
  getSubscription,
  getAllPlans,
  upgradePlan,
  canAddUsers,
  checkFeatureAccess,
  getUsageAnalytics
} from '../controllers/subscriptionController.js';
import verifyToken from '../Middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

/**
 * GET /api/subscriptions/current
 * Get current subscription for authenticated user's organization
 */
router.get('/current', getSubscription);

/**
 * GET /api/subscriptions/plans
 * Get all available subscription plans
 */
router.get('/plans', getAllPlans);

/**
 * POST /api/subscriptions/upgrade
 * Upgrade organization subscription plan
 * Body: { planId: string }
 */
router.post('/upgrade', upgradePlan);

/**
 * GET /api/subscriptions/can-add-users
 * Check if organization can add more users
 * Query: count (optional, default: 1)
 */
router.get('/can-add-users', canAddUsers);

/**
 * GET /api/subscriptions/feature-access
 * Check if organization has access to a specific feature
 * Query: feature (required - analytics, export, customRoles, apiAccess, prioritySupport)
 */
router.get('/feature-access', checkFeatureAccess);

/**
 * GET /api/subscriptions/analytics
 * Get subscription usage analytics
 */
router.get('/analytics', getUsageAnalytics);

export default router;