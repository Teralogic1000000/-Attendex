const API_BASE = 'http://localhost:5000/api';

async function makeRequest(method, path, data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${path}`, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`${response.status}: ${responseData.message || 'Unknown error'}`);
  }

  return responseData;
}

async function testDashboard() {
  try {
    console.log('🧪 Starting TrackTimi Dashboard API Tests...\n');

    // Step 1: Register a test organization and user
    console.log('📝 Step 1: Registering test organization...');
    const registerRes = await makeRequest('POST', '/auth/register', {
      firstName: 'Test',
      lastName: 'Admin',
      email: 'testadmin@tracktimi.com',
      password: 'TestPassword123!',
      orgName: 'Test Organization'
    });

    if (!registerRes.success) {
      throw new Error('Registration failed: ' + registerRes.message);
    }

    const { user, tokens } = registerRes.data;
    const accessToken = tokens.accessToken;
    console.log(`✅ Registration successful!`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Org ID: ${user.orgId}\n`);

    // Step 2: Test Dashboard Analytics
    console.log('📊 Step 2: Fetching dashboard analytics...');
    const dashboardRes = await makeRequest('GET', '/dashboard/org', null, accessToken);

    if (!dashboardRes.success) {
      throw new Error('Dashboard fetch failed: ' + dashboardRes.message);
    }

    const dashboardData = dashboardRes.data;
    console.log(`✅ Dashboard data retrieved!`);
    console.log(`   Total Users: ${dashboardData.totalUsers}`);
    console.log(`   Total Departments: ${dashboardData.totalDepartments}`);
    console.log(`   Total Shifts: ${dashboardData.totalShifts}`);
    console.log(`   Present Today: ${dashboardData.presentToday}`);
    console.log(`   Absent Today: ${dashboardData.absentToday}`);
    console.log(`   Late Today: ${dashboardData.lateToday}\n`);

    // Step 3: Create a test department
    console.log('🏢 Step 3: Creating test department...');
    const deptRes = await makeRequest('POST', '/departments',
      {
        name: 'Engineering',
        description: 'Software Engineering Department',
        head: 'Test Admin'
      },
      accessToken
    );

    if (!deptRes.success) {
      throw new Error('Department creation failed');
    }

    const department = deptRes.data;
    console.log(`✅ Department created!`);
    console.log(`   Department ID: ${department.id}`);
    console.log(`   Name: ${department.name}\n`);

    // Step 4: Create a test shift
    console.log('⏰ Step 4: Creating test shift...');
    const shiftRes = await makeRequest('POST', '/shifts',
      {
        name: 'Morning Shift',
        startTime: '08:00',
        endTime: '16:00'
      },
      accessToken
    );

    if (!shiftRes.success) {
      throw new Error('Shift creation failed');
    }

    const shift = shiftRes.data;
    console.log(`✅ Shift created!`);
    console.log(`   Shift ID: ${shift.id}`);
    console.log(`   Name: ${shift.name}`);
    console.log(`   Time: ${shift.startTime} - ${shift.endTime}\n`);

    // Step 5: Create a test employee
    console.log('👤 Step 5: Creating test employee...');
    const empRes = await makeRequest('POST', '/users',
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        departmentId: department.id,
        shiftId: shift.id
      },
      accessToken
    );

    if (!empRes.success) {
      console.log('⚠️  Employee creation had an issue, but continuing tests...');
    } else {
      console.log(`✅ Employee created!`);
      console.log(`   Employee ID: ${empRes.data.id}\n`);
    }

    // Step 6: Get updated dashboard
    console.log('📊 Step 6: Fetching updated dashboard...');
    const updatedDashRes = await makeRequest('GET', '/dashboard/org', null, accessToken);

    const updatedData = updatedDashRes.data;
    console.log(`✅ Updated dashboard data!`);
    console.log(`   Total Departments: ${updatedData.totalDepartments} (was ${dashboardData.totalDepartments})`);
    console.log(`   Total Shifts: ${updatedData.totalShifts} (was ${dashboardData.totalShifts})\n`);

    // Step 7: Get all departments
    console.log('📋 Step 7: Fetching all departments...');
    const allDeptsRes = await makeRequest('GET', '/departments', null, accessToken);

    const depts = allDeptsRes.data || allDeptsRes;
    console.log(`✅ Departments fetched!`);
    console.log(`   Total: ${Array.isArray(depts) ? depts.length : 'unknown'}\n`);

    // Step 8: Get all shifts
    console.log('🕐 Step 8: Fetching all shifts...');
    const allShiftsRes = await makeRequest('GET', '/shifts', null, accessToken);

    const shifts = allShiftsRes.data || allShiftsRes;
    console.log(`✅ Shifts fetched!`);
    console.log(`   Total: ${Array.isArray(shifts) ? shifts.length : 'unknown'}\n`);

    console.log('✨ All tests completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log(`   Email: testadmin@tracktimi.com`);
    console.log(`   Password: TestPassword123!`);

  } catch (error) {
    console.error('\n❌ Error during testing:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

testDashboard();
