# Complete API Testing Guide - All Endpoints

## 🚀 Server Setup

First, make sure the server is running:

```bash
cd C:\Users\emmanuel\Desktop\TrackTimi\Attendex\Backed
npm start
# Server should run on http://localhost:3000
```

---

## 📋 Test Scenarios (In Order)

Complete these in sequence for a full system test.

---

## 1️⃣ AUTHENTICATION ENDPOINTS

### 1.1 Register New Organization

**Endpoint:** `POST /api/auth/register`

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "orgName": "Acme Corporation"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user-uuid-here",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "OrgAdmin",
      "orgId": "org-uuid-here"
    },
    "subscription": {
      "plan": "Basic",
      "maxUsers": 5,
      "startDate": "2026-02-28T...",
      "endDate": "2026-03-30T..."
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

**Save these for next requests:**
- `accessToken` → Use in Authorization header
- `refreshToken` → Use for refresh endpoint
- `orgId` → For organization operations

---

### 1.2 Login

**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "OrgAdmin",
      "orgId": "org-uuid"
    },
    "subscription": {
      "plan": "Basic",
      "maxUsers": 5,
      "status": "ACTIVE",
      "endDate": "2026-03-30T..."
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

---

### 1.3 Refresh Token

**Endpoint:** `POST /api/auth/refresh`

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 1.4 Logout

**Endpoint:** `POST /api/auth/logout`

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2️⃣ SUBSCRIPTION ENDPOINTS

### 2.1 Get Current Subscription

**Endpoint:** `GET /api/subscriptions/current`

```bash
curl -X GET http://localhost:3000/api/subscriptions/current \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Subscription retrieved",
  "data": {
    "id": "sub-uuid",
    "plan": {
      "name": "Basic",
      "maxUsers": 5,
      "price": 0,
      "features": [
        "Limited features",
        "Core system access",
        "Up to 5 team members",
        "Basic support"
      ]
    },
    "startDate": "2026-02-28T00:00:00Z",
    "endDate": "2026-03-30T00:00:00Z",
    "status": "ACTIVE",
    "isExpired": false,
    "userCount": 1,
    "daysRemaining": 30
  }
}
```

---

### 2.2 Get All Available Plans

**Endpoint:** `GET /api/subscriptions/plans`

```bash
curl -X GET http://localhost:3000/api/subscriptions/plans \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
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
      "features": [
        "Limited features",
        "Core system access",
        "Up to 5 team members",
        "Basic support"
      ]
    },
    {
      "id": "standard",
      "name": "Standard",
      "maxUsers": 10,
      "price": 15,
      "duration": 30,
      "features": [
        "Up to 10 team members",
        "Advanced reporting",
        "More dashboard features",
        "Better support",
        "More storage (100GB)"
      ]
    },
    {
      "id": "pro",
      "name": "Pro",
      "maxUsers": 999,
      "price": 30,
      "duration": 30,
      "features": [
        "Up to 999 team members",
        "Advanced analytics",
        "Export to CSV/Excel",
        "Custom roles",
        "API access",
        "Priority support",
        "Unlimited storage"
      ]
    }
  ]
}
```

---

### 2.3 Upgrade Subscription Plan

**Endpoint:** `POST /api/subscriptions/upgrade`

```bash
curl -X POST http://localhost:3000/api/subscriptions/upgrade \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "pro"
  }'
```

**Expected Response (200):**
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
    "startDate": "2026-02-28T...",
    "endDate": "2026-03-30T...",
    "proratedAmount": 5.50,
    "message": "Upgrade complete. Total cost: $5.50"
  }
}
```

---

### 2.4 Check User Capacity

**Endpoint:** `GET /api/subscriptions/can-add-users?count=2`

```bash
# Check if can add 2 users
curl -X GET "http://localhost:3000/api/subscriptions/can-add-users?count=2" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Check default (1 user)
curl -X GET "http://localhost:3000/api/subscriptions/can-add-users" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200) - Can add:**
```json
{
  "success": true,
  "message": "User capacity check complete",
  "data": {
    "canAdd": true,
    "currentUserCount": 1,
    "maxUsers": 5,
    "availableSlots": 4,
    "requestedCount": 2,
    "message": "You can add 4 more users"
  }
}
```

**Expected Response (403) - Cannot add:**
```json
{
  "success": false,
  "message": "User limit reached. Your plan allows maximum 5 users. Only 0 slots available"
}
```

---

### 2.5 Check Feature Access

**Endpoint:** `GET /api/subscriptions/feature-access?feature=export`

