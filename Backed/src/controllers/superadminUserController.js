/**
 * SuperAdmin User Controller
 * Handles user management across all organizations
 */

import prisma from '../config/prisma.js'
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

  const where = {}
  if (status) where.status = status
  if (role) where.role = { name: role }
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        role: true,
        organization: { select: { id: true, name: true } }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        role: true,
        organization: true,
        lastLogin: true,
        createdAt: true
      }
    }),
    prisma.user.count({ where })
  ])

  return successResponse(res, 'Users fetched', {
    data: users,
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

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      organization: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true
        }
      },
      attendance: { take: 5, orderBy: { date: 'desc' } }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      position: true,
      department: true,
      status: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      organization: true,
      attendance: true
    }
  })

  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  return successResponse(res, 'User details fetched', user)
})

/**
 * POST /api/superadmin/users/:id/disable
 * Disable user
 */
export const disableUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { reason } = req.body

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  if (user.status === 'DISABLED') {
    return errorResponse(res, 'User is already disabled', 400)
  }

  const disabled = await prisma.user.update({
    where: { id },
    data: { status: 'DISABLED' }
  })

  // Log action
  await prisma.auditLog.create({
    data: {
      action: 'DISABLE_USER',
      resource: 'User',
      resourceId: id,
      userId: req.user.id,
      orgId: user.orgId,
      reason: reason || 'No reason provided',
      ipAddress: req.ip
    }
  })

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

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  if (user.status !== 'DISABLED') {
    return errorResponse(res, 'Only disabled users can be enabled', 400)
  }

  const enabled = await prisma.user.update({
    where: { id },
    data: { status: 'ACTIVE' }
  })

  // Log action
  await prisma.auditLog.create({
    data: {
      action: 'ENABLE_USER',
      resource: 'User',
      resourceId: id,
      userId: req.user.id,
      orgId: user.orgId,
      reason: 'User re-enabled',
      ipAddress: req.ip
    }
  })

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

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-12)
  const bcrypt = await import('bcryptjs')
  const hashedPassword = await bcrypt.default.hash(tempPassword, 10)

  const updated = await prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  })

  // Log action
  await prisma.auditLog.create({
    data: {
      action: 'RESET_PASSWORD',
      resource: 'User',
      resourceId: id,
      userId: req.user.id,
      orgId: user.orgId,
      reason: 'Password reset by SuperAdmin',
      ipAddress: req.ip
    }
  })

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
  const org = await prisma.organization.findUnique({ where: { id: orgId } })
  if (!org) {
    return errorResponse(res, 'Organization not found', 404)
  }

  // Check email uniqueness
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return errorResponse(res, 'Email already in use', 400)
  }

  // Get role
  const roleRecord = await prisma.role.findUnique({ where: { name: role } })
  if (!roleRecord) {
    return errorResponse(res, 'Role not found', 404)
  }

  // Hash password
  const bcrypt = await import('bcryptjs')
  const hashedPassword = await bcrypt.default.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      orgId,
      roleId: roleRecord.id,
      position,
      department,
      status: 'ACTIVE'
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      position: true,
      department: true
    }
  })

  // Log action
  await prisma.auditLog.create({
    data: {
      action: 'CREATE_USER',
      resource: 'User',
      resourceId: user.id,
      userId: req.user.id,
      orgId,
      reason: `Created user: ${email}`,
      ipAddress: req.ip
    }
  })

  return successResponse(res, 'User created successfully', user, 201)
})
