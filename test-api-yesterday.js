const http = require('http');

function testYesterdayFilter() {
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/ads-spend?filter=yesterday',
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
        console.log('API Response Status:', res.statusCode);
        console.log('Success:', jsonData.success);
        console.log('Total Leads:', jsonData.totals?.totalLeads);
        console.log('Filter Type:', jsonData.filter?.type);

        if (jsonData.data && jsonData.data.length > 0) {
          console.log('Data items:', jsonData.data.length);
          jsonData.data.forEach(item => {
            console.log(`  ${item.kodeAds} - ${item.channel}: ${item.leads} leads`);
          });
        } else {
          console.log('No data items found');
        }
      } catch (e) {
        console.log('Parse error:', e.message);
        console.log('Raw response:', data.substring(0, 500));
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.end();
}

testYesterdayFilter();