const { PrismaClient } = require('./generated/prisma');

async function checkLeadsData() {
  const prisma = new PrismaClient();

  try {
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    console.log('Checking leads data for today:', startOfDay.toISOString(), 'to', endOfDay.toISOString());

    // Count all prospects
    const totalProspects = await prisma.prospek.count();
    console.log('Total prospects:', totalProspects);

    // Count prospects with tanggalJadiLeads set
    const totalLeads = await prisma.prospek.count({
      where: { tanggalJadiLeads: { not: null } }
    });
    console.log('Total leads (with tanggalJadiLeads):', totalLeads);

    // Count leads converted today
    const leadsToday = await prisma.prospek.count({
      where: {
        tanggalJadiLeads: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });
    console.log('Leads converted today:', leadsToday);

    // Get sample leads converted today
    const sampleLeadsToday = await prisma.prospek.findMany({
      where: {
        tanggalJadiLeads: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      take: 5,
      select: {
        id: true,
        nama: true,
        status: true,
        tanggalProspek: true,
        tanggalJadiLeads: true,
        sumberLeads: true,
        kodeAds: true
      }
    });
    console.log('Sample leads converted today:', JSON.stringify(sampleLeadsToday, null, 2));

    // Check if there are any leads with status 'LEADS' but no tanggalJadiLeads
    const leadsWithoutDate = await prisma.prospek.count({
      where: {
        status: 'LEADS',
        tanggalJadiLeads: null
      }
    });
    console.log('Leads with status LEADS but no tanggalJadiLeads:', leadsWithoutDate);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLeadsData();