import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
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
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return errorResponse(res, 'Email already in use', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create organization
  const organization = await prisma.organization.create({
    data: { name: orgName, logoUrl, theme }
  });

  // Get or create OrgAdmin role
  let role = await prisma.role.findUnique({
    where: { name: 'OrgAdmin' }
  });

  if (!role) {
    role = await prisma.role.create({
      data: { name: 'OrgAdmin' }
    });
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      orgId: organization.id,
      roleId: role.id
    },
    include: { role: true, organization: true }
  });

  // Get Basic plan (seed may not have been run)
  let basicPlan = await prisma.subscriptionPlan.findUnique({
    where: { name: 'Basic' }
  });

  if (!basicPlan) {
    // create a minimal default plan so registration can succeed
    basicPlan = await prisma.subscriptionPlan.create({
      data: {
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
      }
    });
  }

  // Create subscription with Basic plan
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30); // 30 days trial

  const subscription = await prisma.organizationSubscription.create({
    data: {
      orgId: organization.id,
      planId: basicPlan.id,
      startDate: new Date(),
      endDate,
      status: SUBSCRIPTION_STATUS.ACTIVE
    },
    include: { plan: true }
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  });

  return successResponse(res, 'Registration successful', {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.name,
      orgId: organization.id
    },
    subscription: {
      plan: subscription.plan.name,
      maxEmployees: subscription.plan.maxEmployees,
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

  // Find user with relations
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
      organization: {
        include: {
          subscription: {
            include: { plan: true }
          }
        }
      }
    }
  });

  if (!user) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Update refresh token in database
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  });

  // build user response including organization info (logo/theme)
  const resUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role.name,
    orgId: user.orgId,
  }

  if (user.organization) {
    resUser.organization = {
      id: user.organization.id,
      name: user.organization.name,
      email: user.organization.email,
      logoUrl: user.organization.logoUrl,
      theme: user.organization.theme,
    }
  }

  return successResponse(res, 'Login successful', {
    user: resUser,
    subscription: user.organization?.subscription ? {
      plan: user.organization.subscription.plan.name,
      maxEmployees: user.organization.subscription.plan.maxEmployees,
      status: user.organization.subscription.status,
      endDate: user.organization.subscription.endDate
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true }
    });

    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

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

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null }
  });

  return successResponse(res, 'Logged out successfully');
});