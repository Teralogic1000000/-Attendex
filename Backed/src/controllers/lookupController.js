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

/**
 * Create new attendance status (Admin only)
 */
export const createAttendanceStatus = asyncHandler(async (req, res) => {
  const { statusName, description } = req.body;

  if (!statusName) {
    return errorResponse(res, 'Status name is required', 400);
  }

  // For now, we just return the created status (static in memory)
  const newStatus = {
    id: Math.floor(Math.random() * 10000),
    name: statusName,
    description: description
  };

  return successResponse(res, 'Attendance status created successfully', newStatus, 201);
});

/**
 * Update attendance status (Admin only)
 */
export const updateAttendanceStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { statusName, description } = req.body;

  const updatedStatus = {
    id: parseInt(id),
    name: statusName,
    description: description
  };

  return successResponse(res, 'Attendance status updated successfully', updatedStatus);
});

/**
 * Delete attendance status (Admin only)
 */
export const deleteAttendanceStatus = asyncHandler(async (req, res) => {
  return successResponse(res, 'Attendance status deleted successfully');
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
// USER TYPES (static values - for compatibility)
// ============================================================================

/**
 * Get all user types
 */
export const getUserTypes = asyncHandler(async (req, res) => {
  const types = [
    { id: 1, name: 'Super_Admin' },
    { id: 2, name: 'Org_Admin' },
    { id: 3, name: 'Manager' },
    { id: 4, name: 'Employee' }
  ];

  return successResponse(res, 'User types retrieved successfully', {
    count: types.length,
    data: types
  });
});

/**
 * Get user type by ID
 */
export const getUserTypeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const types = [
    { id: 1, name: 'Super_Admin' },
    { id: 2, name: 'Org_Admin' },
    { id: 3, name: 'Manager' },
    { id: 4, name: 'Employee' }
  ];

  const type = types.find(t => t.id === parseInt(id));

  if (!type) {
    return errorResponse(res, 'User type not found', 404);
  }

  return successResponse(res, 'User type retrieved successfully', type);
});

// ============================================================================
// ORG TYPES (placeholder - for compatibility)
// ============================================================================

/**
 * Get all organization types
 */
export const getOrgTypes = asyncHandler(async (req, res) => {
  const types = [
    { id: 1, name: 'Private' },
    { id: 2, name: 'Public' },
    { id: 3, name: 'Government' }
  ];

  return successResponse(res, 'Organization types retrieved successfully', {
    count: types.length,
    data: types
  });
});

/**
 * Get org type by ID
 */
export const getOrgTypeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const types = [
    { id: 1, name: 'Private' },
    { id: 2, name: 'Public' },
    { id: 3, name: 'Government' }
  ];

  const type = types.find(t => t.id === parseInt(id));

  if (!type) {
    return errorResponse(res, 'Organization type not found', 404);
  }

  return successResponse(res, 'Organization type retrieved successfully', type);
});

// ============================================================================
// REGIONS (placeholder - for compatibility)
// ============================================================================

/**
 * Get all regions
 */
export const getRegions = asyncHandler(async (req, res) => {
  const regions = [
    { id: 1, name: 'North' },
    { id: 2, name: 'South' },
    { id: 3, name: 'East' },
    { id: 4, name: 'West' }
  ];

  return successResponse(res, 'Regions retrieved successfully', {
    count: regions.length,
    data: regions
  });
});

/**
 * Get region by ID
 */
export const getRegionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const regions = [
    { id: 1, name: 'North' },
    { id: 2, name: 'South' },
    { id: 3, name: 'East' },
    { id: 4, name: 'West' }
  ];

  const region = regions.find(r => r.id === parseInt(id));

  if (!region) {
    return errorResponse(res, 'Region not found', 404);
  }

  return successResponse(res, 'Region retrieved successfully', region);
});
