# Subscription Tier System Documentation

## Overview

The Attendex subscription system implements three-tier monetization with feature restrictions based on organization plans. This document covers the architecture, tiers, API endpoints, and implementation details.

---

## Subscription Tiers

### 🟢 Basic Plan (FREE - Default)

**Target Audience:** Testing & small teams

- **Max Users:** 5 team members
- **Price:** $0/month
- **Features:**
  - Limited features
  - Core system access
  - Basic team support
  - Standard 30-day trial

**Best for:** Individual users, small testing, evaluation period

---

### 🔵 Standard Plan

**Target Audience:** Small growing teams

- **Max Users:** 10 team members
- **Price:** $15/month
- **Features:**
  - Up to 10 team members
  - Advanced reporting dashboard
  - More dashboard features
  - Better customer support
  - 100GB storage

**Best for:** Small to medium teams with growing needs

---

### 🟣 Pro Plan

**Target Audience:** Enterprise & large organizations

- **Max Users:** 999 team members
- **Price:** $30/month
- **Features:**
  - Unlimited team members (up to 999)
  - Advanced analytics & insights
  - Export to CSV/Excel
  - Custom role management
  - Full API access
  - Priority 24/7 support
  - Unlimited storage

**Best for:** Large enterprises and power users

---

## Feature Access Matrix

| Feature | Basic | Standard | Pro |
|---------|-------|----------|-----|
| Core System | ✅ | ✅ | ✅ |
| Analytics | ❌ | ❌ | ✅ |
| Export (CSV/Excel) | ❌ | ❌ | ✅ |
| Custom Roles | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |
| Max Users | 5 | 10 | 999 |

---

## Database Schema

### Models

#### SubscriptionPlan
```prisma
model SubscriptionPlan {
  id          String   @id @default(uuid())
  name        String   @unique
  maxUsers    Int
  price       Float
  duration    Int                         // days
  features    String[]
  subscriptions OrganizationSubscription[]
}
```

#### OrganizationSubscription
```prisma
model OrganizationSubscription {
  id          String   @id @default(uuid())
  orgId       String   @unique
  planId      String
  startDate   DateTime @default(now())
  endDate     DateTime
  status      String   @default("ACTIVE")
  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  plan        SubscriptionPlan @relation(fields: [planId], references: [id])
}
```

---

## API Endpoints

### Authentication Routes

