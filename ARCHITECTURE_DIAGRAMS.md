# Subscription System Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATION                       │
├─────────────────────────────────────────────────────────────────┤
│  • Web APP / Mobile App / Third-party integrations               │
│  • Sends JWT token with requests                                 │
└────────────────────────────────────────────────────────────────┬┘
                                                                   │
                    HTTP/REST Requests                             │
                                                                   ▼
┌────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS SERVER                            │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Routes Layer:                                                   │
│  ├─ /api/auth (authRoutes.js)                                   │
│  │  ├─ POST /register                                           │
│  │  ├─ POST /login                                              │
│  │  ├─ POST /refresh                                            │
│  │  └─ POST /logout                                             │
│  │                                                              │
│  ├─ /api/subscriptions (subscriptionRoutes.js)                  │
│  │  ├─ GET /current                                             │
│  │  ├─ GET /plans                                               │
│  │  ├─ POST /upgrade                                            │
│  │  ├─ GET /can-add-users                                       │
│  │  ├─ GET /feature-access                                      │
│  │  └─ GET /analytics                                           │
│  │                                                              │
│  ├─ /api/users (userRoutes.js)                                  │
│  │  ├─ POST / (checkUserLimit middleware)                       │
│  │  ├─ GET /                                                    │
│  │  ├─ GET /:id                                                 │
│  │  ├─ PUT /:id                                                 │
│  │  ├─ DELETE /:id                                              │
│  │  ├─ PUT /:id/password                                        │
│  │  └─ GET /stats/overview                                      │
│  │                                                              │
│  └─ /api/attendance (attendanceRoutes.js)                       │
│     ├─ GET / (basic - all plans)                                │
│     ├─ POST /check-in (basic - all plans)                       │
│     ├─ POST /check-out (basic - all plans)                      │
│     ├─ GET /analytics (PRO only - requireFeature)               │
│     └─ POST /export (PRO only - requireFeature)                │
│                                                                  │
│                                                                  │
│  Middleware Stack (executed in order):                           │
│  1. verifyToken()              - ✓ JWT validation               │
│  2. checkSubscriptionActive()  - ✓ Active & not expired         │
│  3. checkUserLimit()           - ✓ User capacity (if creating)  │
│  4. requireFeature()           - ✓ Feature access check         │
│  5. requirePlan()              - ✓ Plan validation              │
│  6. authorizeRoles()           - ✓ RBAC check                   │
│                                                                  │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                    Prisma ORM    │ SQL Queries
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                          │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tables:                                                         │
│  ├─ organizations                                               │
│  │  ├─ id, name, email, phone, createdAt                       │
│  │  └─ Relation: subscription, users, attendances              │
│  │                                                              │
│  ├─ users                                                       │
│  │  ├─ id, firstName, lastName, email, password, orgId, roleId │
│  │  ├─ refreshToken, createdAt                                 │
│  │  └─ Relation: organization, role, attendance                │
│  │                                                              │
│  ├─ roles                                                       │
│  │  ├─ id, name                                                │
│  │  └─ Relation: users                                          │
│  │                                                              │
│  ├─ attendance                                                  │
│  │  ├─ id, date, checkIn, checkOut, totalHours, userId, orgId  │
│  │  └─ Relation: user, organization                             │
│  │                                                              │
│  ├─ subscription_plans                                          │
│  │  ├─ id, name, maxUsers, price, duration, features           │
│  │  └─ Relation: subscriptions                                  │
│  │                                                              │
│  └─ organization_subscriptions                                  │
│     ├─ id, orgId (UNIQUE), planId, startDate, endDate, status  │
│     └─ Relation: organization, plan                             │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## Subscription Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              NEW USER REGISTRATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/auth/register                                        │
│  ├─ Validate input (firstName, lastName, email, password)       │
│  ├─ Hash password (bcrypt)                                      │
│  ├─ Create Organization                                         │
│  ├─ Create User                                                 │
│  ├─ Assign OrgAdmin role                                        │
│  ├─ Create Subscription with BASIC plan                         │
│  │  ├─ maxUsers: 5                                              │
│  │  ├─ price: $0                                                │
│  │  ├─ duration: 30 days                                        │
│  │  └─ status: ACTIVE                                           │
│  ├─ Generate JWT tokens                                         │
│  │  ├─ accessToken (15m expiry)                                 │
│  │  └─ refreshToken (7d expiry)                                 │
│  └─ Store refreshToken in database                              │
│                                                                  │
│  Response: User + Subscription + Tokens                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              PLAN UPGRADE FLOW                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/subscriptions/upgrade (planId='pro')                │
│  ├─ Get target plan (Pro: 999 users, $30)                       │
│  ├─ Get current subscription (Basic: 5 users, $0)               │
│  ├─ Validate upgrade (prevent downgrade)                        │
│  ├─ Calculate proration                                         │
│  │  └─ Amount = (newPrice - oldPrice) × (daysRemaining/30)     │
│  ├─ Update subscription                                         │
│  │  ├─ planId: pro                                              │
│  │  ├─ startDate: today                                         │
│  │  ├─ endDate: today + 30 days                                 │
│  │  └─ status: ACTIVE                                           │
│  └─ Response: Confirmation + Prorated amount                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              PROTECTED ENDPOINT FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Request: GET /api/users                                        │
│  ├─ Middleware: verifyToken()                                   │
│  │  ├─ Parse JWT                                                │
│  │  ├─ Validate signature                                       │
│  │  ├─ Check expiry (15m)                                       │
│  │  └─ Set req.user                                             │
│  │                                                              │
│  ├─ Middleware: checkSubscriptionActive()                       │
│  │  ├─ Get subscription from DB                                 │
│  │  ├─ Check status == ACTIVE                                   │
│  │  ├─ Check endDate > now()                                    │
│  │  └─ Set req.subscription                                     │
│  │                                                              │
│  ├─ Middleware: authorizeRoles('OrgAdmin')                      │
│  │  └─ Check user.role == 'OrgAdmin'                            │
│  │                                                              │
│  └─ Controller: getUsers()                                      │
│     ├─ Query database using orgId                               │
│     ├─ Apply pagination                                         │
│     └─ Return user list                                         │
│                                                                  │
│  Response: { users: [...], pagination: {...} }                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              FEATURE-PROTECTED ENDPOINT FLOW                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Request: POST /api/attendance/export                           │
│  ├─ Middleware: verifyToken()                                   │
│  │  └─ ✓ User authenticated                                     │
│  │                                                              │
│  ├─ Middleware: checkSubscriptionActive()                       │
│  │  └─ ✓ Subscription active & not expired                      │
│  │                                                              │
│  ├─ Middleware: requireFeature('export')                        │
│  │  ├─ Get subscription plan from DB                            │
│  │  ├─ Check FEATURE_ACCESS[planName]['export']                 │
│  │  │  ├─ Basic: false  ✗ DENY                                  │
│  │  │  ├─ Standard: false ✗ DENY                                │
│  │  │  └─ Pro: true ✓ ALLOW                                     │
│  │  └─ If denied → 403 error response                           │
│  │                                                              │
│  └─ Controller: exportToCSV() (only if Pro plan)                │
│     └─ Generate and return CSV file                             │
│                                                                  │
│  Response (Pro user): CSV file attachment                       │
│  Response (Basic/Standard): 403 Forbidden                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              CREATE USER WITH LIMIT FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/users (create new user)                              │
│  ├─ Middleware: verifyToken()                                   │
│  │  └─ ✓ User authenticated                                     │
│  │                                                              │
│  ├─ Middleware: checkSubscriptionActive()                       │
│  │  └─ ✓ Subscription active                                    │
│  │                                                              │
│  ├─ Middleware: checkUserLimit()                                │
│  │  ├─ Get subscription with plan details                       │
│  │  ├─ Count users in organization                              │
│  │  │  ├─ Basic plan: Count = 5/5 → userCount >= maxUsers       │
│  │  │  │  └─ ✗ DENY (403) + "User limit reached"               │
│  │  │  ├─ Standard plan: Count = 8/10 → can add 2 more          │
│  │  │  │  └─ ✓ ALLOW                                            │
│  │  │  └─ Pro plan: Count = 50/999 → can add 949 more           │
│  │  │     └─ ✓ ALLOW                                            │
│  │  └─ Set req.userSlotsRemaining                               │
│  │                                                              │
│  └─ Controller: createUser()                                    │
│     ├─ Validate input (firstName, lastName, email, password)    │
│     ├─ Check email doesn't exist                                │
│     ├─ Hash password                                            │
│     ├─ Create user in DB                                        │
│     └─ Return created user                                      │
│                                                                  │
│  Response (Limited plan, at limit): 403 "User limit reached"    │
│  Response (Available slots): 201 Created with user details      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Plan Transition Flow

```
User Journey:

                     ┌──────────────────┐
                     │ Non-subscriber   │
                     │   (No Account)   │
                     └────────┬─────────┘
                              │
                    POST /api/auth/register
                              │
                              ▼
                     ┌──────────────────┐
                     │   BASIC PLAN     │
                     │  (5 users, $0)   │
                     │   30-day trial   │
                     │    ACTIVE        │
                     └────────┬─────────┘
                              │
                              │ Manual: POST /subscriptions/upgrade
                              │ Automatic: subscription expires
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
         ┌──────────────────┐    ┌──────────────────┐
         │  STANDARD PLAN   │    │   PLAN EXPIRED   │
         │ (10 users, $15)  │    │    (Downgrade    │
         │ Billed monthly   │    │   to Basic)      │
         │    ACTIVE        │    │                  │
         └────────┬─────────┘    └──────────────────┘
                  │
                  │ Manual: POST /subscriptions/upgrade
                  │
                  ▼
         ┌──────────────────┐
         │   PRO PLAN       │
         │(999 users, $30)  │
         │ Billed monthly   │
         │    ACTIVE        │
         └──────────────────┘


Subscription States:

    ACTIVE ──(time passes)──> EXPIRED
       │                         │
       │                         │
       └──(manual cancel)──> CANCELLED
```

---

## Feature Access Decision Tree

```
User requests feature (e.g., /api/attendance/analytics)
│
├─ Authentication Check (verifyToken)
│  ├─ ✓ Valid JWT
│  └─ ✗ Invalid/Missing JWT → 401 Unauthorized
│
├─ Subscription Check (checkSubscriptionActive)
│  ├─ ✓ Subscription exists & ACTIVE & not expired
│  └─ ✗ Expired/Missing/Cancelled → 403 Forbidden
│
├─ Feature Access Check (requireFeature('analytics'))
│  │
│  └─ Get subscription plan
│     │
│     ├─ Plan: Basic
│     │  └─ FEATURE_ACCESS['BASIC']['analytics'] = false
│     │     └─ ✗ Return 403 "Upgrade to Standard or Pro"
│     │
│     ├─ Plan: Standard
│     │  └─ FEATURE_ACCESS['STANDARD']['analytics'] = false
│     │     └─ ✗ Return 403 "Upgrade to Pro"
│     │
│     └─ Plan: Pro
│        └─ FEATURE_ACCESS['PRO']['analytics'] = true
│           └─ ✓ Continue to controller
│
└─ Controller (getAnalytics)
   └─ Process request and return data
```

---

## Middleware Execution Order

```
Request comes in:

1. Express app
   ↓
2. body parser
   ↓
3. CORS middleware
   ↓
4. Route matching (/api/users)
   ↓
5. verifyToken ────────────────────────── Logs: "Token validated"
   ├─ Parses JWT
   ├─ Validates signature
   ├─ Checks expiry
   └─ Sets req.user
   ↓
6. checkSubscriptionActive ────────────── Logs: "Subscription checked"
   ├─ Gets subscription from DB
   ├─ Checks if ACTIVE
   ├─ Checks if not expired
   └─ Sets req.subscription
   ↓
7. checkUserLimit (if POST /users) ────── Logs: "User capacity checked"
   ├─ Counts users
   ├─ Compares to plan limit
   └─ Sets req.userSlotsRemaining
   ↓
8. authorizeRoles('OrgAdmin') ────────── Logs: "Role verified"
   ├─ Checks user.role
   └─ Returns 403 if not authorized
   ↓
9. Controller function ────────────────── Logs: "Processing request"
   ├─ Reads req.user
   ├─ Reads req.subscription
   ├─ Reads req.userSlotsRemaining
   └─ Executes business logic
   ↓
10. Response generation
    ├─ Create response object
    ├─ Serialize to JSON
    └─ Send to client
```

---

## Usage Analytics Dashboard Example

```
Top-level Summary:
┌────────────────────────────────────────────────┐
│  Plan: Pro  |  Status: Active  |  30 days left │
└────────────────────────────────────────────────┘

User Capacity:
┌────────────────────────────────────────────────┐
│ Current: 25/999 users (2.5% usage)             │
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
│ ✓ No warning (< 80%)                           │
└────────────────────────────────────────────────┘

Attendance Data:
┌────────────────────────────────────────────────┐
│ Total attendance records: 1,250                │
└────────────────────────────────────────────────┘

Available Features:
┌────────────────────────────────────────────────┐
│ ✓ Advanced Analytics                           │
│ ✓ CSV/Excel Export                             │
│ ✓ Custom Roles                                 │
│ ✓ API Access                                   │
│ ✓ Priority Support                             │
└────────────────────────────────────────────────┘

Subscription Timeline:
┌────────────────────────────────────────────────┐
│ Started: Feb 28, 2026                          │
│ Expires: Mar 30, 2026                          │
│ Days Remaining: 30                             │
└────────────────────────────────────────────────┘
```

---

## Error Response Flow

```
┌─ Request hits middleware
│
├─ Error occurs (user limit exceeded)
│  │
│  └─ Middleware catches error
│     │
│     ├─ Logs error details
│     │
│     ├─ Formats error response
│     │  {
│     │    "success": false,
│     │    "message": "User limit reached..."
│     │  }
│     │
│     └─ Returns specific HTTP status
│        ├─ 400: Bad Request (validation)
│        ├─ 401: Unauthorized (invalid token)
│        ├─ 403: Forbidden (permission/subscription)
│        └─ 500: Server Error (unhandled)
│
└─ Client receives error and handles UI accordingly
   ├─ Show error message
   ├─ Suggest upgrade
   └─ Disable related features
```

This architecture ensures clean separation of concerns, proper error handling, and comprehensive access control based on subscription tiers.
