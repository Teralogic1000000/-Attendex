#!/usr/bin/env node

const API_BASE = 'http://localhost:5000/api';
let authToken = null;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function testEndpoint(name, method, endpoint, body = null, token = authToken) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    if (response.ok) {
      log(`✓ ${name} (${response.status})`, 'green');
      return { success: true, data, status: response.status };
    } else {
      log(`✗ ${name} (${response.status}) - ${data.message || data.error}`, 'red');
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    log(`✗ ${name} - ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n╔════════════════════════════════════════════╗', 'cyan');
  log('║       ATTENDEX API ENDPOINT TESTS         ║', 'cyan');
  log('╚════════════════════════════════════════════╝\n', 'cyan');

  // ============ AUTHENTICATION TESTS ============
  log('\n📝 AUTHENTICATION ENDPOINTS', 'blue');
  log('─'.repeat(45), 'blue');

  // Test Registration
  const registerRes = await testEndpoint(
    'POST /auth/register (Super Admin)',
    'POST',
    '/auth/register',
    {
      email: `test-${Date.now()}@attendex.com`,
      password: 'Test@123456',
      fullName: 'Test User',
      userType: 'Super_Admin'
    }
  );

  // Test Login with existing super admin
  const loginRes = await testEndpoint(
    'POST /auth/login (Super Admin)',
    'POST',
    '/auth/login',
    {
      email: 'superadmin@attendex.com',
      password: 'SuperAdmin@123'
    }
  );

  if (loginRes.success && loginRes.data.accessToken) {
    authToken = loginRes.data.accessToken;
    log('✓ Authentication token obtained', 'green');
  }

  // ============ LOOKUP ENDPOINTS ============
  if (authToken) {
    log('\n📚 LOOKUP ENDPOINTS', 'blue');
    log('─'.repeat(45), 'blue');

    await testEndpoint('GET /lookups/attendance-statuses', 'GET', '/lookups/attendance-statuses', null, authToken);
    await testEndpoint('GET /lookups/attendance-methods', 'GET', '/lookups/attendance-methods', null, authToken);
    await testEndpoint('GET /lookups/user-types', 'GET', '/lookups/user-types', null, authToken);
    await testEndpoint('GET /lookups/organization-types', 'GET', '/lookups/organization-types', null, authToken);
    await testEndpoint('GET /lookups/regions', 'GET', '/lookups/regions', null, authToken);

    // ============ USER ENDPOINTS ============
    log('\n👥 USER ENDPOINTS', 'blue');
    log('─'.repeat(45), 'blue');

    const profileRes = await testEndpoint('GET /users/profile', 'GET', '/users/profile', null, authToken);
    await testEndpoint('GET /users/all', 'GET', '/users/all', null, authToken);

    // ============ ORGANIZATION ENDPOINTS ============
    log('\n🏢 ORGANIZATION ENDPOINTS', 'blue');
    log('─'.repeat(45), 'blue');

    await testEndpoint('GET /organization/list', 'GET', '/organization/list', null, authToken);
    await testEndpoint('GET /organization/my-organizations', 'GET', '/organization/my-organizations', null, authToken);

    // ============ ATTENDANCE ENDPOINTS ============
    log('\n⏱️  ATTENDANCE ENDPOINTS', 'blue');
    log('─'.repeat(45), 'blue');

    await testEndpoint('GET /attendance/my-records', 'GET', '/attendance/my-records', null, authToken);
    await testEndpoint('GET /attendance/today', 'GET', '/attendance/today', null, authToken);
    await testEndpoint('GET /attendance/stats', 'GET', '/attendance/stats', null, authToken);

    // ============ DASHBOARD ENDPOINTS ============
    log('\n📊 DASHBOARD ENDPOINTS', 'blue');
    log('─'.repeat(45), 'blue');

    await testEndpoint('GET /dashboard/overview', 'GET', '/dashboard/overview', null, authToken);
    await testEndpoint('GET /dashboard/recent-activity', 'GET', '/dashboard/recent-activity', null, authToken);

    // ============ SUPERADMIN DASHBOARD ============
    log('\n👨‍💼 SUPERADMIN DASHBOARD ENDPOINTS', 'blue');
    log('─'.repeat(45), 'blue');

    await testEndpoint('GET /superadmin/dashboard/overview', 'GET', '/superadmin/dashboard/overview', null, authToken);
    await testEndpoint('GET /superadmin/dashboard/organizations', 'GET', '/superadmin/dashboard/organizations', null, authToken);
    await testEndpoint('GET /superadmin/dashboard/audit-logs', 'GET', '/superadmin/dashboard/audit-logs', null, authToken);

    // ============ LOOKUP ENDPOINTS ============
    log('\n📋 LOOKUP TABLE ENDPOINTS', 'blue');
    log('─'.repeat(45), 'blue');

    await testEndpoint('GET /lookups/all', 'GET', '/lookups/all', null, authToken);

    // ============ SEARCH ENDPOINTS ============
    log('\n🔍 SEARCH ENDPOINTS', 'blue');
    log('─'.repeat(45), 'blue');

    await testEndpoint(
      'GET /search/global?query=test',
      'GET',
      '/search/global?query=test',
      null,
      authToken
    );

    // ============ AUDIT LOG ENDPOINTS ============
    log('\n📝 AUDIT LOG ENDPOINTS', 'blue');
    log('─'.repeat(45), 'blue');

    await testEndpoint('GET /audit-logs/logs', 'GET', '/audit-logs/logs', null, authToken);

    // ============ VALIDATION ENDPOINTS ============
    log('\n✔️  VALIDATION ENDPOINTS', 'blue');
    log('─'.repeat(45), 'blue');

    await testEndpoint('GET /validation/status', 'GET', '/validation/status', null, authToken);
  }

  log('\n╔════════════════════════════════════════════╗', 'cyan');
  log('║         TEST SUMMARY COMPLETE             ║', 'cyan');
  log('╚════════════════════════════════════════════╝\n', 'cyan');

  log('Frontend is available at: http://localhost:5177', 'yellow');
  log('Backend API is available at: http://localhost:5000/api', 'yellow');
  log('You can now test different user roles through the frontend!\n', 'green');
}

runTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
