# 🧪 Testing Resources Summary

All testing files are ready for you to use!

---

## 📄 Testing Documentation

### **TESTING_GUIDE.md** ⭐ (START HERE)
Complete guide with all endpoints and curl commands
- All 17 endpoints with examples
- Request/response examples
- Testing sequence
- Postman notes

**📍 Location:** `TrackTimi/TESTING_GUIDE.md`

---

## 🔧 Automated Testing Scripts

### **Option 1: PowerShell (Windows) ⭐ RECOMMENDED**

```powershell
cd C:\Users\emmanuel\Desktop\TrackTimi
.\test-api.ps1
```

**What it does:**
- ✅ Registers a new user
- ✅ Logs in
- ✅ Tests all subscription endpoints
- ✅ Tests all user management endpoints
- ✅ Upgrades from Basic to Pro plan
- ✅ Cleans up test data

**🎯 Best for:** Windows users, complete automated testing

**📍 Location:** `TrackTimi/test-api.ps1`

---

### **Option 2: Bash Script (Linux/Mac)**

```bash
cd ~/TrackTimi
chmod +x test-api.sh
./test-api.sh
```

**What it does:** Same as PowerShell version

**🎯 Best for:** Linux/Mac users, shell environments

**📍 Location:** `TrackTimi/test-api.sh`

---

## 📮 Postman Collection

### **Import Collection**

1. Open Postman
2. Click **Import** button
3. Select **Attendex-Postman-Collection.json**
4. Click **Import**

**Features:**
- ✅ 17 pre-built requests
- ✅ Proper endpoint organization
- ✅ Environment variables setup
- ✅ Easy token management

**Variables to set in Postman:**
- `base_url`: http://localhost:3000
- `access_token`: (set from register response)
- `refresh_token`: (set from register response)
- `user_id`: (set when creating users)

**🎯 Best for:** Manual testing, GUI interface, team collaboration

**📍 Location:** `TrackTimi/Attendex-Postman-Collection.json`

---

## 🌐 Manual Testing with curl

Use the commands from `TESTING_GUIDE.md` directly:

```bash
# Example:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com",
    "password":"Test123!",
    "orgName":"Test Corp"
  }'
```

**🎯 Best for:** Quick tests, CI/CD pipelines, specific endpoint testing

---

## 📋 Quick Start Command

**Fastest way to test everything:**

### Windows (PowerShell):
```powershell
# 1. Navigate to project
cd C:\Users\emmanuel\Desktop\TrackTimi

# 2. Make sure server is running in another terminal
cd Attendex/Backed
npm start

# 3. In new PowerShell window, run tests
.\test-api.ps1
```

### Mac/Linux (Bash):
```bash
# 1. Navigate to project
cd ~/TrackTimi

# 2. Make sure server is running in another terminal
cd Attendex/Backed
npm start

# 3. In new terminal, run tests
./test-api.sh
```

---

## ✅ What Each Test Does

| # | Test | Endpoint | Expected Result |
|---|------|----------|-----------------|
| 1 | Register | POST /auth/register | 201 Created ✓ Gets Basic plan |
| 2 | Login | POST /auth/login | 200 OK ✓ Returns tokens |
| 3 | Get Subscription | GET /subscriptions/current | 200 OK ✓ Shows Basic plan |
| 4 | List Plans | GET /subscriptions/plans | 200 OK ✓ Shows all 3 plans |
| 5 | Check Capacity | GET /subscriptions/can-add-users | 200 OK ✓ Can add 4 more (5 max on Basic) |
| 6 | Check Feature | GET /subscriptions/feature-access | 403 Forbidden ✓ Export not in Basic |
| 7 | Create User | POST /users | 201 Created ✓ Employee created |
| 8 | List Users | GET /users | 200 OK ✓ Shows all users |
| 9 | Get User | GET /users/:id | 200 OK ✓ Shows specific user |
| 10 | Update User | PUT /users/:id | 200 OK ✓ User updated |
| 11 | User Stats | GET /users/stats/overview | 200 OK ✓ Shows statistics |
| 12 | Analytics | GET /subscriptions/analytics | 200 OK ✓ Shows usage data |
| 13 | Upgrade Plan | POST /subscriptions/upgrade | 200 OK ✓ Upgraded to Pro |
| 14 | Check Feature (Pro) | GET /subscriptions/feature-access | 200 OK ✓ Export now available |
| 15 | Refresh Token | POST /auth/refresh | 200 OK ✓ New tokens issued |
| 16 | Delete User | DELETE /users/:id | 200 OK ✓ User deleted |
| 17 | Logout | POST /auth/logout | 200 OK ✓ Token invalidated |

---

## 🎯 Testing Scenarios

