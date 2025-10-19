const { PrismaClient } = require('../generated/prisma/index.js')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Setting up master data...\n')

  try {
    // 1. Setup Status Leads
    console.log('📍 Creating StatusLeads...')
    const statusLeadsData = [
      { nama: 'Leads' },
      { nama: 'Customer' },
      { nama: 'Follow Up' },
      { nama: 'Bukan Leads' },
    ]

    for (const status of statusLeadsData) {
      const existing = await prisma.statusLeads.findFirst({
        where: { nama: status.nama },
      })
      if (!existing) {
        await prisma.statusLeads.create({ data: status })
        console.log(`  ✅ ${status.nama}`)
      }
    }

    // 2. Setup Layanan (Jenis Layanan)
    console.log('\n🏥 Creating Layanan...')
    const layananData = [
      { nama: 'RME' },
      { nama: 'Solmet' },
      { nama: 'Klinik App' },
    ]

    for (const layanan of layananData) {
      const existing = await prisma.layanan.findFirst({
        where: { nama: layanan.nama },
      })
      if (!existing) {
        await prisma.layanan.create({ data: layanan })
        console.log(`  ✅ ${layanan.nama}`)
      }
    }

    // 3. Setup Tipe Faskes
    console.log('\n🏢 Creating Tipe Faskes...')
    const tipeFaskesData = [
      { nama: 'Rumah Sakit' },
      { nama: 'Klinik Pratama' },
      { nama: 'Klinik Utama' },
      { nama: 'Puskesmas' },
      { nama: 'Praktek Mandiri' },
    ]

    for (const tipe of tipeFaskesData) {
      const existing = await prisma.tipeFaskes.findFirst({
        where: { nama: tipe.nama },
      })
      if (!existing) {
        await prisma.tipeFaskes.create({ data: tipe })
        console.log(`  ✅ ${tipe.nama}`)
      }
    }

    // 4. Setup Kode Ads
    console.log('\n📱 Creating Kode Ads...')
    const kodeAdsData = [
      { kode: '000' },
      { kode: '200' },
      { kode: '201' },
      { kode: '202' },
      { kode: '203' },
      { kode: '204' },
    ]

    for (const kode of kodeAdsData) {
      const existing = await prisma.kodeAds.findFirst({
        where: { kode: kode.kode },
      })
      if (!existing) {
        await prisma.kodeAds.create({
          data: {
            kode: kode.kode,
            status: 'aktif',
          },
        })
        console.log(`  ✅ ${kode.kode}`)
      }
    }

    // 5. Setup Sumber Leads
    console.log('\n📊 Creating Sumber Leads...')
    const sumberLeadsData = [
      { nama: 'Direct' },
      { nama: 'Google Ads' },
      { nama: 'Facebook Ads' },
      { nama: 'Instagram Ads' },
      { nama: 'TikTok Ads' },
      { nama: 'Website' },
      { nama: 'Referral' },
    ]

    for (const sumber of sumberLeadsData) {
      const existing = await prisma.sumberLeads.findFirst({
        where: { nama: sumber.nama },
      })
      if (!existing) {
        await prisma.sumberLeads.create({ data: sumber })
        console.log(`  ✅ ${sumber.nama}`)
      }
    }

    console.log('\n✨ Master data setup completed!')
    console.log('\n📊 Summary:')
    const statusCount = await prisma.statusLeads.count()
    const layananCount = await prisma.layanan.count()
    const tipeFaskesCount = await prisma.tipeFaskes.count()
    const kodeAdsCount = await prisma.kodeAds.count()
    const sumberLeadsCount = await prisma.sumberLeads.count()

    console.log(`  ✅ Status Leads: ${statusCount}`)
    console.log(`  ✅ Layanan: ${layananCount}`)
    console.log(`  ✅ Tipe Faskes: ${tipeFaskesCount}`)
    console.log(`  ✅ Kode Ads: ${kodeAdsCount}`)
    console.log(`  ✅ Sumber Leads: ${sumberLeadsCount}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
