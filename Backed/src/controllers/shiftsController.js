import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Create a new shift
 */
export const createShift = asyncHandler(async (req, res) => {
  const { name, startTime, endTime, status } = req.body;
  const orgId = req.user.orgId;

  if (!name || !startTime || !endTime) {
    return errorResponse(res, 'Shift name, start time, and end time are required', 400);
  }

  const shift = await prisma.shift.create({
    data: {
      name,
      startTime,
      endTime,
      status: status || 'Active',
      orgId
    }
  });

  return successResponse(res, 'Shift created successfully', shift, 201);
});

/**
 * Get all shifts for organization
 */
export const getShifts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const orgId = req.user.orgId;

  const [shifts, total] = await Promise.all([
    prisma.shift.findMany({
      where: { orgId },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    }),
    prisma.shift.count({ where: { orgId } })
  ]);

  return successResponse(res, 'Shifts fetched successfully', {
    shifts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get shift by ID
 */
export const getShiftById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const shift = await prisma.shift.findFirst({
    where: { id, orgId }
  });

  if (!shift) {
    return errorResponse(res, 'Shift not found', 404);
  }

  return successResponse(res, 'Shift retrieved successfully', shift);
});

/**
 * Update shift
 */
export const updateShift = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, startTime, endTime, status } = req.body;
  const orgId = req.user.orgId;

  const shift = await prisma.shift.findFirst({
    where: { id, orgId }
  });

  if (!shift) {
    return errorResponse(res, 'Shift not found', 404);
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (startTime !== undefined) updateData.startTime = startTime;
  if (endTime !== undefined) updateData.endTime = endTime;
  if (status !== undefined) updateData.status = status;

  const updated = await prisma.shift.update({
    where: { id },
    data: updateData
  });

  return successResponse(res, 'Shift updated successfully', updated);
});

/**
 * Delete shift
 */
export const deleteShift = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const shift = await prisma.shift.findFirst({
    where: { id, orgId }
  });

  if (!shift) {
    return errorResponse(res, 'Shift not found', 404);
  }

  await prisma.shift.delete({
    where: { id }
  });

  return successResponse(res, 'Shift deleted successfully');
});

// Alias for getShiftById
export const getShift = getShiftById;

/**
 * Assign user to shift
 */
export const assignUserToShift = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const orgId = req.user.orgId;

  // Verify shift exists
  const shift = await prisma.shift.findFirst({
    where: { id, orgId }
  });

  if (!shift) {
    return errorResponse(res, 'Shift not found', 404);
  }

  // Verify user exists in org
  const user = await prisma.user.findFirst({
    where: { id: userId, orgId }
  });

  if (!user) {
    return errorResponse(res, 'User not found in organization', 404);
  }

  return successResponse(res, 'User assigned to shift successfully', {
    shiftId: id,
    userId
  });
});

/**
 * Remove user from shift
 */
export const removeUserFromShift = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const orgId = req.user.orgId;

  // Verify shift exists
  const shift = await prisma.shift.findFirst({
    where: { id, orgId }
  });

  if (!shift) {
    return errorResponse(res, 'Shift not found', 404);
  }

  return successResponse(res, 'User removed from shift successfully');
});