#### Register New Organization
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "orgName": "Acme Corporation"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user-123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "OrgAdmin",
      "orgId": "org-456"
    },
    "subscription": {
      "plan": "Basic",
      "maxUsers": 5,
      "startDate": "2026-02-28T00:00:00Z",
      "endDate": "2026-03-30T00:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

---

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "OrgAdmin",
      "orgId": "org-456"
    },
    "subscription": {
      "plan": "Pro",
      "maxUsers": 999,
      "status": "ACTIVE",
      "endDate": "2026-03-30T00:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

---

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Subscription Routes

#### Get Current Subscription
```http
GET /api/subscriptions/current
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription retrieved",
  "data": {
    "id": "sub-789",
    "plan": {
      "name": "Pro",
      "maxUsers": 999,
      "price": 30,
      "features": [...]
    },
    "startDate": "2026-02-28T00:00:00Z",
    "endDate": "2026-03-30T00:00:00Z",
    "status": "ACTIVE",
    "isExpired": false,
    "userCount": 25,
    "daysRemaining": 30
  }
}
```

---

#### Get All Available Plans
```http
GET /api/subscriptions/plans
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Plans retrieved",
  "data": [
    {
      "id": "basic",
      "name": "Basic",
      "maxUsers": 5,
      "price": 0,
      "duration": 30,
      "features": ["Limited features", "Core system access", ...]
    },
    {
      "id": "standard",
      "name": "Standard",
      "maxUsers": 10,
      "price": 15,
      "duration": 30,
      "features": [...]
    },
    {
      "id": "pro",
      "name": "Pro",
      "maxUsers": 999,
      "price": 30,
      "duration": 30,
      "features": [...]
    }
  ]
}
```

---

#### Upgrade Subscription Plan
```http
POST /api/subscriptions/upgrade
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "planId": "pro"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Plan upgraded successfully",
  "data": {
    "plan": {
      "name": "Pro",
      "maxUsers": 999,
      "price": 30
    },
    "startDate": "2026-02-28T00:00:00Z",
    "endDate": "2026-03-30T00:00:00Z",
    "proratedAmount": 5.50,
    "message": "Upgrade complete. Total cost: $5.50"
  }
}
```

---

#### Check User Addition Capacity
```http
GET /api/subscriptions/can-add-users?count=3
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User capacity check complete",
  "data": {
    "canAdd": true,
    "currentUserCount": 7,
    "maxUsers": 10,
    "availableSlots": 3,
    "requestedCount": 3,
    "message": "You can add 3 more users"
  }
}
```

**Response (403) - If limit exceeded:**
```json
{
  "success": false,
  "message": "User limit reached. Your plan allows maximum 10 users. Upgrade to add more."
}
```

---

#### Check Feature Access
```http
GET /api/subscriptions/feature-access?feature=export
Authorization: Bearer <accessToken>
```

**Supported Features:**
- `analytics` - Advanced analytics access
- `export` - CSV/Excel export capability
- `customRoles` - Custom role management
- `apiAccess` - API access
- `prioritySupport` - Priority support

**Response (200):**
```json
{
  "success": true,
  "message": "Feature access check complete",
  "data": {
    "feature": "export",
    "hasAccess": true,
    "plan": "Pro",
    "message": "Feature \"export\" is available in your plan"
  }
}
```

**Response (403) - Feature not available:**
```json
{
  "success": false,
  "message": "Feature \"analytics\" requires a higher plan"
}
```

---

#### Get Usage Analytics
```http
GET /api/subscriptions/analytics
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Usage analytics retrieved",
  "data": {
    "plan": "Pro",
    "users": {
      "current": 25,
      "max": 999,
      "usagePercent": 2.5,
      "warning": false
    },
    "attendance": {
      "total": 1250
    },
    "subscription": {
      "startDate": "2026-02-28T00:00:00Z",
      "endDate": "2026-03-30T00:00:00Z",
      "daysRemaining": 30,
      "isExpired": false
    },
    "features": {
      "analytics": true,
      "export": true,
      "customRoles": true,
      "apiAccess": true
    }
  }
}
```

---

### User Management Routes

#### Create User
```http
POST /api/users
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "secure_password",
  "roleId": "role-emp"
}
```

**Note:** This endpoint includes `checkUserLimit` middleware that returns 403 if user limit is exceeded.

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user-234",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "role": "Employee"
  }
}
```

---

#### Get All Users
```http
GET /api/users?page=1&limit=10
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "id": "user-123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "OrgAdmin",
        "createdAt": "2026-02-28T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false
    }
  }
}
```

---

#### Get User Stats
```http
GET /api/users/stats/overview
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User statistics retrieved",
  "data": {
    "totalUsers": 25,
    "usersByRole": [
      { "role": "OrgAdmin", "count": 1 },
      { "role": "Employee", "count": 24 }
    ]
  }
}
```

---

## Middleware Usage

### Check Subscription Active
Ensures subscription is active and not expired.

```javascript
import { checkSubscriptionActive } from '../Middleware/planMiddleware.js';

router.get('/protected', verifyToken, checkSubscriptionActive, controller);
```

---

### Check User Limit
Ensures organization hasn't exceeded user limit before creating new users.

```javascript
import { checkUserLimit } from '../Middleware/planMiddleware.js';

router.post('/users', verifyToken, checkUserLimit, createUser);
```

---

### Require Feature
Factory pattern to protect features based on subscription plan.

```javascript
import { requireFeature } from '../Middleware/planMiddleware.js';

// Only allow Pro plan users to access analytics
router.get('/analytics', verifyToken, requireFeature('analytics'), analyticsController);

// Only allow Pro plan users to export
router.post('/export', verifyToken, requireFeature('export'), exportController);
```

---

### Require Specific Plans
Restrict endpoint access to specific plans.

```javascript
import { requirePlan } from '../Middleware/planMiddleware.js';

