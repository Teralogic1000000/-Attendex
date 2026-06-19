import supabase from '../config/supabaseClient.js'
import {
  create,
  update,
  deleteById,
} from '../config/supabaseMapper.js'
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

  const { data: shift, error } = await supabase
    .from('Shift')
    .insert([{
      name,
      startTime,
      endTime,
      status: status || 'Active',
      orgId
    }])
    .select()
    .single()

  if (error) {
    return errorResponse(res, error.message, 400)
  }

  return successResponse(res, 'Shift created successfully', shift, 201)
})

/**
 * Get all shifts in the organization
 * Uses shift_full_view to include organization name
 */
export const getShifts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  // Use shift_full_view for readable data
  const { data: shifts, error, count } = await supabase
    .from('shift_full_view')
    .select('*', { count: 'exact' })
    .order('Shift_Name', { ascending: true })
    .range(skip, skip + limit - 1)

  if (error) {
    return errorResponse(res, error.message, 400)
  }

  return successResponse(res, 'Shifts fetched successfully', {
    data: shifts || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    }
  })
})

/**
 * Get a single shift
 * Uses shift_full_view for readable data
 */
export const getShift = asyncHandler(async (req, res) => {
  const { id } = req.params
  const orgId = req.user.orgId

  const shift = await findOne('shift', { id, orgId })

  if (!shift) {
    return errorResponse(res, 'Shift not found', 404)
  }

  // Get users assigned to this shift
  const users = await findMany('user', { shiftId: parseInt(id) }, { limit: 1000 })

  return successResponse(res, 'Shift fetched successfully', {
    ...shift,
    users: users.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      jobTitle: u.jobTitle
    })),
    employeeCount: users.length
  })
})

/**
 * Update a shift
 */
export const updateShift = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, startTime, endTime, status } = req.body
  const orgId = req.user.orgId

  const shift = await findOne('shift', { id, orgId })

  if (!shift) {
    return errorResponse(res, 'Shift not found', 404)
  }

  const updateData = {}
  if (name !== undefined) updateData.name = name
  if (startTime !== undefined) updateData.startTime = startTime
  if (endTime !== undefined) updateData.endTime = endTime
  if (status !== undefined) updateData.status = status

  const updated = await update('shift', id, updateData, 'id')

  return successResponse(res, 'Shift updated successfully', updated)
})

/**
 * Delete a shift
 */
export const deleteShift = asyncHandler(async (req, res) => {
  const { id } = req.params
  const orgId = req.user.orgId

  const shift = await findOne('shift', { id, orgId })

  if (!shift) {
    return errorResponse(res, 'Shift not found', 404)
  }

  // Check if shift has users assigned
  const userCount = await count('user', { shiftId: parseInt(id) })

  if (userCount > 0) {
    return errorResponse(res, 'Cannot delete shift with assigned users', 400)
  }

  await deleteById('shift', id, 'id')

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
    findOne('shift', { id: shiftId, orgId }),
    findOne('user', { id: userId, orgId })
  ])

  if (!shift || !user) {
    return errorResponse(res, 'Shift or user not found', 404)
  }

  const updated = await update('user', userId, { shiftId }, 'id')

  return successResponse(res, 'User assigned to shift successfully', updated)
})

/**
 * Remove user from shift
 */
export const removeUserFromShift = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const orgId = req.user.orgId

  const user = await findOne('user', { id: userId, orgId })

  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  const updated = await update('user', userId, { shiftId: null }, 'id')

  return successResponse(res, 'User removed from shift successfully', updated)
})
