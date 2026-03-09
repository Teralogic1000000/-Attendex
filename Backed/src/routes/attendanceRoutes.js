import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import { authorizeRoles, checkPermission } from '../Middleware/rbacMiddleware.js';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getOrgAttendance,
  getAttendance,
  getAttendanceRecord,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  approveAttendance,
  rejectAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

router.use(verifyToken);

/**
 * EMPLOYEE OPERATIONS
 * Employees, Contractors, and Interns can check in/out and view their own records
 */

// POST /attendance/checkin
// Check in to mark presence (Employee, Contractor, Intern)
router.post('/checkin', 
  authorizeRoles('Super_Admin', 'Org_Admin', 'Employee', 'Contractor', 'Intern'),
  checkIn
);

// POST /attendance/checkout
// Check out to end shift (Employee, Contractor, Intern)
router.post('/checkout',
  authorizeRoles('Super_Admin', 'Org_Admin', 'Employee', 'Contractor', 'Intern'),
  checkOut
);

// GET /attendance/me
// Get own attendance records (All authenticated users)
router.get('/me', getMyAttendance);

/**
 * ADMIN OPERATIONS
 * Org_Admin and Super_Admin can view/manage organization attendance
 */

// GET /attendance
// List organization attendance records (Super_Admin: all, Org_Admin: own org)
router.get('/', 
  authorizeRoles('Super_Admin', 'Org_Admin'),
  getAttendance
);

// GET /attendance/:id
// Get specific attendance record (Org_Admin+)
router.get('/:id',
  authorizeRoles('Super_Admin', 'Org_Admin'),
  getAttendanceRecord
);

// POST /attendance
// Create attendance record (Org_Admin+)
router.post('/',
  authorizeRoles('Super_Admin', 'Org_Admin'),
  createAttendance
);

// PUT /attendance/:id
// Update attendance record (Org_Admin+)
router.put('/:id',
  authorizeRoles('Super_Admin', 'Org_Admin'),
  updateAttendance
);

// DELETE /attendance/:id
// Delete attendance record (Super_Admin only)
router.delete('/:id',
  authorizeRoles('Super_Admin'),
  deleteAttendance
);

/**
 * APPROVAL OPERATIONS
 * Managers and Org_Admin can approve/reject attendance
 */

// POST /attendance/:id/approve
// Approve attendance record (Manager, Org_Admin, Super_Admin)
router.post('/:id/approve',
  authorizeRoles('Super_Admin', 'Org_Admin', 'Manager'),
  approveAttendance
);

// POST /attendance/:id/reject
// Reject attendance record (Manager, Org_Admin, Super_Admin)
router.post('/:id/reject',
  authorizeRoles('Super_Admin', 'Org_Admin', 'Manager'),
  rejectAttendance
);

export default router;