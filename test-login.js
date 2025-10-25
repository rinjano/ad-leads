const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login with super admin credentials...');

    // First, try to login
    const loginResponse = await fetch('http://localhost:3000/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'superadmin@example.com',
        password: 'test123',
        json: 'true'
      }),
      redirect: 'manual' // Don't follow redirects
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', Object.fromEntries(loginResponse.headers.entries()));

    const loginData = await loginResponse.text();
    console.log('Login response body:', loginData);

    // Now check session
    console.log('\nChecking session...');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
      method: 'GET',
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie') || ''
      }
    });

    const sessionData = await sessionResponse.json();
    console.log('Session data:', JSON.stringify(sessionData, null, 2));

  } catch (error) {
    console.error('Error testing login:', error.message);
  }
}

testLogin();