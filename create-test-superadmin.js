import http from 'http';

const testData = {
  firstName: "Test",
  lastName: "SuperAdmin",
  email: "test@example.com",
  password: "Test123456!",
  adminSecret: "82118521-3f59-4a22-be03-8c54f2560828ab4c9963307c41ca821b66c0d6ed81e9"
};

const payload = JSON.stringify(testData);

console.log('🔐 Creating Super Admin Account...');
console.log('Email:', testData.email);
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
        console.log('\n✓ Super Admin created successfully!');
        const user = response.data?.user;
        const tokens = response.data?.tokens;
        if (user) {
          console.log('\nUser Details:');
          console.log('  Email:', user.email);
          console.log('  Name:', user.firstName + ' ' + user.lastName);
          console.log('  Role:', user.role);
        }
        if (tokens) {
          console.log('\nCredentials for Testing:');
          console.log('  Email:', testData.email);
          console.log('  Password:', testData.password);
          console.log('  Access Token:', tokens.accessToken.substring(0, 20) + '...');
        }
      } else {
        console.log('\n✗ Super Admin creation failed');
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
