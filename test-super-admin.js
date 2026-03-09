// Test script for Super Admin Registration
import http from 'http';

const testData = {
  firstName: "John",
  lastName: "Administrator",  
  email: "john.admin@company.com",
  password: "SecurePassword123!",
  adminSecret: "82118521-3f59-4a22-be03-8c54f2560828ab4c9963307c41ca821b66c0d6ed81e9"
};

const payload = JSON.stringify(testData);

console.log('📧 Testing Super Admin Registration...');
console.log('Email:', testData.email);
console.log('Admin Secret:', testData.adminSecret);
console.log('');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register/superadmin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

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
      
      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log('\n✓ Registration successful!');
        const user = response.data?.user;
        if (user) {
          console.log('User ID:', user.id);
          console.log('Email:', user.email);
          console.log('Role:', user.role);
        }
      } else {
        console.log('\n✗ Registration failed');
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

req.write(payload);
req.end();
