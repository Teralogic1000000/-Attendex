# ✅ Testing Checklist - Copy This

Use this checklist to track your testing progress. Copy and paste responses here to verify results.

---

## 📋 Pre-Testing Setup

- [ ] **Server is running**
  ```bash
  cd Attendex/Backed
  npm start
  # Should see: "Server running on port 3000"
  ```

- [ ] **Pick ONE testing method:**
  - [ ] PowerShell automated (Windows)
  - [ ] Bash automated (Linux/Mac)
  - [ ] Postman GUI
  - [ ] Manual curl commands

---

## 🧪 Test Progress Tracker

### Authentication Tests

- [ ] **Test 1: Register**
  ```
  Status: ___
  User created: ___
  Plan assigned: Basic ___
  Got tokens: Yes/No
  ```

- [ ] **Test 2: Login**
  ```
  Status: ___
  Got access_token: Yes/No
  Got refresh_token: Yes/No
  ```

- [ ] **Test 3: Refresh Token**
  ```
  Status: ___
  Got new access_token: Yes/No
  ```

- [ ] **Test 4: Logout**
  ```
  Status: ___
  Token invalidated: Yes/No
  ```

### Subscription Tests

- [ ] **Test 5: Get Current Subscription**
  ```
  Status: ___
  Plan: Basic ___
  Max Users: 5 ___
  Status: ACTIVE ___
  ```

- [ ] **Test 6: Get All Plans**
  ```
  Status: ___
  Plans returned: 3 ___
  - Basic ___
  - Standard ___
  - Pro ___
  ```

- [ ] **Test 7: Check User Capacity**
  ```
  Status: ___
  Can add users: Yes/No ___
  Current users: ___ / 5
  ```

- [ ] **Test 8: Check Feature Access**
  ```
  Status: ___
  Has analytics: No (Basic) ___
  Has export: No (Basic) ___
  ```

- [ ] **Test 9: Get Analytics**
  ```
  Status: ___
  Days remaining: ___ days
  Total users: ___ / 5
  Features: ___ count
  ```

### User Management Tests

- [ ] **Test 10: Create User**
  ```
  Status: ___
  User created: ___
  ID: ___________
  Role: Employee ___
  ```

- [ ] **Test 11: List All Users**
  ```
  Status: ___
  Total users: ___ (should be 2+)
  Pagination: Working ___
  ```

- [ ] **Test 12: Get Specific User**
  ```
  Status: ___
  User found: Yes/No ___
  Details correct: Yes/No ___
  ```

- [ ] **Test 13: Update User**
  ```
  Status: ___
  User updated: Yes/No ___
  Changes saved: Yes/No ___
  ```

- [ ] **Test 14: Get User Statistics**
  ```
  Status: ___
  Total users: ___ / 5
  Org admins: ___
  Employees: ___
  ```

### Plan Upgrade Tests

- [ ] **Test 15: Upgrade to Pro**
  ```
  Status: ___
  Plan changed: Basic → Pro ___
  Price: ___ (was free)
  Max users: 999 ___
  Features updated: Yes/No ___
  ```

- [ ] **Test 16: Check New Features**
  ```
  Status: ___
  Has analytics: Yes (Pro) ___
  Has export: Yes (Pro) ___
  Has custom roles: Yes (Pro) ___
  ```

- [ ] **Test 17: User Limits Respected**
  ```
  Status: ___
  Can still create users: Yes ___
  New limit: 999 ___
  Can add many users: Yes/No ___
  ```

---

## 🎯 Critical Test Scenarios

### Scenario 1: Plan Limits ✅
- Basic plan limits to 5 users
- Adding 6th user shows error
- Error code: **403**

**My Result:** _______________

### Scenario 2: Feature Restrictions ✅
- Basic plan: export = denied
- Error code: **403**
- Message: Feature not available

**My Result:** _______________

### Scenario 3: Plan Upgrade ✅
- Upgrade: Basic → Pro
- Status: **200 OK**
- New features: Available
- User limit: 999

**My Result:** _______________

### Scenario 4: Token Refresh ✅
- Use refresh token
- Get new access token
- Old token still works briefly
- New token works immediately

**My Result:** _______________

---

## 📊 HTTP Status Codes

Expected codes:

- [ ] **200** - Success (GET, POST when successful)
- [ ] **201** - Created (POST endpoints)
- [ ] **400** - Bad request (missing fields, wrong format)
- [ ] **401** - Unauthorized (no token or invalid token)
- [ ] **403** - Forbidden (access denied based on plan/role)
- [ ] **404** - Not found (user/plan doesn't exist)
- [ ] **500** - Server error (shouldn't happen with good data)

---

## 🔍 Verification Points

### Registration
- [ ] Email is unique
- [ ] Organization created
- [ ] User is OrgAdmin
- [ ] Basic plan assigned
- [ ] Access token provided
- [ ] Refresh token provided

### Login
- [ ] Email validation works
- [ ] Password validation works
- [ ] Wrong password = 401
- [ ] Subscription info returned
- [ ] Tokens are different from register

### Subscriptions
- [ ] Current plan matches DB
- [ ] Max users matches plan
- [ ] Feature access correct
- [ ] Upgrade price calculated
- [ ] Status is ACTIVE

### Users
- [ ] User limit enforced
- [ ] Duplicate emails rejected
- [ ] Can't exceed org limit
- [ ] Can delete users
- [ ] Password can be updated
- [ ] Stats accurate

---

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Connection refused | Start server: `npm start` |
| Invalid token | Rerun test to get fresh token |
| Email in use | Scripts use timestamp (should be unique) |
| 403 error | This is CORRECT for feature/limit tests |
| Empty response | Check Content-Type header is JSON |
| Can't create user | Basic plan limited to 5 users |

---

## 📝 Notes Section

```
Test Date: ______________
Server: ______________
Database: ______________
Issues Found:
1. _________________________
2. _________________________
3. _________________________

Success Rate: ___/17 tests
Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🎉 Final Status

When all tests pass:

- [ ] All 17 endpoints working
- [ ] All expected status codes received
- [ ] All error scenarios handled correctly
- [ ] Plan limits enforced
- [ ] Feature access controlled
- [ ] Tokens working correctly
- [ ] Database updates verified
- [ ] **READY FOR PRODUCTION** ✅

---

## 📋 Copy of Test Commands

### Quick Copy-Paste (for manual testing)

```bash
# 1. REGISTER
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"Test123!","orgName":"Test Org"}'

# 2. LOGIN
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# 3. GET SUBSCRIPTION (replace TOKEN)
curl -X GET http://localhost:3000/api/subscriptions/current \
  -H "Authorization: Bearer TOKEN"

# 4. ALL PLANS
curl -X GET http://localhost:3000/api/subscriptions/plans \
  -H "Authorization: Bearer TOKEN"

# 5. CREATE USER (replace TOKEN)
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Employee","email":"john@test.com","role":"Employee"}'

# 6. LIST USERS
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer TOKEN"

# 7. UPGRADE PLAN
curl -X POST http://localhost:3000/api/subscriptions/upgrade \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId":"PLAN_PRO"}'
```

---

**Last Updated:** Feb 28, 2026  
**Checklist Version:** 1.0
