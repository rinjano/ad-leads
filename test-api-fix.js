const fetch = require('node-fetch');

async function testAdsSpendApi() {
  try {
    console.log('Testing ads-spend API with current-month filter...');

    const response = await fetch('http://localhost:3002/api/ads-spend?filter=current-month');
    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Success:', data.success);

    if (data.success) {
      console.log('Total Leads:', data.totals?.totalLeads);
      console.log('Filter:', data.filter);

      if (data.data && data.data.length > 0) {
        console.log('Data items:');
        data.data.forEach(item => {
          console.log(`  ${item.kodeAds} - ${item.channel}: ${item.leads} leads`);
        });
      } else {
        console.log('No data items found');
      }
    } else {
      console.log('API Error:', data.error);
    }

  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAdsSpendApi();