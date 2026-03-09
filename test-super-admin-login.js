import http from 'http';

const testData = {
  email: "arc1h@gmail.com",
  password: "Qwerty123!"  // This was one of the test passwords used
};

const payload = JSON.stringify(testData);

console.log('🔐 Testing Super Admin Login...');
console.log('Email:', testData.email);
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
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✓ Login successful!');
        const user = response.data?.user;
        if (user) {
          console.log('User:', user.email);
          console.log('Role:', user.role);
          console.log('Access Token:', response.data?.tokens?.accessToken ? '✓ Received' : '✗ Missing');
        }
      } else {
        console.log('\n✗ Login failed');
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
