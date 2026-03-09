/**
 * SuperAdmin Organization Controller
 * Handles organization management across all tenants
 */

import prisma from '../config/prisma.js'
import { successResponse, errorResponse } from '../utils/response.js'
import bcrypt from 'bcrypt'

/**
 * GET /api/superadmin/organizations
 * List all organizations with pagination
 */
export const getAllOrganizations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'ACTIVE', search } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Build where clause
    const where = {}
    if (status) {
      where.status = status
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch total count
    const total = await prisma.organization.count({ where })

    // Fetch organizations with pagination and relationships
    const organizations = await prisma.organization.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          select: { id: true }
        },
        subscription: {
          include: {
            plan: true
          }
        }
      }
    })

    // Format response
    const formatted = organizations.map(org => ({
      id: org.id,
      name: org.name,
      email: org.email,
      phone: org.phone,
      address: org.address,
      industry: org.industry,
      size: org.size,
      logoUrl: org.logoUrl,
      status: org.status,
      userCount: org.users.length,
      subscription: org.subscription ? {
        planName: org.subscription.plan?.name || 'Unknown',
        status: org.subscription.status,
        startDate: org.subscription.startDate,
        endDate: org.subscription.endDate
      } : null,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt
    }))

    return successResponse(res, 'Organizations fetched successfully', {
      data: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error in getAllOrganizations:', error)
    return errorResponse(res, `Failed to fetch organizations: ${error.message}`, 500)
  }
}

/**
 * GET /api/superadmin/organizations/:id
 * Get organization details
 */
export const getOrganizationDetail = async (req, res) => {
  try {
    const { id } = req.params

    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: true,
        subscription: {
          include: {
            plan: true
          }
        },
        attendances: {
          take: 1,
          orderBy: { createdAt: 'desc' }
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
        planName: org.subscription.plan?.name || 'Unknown',
        status: org.subscription.status,
        startDate: org.subscription.startDate,
        endDate: org.subscription.endDate
      } : null,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt
    }

    return successResponse(res, 'Organization details fetched', detail)
  } catch (error) {
    console.error('Error in getOrganizationDetail:', error)
    return errorResponse(res, `Failed to fetch organization: ${error.message}`, 500)
  }
}

/**
 * POST /api/superadmin/organizations
 * Create new organization
 */
export const createOrganization = async (req, res) => {
  try {
    const { name, email, phone, address, industry, size, logoUrl, theme } = req.body

    // Validate required fields
    if (!name || !email) {
      return errorResponse(res, 'Name and email are required', 400)
    }

    // Check if org email already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { email }
    })
    if (existingOrg) {
      return errorResponse(res, 'Organization email already exists', 400)
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
        createdByUserId: req.user?.id
      }
    })

    return successResponse(res, 'Organization created successfully', {
      organization: {
        id: org.id,
        name: org.name,
        email: org.email,
        status: org.status
      }
    }, 201)
  } catch (error) {
    console.error('Error in createOrganization:', error)
    return errorResponse(res, `Failed to create organization: ${error.message}`, 500)
  }
}

/**
 * PUT /api/superadmin/organizations/:id
 * Update organization
 */
export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, address, industry, size, logoUrl, theme, status } = req.body

    const org = await prisma.organization.findUnique({
      where: { id }
    })
    if (!org) {
      return errorResponse(res, 'Organization not found', 404)
    }

    // Check email uniqueness if updating
    if (email && email !== org.email) {
      const existingOrg = await prisma.organization.findUnique({
        where: { email }
      })
      if (existingOrg) {
        return errorResponse(res, 'Email already in use by another organization', 400)
      }
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: {
        name: name || org.name,
        email: email || org.email,
        phone: phone !== undefined ? phone : org.phone,
        address: address !== undefined ? address : org.address,
        industry: industry !== undefined ? industry : org.industry,
        size: size !== undefined ? size : org.size,
        logoUrl: logoUrl !== undefined ? logoUrl : org.logoUrl,
        theme: theme !== undefined ? theme : org.theme,
        status: status !== undefined ? status : org.status
      }
    })

    return successResponse(res, 'Organization updated successfully', {
      organization: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        status: updated.status
      }
    })
  } catch (error) {
    console.error('Error in updateOrganization:', error)
    return errorResponse(res, `Failed to update organization: ${error.message}`, 500)
  }
}

/**
 * POST /api/superadmin/organizations/:id/suspend
 * Suspend organization
 */
export const suspendOrganization = async (req, res) => {
  try {
    const { id } = req.params

    const org = await prisma.organization.findUnique({
      where: { id }
    })
    if (!org) {
      return errorResponse(res, 'Organization not found', 404)
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: { status: 'SUSPENDED' }
    })

    return successResponse(res, 'Organization suspended successfully', {
      organization: { id: updated.id, status: updated.status }
    })
  } catch (error) {
    console.error('Error in suspendOrganization:', error)
    return errorResponse(res, `Failed to suspend organization: ${error.message}`, 500)
  }
}

/**
 * POST /api/superadmin/organizations/:id/reactivate
 * Reactivate organization
 */
export const reactivateOrganization = async (req, res) => {
  try {
    const { id } = req.params

    const org = await prisma.organization.findUnique({
      where: { id }
    })
    if (!org) {
      return errorResponse(res, 'Organization not found', 404)
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: { status: 'ACTIVE' }
    })

    return successResponse(res, 'Organization reactivated successfully', {
      organization: { id: updated.id, status: updated.status }
    })
  } catch (error) {
    console.error('Error in reactivateOrganization:', error)
    return errorResponse(res, `Failed to reactivate organization: ${error.message}`, 500)
  }
}

/**
 * DELETE /api/superadmin/organizations/:id
 * Delete organization
 */
export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params

    const org = await prisma.organization.findUnique({
      where: { id }
    })
    if (!org) {
      return errorResponse(res, 'Organization not found', 404)
    }

    await prisma.organization.delete({
      where: { id }
    })

    return successResponse(res, 'Organization deleted successfully', {
      organization: { id, deleted: true }
    })
  } catch (error) {
    console.error('Error in deleteOrganization:', error)
    return errorResponse(res, `Failed to delete organization: ${error.message}`, 500)
  }
}


