const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

(async () => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const prospekToday = await prisma.prospek.findMany({
    where: { tanggalProspek: { gte: startOfToday, lt: endOfToday } },
    select: { id: true, tanggalProspek: true, tanggalJadiLeads: true, kodeAdsId: true }
  });
  const leadsToday = await prisma.prospek.findMany({
    where: { tanggalJadiLeads: { not: null, gte: startOfToday, lt: endOfToday } },
    select: { id: true, tanggalProspek: true, tanggalJadiLeads: true, kodeAdsId: true }
  });
  console.log('Prospek hari ini:', prospekToday);
  console.log('Leads hari ini:', leadsToday);
  await prisma.$disconnect();
})();
