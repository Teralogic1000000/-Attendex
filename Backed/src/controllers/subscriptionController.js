import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { SUBSCRIPTION_STATUS, FEATURE_ACCESS } from '../constants/subscriptionPlans.js';

/**
 * Get current subscription for organization
 */
export const getSubscription = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;

  if (!orgId) {
    return errorResponse(res, 'Organization not found', 404);
  }

  const subscription = await prisma.organizationSubscription.findUnique({
    where: { orgId },
    include: { plan: true, organization: true }
  });

  if (!subscription) {
    return errorResponse(res, 'No subscription found', 404);
  }

  // Check if subscription is expired
  const isExpired = new Date(subscription.endDate) < new Date();
  const status = isExpired ? SUBSCRIPTION_STATUS.EXPIRED : subscription.status;

  // Get current user count
  const userCount = await prisma.user.count({
    where: { orgId }
  });

  return successResponse(res, 'Subscription retrieved', {
    id: subscription.id,
    plan: {
      name: subscription.plan.name,
      maxUsers: subscription.plan.maxUsers,
      price: subscription.plan.price,
      features: subscription.plan.features
    },
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    status,
    isExpired,
    userCount,
    daysRemaining: Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))
  });
});

/**
 * Get all available subscription plans
 */
export const getAllPlans = asyncHandler(async (req, res) => {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { price: 'asc' }
  });

  return successResponse(res, 'Plans retrieved', plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    maxUsers: plan.maxUsers,
    price: plan.price,
    duration: plan.duration,
    features: plan.features
  })));
});

/**
 * Upgrade subscription plan
 */
export const upgradePlan = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const orgId = req.user.orgId;

  if (!orgId) {
    return errorResponse(res, 'Organization not found', 404);
  }

  if (!planId) {
    return errorResponse(res, 'Plan ID is required', 400);
  }

  // Get target plan
  const targetPlan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId }
  });

  if (!targetPlan) {
    return errorResponse(res, 'Plan not found', 404);
  }

  // Get current subscription
  const currentSubscription = await prisma.organizationSubscription.findUnique({
    where: { orgId },
    include: { plan: true }
  });

  if (!currentSubscription) {
    return errorResponse(res, 'Current subscription not found', 404);
  }

  // Prevent downgrade (can only upgrade)
  if (targetPlan.price < currentSubscription.plan.price) {
    return errorResponse(res, 'Cannot downgrade plan. Contact support for downgrades.', 400);
  }

  // Check if plan is the same
  if (targetPlan.id === currentSubscription.planId) {
    return errorResponse(res, 'Plan is already active', 400);
  }

  // Calculate proration if needed (simple pro-rata for this example)
  const today = new Date();
  const daysInCurrentPeriod = Math.ceil((currentSubscription.endDate - currentSubscription.startDate) / (1000 * 60 * 60 * 24));
  const daysUsed = Math.ceil((today - currentSubscription.startDate) / (1000 * 60 * 60 * 24));
  const daysRemaining = daysInCurrentPeriod - daysUsed;
  
  const proratedAmount = (targetPlan.price - currentSubscription.plan.price) * (daysRemaining / daysInCurrentPeriod);

  // Update subscription
  const newEndDate = new Date();
  newEndDate.setDate(newEndDate.getDate() + targetPlan.duration);

  const updatedSubscription = await prisma.organizationSubscription.update({
    where: { id: currentSubscription.id },
    data: {
      planId: targetPlan.id,
      startDate: today,
      endDate: newEndDate,
      status: SUBSCRIPTION_STATUS.ACTIVE
    },
    include: { plan: true }
  });

  return successResponse(res, 'Plan upgraded successfully', {
    plan: {
      name: updatedSubscription.plan.name,
      maxUsers: updatedSubscription.plan.maxUsers,
      price: updatedSubscription.plan.price
    },
    startDate: updatedSubscription.startDate,
    endDate: updatedSubscription.endDate,
    proratedAmount: Math.round(proratedAmount * 100) / 100,
    message: `Upgrade complete. Total cost: $${Math.round(proratedAmount * 100) / 100}`
  });
});

/**
 * Check if organization can add more users
 */
export const canAddUsers = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { count = 1 } = req.query;

  if (!orgId) {
    return errorResponse(res, 'Organization not found', 404);
  }

  const subscription = await prisma.organizationSubscription.findUnique({
    where: { orgId },
    include: { plan: true }
  });

  if (!subscription) {
    return errorResponse(res, 'No subscription found', 404);
  }

  const currentUserCount = await prisma.user.count({
    where: { orgId }
  });

  const canAdd = (currentUserCount + parseInt(count)) <= subscription.plan.maxUsers;
  const maxUsers = subscription.plan.maxUsers;

  return successResponse(res, 'User capacity check complete', {
    canAdd,
    currentUserCount,
    maxUsers,
    availableSlots: maxUsers - currentUserCount,
    requestedCount: parseInt(count),
    message: canAdd 
      ? `You can add ${maxUsers - currentUserCount} more users`
      : `Cannot add ${count} users. Only ${maxUsers - currentUserCount} slots available`
  });
});

/**
 * Check feature access based on subscription plan
 */
export const checkFeatureAccess = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { feature } = req.query;

  if (!orgId) {
    return errorResponse(res, 'Organization not found', 404);
  }

  if (!feature) {
    return errorResponse(res, 'Feature parameter is required', 400);
  }

  const subscription = await prisma.organizationSubscription.findUnique({
    where: { orgId },
    include: { plan: true }
  });

  if (!subscription) {
    return errorResponse(res, 'No subscription found', 404);
  }

  const featureAccess = FEATURE_ACCESS[subscription.plan.name.toUpperCase()];
  const hasAccess = featureAccess[feature] === true;

  return successResponse(res, 'Feature access check complete', {
    feature,
    hasAccess,
    plan: subscription.plan.name,
    message: hasAccess 
      ? `Feature "${feature}" is available in your plan`
      : `Feature "${feature}" requires a higher plan`
  });
});

/**
 * Get subscription usage analytics
 */
export const getUsageAnalytics = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;

  if (!orgId) {
    return errorResponse(res, 'Organization not found', 404);
  }

  const subscription = await prisma.organizationSubscription.findUnique({
    where: { orgId },
    include: { plan: true }
  });

  if (!subscription) {
    return errorResponse(res, 'No subscription found', 404);
  }

  // Get user count
  const userCount = await prisma.user.count({
    where: { orgId }
  });

  // Get attendance records count
  const attendanceCount = await prisma.attendance.count({
    where: { orgId }
  });

  const userUsagePercent = Math.round((userCount / subscription.plan.maxUsers) * 100);

  return successResponse(res, 'Usage analytics retrieved', {
    plan: subscription.plan.name,
    users: {
      current: userCount,
      max: subscription.plan.maxUsers,
      usagePercent: userUsagePercent,
      warning: userUsagePercent >= 80
    },
    attendance: {
      total: attendanceCount
    },
    subscription: {
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      daysRemaining: Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
      isExpired: new Date(subscription.endDate) < new Date()
    },
    features: {
      analytics: subscription.plan.name === 'Pro',
      export: subscription.plan.name === 'Pro',
      customRoles: subscription.plan.name === 'Pro',
      apiAccess: subscription.plan.name === 'Pro'
    }
  });
});