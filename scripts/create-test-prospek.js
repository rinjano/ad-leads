const { PrismaClient } = require('../generated/prisma/index.js')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Creating additional test prospek with proper assignments...\n')

  try {
    // Get existing data
    const kodeAdsList = await prisma.kodeAds.findMany()
    const sumberLeadsList = await prisma.sumberLeads.findMany()
    const layananList = await prisma.layanan.findMany()

    console.log(`Found ${kodeAdsList.length} kodeAds, ${sumberLeadsList.length} sumberLeads, ${layananList.length} layanan`)

    // Create 8 additional prospek with proper assignments
    const newProspekData = [
      { nama: 'RS Mitra Keluarga Jakarta', kodeAds: '204', sumberLeads: 'Meta Ads' },
      { nama: 'Klinik Sehat Sentosa', kodeAds: '200', sumberLeads: 'Google Ads' },
      { nama: 'RS Cipto Mangunkusumo', kodeAds: '201', sumberLeads: 'Facebook Ads' },
      { nama: 'Klinik Medika Utama', kodeAds: '202', sumberLeads: 'Instagram Ads' },
      { nama: 'Puskesmas Mawar', kodeAds: '200', sumberLeads: 'Referral' },
      { nama: 'RS Hermina Bekasi', kodeAds: '201', sumberLeads: 'Direct' },
      { nama: 'Klinik Gigi Mulia', kodeAds: '207', sumberLeads: 'Website/Landing Page' },
      { nama: 'RS Siloam Kebon Jeruk', kodeAds: '200', sumberLeads: 'Website/Landing Page' },
    ]

    let createdCount = 0

    for (const data of newProspekData) {
      const kodeAds = kodeAdsList.find(k => k.kode === data.kodeAds)
      const sumberLeads = sumberLeadsList.find(s => s.nama === data.sumberLeads)

      if (kodeAds && sumberLeads) {
        const prospek = await prisma.prospek.create({
          data: {
            namaProspek: data.nama,
            email: `${data.nama.toLowerCase().replace(/\s+/g, '')}@example.com`,
            noWhatsApp: `08123456${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            tanggalProspek: new Date(),
            tanggalJadiLeads: new Date(),
            kodeAdsId: kodeAds.id,
            sumberLeadsId: sumberLeads.id,
            statusLeadsId: 1,
            picLeads: "Admin",
            updatedAt: new Date(),
          },
        })

        console.log(`✅ Created prospek: ${prospek.namaProspek}`)
        createdCount++
      }
    }

    console.log(`\n✅ Created ${createdCount} additional prospek records`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => {
    console.log('✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