// Only Standard and Pro plans
router.get('/reports', verifyToken, requirePlan('Standard', 'Pro'), reportController);

// Only Pro plan
router.get('/api-docs', verifyToken, requirePlan('Pro'), apiDocsController);
```

---

## Implementation Examples

### Protecting Analytics Feature (Pro only)

```javascript
// In attendanceRoutes.js
import { requireFeature } from '../Middleware/planMiddleware.js';

router.get('/analytics', 
  verifyToken, 
  requireFeature('analytics'), 
  analyticsController
);
```

### Protecting Export Feature (Pro only)

```javascript
// In attendanceRoutes.js
router.post('/export', 
  verifyToken, 
  requireFeature('export'), 
  exportController
);
```

### Protecting API Access (Pro only)

```javascript
// In apiRoutes.js
import { requirePlan } from '../Middleware/planMiddleware.js';

router.use('/api/v1', 
  verifyToken, 
  requirePlan('Pro'),
  apiV1Routes
);
```

---

## Database Initialization

### Running Seed Script

The subscription plans are initialized via the seed script:

```bash
npm run seed
# or
npx prisma db seed
```

**Plans created:**
- Basic (free, 5 users)
- Standard ($15/month, 10 users)
- Pro ($30/month, 999 users)

### Manual Seeding (if needed)

```bash
npx prisma db push
npx prisma db seed
```

---

## Subscription Status Lifecycle

```
ACTIVE → EXPIRED (after endDate)
       ↓
       CANCELLED (manual cancellation)
       ↓
       PENDING (awaiting payment)
```

### Status Definitions

- **ACTIVE:** Subscription is valid and all features are accessible
- **EXPIRED:** Subscription has passed its end date; basic features only
- **CANCELLED:** Organization cancelled subscription
- **PENDING:** Payment pending; awaiting confirmation

---

## Error Handling

### Subscription Expired
```json
{
  "success": false,
  "message": "Subscription has expired. Please renew your subscription."
}
```

### User Limit Exceeded
```json
{
  "success": false,
  "message": "User limit reached. Your plan allows maximum 10 users. Upgrade to add more."
}
```

### Feature Not Available
```json
{
  "success": false,
  "message": "Feature \"analytics\" is not available in Standard plan. Upgrade your plan for access."
}
```

### Invalid Plan
```json
{
  "success": false,
  "message": "Plan not found"
}
```

---

## Constants Reference

### SUBSCRIPTION_STATUS
```javascript
{
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING'
}
```

### PLAN_IDS
```javascript
{
  BASIC: 'basic',
  STANDARD: 'standard',
  PRO: 'pro'
}
```

### FEATURE_ACCESS
```javascript
{
  BASIC: {
    maxUsers: 5,
    analytics: false,
    export: false,
    customRoles: false,
    apiAccess: false,
    prioritySupport: false
  },
  STANDARD: {
    maxUsers: 10,
    analytics: false,
    export: false,
    customRoles: false,
    apiAccess: false,
    prioritySupport: false
  },
  PRO: {
    maxUsers: 999,
    analytics: true,
    export: true,
    customRoles: true,
    apiAccess: true,
    prioritySupport: true
  }
}
```

---

## Integration Checklist

- [x] Database schema (Prisma)
- [x] Subscription plans constants
- [x] Subscription controller with 6 endpoints
- [x] Subscription routes
- [x] Plan middleware (4 types)
- [x] Auth controller with token management
- [x] User controller with limits
- [x] Seed script with plans
- [x] Documentation

## Next Steps for Full Implementation

1. **Payment Processing:**
   - Integrate Stripe/PayPal for payments
   - Create payment webhook handlers
   - Implement renewal automation

2. **Admin Dashboard:**
   - Subscription management interface
   - Plan upgrade UI
   - Usage analytics dashboard

3. **Notifications:**
   - Subscription expiration alerts
   - Plan limit warning emails
   - Upgrade recommendations

4. **Reporting:**
   - Download subscription history
   - Usage reports
   - Billing statements

---

## Support

For questions or issues with the subscription system, please refer to this documentation or contact support.
