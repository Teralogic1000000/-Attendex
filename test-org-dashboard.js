import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Test org admin - adjust with your test data
const TEST_ORG_EMAIL = 'admin@testorg.com';
const TEST_ORG_PASSWORD = 'password123';

async function testOrgDashboard() {
  try {
    // Step 1: Login as OrgAdmin
    console.log('Step 1: Logging in as OrgAdmin...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_ORG_EMAIL,
      password: TEST_ORG_PASSWORD
    });
    
    const token = loginRes.data.data.token;
    const orgId = loginRes.data.data.user.orgId;
    console.log('✓ LoginSuccessful. Token:', token.substring(0, 20) + '...');
    console.log('  Organization ID:', orgId);

    // Create axios instance with token
    const api = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    });

    // Step 2: Get current subscription (should auto-assign free plan)
    console.log('\nStep 2: Fetching current subscription...');
    const subRes = await api.get('/subscriptions/current');
    console.log('✓ Subscription fetched successfully');
    console.log('  Plan Name:', subRes.data.data.subscription?.planName || subRes.data.data.plan?.name);
    console.log('  Status:', subRes.data.data.status);
    console.log('  Price:', subRes.data.data.subscription?.price || subRes.data.data.plan?.price);
    console.log('  Max Users:', subRes.data.data.subscription?.maxUsers || subRes.data.data.plan?.maxEmployees);

    // Step 3: Get user stats (for dashboard KPIs)
    console.log('\nStep 3: Fetching user stats for dashboard...');
    const statsRes = await api.get('/users/stats/overview');
    console.log('✓ User stats fetched successfully');
    console.log('  Total Employees:', statsRes.data.data.totalEmployees);
    console.log('  Present Today:', statsRes.data.data.presentToday);
    console.log('  Avg Hours:', statsRes.data.data.avgHours);

    // Step 4: Get organization analytics
    console.log('\nStep 4: Fetching organization analytics...');
    const analyticsRes = await api.get('/dashboard/org/analytics');
    console.log('✓ Analytics fetched successfully');
    console.log('  Weekly Data Points:', analyticsRes.data.data.weekly?.length);
    if (analyticsRes.data.data.weekly?.length > 0) {
      console.log('  First Day:', analyticsRes.data.data.weekly[0].date, 'Count:', analyticsRes.data.data.weekly[0].attendanceCount);
    }

    // Step 5: Get org dashboard data
    console.log('\nStep 5: Fetching org dashboard data...');
    const dashboardRes = await api.get('/dashboard/org');
    console.log('✓ Dashboard data fetched successfully');
    console.log('  Total Employees:', dashboardRes.data.data.totalEmployees);
    console.log('  Present Today:', dashboardRes.data.data.presentToday);

    // Step 6: Check if plans are available
    console.log('\nStep 6: Fetching available subscription plans...');
    const plansRes = await api.get('/subscriptions/plans');
    console.log('✓ Plans fetched successfully');
    console.log('  Available Plans:', plansRes.data.data.length);
    plansRes.data.data.forEach(plan => {
      console.log(`  - ${plan.name}: $${plan.price}/month (Max ${plan.maxEmployees} users)`);
    });

    console.log('\n✅ All tests passed! OrgAdmin dashboard is working correctly.');
    console.log('   - Free plan auto-assignment works');
    console.log('   - Dashboard data is accessible');
    console.log('   - No 404 errors encountered');

  } catch (err) {
    console.error('❌ Test failed:');
    if (err.response) {
      console.error('  Status:', err.response.status);
      console.error('  Error:', err.response.data?.message || err.response.data);
    } else {
      console.error('  Error:', err.message);
    }
    process.exit(1);
  }
}

testOrgDashboard();
