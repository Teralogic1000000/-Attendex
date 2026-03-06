import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import authorizeRoles from '../Middleware/roleMiddleware.js';
import checkSubscription from '../Middleware/subscriptionMiddleware.js';
import {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentsController.js';

const router = express.Router();

router.use(verifyToken);
router.use(checkSubscription);
router.use(authorizeRoles("OrgAdmin")); // All department operations require OrgAdmin

router.post('/', createDepartment);
router.get('/', getDepartments);
router.get('/:id', getDepartment);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
