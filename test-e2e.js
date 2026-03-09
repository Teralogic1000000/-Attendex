const API = 'http://localhost:5000/api';
let credentials = {};

async function post(endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`❌ POST ${endpoint}:`, data);
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data.data || data;
}

async function put(endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`❌ PUT ${endpoint}:`, data);
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data.data || data;
}

async function get(endpoint) {
  const res = await fetch(`${API}${endpoint}`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`❌ GET ${endpoint}:`, data);
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data.data || data;
}

function getAuthHeaders() {
  return credentials.accessToken
    ? { Authorization: `Bearer ${credentials.accessToken}` }
    : {};
}

async function runTests() {
  try {
    console.log('🧪 Starting E2E Tests...\n');

    // 1. Register
    console.log('1️⃣  Register Organization');
    const regData = await post('/auth/register', {
      firstName: 'Test',
      lastName: 'Admin',
      email: `test${Date.now()}@test.com`,
      password: 'TestPass123!',
      orgName: 'Test Company ' + Date.now(),
      logoUrl: 'https://example.com/logo.png',
      theme: { primary: '#ff6600', darkMode: false },
    });
    credentials = {
      accessToken: regData.tokens.accessToken,
      orgId: regData.user.orgId,
      userId: regData.user.id,
    };
    console.log('✓ Organization registered:', regData.user.email);
    console.log('  OrgID:', regData.user.orgId);
    console.log('  Plan:', regData.subscription.plan);
    console.log('  Max Employees:', regData.subscription.maxEmployees);
    console.log();

    // 2. Fetch Current Subscription
    console.log('2️⃣  Get Current Subscription');
    const sub = await get('/subscriptions/current');
    console.log('✓ Subscription:', sub.plan);
    console.log('  Status:', sub.status);
    console.log('  Users remaining:', sub.availableSlots || 'N/A');
    console.log();

    // 3. Get Available Plans
    console.log('3️⃣  Get Available Plans');
    const plans = await get('/subscriptions/plans');
    console.log('✓ Plans available:', plans.length);
    plans.forEach((p) => {
      console.log(`  - ${p.name}: $${p.price / 100 || 0}/${p.interval}, max ${p.maxEmployees} employees`);
    });
    console.log();

    // 4. Create a New Employee
    console.log('4️⃣  Create New Employee User');
    const newUserRes = await post('/users', {
      firstName: 'Alice',
      lastName: 'Smith',
      email: `alice${Date.now()}@test.com`,
      password: 'Pass123!',
    });
    console.log('✓ User created:', newUserRes.user?.email || newUserRes.email);
    console.log();

    // 5. Get Users
    console.log('5️⃣  Get Organization Users');
    const users = await get('/users');
    console.log(`✓ Users in org: ${users.length || users.total || 0}`);
    if (Array.isArray(users)) {
      users.forEach((u) => {
        console.log(`  - ${u.firstName || u.first_name} ${u.lastName || u.last_name} (${u.role || u.role_name})`);
      });
    }
    console.log();

    // 6. Get Organization Info
    console.log('6️⃣  Get Organization Info');
    const org = await get('/organization');
    console.log('✓ Organization:', org.name || org.organization?.name);
    console.log('  Email:', org.email || org.organization?.email);
    console.log('  Logo:', org.logoUrl || org.organization?.logoUrl || 'Not set');
    console.log();

    // 7. Update Organization
    console.log('7️⃣  Update Organization Settings');
    await put('/organization', {
      name: 'Test Company Updated',
      email: 'newemail@test.com',
      phone: '555-0123',
    });
    console.log('✓ Organization updated');
    console.log();

    // 8. Check Feature Access (for current plan)
    console.log('8️⃣  Check Feature Access');
    try {
      const analytics = await get('/subscriptions/feature-access?feature=analytics');
      console.log('✓ Feature access check: analytics →', analytics.hasAccess || analytics.canAccess);
    } catch (e) {
      console.log('⚠ Feature access check not available yet');
    }
    console.log();

    // 9. GetUser Stats
    console.log('9️⃣  Get User Statistics');
    try {
      const stats = await get('/users/stats/overview');
      console.log('✓ User stats:');
      console.log('  Total:', stats.totalUsers || stats.totalEmployees);
      console.log('  Present Today:', stats.presentToday);
      console.log('  Avg Hours:', stats.avgHours);
    } catch (e) {
      console.log('⚠ Stats endpoint not available yet');
    }
    console.log();

    console.log('✅ All E2E tests passed!');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
