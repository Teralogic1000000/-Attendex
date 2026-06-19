/**
 * SuperAdmin User Controller
 * Handles user management across all organizations
 */

import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * List all users with pagination
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status = 'ACTIVE', role, search } = req.query;
  const skip = (page - 1) * limit;

  const where = {};
  
  if (status) {
    where.status = status;
  }
  if (role) {
    where.role = { name: role };
  }
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { organization: true, role: true },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  const enriched = users.map(user => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    status: user.status,
    role: user.role.name,
    organization: user.organization ? {
      id: user.organization.id,
      name: user.organization.name
    } : null,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  }));

  return successResponse(res, 'Users retrieved', {
    data: enriched,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get user detail
 */
export const getUserDetail = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true, role: true, department: true }
  });

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Get recent attendance records
  const recentAttendance = await prisma.attendance.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 5
  });

  return successResponse(res, 'User detail fetched', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    position: user.position,
    status: user.status,
    role: user.role.name,
    department: user.department ? { id: user.department.id, name: user.department.name } : null,
    organization: user.organization ? {
      id: user.organization.id,
      name: user.organization.name
    } : null,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    recentAttendance
  });
});

/**
 * Disable user
 */
export const disableUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  if (user.status === 'DISABLED') {
    return errorResponse(res, 'User is already disabled', 400);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status: 'DISABLED' },
    include: { role: true }
  });

  // Log audit action
  try {
    await prisma.auditLog.create({
      data: {
        action: 'DISABLE_USER',
        resource: 'User',
        resourceId: userId,
        userId: req.user.id,
        orgId: user.orgId,
        description: `User disabled${reason ? ': ' + reason : ''}`
      }
    });
  } catch (err) {
    console.warn('Failed to log audit:', err);
  }

  return successResponse(res, 'User disabled successfully', {
    id: updated.id,
    email: updated.email,
    status: updated.status
  });
});

/**
 * Enable user
 */
export const enableUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status: 'ACTIVE' },
    include: { role: true }
  });

  // Log audit action
  try {
    await prisma.auditLog.create({
      data: {
        action: 'ENABLE_USER',
        resource: 'User',
        resourceId: userId,
        userId: req.user.id,
        description: 'User enabled'
      }
    });
  } catch (err) {
    console.warn('Failed to log audit:', err);
  }

  return successResponse(res, 'User enabled successfully', {
    id: updated.id,
    email: updated.email,
    status: updated.status
  });
});

/**
 * Reset user password
 */
export const resetUserPassword = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return errorResponse(res, 'New password is required', 400);
  }

  if (newPassword.length < 8) {
    return errorResponse(res, 'Password must be at least 8 characters', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  // Log audit action
  try {
    await prisma.auditLog.create({
      data: {
        action: 'RESET_PASSWORD',
        resource: 'User',
        resourceId: userId,
        userId: req.user.id,
        description: 'User password reset'
      }
    });
  } catch (err) {
    console.warn('Failed to log audit:', err);
  }

  return successResponse(res, 'Password reset successfully', {
    id: updated.id,
    email: updated.email
  });
});

/**
 * Create user in organization
 */
export const createUserInOrg = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, roleId, orgId, position, phone } = req.body;

  if (!firstName || !lastName || !email || !password || !orgId) {
    return errorResponse(res, 'Required fields missing', 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return errorResponse(res, 'Email already in use', 400);
  }

  // Verify organization exists
  const org = await prisma.organization.findUnique({
    where: { id: orgId }
  });

  if (!org) {
    return errorResponse(res, 'Organization not found', 404);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Get default Employee role if not provided
  let role = null;
  if (roleId) {
    role = await prisma.role.findUnique({ where: { id: roleId } });
  } else {
    role = await prisma.role.findFirst({ where: { name: 'Employee' } });
  }

  if (!role) {
    return errorResponse(res, 'Invalid role', 400);
  }

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      position: position || '',
      phone: phone || '',
      orgId,
      roleId: role.id,
      status: 'ACTIVE'
    },
    include: { role: true, organization: true }
  });

  // Log audit action
  try {
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_USER',
        resource: 'User',
        resourceId: user.id,
        userId: req.user.id,
        orgId,
        description: `User created: ${email}`
      }
    });
  } catch (err) {
    console.warn('Failed to log audit:', err);
  }

  return successResponse(res, 'User created successfully', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role.name,
    organization: user.organization.name
  }, 201);
});

/**
 * Update user information
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, phone, position, status, roleId } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phone !== undefined) updateData.phone = phone;
  if (position !== undefined) updateData.position = position;
  if (status !== undefined) updateData.status = status;
  if (roleId !== undefined) updateData.roleId = roleId;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { role: true }
  });

  // Log audit action
  try {
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_USER',
        resource: 'User',
        resourceId: userId,
        userId: req.user.id,
        description: `User updated: ${email}`
      }
    });
  } catch (err) {
    console.warn('Failed to log audit:', err);
  }

  return successResponse(res, 'User updated successfully', {
    id: updated.id,
    firstName: updated.firstName,
    lastName: updated.lastName,
    email: updated.email,
    phone: updated.phone,
    position: updated.position,
    status: updated.status,
    role: updated.role.name
  });
});

/**
 * Search users across organizations
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { query, status, role, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const where = {};

  if (query) {
    where.OR = [
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } }
    ];
  }

  if (status) {
    where.status = status;
  }

  if (role) {
    where.role = { name: role };
  }

  const [results, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { organization: true, role: true },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  return successResponse(res, 'Users found', {
    data: results.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      organization: u.organization?.name,
      role: u.role?.name,
      status: u.status,
      createdAt: u.createdAt
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});
