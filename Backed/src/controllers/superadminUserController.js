/**
 * SuperAdmin User Controller
 * Handles user management across all organizations
 */

import { findMany, findOne, count, update, create, deleteById } from '../config/supabaseMapper.js'
import bcrypt from 'bcrypt'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * GET /api/superadmin/users
 * List all users with pagination
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status = 'ACTIVE', role, search } = req.query
  const skip = (page - 1) * limit

  // Fetch all users with client-side filtering
  const allUsers = await findMany('user', {}, { limit: 100000 })
  let filtered = allUsers

  if (status) {
    filtered = filtered.filter(u => u.status === status)
  }
  if (role) {
    filtered = filtered.filter(u => u.userTypeId === parseInt(role))
  }
  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(u =>
      u.firstName?.toLowerCase().includes(searchLower) ||
      u.surname?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower)
    )
  }

  const total = filtered.length
  const users = filtered.slice(skip, skip + parseInt(limit))

  // Enrich with organization details
  const enriched = await Promise.all(
    users.map(async (user) => {
      const [org, userType] = await Promise.all([
        findOne('organization', { id: user.orgId }),
        findOne('user_type', { id: user.userTypeId })
      ])

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.surname,
        email: user.email,
        status: user.status,
        userType: userType?.typeName || 'Unknown',
        organization: org ? { id: org.id, name: org.orgName } : null,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    })
  )

  return successResponse(res, 'Users fetched', {
    data: enriched,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

/**
 * GET /api/superadmin/users/:id
 * Get user details
 */
export const getUserDetail = asyncHandler(async (req, res) => {
  const { id } = req.params

  const user = await findOne('user', { id })

  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  // Fetch related data
  const [org, userType, recentAttendances] = await Promise.all([
    findOne('organization', { id: user.orgId }),
    findOne('user_type', { id: user.userTypeId }),
    findMany('attendance', { userId: id }, { limit: 5 })
  ])

  const userDetail = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.surname,
    email: user.email,
    phone: user.phoneNum,
    position: user.position,
    department: user.department,
    status: user.status,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    userType: userType?.typeName || 'Unknown',
    organization: org ? {
      id: org.id,
      name: org.orgName,
      email: org.email,
      status: org.status
    } : null,
    attendance: recentAttendances
  }

  return successResponse(res, 'User details fetched', userDetail)
})

/**
 * POST /api/superadmin/users/:id/disable
 * Disable user
 */
export const disableUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { reason } = req.body

  const user = await findOne('user', { id })
  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  if (user.status === 'DISABLED') {
    return errorResponse(res, 'User is already disabled', 400)
  }

  const disabled = await update('user', id, { status: 'DISABLED' })

  // Log action
  await create('audit_log', {
    action: 'DISABLE_USER',
    resource: 'User',
    resourceId: id,
    userId: req.user.id,
    orgId: user.orgId,
    reason: reason || 'No reason provided',
    ipAddress: req.ip
  }).catch(err => console.warn('Audit log creation failed:', err))

  return successResponse(res, 'User disabled', {
    id: disabled.id,
    email: disabled.email,
    status: disabled.status
  })
})

/**
 * POST /api/superadmin/users/:id/enable
 * Enable user
 */
export const enableUser = asyncHandler(async (req, res) => {
  const { id } = req.params

  const user = await findOne('user', { id })
  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  if (user.status !== 'DISABLED') {
    return errorResponse(res, 'Only disabled users can be enabled', 400)
  }

  const enabled = await update('user', id, { status: 'ACTIVE' })

  // Log action
  await create('audit_log', {
    action: 'ENABLE_USER',
    resource: 'User',
    resourceId: id,
    userId: req.user.id,
    orgId: user.orgId,
    reason: 'User re-enabled',
    ipAddress: req.ip
  }).catch(err => console.warn('Audit log creation failed:', err))

  return successResponse(res, 'User enabled', {
    id: enabled.id,
    email: enabled.email,
    status: enabled.status
  })
})

/**
 * POST /api/superadmin/users/:id/reset-password
 * Reset user password (SuperAdmin generated temporary password)
 */
export const resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params

  const user = await findOne('user', { id })
  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-12)
  const hashedPassword = await bcrypt.hash(tempPassword, 10)

  const updated = await update('user', id, { password: hashedPassword })

  // Log action
  await create('audit_log', {
    action: 'RESET_PASSWORD',
    resource: 'User',
    resourceId: id,
    userId: req.user.id,
    orgId: user.orgId,
    reason: 'Password reset by SuperAdmin',
    ipAddress: req.ip
  }).catch(err => console.warn('Audit log creation failed:', err))

  return successResponse(res, 'Password reset successfully', {
    email: updated.email,
    tempPassword, // Should be sent via email in production
    message: 'Temporary password has been generated. User should change it on next login.'
  })
})

/**
 * POST /api/superadmin/users/:orgId
 * Create user in specific organization
 */
export const createUserInOrg = asyncHandler(async (req, res) => {
  const { orgId } = req.params
  const { firstName, lastName, email, password, role, position, department } = req.body

  // Validate required fields
  if (!firstName || !lastName || !email || !password || !role) {
    return errorResponse(res, 'First name, last name, email, password, and role are required', 400)
  }

  // Check org exists
  const org = await findOne('organization', { id: orgId })
  if (!org) {
    return errorResponse(res, 'Organization not found', 404)
  }

  // Check email uniqueness
  const existingUser = await findOne('user', { email })
  if (existingUser) {
    return errorResponse(res, 'Email already in use', 400)
  }

  // Get user type by name (assuming role is passed as type name)
  const userType = await findOne('user_type', { typeName: role })
  if (!userType) {
    return errorResponse(res, 'User type not found', 404)
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await create('user', {
    firstName,
    surname: lastName,
    email,
    password: hashedPassword,
    orgId,
    userTypeId: userType.id,
    position,
    department,
    status: 'ACTIVE'
  })

  // Log action
  await create('audit_log', {
    action: 'CREATE_USER',
    resource: 'User',
    resourceId: user.id,
    userId: req.user.id,
    orgId,
    reason: `Created user: ${email}`,
    ipAddress: req.ip
  }).catch(err => console.warn('Audit log creation failed:', err))

  return successResponse(res, 'User created successfully', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.surname,
    email: user.email,
    userType: role,
    position: user.position,
    department: user.department
  }, 201)
})
