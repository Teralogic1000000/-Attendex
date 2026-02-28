# 🧪 Complete Testing Resources - Master Index

All files you need for comprehensive API testing are ready!

---

## 📁 Testing Files Created

| File | Type | Purpose | Best For |
|------|------|---------|----------|
| **TESTING_SUMMARY.md** | 📋 Doc | Quick overview of all testing options | Getting started |
| **TESTING_GUIDE.md** | 📚 Doc | Complete API reference with curl examples | Detailed testing |
| **test-api.ps1** | 🔧 Script | Automated PowerShell testing | Windows users |
| **test-api.sh** | 🔧 Script | Automated Bash testing | Linux/Mac users |
| **Attendex-Postman-Collection.json** | 📮 Postman | Import to Postman for GUI testing | Team collaboration |

---

## 🎯 Choose Your Testing Method

### ⭐ **Method 1: Automated Testing (FASTEST - 5 minutes)**

**Windows Users:**
```powershell
cd C:\Users\emmanuel\Desktop\TrackTimi
.\test-api.ps1
```

**Mac/Linux Users:**
```bash
cd ~/TrackTimi
./test-api.sh
```

**What happens:**
- ✅ Registers new user
- ✅ Tests all 17 endpoints automatically
- ✅ Shows pass/fail for each test
- ✅ Cleans up test data
- ✅ Takes ~2 minutes

**Best for:** Quick validation, complete coverage

---

### 🎯 **Method 2: Postman GUI (EASIEST - 10 minutes)**

**Setup:**
1. Download Postman: https://www.postman.com/downloads/
2. Open Postman
3. Click **Import**
4. Select: `Attendex-Postman-Collection.json`
5. Click **Import** button

**Testing:**
1. Click "Register" request
2. Click **Send**
3. Copy `accessToken` from response
4. Go to Postman Settings → Variables
5. Set `access_token` = copied token
6. Click other requests to test them

**What you get:**
- 17 pre-built requests
- Organized by category
- Easy variable management
- Beautiful response formatting

**Best for:** GUI lovers, manual testing, learning

---

### 📝 **Method 3: Manual curl Commands (DETAILED - 15 minutes)**

**Read:** `TESTING_GUIDE.md`

**Example:**
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com",
    "password":"Test123!",
    "orgName":"Test Corp"
  }'

# Copy token from response, then use it:
curl -X GET http://localhost:3000/api/subscriptions/current \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Best for:** Understanding the API, custom testing, CI/CD

---

## 📋 What Each File Contains

### **TESTING_SUMMARY.md** (This File)
- Overview of all testing options
- Quick reference
- Troubleshooting guide
- Common questions

---

### **TESTING_GUIDE.md** (START HERE FOR DETAILS)
- **17 complete endpoints** with:
  - Endpoint path
  - curl command
  - Request body
  - Response example
  - Success criteria

- **Complete test flow:**
  1. Registration → Basic plan
  2. Login → Get tokens
  3. Subscription checks
  4. User creation respects limits
  5. Feature access control
  6. Plan upgrade
  7. Enhanced features available
  8. Cleanup

- **Postman notes** for setup

Example endpoints:
- `POST /api/auth/register` - Create new org
- `POST /api/auth/login` - Authenticate
- `GET /api/subscriptions/current` - Check plan
- `POST /api/subscriptions/upgrade` - Upgrade plan
- `GET /api/subscriptions/analytics` - Usage stats
- `POST /api/users` - Create employees
- `GET /api/users` - List employees
- And 10 more...

---

### **test-api.ps1** (PowerShell - Windows)
Automated script that:
```powershell
✓ Registers new user
✓ Logs in
✓ Checks subscription
✓ Lists plans
✓ Tests user limits
✓ Tests feature access
✓ Creates users
✓ Lists users
✓ Gets specific user
✓ Updates user
✓ Gets statistics
✓ Views analytics
✓ Upgrades plan
✓ Verifies new features
✓ Refreshes token
✓ Deletes user
✓ Logs out
```

**Output:** Color-coded results showing ✓/✗ for each test

---

### **test-api.sh** (Bash - Linux/Mac)
Same as PowerShell version but for Unix systems

---

### **Attendex-Postman-Collection.json** (Postman Import)
Pre-built Postman collection with:
- **4 Auth endpoints:** Register, Login, Refresh, Logout
- **6 Subscription endpoints:** Current, Plans, Upgrade, Capacity, Features, Analytics
- **7 User endpoints:** Create, List, Get, Update, Delete, Password, Stats

Variables built-in:
- `base_url` = http://localhost:3000
- `access_token` = (set from register)
- `refresh_token` = (set from register)
- `user_id` = (set when creating users)

---

## 🚀 Quick Start (Choose One)

### **Quickest (2 minutes):**
```powershell
.\test-api.ps1    # Windows
# or
./test-api.sh     # Linux/Mac
```

### **Most Intuitive (5 minutes):**
Import `Attendex-Postman-Collection.json` into Postman and click Send

### **Most Educational (15 minutes):**
Read `TESTING_GUIDE.md` and run curl commands manually

---

## 📊 Test Coverage

All **17 endpoints** are covered:

**Authentication (4):**
- ✅ Register
- ✅ Login
- ✅ Refresh Token
- ✅ Logout

**Subscriptions (6):**
- ✅ Get Current
- ✅ Get All Plans
- ✅ Upgrade Plan
- ✅ Check User Capacity
- ✅ Check Feature Access
- ✅ Get Analytics

