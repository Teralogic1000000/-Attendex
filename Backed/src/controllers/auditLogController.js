/**
 * Audit Log Controller
 * Manages audit trail and system logs
 */

import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get audit logs with pagination
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, action, resource, userId, orgId, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;

  const where = {};

  if (action) {
    where.action = { contains: action, mode: 'insensitive' };
  }

  if (resource) {
    where.resource = { contains: resource, mode: 'insensitive' };
  }

  if (userId) {
    where.userId = userId;
  }

  if (orgId) {
    where.orgId = orgId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: true, organization: true },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.auditLog.count({ where })
  ]);

  const enriched = logs.map(log => ({
    id: log.id,
    action: log.action,
    resource: log.resource,
    resourceId: log.resourceId,
    description: log.description,
    ipAddress: log.ipAddress,
    createdAt: log.createdAt,
    user: log.user ? { id: log.user.id, email: log.user.email, name: `${log.user.firstName} ${log.user.lastName}` } : null,
    organization: log.organization ? { id: log.organization.id, name: log.organization.name } : null
  }));

  return successResponse(res, 'Audit logs retrieved', {
    data: enriched,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get audit log by ID
 */
export const getAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const log = await prisma.auditLog.findUnique({
    where: { id },
    include: { user: true, organization: true }
  });

  if (!log) {
    return errorResponse(res, 'Audit log not found', 404);
  }

  return successResponse(res, 'Audit log details', {
    id: log.id,
    action: log.action,
    resource: log.resource,
    resourceId: log.resourceId,
    description: log.description,
    ipAddress: log.ipAddress,
    createdAt: log.createdAt,
    user: log.user ? { id: log.user.id, email: log.user.email } : null,
    organization: log.organization ? { id: log.organization.id, name: log.organization.name } : null
  });
});

/**
 * Get audit trail for specific resource
 */
export const getResourceAuditTrail = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { resourceId },
      include: { user: true },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.auditLog.count({ where: { resourceId } })
  ]);

  return successResponse(res, 'Resource audit trail', {
    resourceId,
    logs: logs.map(log => ({
      action: log.action,
      description: log.description,
      user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
      timestamp: log.createdAt
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get logs by action type
 */
export const getLogsByAction = asyncHandler(async (req, res) => {
  const { action } = req.params;
  const { page = 1, limit = 20, days = 30 } = req.query;
  const skip = (page - 1) * limit;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        action,
        createdAt: { gte: startDate }
      },
      include: { user: true },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.auditLog.count({
      where: {
        action,
        createdAt: { gte: startDate }
      }
    })
  ]);

  return successResponse(res, `Logs for action: ${action}`, {
    action,
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Create audit log (used internally)
 */
export const createAuditLog = asyncHandler(async (req, res) => {
  const { action, resource, resourceId, userId, orgId, description, ipAddress } = req.body;

  if (!action || !resource) {
    return errorResponse(res, 'Action and resource are required', 400);
  }

  const log = await prisma.auditLog.create({
    data: {
      action,
      resource,
      resourceId: resourceId || null,
      userId: userId || null,
      orgId: orgId || null,
      description: description || '',
      ipAddress: ipAddress || ''
    },
    include: { user: true }
  });

  return successResponse(res, 'Audit log created', log, 201);
});

/**
 * Get audit statistics
 */
export const getAuditStatistics = asyncHandler(async (req, res) => {
  const { days = 30, orgId } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const where = { createdAt: { gte: startDate } };
  if (orgId) {
    where.orgId = orgId;
  }

  // Get all logs in period
  const allLogs = await prisma.auditLog.findMany({
    where,
    select: { action: true, resource: true, userId: true, createdAt: true }
  });

  // Count by action
  const actionCounts = {};
  allLogs.forEach(log => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
  });

  // Count by resource
  const resourceCounts = {};
  allLogs.forEach(log => {
    resourceCounts[log.resource] = (resourceCounts[log.resource] || 0) + 1;
  });

  // Get unique users
  const uniqueUsers = new Set(allLogs.map(l => l.userId).filter(Boolean)).size;

  // Group by date
  const dailyActivity = {};
  allLogs.forEach(log => {
    const date = log.createdAt.toISOString().split('T')[0];
    dailyActivity[date] = (dailyActivity[date] || 0) + 1;
  });

  return successResponse(res, 'Audit statistics', {
    period: { days: parseInt(days), startDate: startDate.toISOString().split('T')[0] },
    summary: {
      totalLogs: allLogs.length,
      uniqueActions: Object.keys(actionCounts).length,
      uniqueResources: Object.keys(resourceCounts).length,
      activeUsers: uniqueUsers
    },
    actionBreakdown: actionCounts,
    resourceBreakdown: resourceCounts,
    dailyActivity: Object.entries(dailyActivity).map(([date, count]) => ({ date, count }))
  });
});

/**
 * Delete old audit logs
 */
export const deleteOldAuditLogs = asyncHandler(async (req, res) => {
  const { daysToKeep = 90 } = req.body;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysToKeep));

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: cutoffDate }
    }
  });

  return successResponse(res, `Audit logs older than ${daysToKeep} days deleted`, {
    deletedCount: result.count
  });
});

/**
 * Export audit logs (CSV format data)
 */
export const exportAuditLogs = asyncHandler(async (req, res) => {
  const { startDate, endDate, action, resource } = req.query;

  const where = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  if (action) where.action = action;
  if (resource) where.resource = resource;

  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: true, organization: true },
    orderBy: { createdAt: 'desc' }
  });

  // Convert to CSV format
  const headers = ['Timestamp', 'Action', 'Resource', 'Resource ID', 'User', 'Organization', 'Description', 'IP Address'];
  const rows = logs.map(log => [
    log.createdAt.toISOString(),
    log.action,
    log.resource,
    log.resourceId || '',
    log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
    log.organization?.name || '',
    log.description || '',
    log.ipAddress || ''
  ]);

  return successResponse(res, 'Audit logs exported', {
    headers,
    rows,
    count: rows.length
  });
});