```bash
# Check export feature (Pro only)
curl -X GET "http://localhost:3000/api/subscriptions/feature-access?feature=export" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Check analytics (Pro only)
curl -X GET "http://localhost:3000/api/subscriptions/feature-access?feature=analytics" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Check customRoles (Pro only)
curl -X GET "http://localhost:3000/api/subscriptions/feature-access?feature=customRoles" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Check apiAccess (Pro only)
curl -X GET "http://localhost:3000/api/subscriptions/feature-access?feature=apiAccess" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200) - Has access:**
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

**Expected Response (403) - No access:**
```json
{
  "success": false,
  "message": "Feature \"export\" is not available in Basic plan. Upgrade your plan for access."
}
```

---

### 2.6 Get Usage Analytics

**Endpoint:** `GET /api/subscriptions/analytics`

```bash
curl -X GET http://localhost:3000/api/subscriptions/analytics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Usage analytics retrieved",
  "data": {
    "plan": "Pro",
    "users": {
      "current": 5,
      "max": 999,
      "usagePercent": 0.5,
      "warning": false
    },
    "attendance": {
      "total": 0
    },
    "subscription": {
      "startDate": "2026-02-28T...",
      "endDate": "2026-03-30T...",
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

## 3️⃣ USER MANAGEMENT ENDPOINTS

### 3.1 Create User

**Endpoint:** `POST /api/users`

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "password": "SecurePass123!",
    "roleId": "optional-role-uuid"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user-uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "role": "Employee"
  }
}
```

**Error Response (403) - User limit reached:**
```json
{
  "success": false,
  "message": "User limit reached. Your plan allows maximum 5 users. Only 0 slots available"
}
```

---

### 3.2 Get All Users

**Endpoint:** `GET /api/users?page=1&limit=10`

```bash
# Get first page (10 per page)
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get custom pagination
curl -X GET "http://localhost:3000/api/users?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Default pagination
curl -X GET "http://localhost:3000/api/users" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "id": "user-uuid-1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "OrgAdmin",
        "createdAt": "2026-02-28T..."
      },
      {
        "id": "user-uuid-2",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com",
        "role": "Employee",
        "createdAt": "2026-02-28T..."
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false
    }
  }
}
```

---

### 3.3 Get Specific User

**Endpoint:** `GET /api/users/:id`

```bash
curl -X GET "http://localhost:3000/api/users/USER_UUID_HERE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User retrieved",
  "data": {
    "id": "user-uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "role": "Employee",
    "createdAt": "2026-02-28T..."
  }
}
```

---

### 3.4 Update User

**Endpoint:** `PUT /api/users/:id`

```bash
curl -X PUT "http://localhost:3000/api/users/USER_UUID_HERE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Johnson",
    "roleId": "optional-role-uuid"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user-uuid",
    "firstName": "Jane",
    "lastName": "Johnson",
    "email": "jane@example.com",
    "role": "Employee"
  }
}
```

---

### 3.5 Delete User

**Endpoint:** `DELETE /api/users/:id`

```bash
curl -X DELETE "http://localhost:3000/api/users/USER_UUID_HERE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error (400) - Self-deletion:**
```json
{
  "success": false,
  "message": "Cannot delete your own account"
}
```

---

### 3.6 Update Password

**Endpoint:** `PUT /api/users/:id/password`

```bash
curl -X PUT "http://localhost:3000/api/users/USER_UUID_HERE/password" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass123!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

### 3.7 Get User Statistics

**Endpoint:** `GET /api/users/stats/overview`

```bash
curl -X GET "http://localhost:3000/api/users/stats/overview" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User statistics retrieved",
  "data": {
    "totalUsers": 5,
    "usersByRole": [
      {
        "role": "OrgAdmin",
        "count": 1
      },
      {
        "role": "Employee",
        "count": 4
      }
    ]
  }
}
```

---

## 🧪 Complete Test Sequence

Run these tests in order:

```bash
# 1. Register (this creates an org and gives you Basic plan with 5 users)
POST /api/auth/register

# 2. Login with the credentials you created
POST /api/auth/login

# 3. Check your current subscription (should be Basic)
GET /api/subscriptions/current

# 4. List all available plans
GET /api/subscriptions/plans

# 5. Check if you can add users (Basic plan = 5 users max)
GET /api/subscriptions/can-add-users

# 6. Create 4 more users (total: 5, reaches limit)
POST /api/users (4 times)

# 7. Try to create 6th user (should fail)
POST /api/users (expect 403)

# 8. Check feature access (Basic doesn't have export)
GET /api/subscriptions/feature-access?feature=export

# 9. Upgrade to Pro plan
POST /api/subscriptions/upgrade

# 10. Check feature access again (Pro has export)
GET /api/subscriptions/feature-access?feature=export

# 11. Get usage analytics
GET /api/subscriptions/analytics

# 12. Create more users (Pro plan = 999 users max)
POST /api/users (multiple times)

# 13. Get all users with pagination
GET /api/users?page=1&limit=10

# 14. Get user stats
GET /api/users/stats/overview

# 15. Update a user
PUT /api/users/USER_ID

# 16. Update password
PUT /api/users/USER_ID/password

# 17. Delete a user
DELETE /api/users/USER_ID

# 18. Logout
POST /api/auth/logout
```

---

## 📊 Postman Collection Import

Save this as `postman_collection.json`:

```json
{
  "info": {
    "name": "Attendex Subscription System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@example.com\",\"password\":\"SecurePass123!\",\"orgName\":\"Acme Corp\"}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"john@example.com\",\"password\":\"SecurePass123!\"}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## ⚠️ Testing Notes

1. **Save your tokens:** Copy `accessToken` from register/login responses
2. **Use Authorization header:** `Authorization: Bearer YOUR_TOKEN`
3. **Subscription starts as Basic:** New registrations get Basic plan (5 users)
4. **Error 403 means:** Subscription expired, user limit reached, or feature not available
5. **Error 401 means:** Invalid or missing token
6. **Error 400 means:** Bad request/validation error

---

## 🔧 Environment Variables Needed

```bash
# In .env file:
JWT_SECRET=your_random_secret_min_32_chars
JWT_REFRESH_SECRET=your_random_secret_min_32_chars
DATABASE_URL=postgresql://user:password@localhost:5432/attendex_db
```

---

## 🚀 Start Testing!

Everything is set up and ready to test. Use the curl commands above or import into Postman.
