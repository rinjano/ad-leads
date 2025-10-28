const { PrismaClient } = require('./generated/prisma');

async function checkAprilEdgeCases() {
  const prisma = new PrismaClient();

  try {
    // Check various date ranges around April
    const april1 = new Date(2025, 3, 1); // April 1
    const april30 = new Date(2025, 3, 31, 23, 59, 59); // April 30 end of day
    const may1 = new Date(2025, 4, 1); // May 1

    console.log('Date ranges:');
    console.log('April 1:', april1.toISOString());
    console.log('April 30 end:', april30.toISOString());
    console.log('May 1:', may1.toISOString());

    // Check prospects with status that indicates they are leads
    const statusLeads = await prisma.statusLeads.findMany();
    console.log('Available status leads:', statusLeads.map(s => ({ id: s.id, nama: s.nama })));

    // Find prospects that might be leads in April
    const prospectsWithStatus = await prisma.prospek.findMany({
      where: {
        statusLeadsId: {
          in: statusLeads.filter(s => s.nama.toLowerCase().includes('lead')).map(s => s.id)
        }
      }
    });

    console.log('Total prospects with "lead" status:', prospectsWithStatus.length);

    // Check if any of these have tanggalJadiLeads in April
    const aprilStatusLeads = prospectsWithStatus.filter(p =>
      p.tanggalJadiLeads &&
      p.tanggalJadiLeads >= april1 &&
      p.tanggalJadiLeads < may1
    );

    console.log('Prospects with lead status and tanggalJadiLeads in April:', aprilStatusLeads.length);

    // Check if there are prospects that became leads just before or after April
    const nearAprilLeads = await prisma.prospek.findMany({
      where: {
        tanggalJadiLeads: {
          gte: new Date(2025, 2, 25), // March 25
          lt: new Date(2025, 4, 5) // May 5
        }
      },
      orderBy: {
        tanggalJadiLeads: 'asc'
      }
    });

    console.log('Leads around April (March 25 - May 5):', nearAprilLeads.length);
    nearAprilLeads.forEach(lead => {
      console.log(`${lead.namaProspek}: ${lead.tanggalJadiLeads} (${lead.tanggalJadiLeads?.toISOString()})`);
    });

    // Check if there are any prospects created in April that might be leads
    const prospectsCreatedInApril = await prisma.prospek.findMany({
      where: {
        createdAt: {
          gte: april1,
          lt: may1
        }
      }
    });

    console.log('Prospects created in April:', prospectsCreatedInApril.length);

    // Check if any of these became leads later
    const createdInAprilBecameLeads = prospectsCreatedInApril.filter(p => p.tanggalJadiLeads);
    console.log('Of which became leads:', createdInAprilBecameLeads.length);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAprilEdgeCases();