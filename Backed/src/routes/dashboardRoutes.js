import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import { authorizeRoles } from '../Middleware/rbacMiddleware.js';

import { orgDashboard } from '../controllers/dashboardController.js';
import { orgAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(verifyToken);

// GET /dashboard/org - Organization dashboard (Org_Admin+)
router.get('/org', authorizeRoles('Super_Admin', 'Org_Admin'), orgDashboard);

// GET /dashboard/org/analytics - Organization analytics (Org_Admin+)
router.get('/org/analytics', authorizeRoles('Super_Admin', 'Org_Admin'), orgAnalytics);

export default router;