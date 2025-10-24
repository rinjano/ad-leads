const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing monthly ads spend API...');
    const response = await fetch('http://localhost:3001/api/laporan/monthly-ads-spend?dateRange=thismonth');
    const data = await response.json();

    console.log('API Response success:', data.success);

    if (data.data && data.data.length > 0) {
      console.log(`Found ${data.data.length} records`);

      // Check for Unknown values
      const kodeAdsValues = data.data.map(item => item.kodeAds);
      const sumberLeadsValues = data.data.map(item => item.sumberLeads);

      const uniqueKodeAds = [...new Set(kodeAdsValues)];
      const uniqueSumberLeads = [...new Set(sumberLeadsValues)];

      console.log('Unique kodeAds:', uniqueKodeAds);
      console.log('Unique sumberLeads:', uniqueSumberLeads);

      const hasUnknownKodeAds = uniqueKodeAds.includes('Unknown');
      const hasUnknownSumberLeads = uniqueSumberLeads.includes('Unknown');

      console.log('Contains Unknown in kodeAds:', hasUnknownKodeAds);
      console.log('Contains Unknown in sumberLeads:', hasUnknownSumberLeads);

      // Show first few records
      console.log('\nFirst 3 records:');
      data.data.slice(0, 3).forEach((item, i) => {
        console.log(`${i+1}. kodeAds: '${item.kodeAds}', sumberLeads: '${item.sumberLeads}'`);
      });

    } else {
      console.log('No data returned from API');
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI();