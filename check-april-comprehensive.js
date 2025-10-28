const { PrismaClient } = require('./generated/prisma');

async function comprehensiveAprilCheck() {
  const prisma = new PrismaClient();

  try {
    // Check April 2025 data specifically
    const aprilStart = new Date(2025, 3, 1); // April is month 3 (0-indexed)
    const aprilEnd = new Date(2025, 4, 1); // May 1st

    console.log('Checking April 2025 data:', aprilStart.toISOString(), 'to', aprilEnd.toISOString());

    // Get all prospects that became leads in April 2025 (regardless of kodeAdsId)
    const allAprilLeads = await prisma.prospek.findMany({
      where: {
        tanggalJadiLeads: {
          gte: aprilStart,
          lt: aprilEnd
        }
      }
    });

    console.log('Total April leads (all):', allAprilLeads.length);

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

    // Group all April leads by source
    const groupedBySource = allAprilLeads.reduce((acc, lead) => {
      const sumberLeads = sumberLeadsMap.get(lead.sumberLeadsId) || 'Unknown';
      const kodeAds = lead.kodeAdsId ? (kodeAdsMap.get(lead.kodeAdsId) || 'Unknown') : 'No KodeAds';

      if (!acc[sumberLeads]) {
        acc[sumberLeads] = { total: 0, withKodeAds: 0, withoutKodeAds: 0, kodeAdsBreakdown: {} };
      }

      acc[sumberLeads].total += 1;

      if (lead.kodeAdsId) {
        acc[sumberLeads].withKodeAds += 1;
        if (!acc[sumberLeads].kodeAdsBreakdown[kodeAds]) {
          acc[sumberLeads].kodeAdsBreakdown[kodeAds] = 0;
        }
        acc[sumberLeads].kodeAdsBreakdown[kodeAds] += 1;
      } else {
        acc[sumberLeads].withoutKodeAds += 1;
      }

      return acc;
    }, {});

    console.log('\nBreakdown by sumber leads:');
    Object.entries(groupedBySource).forEach(([source, data]) => {
      console.log(`${source}:`);
      console.log(`  Total: ${data.total}`);
      console.log(`  With kodeAds: ${data.withKodeAds}`);
      console.log(`  Without kodeAds: ${data.withoutKodeAds}`);
      console.log(`  KodeAds breakdown:`, data.kodeAdsBreakdown);
    });

    // Check if there are leads from ads channels without kodeAdsId
    const adsLeadsWithoutKodeAds = allAprilLeads.filter(lead => {
      const sumberLeads = sumberLeadsMap.get(lead.sumberLeadsId) || '';
      return adsChannels.some(sl => sl.id === lead.sumberLeadsId) && !lead.kodeAdsId;
    });

    console.log('\nAds leads without kodeAdsId:', adsLeadsWithoutKodeAds.length);
    if (adsLeadsWithoutKodeAds.length > 0) {
      console.log('Details:', adsLeadsWithoutKodeAds.map(l => `${l.namaProspek} (${sumberLeadsMap.get(l.sumberLeadsId)})`));
    }

    // Check if there are any prospects that became leads in April from non-ads sources
    const nonAdsAprilLeads = allAprilLeads.filter(lead =>
      !adsChannels.some(sl => sl.id === lead.sumberLeadsId)
    );

    console.log('\nNon-ads April leads:', nonAdsAprilLeads.length);
    if (nonAdsAprilLeads.length > 0) {
      const groupedNonAds = nonAdsAprilLeads.reduce((acc, lead) => {
        const source = sumberLeadsMap.get(lead.sumberLeadsId) || 'Unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});
      console.log('By source:', groupedNonAds);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveAprilCheck();