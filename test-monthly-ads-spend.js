const http = require('http');

function testMonthlyAdsSpendAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/laporan/monthly-ads-spend',
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
        console.log('Monthly Ads Spend API response:');
        console.log('Success:', jsonData.success);
        console.log('Number of records:', jsonData.data ? jsonData.data.length : 0);

        if (jsonData.data && jsonData.data.length > 0) {
          console.log('First record sample:');
          console.log(JSON.stringify(jsonData.data[0], null, 2));

          // Check if all records have kodeAds and sumberLeads containing 'ads'
          const invalidRecords = jsonData.data.filter(record =>
            record.kodeAds === 'Unknown' ||
            !record.sumberLeads.toLowerCase().includes('ads')
          );

          if (invalidRecords.length > 0) {
            console.log('❌ Found invalid records (should not be included):', invalidRecords.length);
            console.log('Invalid records:', invalidRecords.map(r => ({
              kodeAds: r.kodeAds,
              sumberLeads: r.sumberLeads
            })));
          } else {
            console.log('✅ All records have valid kodeAds and sumberLeads containing "ads"');
          }
        }
      } catch (error) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

testMonthlyAdsSpendAPI();