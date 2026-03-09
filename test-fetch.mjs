#!/usr/bin/env node

import fetch from 'node-fetch';

async function test() {
  try {
    console.log('Testing login...');
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123456!'
      })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.data && data.data.tokens) {
      console.log('\n✓ LOGIN SUCCESSFUL');
      console.log('Access Token:', data.data.tokens.accessToken.substring(0, 50) + '...');
      
      // Try fetch organizations with the token
      console.log('\nFetching organizations...');
      const orgsResponse = await fetch('http://localhost:5000/api/superadmin/organizations', {
        headers: {
          'Authorization': `Bearer ${data.data.tokens.accessToken}`
        }
      });
      
      console.log('Orgs Status:', orgsResponse.status);
      const orgsData = await orgsResponse.json();
      console.log('Orgs:', JSON.stringify(orgsData, null, 2));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
