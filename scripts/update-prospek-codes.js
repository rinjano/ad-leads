const { PrismaClient } = require('../generated/prisma/index.js')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating prospek with kodeAds...\n')

  try {
    // Get all kodeAds
    const kodeAdsList = await prisma.kodeAds.findMany()
    console.log(`Found ${kodeAdsList.length} kodeAds`)

    // Get all prospek
    const prospekList = await prisma.prospek.findMany()
    console.log(`Found ${prospekList.length} prospek records\n`)

    // Update each prospek with a random kodeAdsId
    let updated = 0
    for (const prospek of prospekList) {
      // Pick a random kodeAds
      const randomKodeAds = kodeAdsList[Math.floor(Math.random() * kodeAdsList.length)]

      await prisma.prospek.update({
        where: { id: prospek.id },
        data: {
          kodeAdsId: randomKodeAds.id,
        },
      })
      updated++
    }

    console.log(`✅ Updated ${updated} prospek records with kodeAdsId`)

    // Verify the update
    const verifyProspek = await prisma.prospek.findFirst()
    if (verifyProspek) {
      console.log(`\n✅ Sample updated prospek:`)
      console.log(`   ID: ${verifyProspek.id}`)
      console.log(`   Nama: ${verifyProspek.namaProspek}`)
      console.log(`   KodeAdsId: ${verifyProspek.kodeAdsId}`)
      console.log(`   SumberLeadsId: ${verifyProspek.sumberLeadsId}`)
    }

    console.log('\n✨ Update completed!')

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