**Users (7):**
- ✅ Create User
- ✅ Get All Users
- ✅ Get Specific User
- ✅ Update User
- ✅ Delete User
- ✅ Update Password
- ✅ Get Statistics

---

## ✅ Test Scenarios Included

### Scenario 1: Basic Plan Limits
```
1. Register → Get Basic plan (5 user max)
2. Create 4 users → Reaches limit
3. Try 6th user → 403 error ✓
4. Try export → 403 feature not available ✓
```

### Scenario 2: Plan Upgrade
```
1. Register → Basic plan
2. Upgrade to Pro
3. Try export → Now works ✓
4. Can now create 999 users ✓
```

### Scenario 3: Complete Workflow
```
1. Register
2. Create employees
3. Test restrictions
4. Upgrade plan
5. Test new features
6. Manage employees
7. Check analytics
8. Logout
```

---

## 🔑 Key Features Tested

✅ **Authentication:**
- User registration with org creation
- Automatic Basic plan assignment
- Login with token generation
- Refresh token functionality
- Logout with invalidation

✅ **Subscription Management:**
- Current plan inspection
- Plan listing
- Plan upgrade with prorating
- User capacity checking
- Feature access verification
- Usage analytics

✅ **User Management:**
- Create users (respects plan limits)
- List users (with pagination)
- Get specific user details
- Update user info
- Delete users
- Password changes
- User statistics

---

## 🎯 Expected Results

All tests should show:
- **201** for creation endpoints
- **200** for success responses
- **400** for bad requests (shown if you test wrong input)
- **401** for auth errors (shown if you use wrong token)
- **403** for permission errors (shown when testing limits/features)

---

## 💻 Server Requirements

**Must be running before testing:**
```bash
cd Attendex/Backed
npm start
```

Server should show:
```
Server running on port 3000
Connected to database
```

---

## 📋 Test Script Output Example

```
========================================
Attendex Subscription System - API Tests
========================================

[1] Testing Registration...
✓ Registration successful
User: John Doe
Email: john@example.com
Plan: Basic

[2] Testing Login...
✓ Login successful
Role: OrgAdmin

[3] Testing Get Current Subscription...
✓ Subscription retrieved
Plan: Basic
Max Users: 5
Status: ACTIVE
Days Remaining: 30
...
```

All tests show ✓ for pass, ✗ for fail

---

## 🔧 Customization

### Modify Postman Variables:
1. Settings → Variables
2. Change `base_url` for different server
3. Save and re-run tests

### Modify Scripts:
1. Edit `test-api.ps1` or `test-api.sh`
2. Change request details
3. Change expected results
4. Run again

### Modify curl Commands:
1. Copy command from TESTING_GUIDE.md
2. Change parameters
3. Run in terminal

---

## 📞 Troubleshooting

### Tests fail with "Connection refused"
→ Start server: `npm start`

### Tests fail with "Invalid token"
→ Rerun entire script to get fresh tokens

### "Email already in use"
→ Scripts handle this with timestamps

### Feature test shows access denied
→ This is CORRECT for Basic plan

### Postman shows 401 errors
→ Set `access_token` variable in Postman

---

## 📚 Documentation Reference

- **TESTING_GUIDE.md** - All endpoint details
- **QUICK_REFERENCE.md** - Quick lookup
- **SUBSCRIPTION_SYSTEM.md** - Complete API docs
- **INTEGRATION_GUIDE.md** - How to add subscriptions to code
- **ARCHITECTURE_DIAGRAMS.md** - System design
- **DATABASE_SETUP.md** - Database operations
- **IMPLEMENTATION_SUMMARY.md** - What was built

---

## 🎓 Learning Path

**Beginner (20 minutes):**
1. Run `test-api.ps1`
2. Watch all tests pass
3. Read output to understand each endpoint

**Intermediate (1 hour):**
1. Import Postman collection
2. Test 5 key endpoints manually
3. Read TESTING_GUIDE.md
4. Try upgrade scenario

**Advanced (2-3 hours):**
1. Modify test scripts for custom cases
2. Test edge cases and error scenarios
3. Write integration tests
4. Set up CI/CD testing

---

## ✨ What Happens In Tests

### Registration (Test 1)
- Creates new organization
- Creates user as OrgAdmin
- Assigns Basic plan (5 users, free)
- Generates JWT tokens
- Returns subscription details

### Subscription Tests (Tests 3-6, 12, 14)
- Verify plan details
- List available plans
- Show user capacity
- Check feature access
- Display analytics
- Test plan upgrade

### User Tests (Tests 7-11, 15-16)
- Create employee respecting limits
- List all users with pagination
- Get specific user details
- Update user information
- Get organization statistics
- Delete user safely

---

## 🎉 Ready to Test!

**Pick your method and start testing:**

1. **Fastest:** Copy paste one command
2. **Easiest:** Import Postman collection
3. **Detailed:** Read TESTING_GUIDE.md and run curl commands

**All three methods test the exact same 17 endpoints.**

---

## 📞 Support

- **Questions?** Check TESTING_GUIDE.md
- **Need details?** Read SUBSCRIPTION_SYSTEM.md
- **Stuck?** See Troubleshooting section above
- **Want to integrate?** Read INTEGRATION_GUIDE.md

---

**Status:** ✅ Complete and Ready  
**Version:** 1.0  
**Last Updated:** February 28, 2026
