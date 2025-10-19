const { PrismaClient } = require('../generated/prisma/index.js')

const prisma = new PrismaClient()

async function hashPassword(password) {
  const bcrypt = require('bcryptjs')
  return bcrypt.hash(password, 10)
}

async function main() {
  console.log('🌱 Starting database restoration...\n')

  try {
    // 1. Seed Status Leads
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

    // 2. Seed Layanan
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
        await prisma.layanan.create({ data: { nama: layanan.nama } })
        console.log(`  ✅ ${layanan.nama}`)
      }
    }

    // 3. Seed Tipe Faskes
    console.log('\n🏢 Creating TipeFaskes...')
    const tipeFaskesData = [
      { nama: 'Klinik Pratama' },
      { nama: 'Praktek Mandiri' },
      { nama: 'Klinik Kecantikan' },
      { nama: 'Rumah Sakit' },
      { nama: 'Apotek' },
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

    // 4. Seed Kode Ads
    console.log('\n📱 Creating KodeAds...')
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
        await prisma.kodeAds.create({ data: { kode: kode.kode } })
        console.log(`  ✅ ${kode.kode}`)
      }
    }

    // 5. Seed Sumber Leads
    console.log('\n📊 Creating SumberLeads...')
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

    // 6. Seed Users
    console.log('\n👥 Creating Users...')
    const usersData = [
      {
        email: 'admin@neoassist.com',
        name: 'Administrator',
        password: 'admin123',
        role: 'admin',
      },
      {
        email: 'cs@neoassist.com',
        name: 'CS Representative',
        password: 'cs123',
        role: 'cs_representative',
      },
      {
        email: 'advertiser@neoassist.com',
        name: 'Advertiser',
        password: 'ads123',
        role: 'advertiser',
      },
    ]

    for (const user of usersData) {
      const existing = await prisma.user.findFirst({
        where: { email: user.email },
      })
      if (!existing) {
        const hashedPassword = await hashPassword(user.password)
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            password: hashedPassword,
            role: user.role,
            companyId: 1,
          },
        })
        console.log(`  ✅ ${user.email}`)
      }
    }

    // 7. Create sample Prospek data
    console.log('\n🎯 Creating sample Prospek...')
    const prospekCount = await prisma.prospek.count()
    
    if (prospekCount === 0) {
      const tipeFaskes = await prisma.tipeFaskes.findFirst({
        where: { nama: 'Klinik Pratama' },
      })
      const statusLeads = await prisma.statusLeads.findFirst({
        where: { nama: 'Leads' },
      })
      const sumberLeads = await prisma.sumberLeads.findFirst()

      if (tipeFaskes && statusLeads && sumberLeads) {
        const layananIds = await prisma.layanan.findMany().then(ls => ls.map(l => l.id.toString()))
        
        for (let i = 1; i <= 10; i++) {
          const layananId = layananIds[i % layananIds.length]
          await prisma.prospek.create({
            data: {
              namaProspek: `Prospek Sample ${i}`,
              email: `prospek${i}@example.com`,
              noWhatsApp: `0812345678${i}`,
              sumberLeadsId: sumberLeads.id,
              tipeFaskesId: tipeFaskes.id,
              layananAssistId: layananId,
              statusLeadsId: statusLeads.id,
              tanggalProspek: new Date(2025, 9, Math.max(1, 19 - (i % 15))),
              namaFaskes: 'Klinik Pratama',
              picLeads: 'admin@neoassist.com',
            },
          })
        }
        console.log(`  ✅ Created 10 sample Prospek`)
      }
    }

    // 8. Create sample AdsSpend data
    console.log('\n💰 Creating sample AdsSpend...')
    const adsBudgetCount = await prisma.adsBudget.count()
    
    if (adsBudgetCount === 0) {
      const kodeAds = await prisma.kodeAds.findFirst({
        where: { kode: '200' },
      })
      const sumberLeads = await prisma.sumberLeads.findFirst({
        where: { nama: 'Google Ads' },
      })

      if (kodeAds && sumberLeads) {
        const currentPeriode = new Date().toISOString().slice(0, 7)
        const now = new Date().toISOString()
        
        await prisma.adsBudget.create({
          data: {
            kodeAdsId: kodeAds.id,
            sumberLeadsId: sumberLeads.id,
            budget: 5000000,
            spent: 2000000,
            periode: currentPeriode,
            budgetHistory: [
              {
                id: Date.now(),
                type: 'budget',
                amount: 5000000,
                note: 'Initial budget created',
                createdBy: 'admin@neoassist.com',
                createdAt: now,
              },
            ],
            spentHistory: [
              {
                id: Date.now() + 1,
                type: 'spend',
                amount: 2000000,
                note: 'Initial spend recorded',
                createdBy: 'admin@neoassist.com',
                createdAt: now,
              },
            ],
            createdBy: 'admin@neoassist.com',
          },
        })
        console.log(`  ✅ Created sample AdsSpend`)
      }
    }

    console.log('\n✨ Restoration completed!\n')
    console.log('📝 Demo Credentials:')
    console.log('  Email: admin@neoassist.com')
    console.log('  Password: admin123\n')
    
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
