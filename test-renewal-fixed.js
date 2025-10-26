const http = require('http');

function testRenewalAPI() {
  // Test renewal for customer Aya (id: 23) with RME Privata service
  const renewalData = {
    prospekId: 23, // Aya's customer ID
    tanggalKonversi: new Date().toISOString(),
    totalNilaiTransaksi: 2500000, // Renewal value
    keterangan: 'Test renewal - Fixed serviceId and productId issue',
    items: [
      {
        layananId: 1, // RME layanan ID
        produkId: 1, // Privata produk ID
        nilaiTransaksi: 2500000,
        durasiLangganan: 3, // 3 months renewal
        tipeDurasi: 'months',
      }
    ]
  };

  const postData = JSON.stringify(renewalData);

  const options = {
    hostname: 'localhost',
    port: 3000, // Our server is running on port 3000
    path: '/api/konversi-customer',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('Testing renewal API with data:', JSON.stringify(renewalData, null, 2));

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      try {
        const jsonData = JSON.parse(data);
        console.log('Renewal API response:', JSON.stringify(jsonData, null, 2));
      } catch (error) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(postData);
  req.end();
}

testRenewalAPI();