# Subscription System Integration Guide

This guide explains how to integrate subscription checks into your existing routes.

## Quick Start

### 1. Basic Subscription Check
All authenticated users automatically get subscription checks:

```javascript
import verifyToken from '../Middleware/authMiddleware.js';
import { checkSubscriptionActive } from '../Middleware/planMiddleware.js';

router.get('/protected-feature',
  verifyToken,
  checkSubscriptionActive,  // Ensures subscription is ACTIVE and not expired
  yourController
);
```

### 2. User Limit Check
When creating new users:

```javascript
import { checkUserLimit } from '../Middleware/planMiddleware.js';

router.post('/users',
  verifyToken,
  checkSubscriptionActive,
  checkUserLimit,  // Returns 403 if limit exceeded
  createUserController
);
```

## Feature-Based Access Control

### Analytics (Pro Only)
```javascript
import { requireFeature } from '../Middleware/planMiddleware.js';

// In attendanceRoutes.js
router.get('/analytics',
  verifyToken,
  requireFeature('analytics'),
  getAnalyticsController
);
```

### Export Feature (Pro Only)
```javascript
// In attendanceRoutes.js
router.post('/export',
  verifyToken,
  requireFeature('export'),
  exportToCSV
);

router.post('/export-excel',
  verifyToken,
  requireFeature('export'),
  exportToExcel
);
```

### Custom Roles (Pro Only)
```javascript
// In userRoutes.js
router.post('/roles',
  verifyToken,
  authorizeRoles('OrgAdmin'),
  requireFeature('customRoles'),
  createCustomRoleController
);
```

### API Access (Pro Only)
```javascript
// In apiRoutes.js (new file)
import { requirePlan } from '../Middleware/planMiddleware.js';

router.use('/api/v1',
  verifyToken,
  requirePlan('Pro'),
  apiV1Routes
);
```

## Plan-Based Restrictions

### Only Standard+ Plans
```javascript
import { requirePlan } from '../Middleware/planMiddleware.js';

router.get('/reports',
  verifyToken,
  requirePlan('Standard', 'Pro'),
  generateReportController
);
```

### Multiple Plan Requirements
```javascript
router.post('/backup',
  verifyToken,
  requirePlan('Standard', 'Pro'),  // Both Standard and Pro have this feature
  backupDataController
);
```

## Checking Subscription in Controllers

### Get user's current subscription info
```javascript
export const getSomeData = asyncHandler(async (req, res) => {
  const subscription = await prisma.organizationSubscription.findUnique({
    where: { orgId: req.user.orgId },
    include: { plan: true }
  });

  // subscription.plan.name === 'Basic' | 'Standard' | 'Pro'
  // subscription.plan.maxUsers === number
  // subscription.status === 'ACTIVE' | 'EXPIRED' | etc
  
  // Return data based on plan
  const canExport = subscription.plan.name === 'Pro';
});
```

### Check user count before adding
```javascript
export const createUser = asyncHandler(async (req, res) => {
  // checkUserLimit middleware already checked this, but you can verify:
  const org = req.user.orgId;
  const subscription = await prisma.organizationSubscription.findUnique({
    where: { orgId: org },
    include: { plan: true }
  });

  const userCount = await prisma.user.count({
    where: { orgId: org }
  });

  if (userCount >= subscription.plan.maxUsers) {
    return errorResponse(res, 'User limit reached', 403);
  }

  // Create user...
});
```

## Example: Complete Route Setup

### attendanceRoutes.js
```javascript
import express from 'express';
import verifyToken from '../Middleware/authMiddleware.js';
import { 
  checkSubscriptionActive, 
  requireFeature,
  requirePlan 
} from '../Middleware/planMiddleware.js';
import {
  checkIn,
  checkOut,
  getAttendance,
  getAnalytics,
  exportToCSV
} from '../controllers/attendanceController.js';

const router = express.Router();

// Basic attendance - all plans
router.post('/check-in',
  verifyToken,
  checkSubscriptionActive,
  checkIn
);

router.post('/check-out',
  verifyToken,
  checkSubscriptionActive,
  checkOut
);

// View attendance - all plans
router.get('/',
  verifyToken,
  checkSubscriptionActive,
  getAttendance
);

// Analytics - Pro only
router.get('/analytics',
  verifyToken,
  checkSubscriptionActive,
  requireFeature('analytics'),
  getAnalytics
);

// Export - Pro only
router.post('/export',
  verifyToken,
  checkSubscriptionActive,
  requireFeature('export'),
  exportToCSV
);

export default router;
```

## Subscription Info in Responses

### Attach subscription status to all responses:
```javascript
export const getSomeData = asyncHandler(async (req, res) => {
  const subscription = req.subscription || 
    await prisma.organizationSubscription.findUnique({
      where: { orgId: req.user.orgId },
      include: { plan: true }
    });

  return successResponse(res, 'Data retrieved', {
    data: {...},
    subscription: {
      plan: subscription.plan.name,
      maxUsers: subscription.plan.maxUsers,
      daysRemaining: Math.ceil(
        (new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)
      ),
      canAddUsers: userCount < subscription.plan.maxUsers
    }
  });
});
```

## Frontend Integration

### Check if user can perform action
```javascript
// In your frontend API calls:

const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(newUser)
});

if (response.status === 403) {
  const error = await response.json();
  // Shows: "User limit reached. Your plan allows maximum 10 users..."
  alert(error.message);
  // Suggest upgrade
}
```

### Display available features
```javascript
// Check feature access:
const response = await fetch('/api/subscriptions/feature-access?feature=export', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data } = await response.json();
if (!data.hasAccess) {
  // Hide export button, show "Upgrade to Pro" message
  disableExportButton();
  showUpgradePrompt();
}
```

### Show subscription in UI
```javascript
// Get subscription info on login:
const response = await fetch('/api/subscriptions/current', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data: subscription } = await response.json();

// Display: "Pro Plan • 25/999 users • 30 days remaining"
displaySubscriptionBadge(subscription);
```

## Testing the System

### Test user limit:
```bash
# Create organization (Basic = 5 users max)
POST /api/auth/register
{...}

# Try to create 6 users - 6th should fail with 403
POST /api/users (x6)
```

### Test feature access:
```bash
# Login with Standard plan
POST /api/auth/login

# Try to access Pro feature - should fail
GET /api/subscriptions/feature-access?feature=export
# Response: 403 "Feature requires higher plan"
```

### Test subscription expiration:
```bash
# In database, manually set endDate to past date
UPDATE organization_subscription SET end_date = NOW() - INTERVAL 1 DAY;

# Try to access protected route - should fail
GET /api/users
# Response: 403 "Subscription has expired"
```

## Common Patterns

### Dashboard Routes
```javascript
// All need subscription check
router.get('/dashboard', verifyToken, checkSubscriptionActive, dashboardController);
```

### Admin Routes
```javascript
// Admin actions need subscription check + admin role
router.delete('/user/:id', 
  verifyToken, 
  authorizeRoles('OrgAdmin'),
  checkSubscriptionActive,
  deleteUserController
);
```

### Premium Features
```javascript
// Premium features need specific plan
router.post('/schedule-report',
  verifyToken,
  checkSubscriptionActive,
  requirePlan('Standard', 'Pro'),
  scheduleReportController
);
```

## Troubleshooting

### "Subscription not found" error
- Ensure organization subscription is created during registration
- Check that planId references valid plan
- Verify organization exists

### "User limit reached" still appears after upgrade
- Refresh user's access token (call `/api/auth/refresh`)
- Middleware caches subscription info; new login required to refresh
- Check database to confirm plan update

### Export button disabled but user has Pro
- Verify feature name is exact: 'export' not 'Export'
- Check subscription status isn't EXPIRED
- Ensure check happens after login

---

For complete API documentation, see `SUBSCRIPTION_SYSTEM.md`
