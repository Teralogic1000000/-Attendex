import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import authorizeRoles from '../Middleware/roleMiddleware.js';
import checkSubscription from '../Middleware/subscriptionMiddleware.js';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getOrgAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

router.use(verifyToken);
router.use(checkSubscription);

router.post('/checkin', authorizeRoles("Employee"), checkIn);
router.post('/checkout', authorizeRoles("Employee"), checkOut);
router.get('/me', authorizeRoles("Employee"), getMyAttendance);
router.get('/', authorizeRoles("OrgAdmin"), getOrgAttendance);

export default router;