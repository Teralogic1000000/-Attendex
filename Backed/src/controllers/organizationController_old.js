import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get the organization details for the currently authenticated user.
 */
export const getOrganizationInfo = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId || req.user.organizationId;
  
  if (!orgId) {
    return errorResponse(res, 'Organization not found on user', 400);
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId }
  });

  if (!org) {
    return errorResponse(res, 'Organization not found', 404);
  }

  return successResponse(res, 'Organization fetched', {
    organization: {
      id: org.id,
      name: org.name,
      email: org.email,
      phone: org.phone,
      address: org.address,
      logoUrl: org.logoUrl,
      theme: org.theme,
      status: org.status,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt
    }
  });
});

/**
 * Update organization settings for the current user's organization.
 * Only OrgAdmin (or higher) can perform this update.
 */
export const updateOrganizationSettings = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId || req.user.organizationId;
  
  if (!orgId) {
    return errorResponse(res, 'Organization not found on user', 400);
  }

  const { name, email, phone, address, logoUrl, theme } = req.body;

  // Build update data object, ignoring undefined fields
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
  if (theme !== undefined) updateData.theme = theme;

  const updatedOrg = await prisma.organization.update({
    where: { id: orgId },
    data: updateData
  });

  return successResponse(res, 'Organization updated', {
    organization: {
      id: updatedOrg.id,
      name: updatedOrg.name,
      email: updatedOrg.email,
      phone: updatedOrg.phone,
      address: updatedOrg.address,
      logoUrl: updatedOrg.logoUrl,
      theme: updatedOrg.theme,
      status: updatedOrg.status
    }
  });
});

/**
 * Get organization statistics (users, departments, etc.)
 */
export const getOrganizationStats = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId || req.user.organizationId;
  
  if (!orgId) {
    return errorResponse(res, 'Organization not found on user', 400);
  }

  // Get user count
  const userCount = await prisma.user.count({
    where: { orgId, status: 'ACTIVE' }
  });

  // Get department count
  const departmentCount = await prisma.department.count({
    where: { orgId, status: 'Active' }
  });

  // Get shift count
  const shiftCount = await prisma.shift.count({
    where: { orgId }
  });

  // Get today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAttendance = await prisma.attendance.count({
    where: {
      orgId,
      date: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  return successResponse(res, 'Organization statistics retrieved', {
    stats: {
      totalUsers: userCount,
      totalDepartments: departmentCount,
      totalShifts: shiftCount,
      todayAttendance: todayAttendance
    }
  });
});
