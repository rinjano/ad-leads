const { PrismaClient } = require('../generated/prisma');

async function run() {
  const prisma = new PrismaClient();
  try {
    const sumber = await prisma.sumberLeads.findMany();
    const kode = await prisma.kodeAds.findMany();
    const sname = id => (sumber.find(x => x.id === id) || {}).nama || `sumber:${id}`;
    const kname = id => (kode.find(x => x.id === id) || {}).kode || `kode:${id}`;

    const prospek = await prisma.prospek.findMany({
      where: {
        tanggalProspek: { gte: new Date(2025, 3, 1), lt: new Date(2025, 4, 1) }
      },
      select: { namaProspek: true, tanggalProspek: true, tanggalJadiLeads: true, sumberLeadsId: true, kodeAdsId: true },
      orderBy: { tanggalProspek: 'asc' }
    });

    console.log('\n=== PROSPEK (tanggalProspek in April 2025) ===');
    prospek.forEach(p => console.log(`${p.namaProspek}: tanggalProspek=${p.tanggalProspek.toISOString().split('T')[0]}, tanggalJadiLeads=${p.tanggalJadiLeads ? p.tanggalJadiLeads.toISOString().split('T')[0] : 'NULL'}, sumber=${sname(p.sumberLeadsId)}, kode=${p.kodeAdsId ? kname(p.kodeAdsId) : 'NULL'}`));
    console.log(`Total prospek (by tanggalProspek): ${prospek.length}`);

    const leads = await prisma.prospek.findMany({
      where: {
        tanggalJadiLeads: { gte: new Date(2025, 3, 1), lt: new Date(2025, 4, 1) }
      },
      select: { namaProspek: true, tanggalProspek: true, tanggalJadiLeads: true, sumberLeadsId: true, kodeAdsId: true },
      orderBy: { tanggalJadiLeads: 'asc' }
    });

    console.log('\n=== LEADS (tanggalJadiLeads in April 2025) ===');
    leads.forEach(p => console.log(`${p.namaProspek}: tanggalProspek=${p.tanggalProspek.toISOString().split('T')[0]}, tanggalJadiLeads=${p.tanggalJadiLeads ? p.tanggalJadiLeads.toISOString().split('T')[0] : 'NULL'}, sumber=${sname(p.sumberLeadsId)}, kode=${p.kodeAdsId ? kname(p.kodeAdsId) : 'NULL'}`));
    console.log(`Total leads (by tanggalJadiLeads): ${leads.length}`);

    const group = arr => arr.reduce((acc, p) => {
      const src = sname(p.sumberLeadsId);
      const kd = p.kodeAdsId ? kname(p.kodeAdsId) : 'no-kode';
      const key = `${src} | ${kd}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    console.log('\n=== GROUPS: prospek by sumber|kode ===');
    const pg = group(prospek);
    Object.keys(pg).forEach(k => console.log(`${k}: ${pg[k]}`));

    console.log('\n=== GROUPS: leads by sumber|kode ===');
    const lg = group(leads);
    Object.keys(lg).forEach(k => console.log(`${k}: ${lg[k]}`));

  } catch (e) {
    console.error('Error during reconciliation:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
