const { PrismaClient } = require('../generated/prisma/index.js')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Adding konversi_customer records for all prospek...\n')

  try {
    // Get all prospek and layanan
    const allProspek = await prisma.prospek.findMany()
    const layananList = await prisma.layanan.findMany()

    console.log(`Found ${allProspek.length} prospek and ${layananList.length} layanan`)

    // Get or create produk for layanan
    const produkMap = {}
    for (const layanan of layananList) {
      let produk = await prisma.produk.findFirst({
        where: { layananId: layanan.id }
      })

      if (!produk) {
        produk = await prisma.produk.create({
          data: {
            nama: `${layanan.nama} - Standard Product`,
            deskripsi: `Standard product for ${layanan.nama}`,
            layananId: layanan.id,
          },
        })
        console.log(`✅ Created produk: ${produk.nama}`)
      }
      produkMap[layanan.id] = produk.id
    }

    let konversiCreated = 0

    for (const prospek of allProspek) {
      const existingKonversi = await prisma.konversi_customer.findFirst({
        where: { prospekId: prospek.id }
      })

      if (!existingKonversi) {
        const nilaiTransaksi = Math.floor(Math.random() * 5) * 1000000 + 2000000 // 2M - 7M
        const konversi = await prisma.konversi_customer.create({
          data: {
            prospekId: prospek.id,
            tanggalKonversi: new Date(),
            totalNilaiTransaksi: nilaiTransaksi,
            keterangan: `Conversion for ${prospek.namaProspek}`,
            updatedAt: new Date(),
          },
        })

        // Create konversi items for each layanan - assign RME to some, combination to others
        const layananAssignments = [
          [layananList.find(l => l.nama === 'RME')], // Only RME
          [layananList.find(l => l.nama === 'RME'), layananList.find(l => l.nama === 'Solmet')], // RME + Solmet
          [layananList.find(l => l.nama === 'RME'), layananList.find(l => l.nama === 'Klinik App')], // RME + Klinik App
          [layananList.find(l => l.nama === 'Solmet')], // Only Solmet
          [layananList.find(l => l.nama === 'Klinik App')], // Only Klinik App
        ].filter(assignment => assignment.every(l => l)) // Filter out undefined layanan

        const assignment = layananAssignments[Math.floor(Math.random() * layananAssignments.length)]

        for (const layanan of assignment) {
          const produkId = produkMap[layanan.id]
          const itemValue = Math.floor(nilaiTransaksi / assignment.length)
          await prisma.konversi_customer_item.create({
            data: {
              konversiCustomerId: konversi.id,
              layananId: layanan.id,
              produkId: produkId,
              nilaiTransaksi: itemValue,
              durasiLangganan: Math.floor(Math.random() * 12) + 1,
              tipeDurasi: 'bulan',
              updatedAt: new Date(),
            },
          })
        }

        console.log(`✅ Created konversi for ${prospek.namaProspek} with layanan: ${assignment.map(l => l.nama).join(', ')}`)
        konversiCreated++
      }
    }

    console.log(`\n✅ Created ${konversiCreated} konversi records`)

    // Verify
    const finalKonversiCount = await prisma.konversi_customer.count()
    console.log(`Total konversi_customer records: ${finalKonversiCount}`)

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