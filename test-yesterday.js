const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function checkYesterdayData() {
  try {
    // Hari ini: October 24, 2025
    const today = new Date(2025, 9, 24); // October 24, 2025
    const yesterday = new Date(2025, 9, 23); // October 23, 2025

    console.log('Current date context: October 24, 2025');
    console.log('Today:', today.toISOString().split('T')[0]);
    console.log('Yesterday:', yesterday.toISOString().split('T')[0]);

    // Cek leads yang jadi kemarin
    const yesterdayLeads = await prisma.prospek.findMany({
      where: {
        tanggalJadiLeads: {
          gte: yesterday,
          lt: today
        }
      }
    });

    console.log('Leads yesterday:', yesterdayLeads.length);
    yesterdayLeads.forEach(p => {
      console.log(`  ID: ${p.id}, date: ${p.tanggalJadiLeads?.toISOString().split('T')[0]}, kodeAdsId: ${p.kodeAdsId}, sumberLeadsId: ${p.sumberLeadsId}`);
    });

    // Cek kodeAds dan sumberLeads
    const kodeAdsList = await prisma.kodeAds.findMany();
    const sumberLeadsList = await prisma.sumberLeads.findMany();

    console.log('KodeAds:');
    kodeAdsList.forEach(k => console.log(`  ${k.id}: ${k.kode}`));

    console.log('SumberLeads:');
    sumberLeadsList.forEach(s => console.log(`  ${s.id}: ${s.nama}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkYesterdayData();