/**
 * Audit Log Controller
 * Handles retrieval and management of audit logs
 */

import supabase from '../config/supabaseClient.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get all audit logs with pagination
 * Query: page?, limit?, action?, tableName?, startDate?, endDate?
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  const { action, tableName, startDate, endDate } = req.query;

  let query = supabase.from('AuditLog').select('*', { count: 'exact' });

  // Apply filters
  if (action) {
    query = query.eq('Action', action);
  }
  if (tableName) {
    query = query.eq('Table_Name', tableName);
  }
  if (startDate) {
    query = query.gte('createdAt', startDate);
  }
  if (endDate) {
    query = query.lte('createdAt', endDate);
  }

  const { data, error, count } = await query
    .order('createdAt', { ascending: false })
    .range(skip, skip + limit - 1);

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Audit logs retrieved successfully', {
    count: count || 0,
    page,
    limit,
    data: data || []
  });
});

/**
 * Get audit log by ID
 */
export const getAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('AuditLog')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return errorResponse(res, 'Audit log not found', 404);
  }

  return successResponse(res, 'Audit log retrieved successfully', data);
});

/**
 * Get audit logs for a specific record
 * Query: tableName, recordId
 */
export const getRecordAuditTrail = asyncHandler(async (req, res) => {
  const { tableName, recordId } = req.query;

  if (!tableName || !recordId) {
    return errorResponse(res, 'Table name and record ID are required', 400);
  }

  const { data, error } = await supabase
    .from('AuditLog')
    .select('*')
    .eq('Table_Name', tableName)
    .eq('Record_ID', recordId)
    .order('createdAt', { ascending: false });

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Audit trail retrieved successfully', {
    count: data?.length || 0,
    tableName,
    recordId,
    data: data || []
  });
});

/**
 * Get audit logs by action type
 * Query: action, page?, limit?
 */
export const getLogsByAction = asyncHandler(async (req, res) => {
  const { action } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  if (!action) {
    return errorResponse(res, 'Action type is required', 400);
  }

  const { data, error, count } = await supabase
    .from('AuditLog')
    .select('*', { count: 'exact' })
    .eq('Action', action)
    .order('createdAt', { ascending: false })
    .range(skip, skip + limit - 1);

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Audit logs retrieved successfully', {
    action,
    count: count || 0,
    page,
    limit,
    data: data || []
  });
});

/**
 * Create audit log entry
 * Internal use only - called by application logic
 */
export const createAuditLog = asyncHandler(async (req, res) => {
  const { action, tableName, recordId, oldData, newData, ipAddress, userId } = req.body;

  if (!action || !tableName) {
    return errorResponse(res, 'Action and table name are required', 400);
  }

  const { data, error } = await supabase
    .from('AuditLog')
    .insert([{
      Action: action,
      Table_Name: tableName,
      Record_ID: recordId,
      Old_Data: oldData || null,
      New_Data: newData || null,
      IP_Address: ipAddress,
      userId: userId,
      createdAt: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Audit log created successfully', data, 201);
});

/**
 * Get audit statistics
 * Returns count by action, table, and user
 */
export const getAuditStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let query = supabase.from('AuditLog').select('*');

  if (startDate) {
    query = query.gte('createdAt', startDate);
  }
  if (endDate) {
    query = query.lte('createdAt', endDate);
  }

  const { data, error } = await query;

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  // Calculate statistics
  const stats = {
    totalLogs: data?.length || 0,
    byAction: {},
    byTable: {},
    byUser: {}
  };

  data?.forEach(log => {
    // Count by action
    stats.byAction[log.Action] = (stats.byAction[log.Action] || 0) + 1;
    // Count by table
    stats.byTable[log.Table_Name] = (stats.byTable[log.Table_Name] || 0) + 1;
    // Count by user
    if (log.userId) {
      stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1;
    }
  });

  return successResponse(res, 'Audit statistics retrieved successfully', stats);
});

/**
 * Delete old audit logs (by date) - Admin only
 */
export const deleteOldAuditLogs = asyncHandler(async (req, res) => {
  const { beforeDate } = req.body;

  if (!beforeDate) {
    return errorResponse(res, 'Before date is required', 400);
  }

  const { error, data } = await supabase
    .from('AuditLog')
    .delete()
    .lt('createdAt', beforeDate);

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Old audit logs deleted successfully');
});
