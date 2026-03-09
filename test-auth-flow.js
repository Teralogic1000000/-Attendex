// Test complete auth flow
import http from 'http';

function testLogin() {
    const loginData = JSON.stringify({
        email: "superadmin@attendex.com",
        password: "SuperAdmin@123"
        // userType removed to test without role validation
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length
        }
    };

    const req = http.request(options, (res) => {
        let data = '';

        console.log(`\n📊 Response Status: ${res.statusCode}`);
        console.log(`📋 Response Headers: ${JSON.stringify(res.headers, null, 2)}\n`);

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                console.log('✅ Login Response:\n', JSON.stringify(parsed, null, 2));
                
                if (parsed.data && parsed.data.accessToken) {
                    console.log('\n🔐 Tokens Generated:');
                    console.log(`  - Access Token: ${parsed.data.accessToken.substring(0, 30)}...`);
                    if (parsed.data.refreshToken) {
                        console.log(`  - Refresh Token: ${parsed.data.refreshToken.substring(0, 30)}...`);
                    }
                }
                
                if (parsed.data && parsed.data.user) {
                    console.log('\n👤 User Info:');
                    console.log(`  - ID: ${parsed.data.user.id}`);
                    console.log(`  - Email: ${parsed.data.user.email}`);
                    console.log(`  - Name: ${parsed.data.user.firstName} ${parsed.data.user.lastName}`);
                    console.log(`  - Role: ${parsed.data.user.role}`);
                }
            } catch (e) {
                console.log('❌ Error parsing response:', e.message);
                console.log('Raw response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Request Error:', error);
    });

    console.log('📤 Sending login request...');
    console.log(`   Email: superadmin@attendex.com`);
    console.log(`   Password: SuperAdmin@123`);
    console.log(`   UserType: Super_Admin\n`);
    
    req.write(loginData);
    req.end();
}

testLogin();
