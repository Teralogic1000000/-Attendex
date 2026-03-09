import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000
});

async function testBackend() {
  try {
    console.log('Testing backend at http://localhost:5000');
    
    // Test 1: Health check (if exists)
    console.log('\n1. Testing GET /api/health...');
    try {
      const health = await api.get('/api/health');
      console.log('✓ Health:', health.data);
    } catch (err) {
      console.log('✗ Health endpoint error:', err.response?.status, err.response?.data);
    }

    // Test 2: Login
    console.log('\n2. Testing POST /api/auth/login...');
    try {
      const loginRes = await api.post('/api/auth/login', {
        email: 'test@example.com',
        password: 'Test123456!'
      });
      console.log('✓ Login successful');
      console.log('  Response:', loginRes.data);
    } catch (err) {
      console.log('✗ Login error:', err.response?.status, err.response?.data);
      console.log('  Full error:', err.message);
    }

    // Test 3: Organizations without auth
    console.log('\n3. Testing GET /api/superadmin/organizations (no auth)...');
    try {
      const orgsRes = await api.get('/api/superadmin/organizations');
      console.log('✓ Orgs fetch (no auth):', orgsRes.data);
    } catch (err) {
      console.log('✗ Orgs error:', err.response?.status, err.response?.data);
    }

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testBackend();
