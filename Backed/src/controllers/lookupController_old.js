/**
 * Lookup Tables Controller
 * Handles retrieval of reference data for lookups/dropdowns
 */

import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ============================================================================
// ROLES
// ============================================================================

/**
 * Get all available roles
 */
export const getRoles = asyncHandler(async (req, res) => {
  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' }
  });

  return successResponse(res, 'Roles retrieved successfully', {
    count: roles.length,
    data: roles
  });
});

/**
 * Get role by ID
 */
export const getRoleById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const role = await prisma.role.findUnique({
    where: { id }
  });

  if (!role) {
    return errorResponse(res, 'Role not found', 404);
  }

  return successResponse(res, 'Role retrieved successfully', role);
});

// ============================================================================
// ATTENDANCE STATUS (static values)
// ============================================================================

/**
 * Get all attendance statuses (static list)
 */
export const getAttendanceStatuses = asyncHandler(async (req, res) => {
  const statuses = [
    { id: 1, name: 'Present' },
    { id: 2, name: 'Absent' },
    { id: 3, name: 'Late' },
    { id: 4, name: 'On_Leave' },
    { id: 5, name: 'Pending_Approval' },
    { id: 6, name: 'Rejected' }
  ];

  return successResponse(res, 'Attendance statuses retrieved successfully', {
    count: statuses.length,
    data: statuses
  });
});

/**
 * Get attendance status by ID
 */
export const getAttendanceStatusById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const statuses = [
    { id: 1, name: 'Present' },
    { id: 2, name: 'Absent' },
    { id: 3, name: 'Late' },
    { id: 4, name: 'On_Leave' },
    { id: 5, name: 'Pending_Approval' },
    { id: 6, name: 'Rejected' }
  ];

  const status = statuses.find(s => s.id === parseInt(id));

  if (!status) {
    return errorResponse(res, 'Attendance status not found', 404);
  }

  return successResponse(res, 'Attendance status retrieved successfully', status);
});

// ============================================================================
// ATTENDANCE METHODS (static values)
// ============================================================================

/**
 * Get all attendance methods
 */
export const getAttendanceMethods = asyncHandler(async (req, res) => {
  const methods = [
    { id: 1, name: 'Face_Recognition' },
    { id: 2, name: 'Biometric' },
    { id: 3, name: 'QR_Code' },
    { id: 4, name: 'RFID' },
    { id: 5, name: 'Manual' },
    { id: 6, name: 'Mobile_App' },
    { id: 7, name: 'Geofence' }
  ];

  return successResponse(res, 'Attendance methods retrieved successfully', {
    count: methods.length,
    data: methods
  });
});

/**
 * Get attendance method by ID
 */
export const getAttendanceMethodById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const methods = [
    { id: 1, name: 'Face_Recognition' },
    { id: 2, name: 'Biometric' },
    { id: 3, name: 'QR_Code' },
    { id: 4, name: 'RFID' },
    { id: 5, name: 'Manual' },
    { id: 6, name: 'Mobile_App' },
    { id: 7, name: 'Geofence' }
  ];

  const method = methods.find(m => m.id === parseInt(id));

  if (!method) {
    return errorResponse(res, 'Attendance method not found', 404);
  }

  return successResponse(res, 'Attendance method retrieved successfully', method);
});

// ============================================================================
// DEPARTMENTS
// ============================================================================

/**
 * Get all departments for organization
 */
export const getDepartments = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;

  const departments = await prisma.department.findMany({
    where: { orgId },
    orderBy: { name: 'asc' }
  });

  return successResponse(res, 'Departments retrieved successfully', {
    count: departments.length,
    data: departments
  });
});

// ============================================================================
// SHIFTS
// ============================================================================

/**
 * Get all shifts for organization
 */
export const getShifts = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;

  const shifts = await prisma.shift.findMany({
    where: { orgId },
    orderBy: { name: 'asc' }
  });

  return successResponse(res, 'Shifts retrieved successfully', {
    count: shifts.length,
    data: shifts
  });
});

// ============================================================================
// USER STATUSES (static values)
// ============================================================================

/**
 * Get all user status options
 */
export const getUserStatuses = asyncHandler(async (req, res) => {
  const statuses = [
    { id: 1, name: 'ACTIVE' },
    { id: 2, name: 'DISABLED' },
    { id: 3, name: 'DELETED' }
  ];

  return successResponse(res, 'User statuses retrieved successfully', {
    count: statuses.length,
    data: statuses
  });
});

// ============================================================================
// ORGANIZATION STATUSES (static values)
// ============================================================================

/**
 * Get all organization status options
 */
export const getOrganizationStatuses = asyncHandler(async (req, res) => {
  const statuses = [
    { id: 1, name: 'Active' },
    { id: 2, name: 'Inactive' }
  ];

  return successResponse(res, 'Organization statuses retrieved successfully', {
    count: statuses.length,
    data: statuses
  });
});