### Scenario 1: Basic Plan Limits (5 min)
```bash
1. Register → Get Basic plan (5 user limit)
2. Create 4 users (now at 5/5)
3. Try to create 6th user → 403 error ✓
4. Try to export → 403 error (feature not available) ✓
```

### Scenario 2: Plan Upgrade (5 min)
```bash
1. Register → Get Basic plan
2. Upgrade to Pro
3. Try to export → Now works! ✓
4. Can now create 999 users ✓
```

### Scenario 3: Complete Workflow (10 min)
```bash
1. Register new organization
2. Create multiple employees
3. Test subscription features
4. Upgrade plan
5. Create more employees
6. Test new features
7. Manage users (update, delete)
8. Check analytics
9. Logout
```

---

## 🔑 Important Endpoints to Test First

**Must test in this order:**

1. **POST /api/auth/register** ← Creates org + Basic plan
2. **GET /api/subscriptions/current** ← Verify Basic plan
3. **POST /api/users** ← Create users (respects limit)
4. **POST /api/subscriptions/upgrade** ← Upgrade to Pro
5. **GET /api/subscriptions/feature-access** ← Verify new features

---

## 📊 Expected Server Response Codes

| Status | Meaning | Example |
|--------|---------|---------|
| **200** | OK | Login, get data, updates |
| **201** | Created | Register, create user |
| **400** | Bad Request | Missing required fields |
| **401** | Unauthorized | Invalid/missing token |
| **403** | Forbidden | Subscription expired, user limit, feature access |
| **404** | Not Found | User doesn't exist |
| **500** | Server Error | Database connection issue |

---

## 💡 Testing Tips

### ✅ DO:
- Start fresh each testing session (new register)
- Save tokens from responses
- Test in the order provided
- Check response status codes
- Verify subscription changes after upgrades

### ❌ DON'T:
- Use the same email twice (must be unique)
- Forget to set `Authorization: Bearer token` header
- Test without confirming server is running
- Skip the registration step
- Reuse tokens after logout

---

## 🐛 Troubleshooting Tests

### "Connection refused"
**Problem:** Server not running  
**Solution:** Start server: `cd Attendex/Backed && npm start`

### "Invalid token"
**Problem:** Using expired or wrong token  
**Solution:** Register again to get fresh tokens

### "Email already in use"
**Problem:** Reusing same email from previous test  
**Solution:** Use unique email each test (e.g., add timestamp)

### "User limit reached"
**Problem:** Testing limit enforcement correctly, but unexpected  
**Solution:** Upgrade plan or register fresh account

### "Feature not available"
**Problem:** Testing feature access correctly  
**Solution:** Upgrade to Pro plan to test feature access

---

## 🎓 Learning Path

### Beginner (20 min)
1. Read TESTING_GUIDE.md intro
2. Run `test-api.ps1` (or `.sh`)
3. Watch all tests pass ✓

### Intermediate (1 hour)
1. Read TESTING_GUIDE.md completely
2. Import Postman collection
3. Manually test 5 key endpoints
4. Try upgrade scenario

### Advanced (2-3 hours)
1. Modify test script for custom scenarios
2. Write automated tests in Jest/Mocha
3. Set up CI/CD testing
4. Test edge cases

---

## 📞 Common Questions

**Q: Can I test without the frontend?**  
A: Yes! All tests use API directly with curl/Postman.

**Q: Do I need to reset the database?**  
A: Not for basic testing. Each register creates fresh org.

**Q: Can I test multiple plans?**  
A: Yes! Register → Get Basic → Upgrade to Standard/Pro → Test features.

**Q: What if something fails?**  
A: Check the response message. Tests are designed to show failures clearly.

**Q: Can I use these tests in production?**  
A: Use for testing only. Modify for production with real payment integration.

---

## 🚀 Next Steps

1. **Start Testing:** Run `test-api.ps1`
2. **Verify All Pass:** Check green ✓ marks
3. **Manual Testing:** Use Postman for deeper testing
4. **Integration:** Add endpoints to your frontend
5. **Production:** Deploy with confidence!

---

## 📞 Support Resources

- **Full API Docs:** `SUBSCRIPTION_SYSTEM.md`
- **Integration Help:** `INTEGRATION_GUIDE.md`
- **Architecture:** `ARCHITECTURE_DIAGRAMS.md`
- **Setup:** `DATABASE_SETUP.md`
- **Quick Ref:** `QUICK_REFERENCE.md`

---

## ✨ Ready to Test?

**Pick your method:**

🎉 **Easiest:** Run `test-api.ps1` (automatic)  
🎯 **Most Control:** Use Postman (GUI)  
⚡ **Quick Test:** Copy curl from TESTING_GUIDE.md  

---

**Version:** 1.0  
**Status:** ✅ Ready to Test  
**Last Updated:** February 28, 2026
