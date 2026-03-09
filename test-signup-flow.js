// Test complete signup flow for different user types
import http from 'http';

function testSignup(userType, payload) {
    return new Promise((resolve) => {
        const signupData = JSON.stringify(payload);
        const endpoint = userType === 'employee' ? '/api/auth/register/employee' : '/api/auth/register/organization';

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: endpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': signupData.length
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    console.log(`\n📋 ${userType.toUpperCase()} Signup - Status: ${res.statusCode}`);
                    
                    if (res.statusCode === 201 || res.statusCode === 200) {
                        console.log('✅ Signup Success');
                        if (parsed.data && parsed.data.user) {
                            console.log(`   - Email: ${parsed.data.user.email}`);
                            console.log(`   - Name: ${parsed.data.user.firstName} ${parsed.data.user.lastName}`);
                            console.log(`   - Role: ${parsed.data.user.role}`);
                        }
                        if (parsed.data && parsed.data.accessToken) {
                            console.log(`   - Access Token: ${parsed.data.accessToken.substring(0, 30)}...`);
                        }
                    } else {
                        console.log('❌ Signup Failed');
                        console.log(`   Message: ${parsed.message}`);
                        if (parsed.errors) {
                            console.log('   Errors:', parsed.errors);
                        }
                    }
                } catch (e) {
                    console.log(`\n❌ Error parsing response:`, e.message);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error('❌ Request Error:', error.message);
            resolve();
        });

        req.write(signupData);
        req.end();
    });
}

async function runTests() {
    console.log('🚀 Testing Authentication Signup Flows\n');

    // Test Employee Signup
    await testSignup('employee', {
        firstName: 'John',
        lastName: 'Employee',
        email: `employee_${Date.now()}@attendex.com`,
        password: 'TestPass@123',
        phone: '1234567890',
        userType: 'Employee'
    });

    // Test Organization Signup
    await testSignup('organization', {
        firstName: 'Jane',
        lastName: 'Manager',
        email: `org_admin_${Date.now()}@attendex.com`,
        password: 'TestPass@123',
        orgName: 'Test Organization Ltd',
        phone: '0987654321'
    });

    console.log('\n✅ All signup tests completed');
}

runTests();
