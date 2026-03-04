import prisma from '../config/prisma.js';
import { errorResponse } from '../utils/response.js';
import { FEATURE_ACCESS, SUBSCRIPTION_STATUS } from '../constants/subscriptionPlans.js';

/**
 * Middleware to check if subscription is active and not expired
 */
export const checkSubscriptionActive = async (req, res, next) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      return errorResponse(res, 'Organization not found', 404);
    }

    const subscription = await prisma.organizationSubscription.findUnique({
      where: { orgId }
    });

    if (!subscription) {
      return errorResponse(res, 'No subscription found', 403);
    }

    // Check if subscription is expired
    const isExpired = new Date(subscription.endDate) < new Date();
    
    if (isExpired) {
      return errorResponse(res, 'Subscription has expired. Please renew your subscription.', 403);
    }

    if (subscription.status !== SUBSCRIPTION_STATUS.ACTIVE) {
      return errorResponse(res, `Subscription is ${subscription.status.toLowerCase()}`, 403);
    }

    // Attach subscription info to request
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * Middleware to check if organization can add more users
 */
export const checkUserLimit = async (req, res, next) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      return errorResponse(res, 'Organization not found', 404);
    }

    const subscription = await prisma.organizationSubscription.findUnique({
      where: { orgId },
      include: { plan: true }
    });

    if (!subscription) {
      return errorResponse(res, 'No subscription found', 403);
    }

    const userCount = await prisma.user.count({
      where: { orgId }
    });

    if (userCount >= subscription.plan.maxEmployees) {
      return errorResponse(
        res,
        `User limit reached. Your plan allows maximum ${subscription.plan.maxEmployees} users. Upgrade to add more.`,
        403
      );
    }

    // Attach remaining slots to request
    req.userSlotsRemaining = subscription.plan.maxEmployees - userCount;
    next();
  } catch (error) {
    console.error('User limit check error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * Factory function to create feature access middleware
 * Usage: router.get('/export', requireFeature('export'), controller);
 */
export const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const orgId = req.user?.orgId;

      if (!orgId) {
        return errorResponse(res, 'Organization not found', 404);
      }

      const subscription = await prisma.organizationSubscription.findUnique({
        where: { orgId },
        include: { plan: true }
      });

      if (!subscription) {
        return errorResponse(res, 'No subscription found', 403);
      }

      // Get feature access for this plan
      const featureAccess = FEATURE_ACCESS[subscription.plan.name.toUpperCase()];

      if (!featureAccess || !featureAccess[featureName]) {
        return errorResponse(
          res,
          `Feature "${featureName}" is not available in ${subscription.plan.name} plan. Upgrade your plan for access.`,
          403
        );
      }

      req.planFeatures = featureAccess;
      next();
    } catch (error) {
      console.error('Feature access check error:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  };
};

/**
 * Middleware to require specific plans
 * Usage: router.get('/analytics', requirePlan('Pro', 'Standard'), controller);
 */
export const requirePlan = (...allowedPlans) => {
  return async (req, res, next) => {
    try {
      const orgId = req.user?.orgId;

      if (!orgId) {
        return errorResponse(res, 'Organization not found', 404);
      }

      const subscription = await prisma.organizationSubscription.findUnique({
        where: { orgId },
        include: { plan: true }
      });

      if (!subscription) {
        return errorResponse(res, 'No subscription found', 403);
      }

      const planName = subscription.plan.name;

      if (!allowedPlans.includes(planName)) {
        return errorResponse(
          res,
          `This feature requires one of these plans: ${allowedPlans.join(', ')}. You have ${planName} plan.`,
          403
        );
      }

      req.userPlan = planName;
      next();
    } catch (error) {
      console.error('Plan requirement check error:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  };
};

export default {
  checkSubscriptionActive,
  checkUserLimit,
  requireFeature,
  requirePlan
};
