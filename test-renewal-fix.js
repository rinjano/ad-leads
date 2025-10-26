const http = require('http');

function testRenewalAPI() {
  const renewalData = {
    prospekId: 1, // Using real prospek ID from database
    tanggalKonversi: new Date().toISOString(),
    totalNilaiTransaksi: 3000000,
    keterangan: "Test renewal from API - Fixed",
    items: [
      {
        layananId: 1, // RME layanan ID
        produkId: 1, // Privata produk ID
        nilaiTransaksi: 3000000,
        durasiLangganan: 6,
        tipeDurasi: "bulan",
      }
    ]
  };

  const postData = JSON.stringify(renewalData);

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/konversi-customer',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

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