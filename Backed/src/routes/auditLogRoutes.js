import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import authorizeRoles from '../Middleware/roleMiddleware.js';
import {
  getAuditLogs,
  getAuditLogById,
  getRecordAuditTrail,
  getLogsByAction,
  createAuditLog,
  getAuditStatistics,
  deleteOldAuditLogs
} from '../controllers/auditLogController.js';

const router = express.Router();

router.use(verifyToken);

/**
 * GET /api/audit-logs
 * Get all audit logs with pagination
 * Query: page?, limit?, action?, tableName?, startDate?, endDate?
 * Only SuperAdmin and OrgAdmin can view
 */
router.get('/', authorizeRoles('Org_Admin', 'Super_Admin'), getAuditLogs);

/**
 * GET /api/audit-logs/:id
 * Get specific audit log entry
 */
router.get('/:id', authorizeRoles('Org_Admin', 'Super_Admin'), getAuditLogById);

/**
 * GET /api/audit-logs/search/record
 * Get all audit entries for a specific record
 * Query: tableName, recordId
 */
router.get('/search/record', authorizeRoles('Org_Admin', 'Super_Admin'), getRecordAuditTrail);

/**
 * GET /api/audit-logs/search/action
 * Get audit logs filtered by action type
 * Query: action, page?, limit?
 */
router.get('/search/action', authorizeRoles('Org_Admin', 'Super_Admin'), getLogsByAction);

/**
 * GET /api/audit-logs/stats/summary
 * Get audit statistics and summaries
 * Query: startDate?, endDate?
 */
router.get('/stats/summary', authorizeRoles('Org_Admin', 'Super_Admin'), getAuditStatistics);

/**
 * POST /api/audit-logs
 * Create new audit log entry
 * Body: { action, tableName, recordId?, oldData?, newData?, ipAddress? }
 * Internal use - typically called by application logic
 */
router.post('/', createAuditLog);

/**
 * DELETE /api/audit-logs/cleanup/old
 * Delete audit logs older than specified date
 * Body: { beforeDate: ISO date string }
 * SuperAdmin only
 */
router.delete('/cleanup/old', authorizeRoles('Super_Admin'), deleteOldAuditLogs);

export default router;
