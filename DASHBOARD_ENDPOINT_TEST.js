/**
 * Dashboard Endpoint Validation Test Suite
 * Tests all critical dashboard endpoints to verify:
 * 1. Endpoints exist and respond
 * 2. Response format matches frontend expectations
 * 3. Data integrity
 * 4. Error handling
 * 
 * Usage: node DASHBOARD_ENDPOINT_TEST.js
 * 
 * Prerequisites:
 * - Start backend: npm run dev (from Backed folder)
 * - Ensure test database is populated
 */

const API_BASE = 'http://localhost:5000/api';
let authToken = null;
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Test Credentials (adjust as needed)
 */
const TEST_CREDENTIALS = {
  superAdmin: {
    email: 'superadmin@attendex.com',
    password: 'password123'
  },
  orgAdmin: {
    email: 'orgadmin@attendex.com',
    password: 'password123'
  },
  employee: {
    email: 'employee@attendex.com',
    password: 'password123'
  }
};

/**
 * Helper: Make HTTP request
 */
async function request(method, endpoint, body = null, token = authToken) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

/**
 * Helper: Log test result
 */
function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name}${message ? ` (${message})` : ''}`);
  
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
    testResults.errors.push({ test: name, message });
  }
}

/**
 * Test: Login and get token
 */
async function testLogin() {
  console.log('\n📋 Testing Authentication...\n');
  
  // Test SuperAdmin login
  let response = await request('POST', '/auth/login', TEST_CREDENTIALS.superAdmin);
  let passed = response.ok && response.data?.data?.tokens?.accessToken;
  logTest('SuperAdmin Login', passed, response.data?.message);
  
  if (passed) {
    authToken = response.data.data.tokens.accessToken;
  }

  return passed;
}

/**
 * Test: SuperAdmin Dashboard Endpoints
 */
async function testSuperAdminDashboard() {
  console.log('\n🛡️ Testing SuperAdmin Dashboard Endpoints...\n');

  const endpoints = [
    {
      name: 'GET /api/superadmin/dashboard/overview',
      method: 'GET',
      path: '/superadmin/dashboard/overview',
      expects: ['organizations', 'users']
    },
    {
      name: 'GET /api/superadmin/dashboard/analytics/organization-growth',
      method: 'GET',
      path: '/superadmin/dashboard/analytics/organization-growth?days=30',
      expects: ['period', 'summary', 'daily']
    },
    {
      name: 'GET /api/superadmin/dashboard/analytics/user-growth',
      method: 'GET',
      path: '/superadmin/dashboard/analytics/user-growth?days=30',
      expects: ['period', 'summary', 'daily']
    },
    {
      name: 'GET /api/superadmin/dashboard/analytics/attendance-trends',
      method: 'GET',
      path: '/superadmin/dashboard/analytics/attendance-trends?days=30',
      expects: ['period', 'summary', 'daily']
    },
    {
      name: 'GET /api/superadmin/organizations',
      method: 'GET',
      path: '/superadmin/organizations?page=1&limit=10',
      expects: ['data', 'pagination']
    },
    {
      name: 'GET /api/superadmin/users',
      method: 'GET',
      path: '/superadmin/users?page=1&limit=10',
      expects: ['data', 'pagination']
    },
    {
      name: 'GET /api/superadmin/system/overview',
      method: 'GET',
      path: '/superadmin/system/overview',
      expects: ['organizations', 'users', 'attendance']
    },
    {
      name: 'GET /api/superadmin/audit-logs',
      method: 'GET',
      path: '/superadmin/audit-logs?page=1&limit=20',
      expects: ['data', 'pagination']
    }
  ];

  for (const endpoint of endpoints) {
    const response = await request(endpoint.method, endpoint.path, null, authToken);
    const hasExpectedFields = endpoint.expects.every(field => 
      field in (response.data?.data || {})
    );
    
    logTest(
      endpoint.name,
      response.ok && hasExpectedFields,
      `Status: ${response.status}${!hasExpectedFields ? ', Missing data' : ''}`
    );
  }
}

/**
 * Test: Organization Admin Dashboard Endpoints
 */
async function testOrgAdminDashboard() {
  console.log('\n🏢 Testing Organization Admin Dashboard Endpoints...\n');

  // Get an OrgAdmin token for testing
  const loginResp = await request('POST', '/auth/login', TEST_CREDENTIALS.orgAdmin);
  const orgAdminToken = loginResp.data?.data?.tokens?.accessToken;

  if (!orgAdminToken) {
    logTest('OrgAdmin Login', false, 'Could not log in OrgAdmin');
    return;
  }

  const endpoints = [
    {
      name: 'GET /api/org-dashboard/overview',
      method: 'GET',
      path: '/org-dashboard/overview',
      expects: ['totalEmployees', 'presentToday', 'statistics']
    },
    {
      name: 'GET /api/org-dashboard/analytics/attendance-trends',
      method: 'GET',
      path: '/org-dashboard/analytics/attendance-trends?days=30',
      expects: ['trends', 'period']
    },
    {
      name: 'GET /api/org-dashboard/analytics/department-comparison',
      method: 'GET',
      path: '/org-dashboard/analytics/department-comparison',
      expects: ['departments']
    },
    {
      name: 'GET /api/org-dashboard/users',
      method: 'GET',
      path: '/org-dashboard/users?page=1&limit=10',
      expects: ['users', 'pagination']
    },
    {
      name: 'GET /api/org-dashboard/attendance',
      method: 'GET',
      path: '/org-dashboard/attendance?page=1&limit=20',
      expects: ['attendance', 'pagination']
    },
    {
      name: 'GET /api/org-dashboard/departments',
      method: 'GET',
      path: '/org-dashboard/departments',
      expects: ['departments']
    }
  ];

  for (const endpoint of endpoints) {
    const response = await request(endpoint.method, endpoint.path, null, orgAdminToken);
    const hasExpectedFields = endpoint.expects.every(field => 
      field in (response.data?.data || {})
    );
    
    logTest(
      endpoint.name,
      response.ok && hasExpectedFields,
      `Status: ${response.status}${!hasExpectedFields ? ', Missing data' : ''}`
    );
  }
}

/**
 * Test: Employee Dashboard Endpoints
 */
async function testEmployeeDashboard() {
  console.log('\n👤 Testing Employee Dashboard Endpoints...\n');

  // Get an Employee token for testing
  const loginResp = await request('POST', '/auth/login', TEST_CREDENTIALS.employee);
  const employeeToken = loginResp.data?.data?.tokens?.accessToken;

  if (!employeeToken) {
    logTest('Employee Login', false, 'Could not log in Employee');
    return;
  }

  const endpoints = [
    {
      name: 'GET /api/employee-dashboard/overview',
      method: 'GET',
      path: '/employee-dashboard/overview',
      expects: ['currentStatus', 'todayRecord', 'statistics']
    },
    {
      name: 'POST /api/employee-dashboard/check-in',
      method: 'POST',
      path: '/employee-dashboard/check-in',
      body: { latitude: 6.5244, longitude: 3.3792 },
      expects: ['record', 'message'],
      token: employeeToken
    },
    {
      name: 'GET /api/employee-dashboard/attendance-history',
      method: 'GET',
      path: '/employee-dashboard/attendance-history?page=1&limit=20',
      expects: ['attendance', 'pagination']
    },
    {
      name: 'GET /api/employee-dashboard/monthly-stats',
      method: 'GET',
      path: '/employee-dashboard/monthly-stats',
      expects: ['stats', 'attendance']
    }
  ];

  for (const endpoint of endpoints) {
    const response = await request(endpoint.method, endpoint.path, endpoint.body, employeeToken);
    const hasExpectedFields = endpoint.expects.every(field => 
      field in (response.data?.data || response.data || {})
    );
    
    logTest(
      endpoint.name,
      response.ok && hasExpectedFields,
      `Status: ${response.status}${!hasExpectedFields ? ', Missing data' : ''}`
    );
  }
}

/**
 * Test: Data Consistency
 */
async function testDataConsistency() {
  console.log('\n🔄 Testing Data Consistency...\n');

  // Test 1: Dashboard totals match user listings
  const overview = await request('GET', '/superadmin/dashboard/overview', null, authToken);
  const users = await request('GET', '/superadmin/users?page=1&limit=10000', null, authToken);
  
  if (overview.ok && users.ok) {
    const overviewTotal = overview.data?.data?.users?.total || 0;
    const usersTotal = users.data?.data?.pagination?.total || 0;
    logTest(
      'SuperAdmin: User count consistency',
      Math.abs(overviewTotal - usersTotal) < 10,
      `Overview: ${overviewTotal}, Listing: ${usersTotal}`
    );
  }

  // Test 2: Attendance records have required fields
  const attendanceResp = await request('GET', '/attendance?page=1&limit=10', null, authToken);
  if (attendanceResp.ok && attendanceResp.data?.data?.attendance?.length > 0) {
    const record = attendanceResp.data.data.attendance[0];
    const hasRequired = record.id && record.userId && record.date && record.status;
    logTest(
      'Attendance records have required fields',
      hasRequired,
      `Fields: ${Object.keys(record).join(', ')}`
    );
  }
}

/**
 * Main: Run all tests
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Dashboard Endpoint Validation Test Suite            ║');
  console.log('║     Testing all critical endpoints...                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Step 1: Login
  const loginPassed = await testLogin();
  if (!loginPassed) {
    console.log('\n❌ Authentication failed. Cannot continue tests.');
    console.log('   Please check test credentials in TEST_CREDENTIALS');
    return;
  }

  // Step 2: Test SuperAdmin endpoints
  await testSuperAdminDashboard();

  // Step 3: Test OrgAdmin endpoints
  await testOrgAdminDashboard();

  // Step 4: Test Employee endpoints
  await testEmployeeDashboard();

  // Step 5: Test data consistency
  await testDataConsistency();

  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total:  ${testResults.passed + testResults.failed}`);

  if (testResults.failed > 0) {
    console.log('\n⚠️  Failed Tests:');
    testResults.errors.forEach(err => {
      console.log(`   - ${err.test}: ${err.message}`);
    });
  } else {
    console.log('\n🎉 All tests passed!');
  }

  console.log('\n📋 Next Steps:');
  if (testResults.failed > 0) {
    console.log('   1. Review failed endpoints above');
    console.log('   2. Check backend controller implementations');
    console.log('   3. Verify database queries return correct data');
    console.log('   4. Check middleware (auth, RBAC) is working');
  } else {
    console.log('   1. All endpoints are working correctly');
    console.log('   2. Start frontend and test dashboard UI');
    console.log('   3. Monitor performance and optimize if needed');
  }
}

// Run tests
runAllTests().catch(console.error);
