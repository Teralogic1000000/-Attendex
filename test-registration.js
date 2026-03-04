const testRegistration = async () => {
  try {
    console.log('Testing registration...');
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
        email: `john${Date.now()}@test.com`,
        password: 'TestPass123!',
        orgName: 'Test Corporation'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✓ Registration successful:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('✗ Registration failed:');
      console.error('Status:', response.status);
      console.error('Data:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
};

testRegistration();
