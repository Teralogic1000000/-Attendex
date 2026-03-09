import http from 'http';

// Step 1: Login to get token
async function login() {
  return new Promise((resolve) => {
    const loginData = {
      email: "testadmin1772952397298@test.com",
      password: "TestPassword123!"
    };

    const payload = JSON.stringify(loginData);

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.data?.tokens?.accessToken) {
            console.log('✓ Login successful');
            console.log('  Token received:', response.data.tokens.accessToken.substring(0, 30) + '...');
            resolve(response.data.tokens.accessToken);
          } else {
            console.log('✗ No token in response');
            resolve(null);
          }
        } catch (e) {
          console.log('✗ Error parsing login response');
          resolve(null);
        }
      });
    });

    req.write(payload);
    req.end();
  });
}

// Step 2: Test dashboard endpoints with token
async function testDashboardEndpoint(endpoint, token, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${endpoint}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log(`\n✓ ${name}`);
            console.log(`  Status: ${res.statusCode}`);
            
            if (response.data) {
              if (typeof response.data === 'object' && !Array.isArray(response.data)) {
                console.log(`  Data:`, JSON.stringify(response.data).substring(0, 128) + '...');
              } else if (Array.isArray(response.data)) {
                console.log(`  Items:`, response.data.length);
              }
            }
          } else {
            console.log(`\n✗ ${name} - Status: ${res.statusCode}`);
            if (response.message) console.log(`  Error: ${response.message}`);
          }
        } catch (e) {
          console.log(`\n✗ ${name} - Parse error`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`\n✗ ${name} - ${e.message}`);
      resolve();
    });

    req.end();
  });
}

async function runFullTest() {
  console.log('🔐 Testing Super Admin Dashboard with Authentication\n');
  
  console.log('Step 1: Login');
  const token = await login();
  
  if (!token) {
    console.log('\n✗ Failed to get authentication token');
    process.exit(1);
  }
  
  console.log('\nStep 2: Testing Dashboard Endpoints with Token');
  await testDashboardEndpoint('/superadmin/dashboard/overview', token, 'System Overview');
  await testDashboardEndpoint('/superadmin/dashboard/analytics/organization-growth', token, 'Organization Growth Analytics');
  await testDashboardEndpoint('/superadmin/organizations', token, 'Organizations List');
  await testDashboardEndpoint('/superadmin/audit-logs', token, 'Audit Logs');
  
  console.log('\n✅ Dashboard data fetch test complete');
  process.exit(0);
}

runFullTest();
