const { PrismaClient } = require('../generated/prisma/index.js')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Setting up ads-spend data...\n')

  try {
    // Get all ads sumber leads (channels with "ads" in name)
    const adsSumberLeads = await prisma.sumberLeads.findMany({
      where: {
        nama: {
          contains: 'Ads',
        },
      },
    })
    console.log(`Found ${adsSumberLeads.length} ads channels: ${adsSumberLeads.map(s => s.nama).join(', ')}\n`)

    // Get all kodeAds
    const kodeAdsList = await prisma.kodeAds.findMany()
    console.log(`Found ${kodeAdsList.length} kodeAds\n`)

    // Get all prospek and update them to use ads channels
    const prospekList = await prisma.prospek.findMany()
    console.log(`Updating ${prospekList.length} prospek records...\n`)

    for (let i = 0; i < prospekList.length; i++) {
      const prospek = prospekList[i]
      // Assign to a random ads channel
      const randomAdsSumberLeads = adsSumberLeads[Math.floor(Math.random() * adsSumberLeads.length)]

      await prisma.prospek.update({
        where: { id: prospek.id },
        data: {
          sumberLeadsId: randomAdsSumberLeads.id,
        },
      })
    }

    console.log(`✅ Updated all prospek to use ads channels\n`)

    // Now create AdsBudget records for all combinations of kodeAds and ads sumberLeads that exist in prospek
    const prospekCombinations = await prisma.prospek.findMany({
      select: {
        kodeAdsId: true,
        sumberLeadsId: true,
      },
      distinct: ['kodeAdsId', 'sumberLeadsId'],
    })

    console.log(`Found ${prospekCombinations.length} unique combinations of kodeAds and sumberLeads\n`)

    const currentPeriode = new Date().toISOString().slice(0, 7)
    const now = new Date().toISOString()

    let createdBudgets = 0
    for (const combination of prospekCombinations) {
      if (!combination.kodeAdsId) continue

      // Check if budget already exists
      const existing = await prisma.adsBudget.findFirst({
        where: {
          kodeAdsId: combination.kodeAdsId,
          sumberLeadsId: combination.sumberLeadsId,
          periode: currentPeriode,
        },
      })

      if (!existing) {
        const budget = Math.floor(Math.random() * 8) * 1000000 + 3000000 // 3M - 11M
        const spent = Math.floor(budget * (Math.random() * 0.8 + 0.2)) // 20-100% of budget

        await prisma.adsBudget.create({
          data: {
            kodeAdsId: combination.kodeAdsId,
            sumberLeadsId: combination.sumberLeadsId,
            budget: budget,
            spent: spent,
            periode: currentPeriode,
            budgetHistory: [
              {
                id: Date.now(),
                type: 'budget',
                amount: budget,
                note: 'Initial budget created',
                createdBy: 'admin@neoassist.com',
                createdAt: now,
              },
            ],
            spentHistory: [
              {
                id: Date.now() + 1,
                type: 'spend',
                amount: spent,
                note: 'Initial spend recorded',
                createdBy: 'admin@neoassist.com',
                createdAt: now,
              },
            ],
            createdBy: 'admin@neoassist.com',
          },
        })
        createdBudgets++
      }
    }

    console.log(`✅ Created ${createdBudgets} AdsBudget records\n`)

    // Verify
    const adsSpendCount = await prisma.adsBudget.findMany()
    console.log(`Total AdsBudget records: ${adsSpendCount.length}`)

    console.log('\n✨ Ads-spend data setup completed!')

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
