import bcrypt from 'bcrypt';
import {
  findOne,
  create,
  update,
  findMany,
  camelToSnakeCase,
  snakeToCamelCase,
} from '../config/supabaseMapper.js';
import supabase from '../config/supabaseClient.js';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';
import { SUBSCRIPTION_STATUS } from '../constants/subscriptionPlans.js';

/**
 * Register a new organization with user and default Basic subscription
 */
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, orgName, logoUrl, theme } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !password || !orgName) {
    return errorResponse(res, 'All fields are required', 400);
  }

  // Check if email already exists
  const existingUser = await findOne('user', { email });

  if (existingUser) {
    return errorResponse(res, 'Email already in use', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create organization
  const organization = await create('organization', {
    name: orgName,
    logoUrl,
    theme
  });

  // Get OrgAdmin user type (assuming user_type_id = 3 for OrgAdmin, or query it)
  let userType = await findOne('user_type', { typeName: 'OrgAdmin' });

  if (!userType) {
    // Fallback to first available user type or default to 1
    userType = await findOne('user_type', {});
    if (!userType) {
      // Create OrgAdmin user type if it doesn't exist
      userType = await create('user_type', {
        typeName: 'OrgAdmin'
      });
    }
  }

  // Create user
  const user = await create('user', {
    firstName,
    lastName,
    email,
    password: hashedPassword,
    orgId: organization.id,
    userTypeId: userType.id
  });

  // Get Basic plan
  let basicPlan = await findOne('subscriptionPlan', { name: 'Basic' });

  if (!basicPlan) {
    // Create Basic plan if it doesn't exist
    basicPlan = await create('subscriptionPlan', {
      name: 'Basic',
      maxEmployees: 5,
      price: 0,
      interval: 'monthly',
      features: [
        'Limited features',
        'Core system access',
        'Up to 5 team members',
        'Basic support'
      ]
    });
  }

  // Create subscription with Basic plan
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30); // 30 days trial

  const subscription = await create('organizationSubscription', {
    orgId: organization.id,
    planId: basicPlan.id,
    startDate: new Date(),
    endDate,
    status: SUBSCRIPTION_STATUS.ACTIVE || 'ACTIVE'
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token
  await update('user', user.id, { refreshToken }, 'id');

  return successResponse(res, 'Registration successful', {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: userType.typeName,
      orgId: organization.id
    },
    subscription: {
      plan: basicPlan.name,
      maxEmployees: basicPlan.maxEmployees,
      startDate: subscription.startDate,
      endDate: subscription.endDate
    },
    tokens: {
      accessToken,
      refreshToken
    }
  }, 201);
});

/**
 * Login user with credentials
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'Email and password are required', 400);
  }

  // Find user
  const user = await findOne('user', { email });

  if (!user) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  // Get user type info
  const userType = user.userTypeId ? await findOne('user_type', { id: user.userTypeId }) : null;

  // Get organization info
  const organization = user.orgId ? await findOne('organization', { id: user.orgId }) : null;

  // Get subscription info
  let subscription = null;
  if (user.orgId) {
    subscription = await findOne('organizationSubscription', { orgId: user.orgId });
    if (subscription) {
      const plan = await findOne('subscriptionPlan', { id: subscription.planId });
      subscription.plan = plan;
    }
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Update refresh token in database
  await update('user', user.id, { refreshToken }, 'id');

  // Build user response
  const resUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userType: userType?.typeName || 'Employee',
    orgId: user.orgId,
  };

  if (organization) {
    resUser.organization = {
      id: organization.id,
      name: organization.name,
      email: organization.email,
      logoUrl: organization.logoUrl,
      theme: organization.theme,
    };
  }

  return successResponse(res, 'Login successful', {
    user: resUser,
    subscription: subscription ? {
      plan: subscription.plan?.name,
      maxEmployees: subscription.plan?.maxEmployees,
      status: subscription.status,
      endDate: subscription.endDate
    } : null,
    tokens: {
      accessToken,
      refreshToken
    }
  }, 200);
});

/**
 * Refresh access token using refresh token
 */
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(res, 'Refresh token required', 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await findOne('user', { id: decoded.id });

    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token
    await update('user', user.id, { refreshToken: newRefreshToken }, 'id');

    return successResponse(res, 'Token refreshed', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return errorResponse(res, 'Invalid refresh token', 401);
  }
});

/**
 * Logout user by invalidating refresh token
 */
export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return errorResponse(res, 'User not authenticated', 401);
  }

  await update('user', userId, { refreshToken: null }, 'id');

  return successResponse(res, 'Logged out successfully');
});