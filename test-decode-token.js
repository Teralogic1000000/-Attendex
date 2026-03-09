import jwt from 'jsonwebtoken';

// Decode without verification (just to inspect)
function decodeToken(token) {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (e) {
    return null;
  }
}

// Get the token from previous test
import http from 'http';

async function getTokenAndDecode() {
  return new Promise((resolve) => {
    const loginData = {
      email: "testadmin1772952397298@test.com",
      password: "TestPassword123!"
    };

    const payload = JSON.stringify(loginData);

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
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.data?.tokens?.accessToken) {
            const token = response.data.tokens.accessToken;
            const decoded = decodeToken(token);
            
            console.log('📋 Token Payload:');
            console.log(JSON.stringify(decoded, null, 2));
            
            console.log('\n🔍 Key Fields:');
            console.log('  ID:', decoded.id);
            console.log('  Email:', decoded.email);
            console.log('  Role ID:', decoded.roleId);
            console.log('  Org ID:', decoded.orgId);
            
            resolve(decoded);
          } else {
            console.log('✗ No token in response');
            resolve(null);
          }
        } catch (e) {
          console.log('✗ Error:', e.message);
          resolve(null);
        }
      });
    });

    req.write(payload);
    req.end();
  });
}

getTokenAndDecode();
