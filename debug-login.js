import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';

console.log('🔧 DEBUG LOGIN ISSUE\n');

// Helper function to make API calls
function apiCall(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function debug() {
  try {
    // Step 1: Check if backend is running
    console.log('1️⃣  Testing backend connection...');
    const testRes = await apiCall('GET', '/auth/help');
    if (testRes.status !== 200) {
      console.log('❌ Backend is not responding. Is it running on port 5000?\n');
      console.log('   Run: cd Backed && node server.js\n');
      process.exit(1);
    }
    console.log('✅ Backend is running\n');

    // Step 2: Try default test credentials
    console.log('2️⃣  Testing login with test credentials...');
    const loginRes = await apiCall('POST', '/auth/login', {
      email: 'superadmin@attendex.com',
      password: 'SuperAdmin@123'
    });

    console.log(`Status: ${loginRes.status}`);
    console.log('Response:', JSON.stringify(loginRes.data, null, 2));

    if (loginRes.status === 401) {
      console.log('\n⚠️  Invalid credentials error detected!\n');
      console.log('POSSIBLE CAUSES:');
      console.log('1. Test user doesn\'t exist in database');
      console.log('2. Password hash mismatch');
      console.log('3. Database connection issue\n');
      
      console.log('3️⃣  Creating test Super Admin account...\n');
      const registerRes = await apiCall('POST', '/auth/register/superadmin', {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@attendex.com',
        password: 'SuperAdmin@123',
        adminSecret: process.env.ADMIN_SECRET
      });

      console.log(`Register Status: ${registerRes.status}`);
      console.log('Response:', JSON.stringify(registerRes.data, null, 2));

      if (registerRes.status === 201) {
        console.log('\n✅ Super Admin created successfully!\n');
        console.log('Now try logging in again with:');
        console.log('  Email: superadmin@attendex.com');
        console.log('  Password: SuperAdmin@123\n');
      }
    } else if (loginRes.status === 200) {
      console.log('\n✅ Login successful!\n');
      console.log('Credentials are working correctly.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Ensure backend is running: cd Backed && node server.js');
    console.log('2. Check that database DATABASE_URL is valid');
    console.log('3. Verify database is accessible');
  }
}

debug();
