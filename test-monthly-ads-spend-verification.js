const { PrismaClient } = require('./generated/prisma');

async function testMonthlyAdsSpend() {
  const prisma = new PrismaClient();

  try {
    console.log('=== TESTING MONTHLY ADS SPEND LOGIC ===\n');

    // 1. Get all sumber leads and filter ads channels
    const allSumberLeads = await prisma.sumberLeads.findMany();
    const adsChannels = allSumberLeads.filter(sl =>
      sl.nama.toLowerCase().includes('ads')
    );
    console.log('Ads channels found:');
    adsChannels.forEach(sl => console.log(`  ${sl.id}: ${sl.nama}`));
    console.log();

    // 2. Get all kode ads
    const allKodeAds = await prisma.kodeAds.findMany();
    console.log('Kode Ads:');
    allKodeAds.forEach(ka => console.log(`  ${ka.id}: ${ka.kode}`));
    console.log();

    // 3. Get leads for April 2025 with kodeAdsId not null
    const aprilLeads = await prisma.prospek.findMany({
      where: {
        tanggalJadiLeads: {
          gte: new Date(2025, 3, 1), // April 1, 2025
          lt: new Date(2025, 4, 1)   // May 1, 2025
        },
        kodeAdsId: {
          not: null
        }
      },
      select: {
        id: true,
        namaProspek: true,
        tanggalJadiLeads: true,
        sumberLeadsId: true,
        kodeAdsId: true
      },
      orderBy: { tanggalJadiLeads: 'asc' }
    });

    console.log('All April 2025 leads with kodeAdsId:');
    aprilLeads.forEach(lead => {
      const sumberName = allSumberLeads.find(sl => sl.id === lead.sumberLeadsId)?.nama || 'Unknown';
      const kodeName = allKodeAds.find(ka => ka.id === lead.kodeAdsId)?.kode || 'Unknown';
      console.log(`  ${lead.namaProspek}: ${lead.tanggalJadiLeads.toISOString().split('T')[0]} (${sumberName}, kode ${kodeName})`);
    });
    console.log();

    // 4. Filter only ads channels
    const aprilAdsLeads = aprilLeads.filter(lead =>
      adsChannels.some(sl => sl.id === lead.sumberLeadsId)
    );

    console.log('April 2025 leads from ads channels only:');
    aprilAdsLeads.forEach(lead => {
      const sumberName = allSumberLeads.find(sl => sl.id === lead.sumberLeadsId)?.nama || 'Unknown';
      const kodeName = allKodeAds.find(ka => ka.id === lead.kodeAdsId)?.kode || 'Unknown';
      console.log(`  ${lead.namaProspek}: ${lead.tanggalJadiLeads.toISOString().split('T')[0]} (${sumberName}, kode ${kodeName})`);
    });
    console.log(`Total: ${aprilAdsLeads.length} leads\n`);

    // 5. Group by month/year/kodeAds/sumberLeads (simulate API logic)
    const monthlyDataMap = new Map();

    aprilAdsLeads.forEach(prospek => {
      const month = new Date(prospek.tanggalJadiLeads).toLocaleDateString('id-ID', { month: 'long' });
      const year = new Date(prospek.tanggalJadiLeads).getFullYear();
      const kodeAds = allKodeAds.find(ka => ka.id === prospek.kodeAdsId)?.kode || 'Unknown';
      const sumberLeads = allSumberLeads.find(sl => sl.id === prospek.sumberLeadsId)?.nama || 'Unknown';
      const key = `${month}-${year}-${kodeAds}-${sumberLeads}`;

      if (!monthlyDataMap.has(key)) {
        monthlyDataMap.set(key, {
          month,
          year,
          kodeAds,
          sumberLeads,
          prospek: 0,
          leads: 0
        });
      }

      const data = monthlyDataMap.get(key);
      data.prospek += 1;
      data.leads += 1;
    });

    console.log('Grouped data (simulating API output):');
    const monthlyData = Array.from(monthlyDataMap.values());
    monthlyData.forEach(item => {
      console.log(`  ${item.month} ${item.year} - ${item.kodeAds} (${item.sumberLeads}): ${item.prospek} prospek`);
    });

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total April 2025 ads leads: ${aprilAdsLeads.length}`);
    console.log(`Total grouped entries: ${monthlyData.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMonthlyAdsSpend();