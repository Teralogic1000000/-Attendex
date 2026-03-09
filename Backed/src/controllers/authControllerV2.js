/**
 * Enhanced Authentication Controller - STEP 21
 * Updated for all user types and complete authentication flow
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Generate JWT Access Token
 */
function generateAccessToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    roleId: user.roleId,
    orgId: user.orgId
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'your_secret_key', {
    expiresIn: '24h'
  });
}

/**
 * Generate JWT Refresh Token
 */
function generateRefreshToken(user) {
  const payload = {
    id: user.id,
    email: user.email
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'your_refresh_secret', {
    expiresIn: '7d'
  });
}

/**
 * Get or create role by name
 */
async function getRole(roleName) {
  let role = await prisma.role.findUnique({
    where: { name: roleName }
  });

  if (!role) {
    role = await prisma.role.create({
      data: { name: roleName }
    });
  }

  return role;
}

/**
 * Register new user (Employee signup)
 */
export async function registerEmployee(req, res) {
  try {
    const { firstName, lastName, email, password, phone, departmentId, userType } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return errorResponse(res, 'First name, last name, email, and password are required', 400);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return errorResponse(res, 'Email already registered', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Get Employee role
    const role = await getRole(userType || 'Employee');

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: passwordHash,
        phone: phone || null,
        departmentId: departmentId || null,
        roleId: role.id,
        status: 'ACTIVE'
      },
      include: {
        role: true,
        organization: true,
        department: true
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    return successResponse(res, 'Employee registered successfully', {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name,
        status: user.status
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h'
      }
    }, 201);
  } catch (error) {
    console.error('Error registering employee:', error);
    return errorResponse(res, `Registration failed: ${error.message}`, 500);
  }
}

/**
 * Register new organization with admin
 */
export async function registerOrganization(req, res) {
  try {
    const { firstName, lastName, email, password, orgName, phone, address } = req.body;

    if (!firstName || !lastName || !email || !password || !orgName) {
      return errorResponse(res, 'All required fields must be provided', 400);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return errorResponse(res, 'Email already registered', 409);
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: orgName,
        email: email,
        phone: phone || null,
        address: address || null,
        status: 'ACTIVE'
      }
    });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Get Org_Admin role
    const role = await getRole('Org_Admin');

    // Create org admin user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: passwordHash,
        phone: phone || null,
        orgId: organization.id,
        roleId: role.id,
        status: 'ACTIVE'
      },
      include: {
        role: true,
        organization: true
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    return successResponse(res, 'Organization created successfully', {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name,
        organization: user.organization.name,
        status: user.status
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h'
      }
    }, 201);
  } catch (error) {
    console.error('Error registering organization:', error);
    return errorResponse(res, `Registration failed: ${error.message}`, 500);
  }
}

/**
 * Register Super Admin (Platform Administrator)
 * Requires optional admin token or secret key for security
 */
export async function registerSuperAdmin(req, res) {
  try {
    const { firstName, lastName, email, password, adminSecret } = req.body;

    // Verify admin secret key (required security layer)
    const ADMIN_SECRET = process.env.ADMIN_SECRET;
    if (!ADMIN_SECRET) {
      console.error('ERROR: ADMIN_SECRET not configured in .env file');
      return errorResponse(res, 'Server configuration error', 500);
    }

    if (!adminSecret) {
      return errorResponse(res, 'Admin secret is required', 400);
    }

    if (adminSecret !== ADMIN_SECRET) {
      return errorResponse(res, 'Invalid admin credentials. Please check your admin secret key.', 401);
    }

    if (!firstName || !lastName || !email || !password) {
      return errorResponse(res, 'All required fields must be provided', 400);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return errorResponse(res, 'Email already registered', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Get Super_Admin role
    const role = await getRole('Super_Admin');

    if (!role) {
      console.error('Super_Admin role not found');
      return errorResponse(res, 'System configuration error: Super_Admin role not found', 500);
    }

    // Create super admin user (no organization assigned)
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: passwordHash,
        roleId: role.id,
        status: 'ACTIVE'
      },
      include: {
        role: true
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    return successResponse(res, 'Super Admin created successfully', {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name,
        status: user.status
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h'
      }
    }, 201);
  } catch (error) {
    console.error('Error registering super admin:', error);
    return errorResponse(res, `Super Admin registration failed: ${error.message}`, 500);
  }
}

/**
 * Login user with email and password
 */
export async function login(req, res) {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    // Find user by email - only include necessary relations
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        organization: true
      }
    });

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // If userType is specified, verify it matches
    if (userType) {
      const role = await getRole(userType);
      if (user.roleId !== role.id) {
        return errorResponse(res, `User is not a ${userType}`, 401);
      }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update last login and refresh token
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLogin: new Date()
      },
      include: {
        role: true,
        organization: true
      }
    });

    return successResponse(res, 'Login successful', {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name,
        organization: user.organization?.name || null,
        status: user.status
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h'
      }
    }, 200);
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, `Login failed: ${error.message}`, 500);
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_refresh_secret');
    } catch (error) {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true }
    });

    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

    return successResponse(res, 'Token refreshed', {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: '24h'
    }, 200);
  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse(res, `Token refresh failed: ${error.message}`, 500);
  }
}

/**
 * Logout user
 */
export async function logout(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'User not found', 401);
    }

    // Clear refresh token
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });

    return successResponse(res, 'Logout successful', {}, 200);
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, `Logout failed: ${error.message}`, 500);
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'User not found', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        organization: true,
        department: true
      }
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
      role: user.role.name,
      organization: user.organization?.name || null,
      department: user.department?.name || null,
      status: user.status,
      lastLogin: user.lastLogin
    }, 200);
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse(res, `Failed to get user: ${error.message}`, 500);
  }
}

/**
 * Verify credentials (for testing)
 */
export async function verifyCredentials(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        organization: true
      }
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    return successResponse(res, 'Credentials verified', {
      valid: passwordMatch,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name,
        organization: user.organization?.name || null
      }
    }, 200);
  } catch (error) {
    console.error('Verify credentials error:', error);
    return errorResponse(res, `Verification failed: ${error.message}`, 500);
  }
}
