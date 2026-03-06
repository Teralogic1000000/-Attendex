import prisma from '../config/prisma.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * Create a new shift
 */
export const createShift = asyncHandler(async (req, res) => {
  const { name, startTime, endTime, status } = req.body
  const orgId = req.user.orgId

  if (!name || !startTime || !endTime) {
    return errorResponse(res, 'Shift name, start time, and end time are required', 400)
  }

  const shift = await prisma.shift.create({
    data: {
      name,
      startTime,
      endTime,
      status: status || 'Active',
      orgId
    }
  })

  return successResponse(res, 'Shift created successfully', shift, 201)
})

/**
 * Get all shifts in the organization
 */
export const getShifts = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  const [shifts, total] = await Promise.all([
    prisma.shift.findMany({
      where: { orgId },
      include: {
        users: {
          select: { id: true }
        }
      },
      skip,
      take: limit
    }),
    prisma.shift.count({
      where: { orgId }
    })
  ])

  const shiftsWithCount = shifts.map(shift => ({
    ...shift,
    employeeCount: shift.users.length,
    users: undefined
  }))

  return successResponse(res, 'Shifts fetched successfully', {
    data: shiftsWithCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

/**
 * Get a single shift
 */
export const getShift = asyncHandler(async (req, res) => {
  const { id } = req.params
  const orgId = req.user.orgId

  const shift = await prisma.shift.findFirst({
    where: {
      id,
      orgId
    },
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          position: true,
          status: true
        }
      }
    }
  })

  if (!shift) {
    return errorResponse(res, 'Shift not found', 404)
  }

  return successResponse(res, 'Shift fetched successfully', {
    ...shift,
    employeeCount: shift.users.length
  })
})

/**
 * Update a shift
 */
export const updateShift = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, startTime, endTime, status } = req.body
  const orgId = req.user.orgId

  const shift = await prisma.shift.findFirst({
    where: { id, orgId }
  })

  if (!shift) {
    return errorResponse(res, 'Shift not found', 404)
  }

  const updated = await prisma.shift.update({
    where: { id },
    data: {
      name: name || shift.name,
      startTime: startTime || shift.startTime,
      endTime: endTime || shift.endTime,
      status: status !== undefined ? status : shift.status
    }
  })

  return successResponse(res, 'Shift updated successfully', updated)
})

/**
 * Delete a shift
 */
export const deleteShift = asyncHandler(async (req, res) => {
  const { id } = req.params
  const orgId = req.user.orgId

  const shift = await prisma.shift.findFirst({
    where: { id, orgId }
  })

  if (!shift) {
    return errorResponse(res, 'Shift not found', 404)
  }

  // Check if shift has users assigned
  const userCount = await prisma.user.count({
    where: { shiftId: id }
  })

  if (userCount > 0) {
    return errorResponse(res, 'Cannot delete shift with assigned users', 400)
  }

  await prisma.shift.delete({
    where: { id }
  })

  return successResponse(res, 'Shift deleted successfully', null)
})

/**
 * Assign user to shift
 */
export const assignUserToShift = asyncHandler(async (req, res) => {
  const { shiftId, userId } = req.body
  const orgId = req.user.orgId

  // Verify shift and user belong to same org
  const [shift, user] = await Promise.all([
    prisma.shift.findFirst({ where: { id: shiftId, orgId } }),
    prisma.user.findFirst({ where: { id: userId, orgId } })
  ])

  if (!shift || !user) {
    return errorResponse(res, 'Shift or user not found', 404)
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { shiftId }
  })

  return successResponse(res, 'User assigned to shift successfully', updated)
})

/**
 * Remove user from shift
 */
export const removeUserFromShift = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const orgId = req.user.orgId

  const user = await prisma.user.findFirst({
    where: { id: userId, orgId }
  })

  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { shiftId: null }
  })

  return successResponse(res, 'User removed from shift successfully', updated)
})
