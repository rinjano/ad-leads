const { PrismaClient } = require('./generated/prisma');

async function checkAprilLeads() {
  const prisma = new PrismaClient();

  try {
    // Check all leads in April with kodeAdsId, regardless of source
    const leads = await prisma.prospek.findMany({
      where: {
        tanggalJadiLeads: { gte: new Date(2025, 3, 1), lt: new Date(2025, 4, 1) },
        kodeAdsId: { not: null }
      },
      select: { namaProspek: true, tanggalJadiLeads: true, sumberLeadsId: true, kodeAdsId: true }
    });

    console.log('All April leads with kodeAdsId:');
    leads.forEach(l => console.log(`${l.namaProspek}: ${l.tanggalJadiLeads.toISOString().split('T')[0]} (sumber: ${l.sumberLeadsId}, kode: ${l.kodeAdsId})`));

    // Check if any leads have kodeAdsId but are from non-ads sources
    const nonAdsWithKode = leads.filter(l => l.sumberLeadsId !== 2 && l.sumberLeadsId !== 3);
    if (nonAdsWithKode.length > 0) {
      console.log('\nLeads with kodeAdsId from non-ads sources:');
      nonAdsWithKode.forEach(l => console.log(`${l.namaProspek} (sumber: ${l.sumberLeadsId})`));
    } else {
      console.log('\nNo leads with kodeAdsId from non-ads sources.');
    }

    console.log(`\nTotal leads with kodeAdsId in April: ${leads.length}`);
    console.log(`Total from ads sources (Meta Ads/Google Ads): ${leads.length - nonAdsWithKode.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAprilLeads();