# Quick Reference Card - Subscription System

## 🎯 Core Concepts (30 seconds)

```
┌─ BASIC PLAN (Free)
│  └─ 5 users | $0/month | Core features
│
├─ STANDARD PLAN ($15/month)
│  └─ 10 users | Advanced reporting
│
└─ PRO PLAN ($30/month)
   └─ 999 users | Export, API, Analytics
```

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `subscriptionPlans.js` | Plan definitions & features |
| `planMiddleware.js` | Access control middleware |
| `subscriptionController.js` | 6 subscription endpoints |
| `authController.js` | Registration creates Basic plan |
| `userController.js` | Create users with limits |

---

## 📍 API Endpoints at a Glance

### Auth
```
POST /api/auth/register  → Creates org + user + Basic plan
POST /api/auth/login      → Returns subscription info
POST /api/auth/logout     → Invalidates token
```

### Subscriptions
```
GET  /api/subscriptions/current       → Get user's plan
GET  /api/subscriptions/plans         → List all plans
POST /api/subscriptions/upgrade       → Upgrade plan
GET  /api/subscriptions/can-add-users → Check user slots
GET  /api/subscriptions/feature-access → Check feature
GET  /api/subscriptions/analytics    → Usage stats
```

---

## 🛡️ Protecting Endpoints

### All protected routes
```javascript
router.get('/any-endpoint',
  verifyToken,
  checkSubscriptionActive,  // ← Required
  yourController
);
```

### Enforce user limit when creating users
```javascript
router.post('/users',
  verifyToken,
  checkSubscriptionActive,
  checkUserLimit,  // ← Returns 403 if full
  createUserController
);
```

### Pro-only features (e.g., export)
```javascript
router.post('/export',
  verifyToken,
  checkSubscriptionActive,
  requireFeature('export'),  // ← Pro only
  exportController
);
```

### Specific plans required
```javascript
router.get('/premium-report',
  verifyToken,
  checkSubscriptionActive,
  requirePlan('Standard', 'Pro'),  // ← Standard+ only
  reportController
);
```

---

## 🔌 Middleware Cheat Sheet

| Middleware | What it does | Returns on failure |
|-----------|-------------|-------------------|
| `verifyToken` | Validates JWT | 401 Unauthorized |
| `checkSubscriptionActive` | Ensures ACTIVE & not expired | 403 Forbidden |
| `checkUserLimit` | Blocks if user limit reached | 403 Forbidden |
| `requireFeature('name')` | Blocks if feature not in plan | 403 Forbidden |
| `requirePlan('X', 'Y')` | Blocks if wrong plan | 403 Forbidden |

---

## 📊 Feature Matrix

|  | Basic | Standard | Pro |
|-----|:-----:|:--------:|:---:|
| Users | 5 | 10 | 999 |
| Analytics | ✗ | ✗ | ✓ |
| Export | ✗ | ✗ | ✓ |
| Custom Roles | ✗ | ✗ | ✓ |
| API Access | ✗ | ✗ | ✓ |
| Price | Free | $15 | $30 |

---

## 💻 Code Examples

### Check subscription in controller
```javascript
export const myController = asyncHandler(async (req, res) => {
  const sub = req.subscription;  // Set by middleware
  console.log(sub.plan.name);    // 'Basic', 'Standard', or 'Pro'
  console.log(sub.plan.maxUsers); // 5, 10, or 999
});
```

### Get subscription details from DB
```javascript
const sub = await prisma.organizationSubscription.findUnique({
  where: { orgId: req.user.orgId },
  include: { plan: true }
});
```

### Check feature in controller
```javascript
const canExport = sub.plan.name === 'Pro';
if (!canExport) {
  return errorResponse(res, 'Upgrade to Pro', 403);
}
```

---

## 🐛 Common Issues & Fixes

### "User limit reached" error when should be allowed
- **Cause:** Didn't pass `checkUserLimit` middleware
- **Fix:** Add `checkUserLimit` before controller

### Feature access returns 403
- **Cause:** User not on correct plan
- **Fix:** Check plan name: use `requireFeature()` for automatic checks

### "Subscription not found"
- **Cause:** Organization wasn't created with subscription
- **Fix:** Verify registration creates subscription; reseed database

### Token expired during session
- **Cause:** Access token only valid 15 minutes
- **Fix:** Call `POST /api/auth/refresh` with refresh token

---

## 🧪 Testing Commands

```bash
# Register new org (gets Basic plan)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@test.com",
    "password":"pass123",
    "orgName":"Test Corp"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

# Get current subscription
curl -X GET http://localhost:3000/api/subscriptions/current \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check if can add user
curl "http://localhost:3000/api/subscriptions/can-add-users?count=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check feature access
curl "http://localhost:3000/api/subscriptions/feature-access?feature=export" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Try to upgrade
curl -X POST http://localhost:3000/api/subscriptions/upgrade \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId":"pro"}'
```

---

## 📚 Documentation Files

| File | Contains |
|------|----------|
| `SUBSCRIPTION_SYSTEM.md` | Complete API reference |
| `INTEGRATION_GUIDE.md` | How to integrate into routes |
| `IMPLEMENTATION_SUMMARY.md` | What was built & fixed |
| `ARCHITECTURE_DIAGRAMS.md` | System design & flows |

---

## ⚙️ Subscription States

```
Possible values for subscription.status:
├─ ACTIVE    → Can use all features
├─ EXPIRED   → Downgraded to Basic
├─ CANCELLED → User cancelled
└─ PENDING   → Waiting for payment
```

---

## 🚀 Deployment Checklist

- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed database: `npx prisma db seed`
- [ ] Verify roles created (SuperAdmin, OrgAdmin, Employee)
- [ ] Verify plans created (Basic, Standard, Pro)
- [ ] Test registration creates Basic plan
- [ ] Test login returns subscription info
- [ ] Test user limit on Basic plan
- [ ] Test feature access check for Pro
- [ ] Test plan upgrade
- [ ] Verify JWT tokens working
- [ ] Set JWT_SECRET in .env
- [ ] Set JWT_REFRESH_SECRET in .env
- [ ] Test with frontend app

---

## 🔐 Security Notes

✓ Passwords hashed with bcrypt  
✓ Tokens stored securely (refresh token in DB)  
✓ Features protected with middleware  
✓ User limits enforced at DB level  
✓ Subscription expiration checked on every request  
✓ Role-based access control implemented  

---

## 📞 Support

For detailed help:
1. Check `SUBSCRIPTION_SYSTEM.md` for full API docs
2. Check `INTEGRATION_GUIDE.md` for setup help
3. Check `ARCHITECTURE_DIAGRAMS.md` for system design
4. Check `IMPLEMENTATION_SUMMARY.md` for code changes

---

## Constants Reference

```javascript
// In subscriptionPlans.js
SUBSCRIPTION_PLANS.BASIC    → name:'Basic', maxUsers:5, price:0
SUBSCRIPTION_PLANS.STANDARD → name:'Standard', maxUsers:10, price:15
SUBSCRIPTION_PLANS.PRO      → name:'Pro', maxUsers:999, price:30

SUBSCRIPTION_STATUS.ACTIVE
SUBSCRIPTION_STATUS.EXPIRED
SUBSCRIPTION_STATUS.CANCELLED
SUBSCRIPTION_STATUS.PENDING

FEATURE_ACCESS['PRO']['export']
FEATURE_ACCESS['PRO']['analytics']
FEATURE_ACCESS['PRO']['customRoles']
FEATURE_ACCESS['PRO']['apiAccess']
```

---

**Version:** 1.0  
**Last Updated:** February 28, 2026  
**Status:** ✅ Ready for Integration
