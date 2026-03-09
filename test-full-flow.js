import http from 'http';

// First create a super admin account
const registrationData = {
  firstName: "Test",
  lastName: "Admin",
  email: `testadmin${Date.now()}@test.com`,
  password: "TestPassword123!",
  adminSecret: "82118521-3f59-4a22-be03-8c54f2560828ab4c9963307c41ca821b66c0d6ed81e9"
};

console.log('📧 Creating Super Admin Account...');
console.log('Email:', registrationData.email);
console.log('Password:', registrationData.password);
console.log('');

const regPayload = JSON.stringify(registrationData);

const regOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register/superadmin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(regPayload)
  }
};

const regReq = http.request(regOptions, (res) => {
  console.log(`Registration Response: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 201) {
      console.log('✓ Account created successfully!\n');
      
      // Now test login
      console.log('🔐 Testing Login...');
      const loginData = {
        email: registrationData.email,
        password: registrationData.password
      };
      
      const loginPayload = JSON.stringify(loginData);
      
      const loginOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginPayload)
        }
      };
      
      const loginReq = http.request(loginOptions, (loginRes) => {
        console.log(`Login Response: ${loginRes.statusCode}`);
        
        let loginData = '';
        loginRes.on('data', (chunk) => {
          loginData += chunk;
        });
        
        loginRes.on('end', () => {
          try {
            const response = JSON.parse(loginData);
            console.log(JSON.stringify(response, null, 2));
            
            if (loginRes.statusCode === 200) {
              console.log('\n✓ LOGIN SUCCESSFUL!');
              const user = response.data?.user;
              if (user) {
                console.log('- Email:', user.email);
                console.log('- Role:', user.role);
                console.log('- Name:', `${user.firstName} ${user.lastName}`);
              }
            }
          } catch (e) {
            console.log('Response:', loginData);
          }
          process.exit(0);
        });
      });
      
      loginReq.write(loginPayload);
      loginReq.end();
    } else {
      console.log('✗ Registration failed');
      console.log(data);
      process.exit(1);
    }
  });
});

regReq.write(regPayload);
regReq.end();
