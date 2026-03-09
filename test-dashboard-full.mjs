import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
let token = '';

async function test() {
  try {
    console.log('🔐 Testing Super Admin Dashboard with Full Response Logging\n');

    // Step 1: Login
    console.log('Step 1: Login');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testadmin1772952397298@test.com',
      password: 'Admin123!'
    });

    token = loginRes.data.data.accessToken;
    console.log('✓ Login successful');
    console.log('  Token:', token.substring(0, 50) + '...\n');

    const headers = { Authorization: `Bearer ${token}` };

    // Step 2: Test each endpoint individually with full logging
    const endpoints = [
      { name: 'Overview', path: '/superadmin/dashboard/overview' },
      { name: 'Organization Growth', path: '/superadmin/dashboard/analytics/organization-growth' },
      { name: 'User Growth', path: '/superadmin/dashboard/analytics/user-growth' },
      { name: 'Attendance Trends', path: '/superadmin/dashboard/analytics/attendance-trends' },
      { name: 'Organizations', path: '/superadmin/organizations' },
      { name: 'Audit Logs', path: '/superadmin/audit-logs' }
    ];

    for (const endpoint of endpoints) {
      console.log(`\n${endpoint.name}:`);
      console.log(`  URL: ${API_BASE}${endpoint.path}`);
      
      try {
        const res = await axios.get(`${API_BASE}${endpoint.path}`, { headers });
        console.log(`  ✓ Status: ${res.status}`);
        console.log(`  ✓ Response keys: ${Object.keys(res.data).join(', ')}`);
        
        if (res.data.data) {
          if (typeof res.data.data === 'object') {
            console.log(`  ✓ Data type: ${Array.isArray(res.data.data) ? 'array' : 'object'}`);
            if (Array.isArray(res.data.data)) {
              console.log(`  ✓ Data length: ${res.data.data.length}`);
            } else {
              console.log(`  ✓ Data keys: ${Object.keys(res.data.data).slice(0, 5).join(', ')}`);
            }
          }
        }
      } catch (error) {
        if (error.response) {
          console.log(`  ✗ Status: ${error.response.status}`);
          console.log(`  ✗ Error: ${error.response.data?.message || error.message}`);
        } else {
          console.log(`  ✗ Error: ${error.message}`);
        }
      }
    }

    console.log('\n\n✅ Test complete\n');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
  process.exit(0);
}

test();
