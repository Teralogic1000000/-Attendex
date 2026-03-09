import supabase from '../config/supabaseClient.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { update } from '../config/supabaseMapper.js'
import { successResponse, errorResponse } from '../utils/response.js'

/**
 * Get the organization details for the currently authenticated user.
 * Uses organization_full_view for readable data (type and region names)
 */
export const getOrganizationInfo = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId || req.user.organizationId
  if (!orgId) {
    return errorResponse(res, 'Organization not found on user', 400)
  }

  // Use organization_full_view for readable data
  const { data: org, error } = await supabase
    .from('organization_full_view')
    .select('*')
    .eq('Org_ID', orgId)
    .single()

  if (error || !org) {
    return errorResponse(res, 'Organization not found', 404)
  }

  return successResponse(res, 'Organization fetched', {
    organization: org
  })
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

  // Build update data object, ignoring undefined fields
  const updateData = {}
  if (name !== undefined) updateData.name = name
  if (email !== undefined) updateData.email = email
  if (phone !== undefined) updateData.phoneNum = phone
  if (address !== undefined) updateData.address = address
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl
  if (theme !== undefined) updateData.theme = theme

  const { data: updatedOrg, error } = await supabase
    .from('Organization')
    .update(updateData)
    .eq('id', orgId)
    .select()
    .single()

  if (error) {
    return errorResponse(res, error.message, 400)
  }

  return successResponse(res, 'Organization updated', {
    organization: {
      id: updatedOrg.id,
      name: updatedOrg.name,
      email: updatedOrg.email,
      phone: updatedOrg.phone,
      address: updatedOrg.address,
      logoUrl: updatedOrg.logoUrl,
      theme: updatedOrg.theme,
    },
  })
})
