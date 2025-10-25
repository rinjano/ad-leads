const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Seeding master data...');

    // Status Leads
    const statusData = [
      { nama: 'Leads' },
      { nama: 'Customer' },
      { nama: 'Follow Up' },
      { nama: 'Bukan Leads' },
    ];

    for (const status of statusData) {
      const existing = await prisma.statusLeads.findFirst({ where: { nama: status.nama } });
      if (!existing) {
        await prisma.statusLeads.create({ data: status });
        console.log('Created status:', status.nama);
      }
    }

    // Layanan
    const layananData = [
      { nama: 'RME' },
      { nama: 'Solmet' },
    ];

    for (const layanan of layananData) {
      const existing = await prisma.layanan.findFirst({ where: { nama: layanan.nama } });
      if (!existing) {
        await prisma.layanan.create({ data: layanan });
        console.log('Created layanan:', layanan.nama);
      }
    }

    console.log('Seeding completed!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

seed();