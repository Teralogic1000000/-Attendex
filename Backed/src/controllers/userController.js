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
    role = await prisma.role.findFirst({
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
    include: { role: true, organization: true }
  });

  return successResponse(res, 'User created successfully', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: role.name
  }, 201);
});

/**
 * Get all users in the organization with pagination
 */
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const orgId = req.user.orgId;

  console.log('🔍 getUsers DEBUG:', {
    orgId,
    userId: req.user.id,
    email: req.user.email,
    role: req.user.role,
    page,
    limit,
    skip
  });

  if (!orgId) {
    return errorResponse(res, 'Organization ID not found - user may not be assigned to an organization', 400);
  }

  // Get users with pagination
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { orgId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roleId: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true
      },
      orderBy: { firstName: 'asc' },
      skip,
      take: limit
    }),
    prisma.user.count({
      where: { orgId }
    })
  ]);

  console.log('✅ getUsers SUCCESS:', { userCount: users.length, total });

  return successResponse(res, 'Users fetched successfully', {
    users: users || [],
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
    include: {
      role: true,
      organization: true,
      department: true
    }
  });

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  return successResponse(res, 'User retrieved', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    department: user.department,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
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

  // Build update data
  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (roleId !== undefined) updateData.roleId = roleId;

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    include: { role: true }
  });

  return successResponse(res, 'User updated successfully', {
    id: updatedUser.id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    role: updatedUser.role?.name || 'Employee'
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

  // Delete user (cascades to attendance records via Prisma)
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

  // Get total users
  const totalUsers = await prisma.user.count({
    where: { orgId }
  });

  // Get all users grouped by role
  const allUsers = await prisma.user.findMany({
    where: { orgId },
    include: { role: true }
  });

  const usersByRole = {};
  for (const user of allUsers) {
    const roleName = user.role?.name || 'Unknown';
    usersByRole[roleName] = (usersByRole[roleName] || 0) + 1;
  }

  const usersByRoleArray = Object.entries(usersByRole).map(([role, count]) => ({
    role,
    count
  }));

  // Get employees present today (who checked in)
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      orgId,
      checkInTime: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  });

  const presentToday = new Set(attendanceRecords.map(r => r.userId));

  const totalHoursToday = attendanceRecords.reduce((sum, record) => {
    return sum + (record.totalHours || 0);
  }, 0);

  const avgHours = presentToday.size > 0
    ? (totalHoursToday / presentToday.size).toFixed(1)
    : '0.0';

  return successResponse(res, 'User statistics retrieved', {
    totalUsers,
    totalEmployees: totalUsers,
    presentToday: presentToday.size,
    avgHours: parseFloat(avgHours),
    usersByRole: usersByRoleArray
  });
});
