const { PrismaClient } = require('./generated/prisma');

async function checkAprilData() {
  const prisma = new PrismaClient();

  try {
    // Check April 2025 data specifically
    const aprilStart = new Date(2025, 3, 1); // April is month 3 (0-indexed)
    const aprilEnd = new Date(2025, 4, 1); // May 1st

    console.log('Checking April 2025 data:', aprilStart.toISOString(), 'to', aprilEnd.toISOString());

    // Get all prospects that became leads in April 2025
    const aprilLeads = await prisma.prospek.findMany({
      where: {
        tanggalJadiLeads: {
          gte: aprilStart,
          lt: aprilEnd
        },
        kodeAdsId: {
          not: null
        }
      }
    });

    console.log('Total April leads with kodeAdsId:', aprilLeads.length);

    // Get sumber leads and kode ads maps
    const allSumberLeads = await prisma.sumberLeads.findMany();
    const allKodeAds = await prisma.kodeAds.findMany();
    
    const sumberLeadsMap = new Map(allSumberLeads.map(sl => [sl.id, sl.nama]));
    const kodeAdsMap = new Map(allKodeAds.map(ka => [ka.id, ka.kode]));

    // Filter only ads channels
    const adsChannels = allSumberLeads.filter(sl =>
      sl.nama.toLowerCase().includes('ads')
    );

    console.log('Ads channels:', adsChannels.map(sl => sl.nama));

    const aprilAdsLeads = aprilLeads.filter(lead =>
      adsChannels.some(sl => sl.id === lead.sumberLeadsId)
    );

    console.log('April leads from ads channels:', aprilAdsLeads.length);

    // Group by month, kodeAds, sumberLeads
    const groupedData = aprilAdsLeads.reduce((acc, lead) => {
      const kodeAds = lead.kodeAds?.kode || 'Unknown';
      const sumberLeads = lead.sumberLeads?.nama || 'Unknown';
      const key = `${kodeAds}-${sumberLeads}`;

      if (!acc[key]) {
        acc[key] = {
          kodeAds,
          sumberLeads,
          count: 0,
          leads: []
        };
      }

      acc[key].count += 1;
      acc[key].leads.push({
        id: lead.id,
        namaProspek: lead.namaProspek,
        tanggalJadiLeads: lead.tanggalJadiLeads
      });

      return acc;
    }, {});

    console.log('Grouped April data:');
    Object.entries(groupedData).forEach(([key, data]) => {
      console.log(`${key}: ${data.count} leads`);
      console.log('Lead details:', data.leads.map(l => `${l.namaProspek} (${l.tanggalJadiLeads})`));
    });

    // Total prospek count for April
    const totalAprilProspek = Object.values(groupedData).reduce((sum, group) => sum + group.count, 0);
    console.log('Total April prospek from ads channels:', totalAprilProspek);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAprilData();