const { PrismaClient } = require('../generated/prisma');
(async function(){
  const prisma = new PrismaClient();
  try{
    const sumber = await prisma.sumberLeads.findMany();
    const kode = await prisma.kodeAds.findMany();
    const sname = id => (sumber.find(x=>x.id===id)||{}).nama || `sumber:${id}`;
    const kname = id => (kode.find(x=>x.id===id)||{}).kode || `kode:${id}`;

    const prospekWithKode = await prisma.prospek.findMany({
      where: {
        tanggalProspek: { gte: new Date(2025,3,1), lt: new Date(2025,4,1) },
        kodeAdsId: { not: null }
      },
      select: { namaProspek:true, tanggalProspek:true, tanggalJadiLeads:true, sumberLeadsId:true, kodeAdsId:true }
    });

    const leadsWithKode = await prisma.prospek.findMany({
      where: {
        tanggalJadiLeads: { gte: new Date(2025,3,1), lt: new Date(2025,4,1) },
        kodeAdsId: { not: null }
      },
      select: { namaProspek:true, tanggalProspek:true, tanggalJadiLeads:true, sumberLeadsId:true, kodeAdsId:true }
    });

    console.log('Prospek (tanggalProspek in April, kodeAdsId not null):', prospekWithKode.length);
    prospekWithKode.forEach(p=>console.log(`${p.namaProspek}: ${p.tanggalProspek.toISOString().split('T')[0]} - sumber=${sname(p.sumberLeadsId)} kode=${kname(p.kodeAdsId)}`));
    console.log('\nLeads (tanggalJadiLeads in April, kodeAdsId not null):', leadsWithKode.length);
    leadsWithKode.forEach(p=>console.log(`${p.namaProspek}: ${p.tanggalJadiLeads.toISOString().split('T')[0]} - sumber=${sname(p.sumberLeadsId)} kode=${kname(p.kodeAdsId)}`));
  }catch(e){console.error(e)}finally{await prisma.$disconnect();}
})();