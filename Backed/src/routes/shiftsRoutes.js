import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import authorizeRoles from '../Middleware/roleMiddleware.js';
import checkSubscription from '../Middleware/subscriptionMiddleware.js';
import {
  createShift,
  getShifts,
  getShift,
  updateShift,
  deleteShift,
  assignUserToShift,
  removeUserFromShift
} from '../controllers/shiftsController.js';

const router = express.Router();

router.use(verifyToken);
router.use(checkSubscription);
router.use(authorizeRoles("OrgAdmin")); // All shift operations require OrgAdmin

router.post('/', createShift);
router.get('/', getShifts);
router.get('/:id', getShift);
router.put('/:id', updateShift);
router.delete('/:id', deleteShift);

// Assign/remove users to/from shifts
router.post('/:shiftId/employees/:userId', assignUserToShift);
router.delete('/:shiftId/employees/:userId', removeUserFromShift);

export default router;
