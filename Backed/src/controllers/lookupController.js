/**
 * Lookup Tables Controller
 * Handles CRUD operations for lookup/reference tables
 */

import supabase from '../config/supabaseClient.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ============================================================================
// ATTENDANCE STATUS
// ============================================================================

/**
 * Get all attendance statuses
 */
export const getAttendanceStatuses = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('Attendance_Status')
    .select('*')
    .order('createdAt', { ascending: true });

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Attendance statuses retrieved successfully', {
    count: data?.length || 0,
    data: data || []
  });
});

/**
 * Get attendance status by ID
 */
export const getAttendanceStatusById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('Attendance_Status')
    .select('*')
    .eq('Status_ID', id)
    .single();

  if (error || !data) {
    return errorResponse(res, 'Attendance status not found', 404);
  }

  return successResponse(res, 'Attendance status retrieved successfully', data);
});

/**
 * Create new attendance status (Admin only)
 */
export const createAttendanceStatus = asyncHandler(async (req, res) => {
  const { statusName, description } = req.body;

  if (!statusName) {
    return errorResponse(res, 'Status name is required', 400);
  }

  const { data, error } = await supabase
    .from('Attendance_Status')
    .insert([{ Status_Name: statusName, Description: description }])
    .select()
    .single();

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Attendance status created successfully', data, 201);
});

/**
 * Update attendance status (Admin only)
 */
export const updateAttendanceStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { statusName, description } = req.body;

  const { data, error } = await supabase
    .from('Attendance_Status')
    .update({ Status_Name: statusName, Description: description })
    .eq('Status_ID', id)
    .select()
    .single();

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Attendance status updated successfully', data);
});

/**
 * Delete attendance status (Admin only)
 */
export const deleteAttendanceStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('Attendance_Status')
    .delete()
    .eq('Status_ID', id);

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Attendance status deleted successfully');
});

// ============================================================================
// ATTENDANCE METHOD
// ============================================================================

/**
 * Get all attendance methods
 */
export const getAttendanceMethods = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('Attendance_Method')
    .select('*')
    .order('createdAt', { ascending: true });

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Attendance methods retrieved successfully', {
    count: data?.length || 0,
    data: data || []
  });
});

/**
 * Get attendance method by ID
 */
export const getAttendanceMethodById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('Attendance_Method')
    .select('*')
    .eq('Method_ID', id)
    .single();

  if (error || !data) {
    return errorResponse(res, 'Attendance method not found', 404);
  }

  return successResponse(res, 'Attendance method retrieved successfully', data);
});

// ============================================================================
// USER TYPE
// ============================================================================

/**
 * Get all user types
 */
export const getUserTypes = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('User_Type')
    .select('*')
    .order('createdAt', { ascending: true });

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'User types retrieved successfully', {
    count: data?.length || 0,
    data: data || []
  });
});

/**
 * Get user type by ID
 */
export const getUserTypeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('User_Type')
    .select('*')
    .eq('User_Type_ID', id)
    .single();

  if (error || !data) {
    return errorResponse(res, 'User type not found', 404);
  }

  return successResponse(res, 'User type retrieved successfully', data);
});

// ============================================================================
// ORGANIZATION TYPE
// ============================================================================

/**
 * Get all organization types
 */
export const getOrgTypes = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('Org_Type')
    .select('*')
    .order('createdAt', { ascending: true });

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Organization types retrieved successfully', {
    count: data?.length || 0,
    data: data || []
  });
});

/**
 * Get organization type by ID
 */
export const getOrgTypeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('Org_Type')
    .select('*')
    .eq('Org_Type_ID', id)
    .single();

  if (error || !data) {
    return errorResponse(res, 'Organization type not found', 404);
  }

  return successResponse(res, 'Organization type retrieved successfully', data);
});

// ============================================================================
// REGION
// ============================================================================

/**
 * Get all regions
 */
export const getRegions = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('Region')
    .select('*')
    .order('createdAt', { ascending: true });

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Regions retrieved successfully', {
    count: data?.length || 0,
    data: data || []
  });
});

/**
 * Get region by ID
 */
export const getRegionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('Region')
    .select('*')
    .eq('Region_ID', id)
    .single();

  if (error || !data) {
    return errorResponse(res, 'Region not found', 404);
  }

  return successResponse(res, 'Region retrieved successfully', data);
});
