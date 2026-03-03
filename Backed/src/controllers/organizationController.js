import { asyncHandler } from '../utils/asyncHandler.js'
import prisma from '../config/prisma.js'
import { successResponse, errorResponse } from '../utils/response.js'

/**
 * Get the organization details for the currently authenticated user.
 * OrgAdmins and employees can fetch their own org info.
 */
export const getOrganizationInfo = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId || req.user.organizationId
  if (!orgId) {
    return errorResponse(res, 'Organization not found on user', 400)
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      logoUrl: true,
      theme: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!org) {
    return errorResponse(res, 'Organization not found', 404)
  }

  return successResponse(res, 'Organization fetched', { organization: org })
})

/**
 * Update organization settings for the current user's organization.
 * Only OrgAdmin (or higher) can perform this update.
 */
export const updateOrganizationSettings = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId || req.user.organizationId
  if (!orgId) {
    return errorResponse(res, 'Organization not found on user', 400)
  }

  const { name, email, phone, address, logoUrl, theme } = req.body

  // build update data object, ignoring undefined fields
  const updateData = {}
  if (name !== undefined) updateData.name = name
  if (email !== undefined) updateData.email = email
  if (phone !== undefined) updateData.phone = phone
  if (address !== undefined) updateData.address = address
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl
  if (theme !== undefined) updateData.theme = theme

  const updatedOrg = await prisma.organization.update({
    where: { id: orgId },
    data: updateData,
  })

  return successResponse(res, 'Organization updated', { organization: updatedOrg })
})
