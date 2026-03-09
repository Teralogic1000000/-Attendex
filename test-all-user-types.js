// Test all 6 user types with unified flow
import http from 'http';

function makeRequest(method, path, data) {
    return new Promise((resolve) => {
        const body = JSON.stringify(data);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(responseData)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        error: e.message
                    });
                }
            });
        });

        req.on('error', (error) => {
            resolve({ error: error.message });
        });

        req.write(body);
        req.end();
    });
}

async function testAllUserTypes() {
    console.log('🧪 Testing All 6 User Types\n');
    console.log('═'.repeat(60));

    const testCases = [
        {
            type: '👤 Employee',
            endpoint: '/api/auth/register/employee',
            payload: {
                firstName: 'Alice',
                lastName: 'Employee',
                email: `emp_${Date.now()}@attendex.com`,
                password: 'SecurePass@123',
                userType: 'Employee'
            }
        },
        {
            type: '🏢 Organization',
            endpoint: '/api/auth/register/organization',
            payload: {
                firstName: 'Bob',
                lastName: 'OrgAdmin',
                email: `org_${Date.now()}@attendex.com`,
                password: 'SecurePass@123',
                orgName: 'Acme Corp',
                phone: '555-0001'
            }
        },
        {
            type: '👔 Manager',
            endpoint: '/api/auth/register/employee',
            payload: {
                firstName: 'Charlie',
                lastName: 'Manager',
                email: `mgr_${Date.now()}@attendex.com`,
                password: 'SecurePass@123',
                userType: 'Manager'
            }
        },
        {
            type: '🔧 Contractor',
            endpoint: '/api/auth/register/employee',
            payload: {
                firstName: 'Diana',
                lastName: 'Contractor',
                email: `con_${Date.now()}@attendex.com`,
                password: 'SecurePass@123',
                userType: 'Contractor'
            }
        },
        {
            type: '🎓 Intern',
            endpoint: '/api/auth/register/employee',
            payload: {
                firstName: 'Eve',
                lastName: 'Intern',
                email: `int_${Date.now()}@attendex.com`,
                password: 'SecurePass@123',
                userType: 'Intern'
            }
        },
        {
            type: '🔐 Super Admin',
            endpoint: '/api/auth/register/employee',
            payload: {
                firstName: 'Frank',
                lastName: 'SuperAdmin',
                email: `sa_${Date.now()}@attendex.com`,
                password: 'SecurePass@123',
                userType: 'Super_Admin'
            }
        }
    ];

    let successCount = 0;
    let failCount = 0;

    for (const testCase of testCases) {
        console.log(`\n${testCase.type} Signup:`);
        
        const response = await makeRequest('POST', testCase.endpoint, testCase.payload);
        
        if (response.status >= 200 && response.status < 300) {
            successCount++;
            console.log(`   ✅ Status ${response.status} - Success`);
            if (response.data.data?.user?.email) {
                console.log(`   📧 Email: ${response.data.data.user.email}`);
                console.log(`   👤 Name: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`);
                console.log(`   🎯 Role: ${response.data.data.user.role}`);
            }
        } else {
            failCount++;
            console.log(`   ❌ Status ${response.status} - Failed`);
            if (response.data?.message) {
                console.log(`   📝 Message: ${response.data.message}`);
            }
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`\n📊 Results: ${successCount} passed, ${failCount} failed`);
    console.log(`✅ Authentication System: ${failCount === 0 ? 'FULLY OPERATIONAL' : 'PARTIALLY WORKING'}\n`);
}

testAllUserTypes();
