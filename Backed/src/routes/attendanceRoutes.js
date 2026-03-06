import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import authorizeRoles from '../Middleware/roleMiddleware.js';
import checkSubscription from '../Middleware/subscriptionMiddleware.js';
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
router.use(checkSubscription);

// Employee routes
router.post('/checkin', authorizeRoles("Employee"), checkIn);
router.post('/checkout', authorizeRoles("Employee"), checkOut);
router.get('/me', authorizeRoles("Employee"), getMyAttendance);

// Admin routes
router.get('/', authorizeRoles("OrgAdmin"), getAttendance);
router.get('/:id', authorizeRoles("OrgAdmin"), getAttendanceRecord);
router.post('/', authorizeRoles("OrgAdmin"), createAttendance);
router.put('/:id', authorizeRoles("OrgAdmin"), updateAttendance);
router.delete('/:id', authorizeRoles("OrgAdmin"), deleteAttendance);
router.post('/:id/approve', authorizeRoles("OrgAdmin"), approveAttendance);
router.post('/:id/reject', authorizeRoles("OrgAdmin"), rejectAttendance);

export default router;