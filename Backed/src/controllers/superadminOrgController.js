/**
 * SuperAdmin Organization Controller
 * Handles organization management across all tenants
 */

import prisma from '../config/prisma.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * GET /api/superadmin/organizations
 * List all organizations with pagination
 */
export const getAllOrganizations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status = 'ACTIVE', search } = req.query
  const skip = (page - 1) * limit

  const where = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  }

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      include: {
        users: { select: { id: true } },
        subscription: { include: { plan: true } }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.organization.count({ where })
  ])

  const data = organizations.map(org => ({
    id: org.id,
    name: org.name,
    email: org.email,
    status: org.status,
    userCount: org.users.length,
    subscription: org.subscription ? {
      planName: org.subscription.plan.name,
      status: org.subscription.status,
      nextBillingDate: org.subscription.nextBillingDate
    } : null,
    createdAt: org.createdAt
  }))

  return successResponse(res, 'Organizations fetched', {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

/**
 * GET /api/superadmin/organizations/:id
 * Get organization details
 */
export const getOrganizationDetail = asyncHandler(async (req, res) => {
  const { id } = req.params

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      users: {
        select: { id: true, firstName: true, lastName: true, email: true, status: true }
      },
      subscription: { include: { plan: true } },
      attendances: {
        select: { id: true },
        take: 0 // Just count
      }
    }
  })

  if (!org) {
    return errorResponse(res, 'Organization not found', 404)
  }

  const detail = {
    id: org.id,
    name: org.name,
    email: org.email,
    phone: org.phone,
    address: org.address,
    industry: org.industry,
    size: org.size,
    logoUrl: org.logoUrl,
    theme: org.theme,
    status: org.status,
    userCount: org.users.length,
    admins: org.users.filter(u => u.status === 'ACTIVE'),
    subscription: org.subscription ? {
      planName: org.subscription.plan.name,
      status: org.subscription.status,
      paymentStatus: org.subscription.paymentStatus,
      startDate: org.subscription.startDate,
      nextBillingDate: org.subscription.nextBillingDate,
      price: org.subscription.plan.price
    } : null,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt
  }

  return successResponse(res, 'Organization details fetched', detail)
})

/**
 * POST /api/superadmin/organizations
 * Create new organization
 */
export const createOrganization = asyncHandler(async (req, res) => {
  const { name, email, phone, address, industry, size, logoUrl, theme, adminEmail, adminPassword, adminFirstName, adminLastName } = req.body

  // Validate required fields
  if (!name || !email) {
    return errorResponse(res, 'Name and email are required', 400)
  }

  // Check if org email already exists
  const existingOrg = await prisma.organization.findFirst({
    where: { email }
  })
  if (existingOrg) {
    return errorResponse(res, 'Organization email already exists', 400)
  }

  // Get OrgAdmin role
  const orgAdminRole = await prisma.role.findUnique({
    where: { name: 'OrgAdmin' }
  })
  if (!orgAdminRole) {
    return errorResponse(res, 'OrgAdmin role not found', 500)
  }

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name,
      email,
      phone,
      address,
      industry,
      size,
      logoUrl,
      theme,
      status: 'ACTIVE',
      createdByUserId: req.user.id
    },
    include: { subscription: true }
  })

  // Create initial admin user if provided
  let adminUser = null
  if (adminEmail && adminPassword) {
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.default.hash(adminPassword, 10)

    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: adminFirstName || 'Admin',
        lastName: adminLastName || 'User',
        password: hashedPassword,
        orgId: org.id,
        roleId: orgAdminRole.id,
        status: 'ACTIVE'
      }
    })
  }

  // Log action
  await prisma.auditLog.create({
    data: {
      action: 'CREATE_ORGANIZATION',
      resource: 'Organization',
      resourceId: org.id,
      userId: req.user.id,
      reason: `Created organization: ${name}`,
      ipAddress: req.ip
    }
  })

  return successResponse(res, 'Organization created successfully', {
    organization: {
      id: org.id,
      name: org.name,
      email: org.email,
      status: org.status
    },
    adminUser: adminUser ? {
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName
    } : null
  }, 201)
})

/**
 * PUT /api/superadmin/organizations/:id
 * Update organization
 */
export const updateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, email, phone, address, industry, size, logoUrl, theme } = req.body

  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org) {
    return errorResponse(res, 'Organization not found', 404)
  }

  // Check email uniqueness if updating
  if (email && email !== org.email) {
    const existingOrg = await prisma.organization.findFirst({
      where: { email }
    })
    if (existingOrg) {
      return errorResponse(res, 'Email already in use by another organization', 400)
    }
  }

  const updated = await prisma.organization.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(industry && { industry }),
      ...(size && { size }),
      ...(logoUrl && { logoUrl }),
      ...(theme && { theme })
    }
  })

  // Log action
  await prisma.auditLog.create({
    data: {
      action: 'UPDATE_ORGANIZATION',
      resource: 'Organization',
      resourceId: id,
      userId: req.user.id,
      reason: `Updated organization details`,
      ipAddress: req.ip
    }
  })

  return successResponse(res, 'Organization updated', updated)
})

/**
 * POST /api/superadmin/organizations/:id/suspend
 * Suspend organization
 */
export const suspendOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { reason } = req.body

  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org) {
    return errorResponse(res, 'Organization not found', 404)
  }

  if (org.status === 'SUSPENDED') {
    return errorResponse(res, 'Organization is already suspended', 400)
  }

  const suspended = await prisma.organization.update({
    where: { id },
    data: { status: 'SUSPENDED' }
  })

  // Log action
  await prisma.auditLog.create({
    data: {
      action: 'SUSPEND_ORGANIZATION',
      resource: 'Organization',
      resourceId: id,
      userId: req.user.id,
      reason: `Suspended organization: ${reason || 'No reason provided'}`,
      ipAddress: req.ip
    }
  })

  return successResponse(res, 'Organization suspended', suspended)
})

/**
 * POST /api/superadmin/organizations/:id/reactivate
 * Reactivate organization
 */
export const reactivateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params

  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org) {
    return errorResponse(res, 'Organization not found', 404)
  }

  if (org.status !== 'SUSPENDED') {
    return errorResponse(res, 'Only suspended organizations can be reactivated', 400)
  }

  const reactivated = await prisma.organization.update({
    where: { id },
    data: { status: 'ACTIVE' }
  })

  // Log action
  await prisma.auditLog.create({
    data: {
      action: 'REACTIVATE_ORGANIZATION',
      resource: 'Organization',
      resourceId: id,
      userId: req.user.id,
      reason: 'Reactivated organization',
      ipAddress: req.ip
    }
  })

  return successResponse(res, 'Organization reactivated', reactivated)
})

/**
 * DELETE /api/superadmin/organizations/:id
 * Delete organization
 */
export const deleteOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params

  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org) {
    return errorResponse(res, 'Organization not found', 404)
  }

  // Delete all related data (cascaded)
  await prisma.organization.delete({ where: { id } })

  // Log action
  await prisma.auditLog.create({
    data: {
      action: 'DELETE_ORGANIZATION',
      resource: 'Organization',
      resourceId: id,
      userId: req.user.id,
      reason: `Deleted organization: ${org.name}`,
      ipAddress: req.ip
    }
  })

  return successResponse(res, 'Organization deleted successfully')
})
