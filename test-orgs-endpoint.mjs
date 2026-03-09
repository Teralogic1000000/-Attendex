import axios from 'axios';

async function test() {
  try {
    // Login first
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john.admin@company.com',
      password: 'SecurePassword123!'
    });

    console.log('✓ Logged in');
    
    const token = loginRes.data.data?.tokens?.accessToken;
    if (!token) {
      console.error('No token in response!');
      process.exit(1);
    }
    console.log('Token:', token);
    console.log('');

    // Test organizations endpoint
    console.log('Testing /api/superadmin/organizations...');
    console.log('Authorization header: Bearer ' + token.substring(0, 50) + '...');
    const res = await axios.get('http://localhost:5000/api/superadmin/organizations', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✓ Status:', res.status);
    console.log('✓ Data:', JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.response?.headers) {
      console.error('Headers:', error.response.headers);
    }
  }
  process.exit(0);
}

test();
