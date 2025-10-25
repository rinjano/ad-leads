const http = require('http');

function testDashboardAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/dashboard',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Dashboard API response:');
        console.log('Leads count:', jsonData.data?.leads);
        console.log('Previous leads count:', jsonData.data?.previousLeads);
        console.log('Top services:', jsonData.data?.topServices?.length);
        console.log('Top cities:', jsonData.data?.topCities?.length);
        console.log('Top CS:', jsonData.data?.topCS?.length);
      } catch (error) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.end();
}

// Start server first
const { spawn } = require('child_process');
const server = spawn('npm', ['run', 'dev'], {
  cwd: '/Users/diditrinjano/Documents/DIDIT FILE/ASSIST/NEO-ASSIST/lead-management',
  stdio: 'inherit'
});

setTimeout(() => {
  testDashboardAPI();
  setTimeout(() => {
    server.kill();
  }, 2000);
}, 3000);