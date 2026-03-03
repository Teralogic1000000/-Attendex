import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import authorizeRoles from '../Middleware/roleMiddleware.js';
import checkSubscription from '../Middleware/subscriptionMiddleware.js';
import { orgDashboard } from '../controllers/dashboardController.js';
import { orgAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(verifyToken);
router.use(checkSubscription);

router.get('/org', authorizeRoles("OrgAdmin"), orgDashboard);
router.get('/org/analytics', authorizeRoles("OrgAdmin"), orgAnalytics);

export default router;