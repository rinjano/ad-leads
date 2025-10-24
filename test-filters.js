const https = require('https');
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testMonthlyAdsSpendFilters() {
  try {
    console.log('Testing Monthly Ads Spend API and Filter Population...\n');

    // Test API response
    const data = await makeRequest('http://localhost:3001/api/laporan/monthly-ads-spend?dateRange=thismonth');

    if (!data.success) {
      console.error('❌ API returned error:', data.error);
      return;
    }

    console.log('✅ API Response:');
    console.log(`   - Success: ${data.success}`);
    console.log(`   - Records: ${data.data.length}`);

    if (data.data.length === 0) {
      console.log('❌ No data returned from API');
      return;
    }

    // Simulate frontend filter logic
    const monthlyAdsSpendData = data.data;

    // Test uniqueAdsCodes
    const uniqueAdsCodes = [...new Set(monthlyAdsSpendData.map(item => item.kodeAds).filter(code => code && code !== 'Unknown'))];
    console.log(`\n✅ Filter: Kode Ads`);
    console.log(`   - Unique values: ${uniqueAdsCodes.length}`);
    console.log(`   - Values: [${uniqueAdsCodes.join(', ')}]`);

    // Test uniqueLeadSources (updated logic - no 'ads' filter)
    const uniqueLeadSources = [...new Set(monthlyAdsSpendData.map(item => item.sumberLeads).filter(source => source && source !== 'Unknown'))];
    console.log(`\n✅ Filter: Sumber Leads`);
    console.log(`   - Unique values: ${uniqueLeadSources.length}`);
    console.log(`   - Values: [${uniqueLeadSources.join(', ')}]`);

    // Test uniqueLayanan
    const allLayanan = monthlyAdsSpendData.flatMap(item =>
      item.layanan ? item.layanan.split(', ').filter(l => l.trim()) : []
    );
    const uniqueLayanan = [...new Set(allLayanan)].filter(layanan => layanan && layanan !== 'Unknown');
    console.log(`\n✅ Filter: Layanan`);
    console.log(`   - Unique values: ${uniqueLayanan.length}`);
    console.log(`   - Values: [${uniqueLayanan.join(', ')}]`);

    // Test getAvailableYears
    const years = [...new Set(monthlyAdsSpendData.map(item => item.year))].sort((a, b) => b - a);
    console.log(`\n✅ Filter: Tahun`);
    console.log(`   - Available years: ${years.length}`);
    console.log(`   - Values: [${years.join(', ')}]`);

    console.log('\n🎉 All filters should now be populated in the frontend!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMonthlyAdsSpendFilters();