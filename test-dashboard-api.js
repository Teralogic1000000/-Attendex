import http from 'http';

async function testAPI(endpoint, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${endpoint}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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
          console.log(`\n✓ ${name}`);
          console.log(`  Status: ${res.statusCode}`);
          console.log(`  Data Keys:`, Object.keys(response?.data || response || {}).slice(0, 5));
          if (response?.data) {
            if (typeof response.data === 'object' && !Array.isArray(response.data)) {
              console.log(`  Keys:`, Object.keys(response.data).slice(0, 5));
            }
          }
        } catch (e) {
          console.log(`✗ ${name} - Error parsing response`);
          console.log(`  Raw:`, data.substring(0, 100));
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`✗ ${name} - ${e.message}`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing Super Admin Dashboard API Endpoints\n');
  
  await testAPI('/superadmin/dashboard/overview', 'System Overview');
  await testAPI('/superadmin/dashboard/analytics/organization-growth', 'Organization Growth Analytics');
  await testAPI('/superadmin/organizations', 'Organizations');
  await testAPI('/superadmin/users', 'Users');
  await testAPI('/superadmin/audit-logs', 'Audit Logs');
  
  console.log('\n✅ All tests complete');
  process.exit(0);
}

runTests();
