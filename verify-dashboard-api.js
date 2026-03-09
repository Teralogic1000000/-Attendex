import http from 'http';

// Use the access token from the super admin creation
const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImE5OGRkZTA2LWE3MWUtNDMxNS1iMTNlLTBhMTY2NWY1Yjk1ZSIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVJZCI6Ijk4ZmFhMWNiLTY0OTctNDk2Yi05ZWQ3LTY2YTk5YWNiNjIzMyIsIm9yZ0lkIjpudWxsLCJpYXQiOjE3NzI5NjgxMzMsImV4cCI6MTc3MzA1NDUzM30.ZZiR1KD4qg_hDjlPGuENj_QExansUoeP5mZ-CxiLUpU";

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/superadmin/dashboard/overview',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
};

console.log('📊 Testing SuperAdmin Dashboard API Endpoint');
console.log('Endpoint: GET /api/superadmin/dashboard/overview');
console.log('');

const req = http.request(options, (res) => {
  console.log(`✓ Response Status: ${res.statusCode}`);
  console.log('');

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✓ API is returning REAL data from database!');
        const overview = response.data;
        if (overview) {
          console.log('\n📊 Dashboard Metrics Found:');
          console.log(`  Organizations: ${overview.organizations?.total || 0}`);
          console.log(`  Users: ${overview.users?.total || 0}`);
          console.log(`  Active Subscriptions: ${overview.subscriptions?.activePaid || 0}`);
          console.log(`  Today's Attendance: ${overview.attendance?.today || 0}`);
        }
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.end();
