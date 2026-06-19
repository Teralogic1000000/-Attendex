import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';

/**
 * Register a new organization with user
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
    data: {
      name: orgName,
      logoUrl: logoUrl || null,
      theme: theme || 'light'
    }
  });

  // Get or create OrgAdmin role
  let role = await prisma.role.findFirst({
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
    include: { role: true }
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
      role: role.name,
      orgId: organization.id
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

  // Find user with role and organization
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true, organization: true }
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

  // Update refresh token and lastLogin in database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken,
      lastLogin: new Date()
    }
  });

  // Build user response
  const resUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role.name,
    orgId: user.orgId,
  };

  if (user.organization) {
    resUser.organization = {
      id: user.organization.id,
      name: user.organization.name,
      email: user.organization.email,
      logoUrl: user.organization.logoUrl,
      theme: user.organization.theme,
    };
  }

  return successResponse(res, 'Login successful', {
    user: resUser,
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

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return errorResponse(res, 'User not authenticated', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, organization: true }
  });

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  return successResponse(res, 'User profile retrieved', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    position: user.position,
    role: user.role.name,
    organization: user.organization ? {
      id: user.organization.id,
      name: user.organization.name
    } : null
  });
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { firstName, lastName, phone, position } = req.body;

  if (!userId) {
    return errorResponse(res, 'User not authenticated', 401);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      phone: phone ?? undefined,
      position: position ?? undefined
    },
    include: { role: true }
  });

  return successResponse(res, 'Profile updated successfully', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    position: user.position,
    role: user.role.name
  });
});

/**
 * Change user password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    return errorResponse(res, 'User not authenticated', 401);
  }

  if (!currentPassword || !newPassword) {
    return errorResponse(res, 'Current password and new password are required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    return errorResponse(res, 'Current password is incorrect', 401);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  return successResponse(res, 'Password changed successfully');
});
