import http from 'http';

// Test user credentials
const testData = {
  email: 'test@example.com',
  password: 'Test123456!'
};

const payload = JSON.stringify(testData);

console.log('🔐 Testing Login Flow with JWT...');
console.log('Email:', testData.email);
console.log('Password:', testData.password);
console.log('');

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
  console.log(`Response Status: ${res.statusCode}\n`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200) {
        const tokens = response.data?.tokens;
        const user = response.data?.user;
        
        console.log('\n✅ LOGIN SUCCESSFUL!');
        console.log('\nUser Info:');
        console.log('  ID:', user?.id);
        console.log('  Email:', user?.email);
        console.log('  Role:', user?.role);
        console.log('  Name:', user?.firstName, user?.lastName);
        
        if (tokens) {
          console.log('\nToken Info:');
          console.log('  Access Token:', tokens.accessToken.substring(0, 40) + '...');
          console.log('  Refresh Token:', tokens.refreshToken.substring(0, 40) + '...');
          console.log('  Expires In:', tokens.expiresIn);
          
          // Now test fetching organizations with this token
          console.log('\n\n📊 Testing Organizations Fetch with Token...\n');
          
          const orgOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/superadmin/organizations',
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${tokens.accessToken}`
            }
          };
          
          const orgReq = http.request(orgOptions, (orgRes) => {
            console.log(`Organizations Response Status: ${orgRes.statusCode}\n`);
            let orgData = '';
            orgRes.on('data', (chunk) => {
              orgData += chunk;
            });
            orgRes.on('end', () => {
              try {
                const orgResponse = JSON.parse(orgData);
                console.log(JSON.stringify(orgResponse, null, 2));
                
                if (orgRes.statusCode === 200) {
                  console.log('\n✅ ORGANIZATIONS FETCH SUCCESSFUL!');
                } else {
                  console.log('\n❌ ORGANIZATIONS FETCH FAILED');
                }
              } catch (e) {
                console.log('Raw response:', orgData);
              }
              process.exit(0);
            });
          });
          
          orgReq.on('error', (e) => {
            console.error('Organizations request error:', e.message);
            process.exit(1);
          });
          orgReq.end();
        }
      } else if (res.statusCode === 401) {
        console.log('\n❌ LOGIN FAILED - Credentials Invalid');
      } else {
        console.log('\n❌ LOGIN FAILED - Server Error');
      }
    } catch (e) {
      console.log('Raw response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});

req.write(payload);
req.end();
