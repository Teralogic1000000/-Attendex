import bcrypt from 'bcrypt';
import {
  findOne,
  create,
  update,
  findMany,
  count,
  deleteById,
} from '../config/supabaseMapper.js';
import supabase from '../config/supabaseClient.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Create a new user in the organization
 */
export const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, userTypeId } = req.body;
  const orgId = req.user.orgId;

  // Validation
  if (!firstName || !lastName || !email || !password) {
    return errorResponse(res, 'All fields are required', 400);
  }

  // Check if email already exists
  const existingUser = await findOne('user', { email });

  if (existingUser) {
    return errorResponse(res, 'Email already in use', 400);
  }

  // Get default Employee user type if userTypeId not provided
  let userType = null;
  if (userTypeId) {
    userType = await findOne('user_type', { id: userTypeId });
  } else {
    userType = await findOne('user_type', { typeName: 'Employee' });
  }

  if (!userType) {
    return errorResponse(res, 'Invalid user type', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await create('user', {
    firstName,
    lastName,
    email,
    password: hashedPassword,
    orgId,
    userTypeId: userType.id
  });

  return successResponse(res, 'User created successfully', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userType: userType.typeName
  }, 201);
});

/**
 * Get all users in the organization with pagination
 * Uses user_full_view for readable data (names instead of IDs)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Use the user_full_view for readable data
  const { data: users, error, count } = await supabase
    .from('user_full_view')
    .select('*', { count: 'exact' })
    .order('First_Name', { ascending: true })
    .range(skip, skip + limit - 1);

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  const total = count || 0;

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
 * Uses user_full_view for readable data
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: user, error } = await supabase
    .from('user_full_view')
    .select('*')
    .eq('User_ID', id)
    .single();

  if (error || !user) {
    return errorResponse(res, 'User not found', 404);
  }

  return successResponse(res, 'User retrieved', user);
});

/**
 * Update user information
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, userTypeId } = req.body;
  const orgId = req.user.orgId;

  // Verify user exists in organization
  const user = await findOne('user', { id, orgId });

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Verify user type exists if being changed
  if (userTypeId) {
    const userType = await findOne('user_type', { id: userTypeId });

    if (!userType) {
      return errorResponse(res, 'Invalid user type', 400);
    }
  }

  // Build update data
  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (userTypeId !== undefined) updateData.userTypeId = userTypeId;

  // Update user
  const updatedUser = await update('user', id, updateData, 'id');

  const userType = updatedUser.userTypeId ? await findOne('user_type', { id: updatedUser.userTypeId }) : null;

  return successResponse(res, 'User updated successfully', {
    id: updatedUser.id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    userType: userType?.typeName || 'Employee'
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
  const user = await findOne('user', { id, orgId });

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Delete user (cascades to attendance records)
  await deleteById('user', id, 'id');

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

  const user = await findOne('user', { id });

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
  await update('user', id, { password: hashedPassword }, 'id');

  return successResponse(res, 'Password updated successfully');
});

/**
 * Get user statistics for the organization
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalUsers = await count('user', { orgId });

  // Get all users grouped by user type
  const allUsers = await findMany('user', { orgId });
  const userTypeMap = {};

  for (const user of allUsers) {
    if (user.userTypeId) {
      if (!userTypeMap[user.userTypeId]) {
        const userType = await findOne('user_type', { id: user.userTypeId });
        userTypeMap[user.userTypeId] = userType?.typeName || 'Unknown';
      }
    }
  }

  // Count users by type
  const usersByType = {};
  for (const user of allUsers) {
    const typeName = userTypeMap[user.userTypeId] || 'Unknown';
    usersByType[typeName] = (usersByType[typeName] || 0) + 1;
  }

  const usersByRole = Object.entries(usersByType).map(([type, count]) => ({
    role: type,
    count
  }));

  // Get employees present today (who checked in at least)
  const attendanceRecords = await findMany('attendance', {}, {
    limit: 10000 // Fetch all to filter on client side
  });

  const presentToday = new Set();
  let totalHoursToday = 0;

  for (const record of attendanceRecords) {
    if (record.orgId === orgId) {
      const recordDate = new Date(record.checkInTime);
      recordDate.setHours(0, 0, 0, 0);
      if (recordDate.getTime() === today.getTime()) {
        presentToday.add(record.userId);
        totalHoursToday += record.totalHours || 0;
      }
    }
  }

  const avgHours = presentToday.size > 0
    ? (totalHoursToday / presentToday.size).toFixed(1)
    : '0.0';

  return successResponse(res, 'User statistics retrieved', {
    totalUsers,
    totalEmployees: totalUsers,
    presentToday: presentToday.size,
    avgHours: parseFloat(avgHours),
    usersByRole
  });
});