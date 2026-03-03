import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Create a new user in the organization
 */
export const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, roleId } = req.body;
  const orgId = req.user.orgId;

  // Validation
  if (!firstName || !lastName || !email || !password) {
    return errorResponse(res, 'All fields are required', 400);
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return errorResponse(res, 'Email already in use', 400);
  }

  // Get default Employee role if roleId not provided
  let role = null;
  if (roleId) {
    role = await prisma.role.findUnique({
      where: { id: roleId }
    });
  } else {
    role = await prisma.role.findUnique({
      where: { name: 'Employee' }
    });
  }

  if (!role) {
    return errorResponse(res, 'Invalid role', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      orgId,
      roleId: role.id
    },
    include: { role: true }
  });

  return successResponse(res, 'User created successfully', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role.name
  }, 201);
});

/**
 * Get all users in the organization with pagination
 */
export const getUsers = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    where: { orgId },
    include: { role: true },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.user.count({
    where: { orgId }
  });

  return successResponse(res, 'Users fetched successfully', {
    users: users.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role.name,
      createdAt: u.createdAt
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit)
    }
  });
});

/**
 * Get a specific user by ID
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const user = await prisma.user.findFirst({
    where: {
      id,
      orgId
    },
    include: { role: true }
  });

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  return successResponse(res, 'User retrieved', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role.name,
    createdAt: user.createdAt
  });
});

/**
 * Update user information
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, roleId } = req.body;
  const orgId = req.user.orgId;

  // Verify user exists in organization
  const user = await prisma.user.findFirst({
    where: { id, orgId }
  });

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Verify role exists if being changed
  if (roleId) {
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return errorResponse(res, 'Invalid role', 400);
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(roleId && { roleId })
    },
    include: { role: true }
  });

  return successResponse(res, 'User updated successfully', {
    id: updatedUser.id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    role: updatedUser.role.name
  });
});

/**
 * Delete a user from the organization
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;
  const currentUserId = req.user.id;

  // Prevent self-deletion
  if (id === currentUserId) {
    return errorResponse(res, 'Cannot delete your own account', 400);
  }

  // Verify user exists in organization
  const user = await prisma.user.findFirst({
    where: { id, orgId }
  });

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Delete user (cascades to attendance records)
  await prisma.user.delete({
    where: { id }
  });

  return successResponse(res, 'User deleted successfully');
});

/**
 * Update user password
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  const orgId = req.user.orgId;
  const currentUserId = req.user.id;

  // Users can only change their own password
  if (id !== currentUserId) {
    return errorResponse(res, 'You can only change your own password', 403);
  }

  if (!currentPassword || !newPassword) {
    return errorResponse(res, 'Current and new password are required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id }
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
    where: { id },
    data: { password: hashedPassword }
  });

  return successResponse(res, 'Password updated successfully');
});

/**
 * Get user statistics for the organization
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalUsers = await prisma.user.count({
    where: { orgId }
  });

  const usersByRole = await prisma.user.groupBy({
    by: ['roleId'],
    where: { orgId },
    _count: {
      id: true
    }
  });

  const rolesWithCounts = await Promise.all(
    usersByRole.map(async (group) => {
      const role = await prisma.role.findUnique({
        where: { id: group.roleId }
      });
      return {
        role: role.name,
        count: group._count.id
      };
    })
  );

  // Get employees present today (who checked in at least)
  const presentToday = await prisma.attendance.findMany({
    where: {
      user: { orgId },
      date: {
        gte: today
      }
    },
    distinct: ['userId'],
    select: { userId: true }
  });

  // Calculate average hours worked today
  const attendanceToday = await prisma.attendance.findMany({
    where: {
      user: { orgId },
      date: {
        gte: today
      }
    },
    select: {
      totalHours: true
    }
  });

  const avgHours = attendanceToday.length > 0
    ? (attendanceToday.reduce((sum, a) => sum + (a.totalHours || 0), 0) / attendanceToday.length).toFixed(1)
    : '0.0';

  return successResponse(res, 'User statistics retrieved', {
    totalUsers,
    totalEmployees: totalUsers,
    presentToday: presentToday.length,
    avgHours: parseFloat(avgHours),
    usersByRole: rolesWithCounts
  });
});