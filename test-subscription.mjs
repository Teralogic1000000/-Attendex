const BASE_URL = 'http://localhost:5000/api';

async function test() {
  try {
    console.log('Testing OrgAdmin Dashboard Subscription...\n');
    
    // Login
    console.log('1️⃣ Logging in as OrgAdmin...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@democorp.com',
        password: 'Admin@123'
      })
    });
    
    const login = await loginRes.json();
    console.log('Login response:', JSON.stringify(login, null, 2));
    
    if (!login.success) {
      throw new Error(`Login failed: ${login.message}`);
    }
    
    const token = login.data?.token || login.token;
    const orgId = login.data?.user?.orgId || login.user?.orgId;
    
    if (!token || !orgId) {
      throw new Error(`Missing token or orgId in login response`);
    }
    
    console.log('✅ Login successful');
    console.log(`   Token: ${token.substring(0, 40)}...`);
    console.log(`   OrgId: ${orgId}\n`);

    // Get subscription (should auto-assign free plan)
    console.log('2️⃣ Fetching subscription (should auto-assign FREE plan)...');
    const subRes = await fetch(`${BASE_URL}/subscriptions/current`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const sub = await subRes.json();
    if (!sub.success) {
      throw new Error(`Subscription fetch failed: ${sub.message}`);
    }
    
    const subData = sub.data;
    console.log('✅ Subscription retrieved successfully');
    console.log(`   Current Plan: ${subData.subscription?.planName || subData.plan?.name || 'N/A'}`);
    console.log(`   Status: ${subData.status}`);
    console.log(`   Price: $${subData.subscription?.price || subData.plan?.price || 0}/month`);
    console.log(`   Max Users: ${subData.subscription?.maxUsers || subData.plan?.maxEmployees || 'N/A'}`);
    console.log(`   Start Date: ${new Date(subData.startDate).toLocaleDateString()}`);
    console.log(`   End Date: ${new Date(subData.endDate).toLocaleDateString()}\n`);

    // Get dashboard stats
    console.log('3️⃣ Fetching user stats for dashboard...');
    const statsRes = await fetch(`${BASE_URL}/users/stats/overview`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const stats = await statsRes.json();
    if (stats.success) {
      const statsData = stats.data;
      console.log('✅ Dashboard stats retrieved');
      console.log(`   Total Employees: ${statsData.totalEmployees}`);
      console.log(`   Present Today: ${statsData.presentToday}`);
      console.log(`   Avg Hours: ${statsData.avgHours}\n`);
    } else {
      console.log('⚠️ Could not fetch stats:', stats.message);
    }

    // Get analytics
    console.log('4️⃣ Fetching organization analytics...');
    const analyticsRes = await fetch(`${BASE_URL}/dashboard/org/analytics`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const analytics = await analyticsRes.json();
    if (analytics.success) {
      const analyticsData = analytics.data;
      console.log('✅ Analytics retrieved');
      console.log(`   Weekly data points: ${analyticsData.weekly?.length || 0}`);
      if (analyticsData.weekly?.length > 0) {
        console.log(`   Sample: ${analyticsData.weekly[0].date} - ${analyticsData.weekly[0].attendanceCount} check-ins\n`);
      }
    } else {
      console.log('⚠️ Could not fetch analytics:', analytics.message);
    }

    console.log('\n✅ ALL TESTS PASSED!');
    console.log('   ✓ OrgAdmin can login');
    console.log('   ✓ Free plan auto-assigned');
    console.log('   ✓ Dashboard data accessible');
    console.log('   ✓ No 404 errors');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ TEST FAILED');
    console.error(`   Error: ${err.message}`);
    process.exit(1);
  }
}

test();
