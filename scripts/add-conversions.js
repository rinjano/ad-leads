const { PrismaClient } = require('../generated/prisma/index.js')

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Adding conversion data to prospek...\n')

  try {
    // Get all prospek
    const prospekList = await prisma.prospek.findMany()
    console.log(`Found ${prospekList.length} prospek records\n`)

    // Get or create produk for layanan
    const layananList = await prisma.layanan.findMany()
    const produkMap = {}

    for (const layanan of layananList) {
      let produk = await prisma.produk.findFirst({
        where: { layananId: layanan.id },
      })

      if (!produk) {
        produk = await prisma.produk.create({
          data: {
            nama: `${layanan.nama} - Standard Product`,
            deskripsi: `Standard product for ${layanan.nama}`,
            layananId: layanan.id,
          },
        })
      }
      produkMap[layanan.id] = produk.id
    }

    // For each prospek, create a konversi_customer if not exists
    let count = 0
    for (const prospek of prospekList) {
      const existing = await prisma.konversi_customer.findFirst({
        where: { prospekId: prospek.id },
      })

      if (!existing) {
        // Create konversi_customer
        const nilaiTransaksi = Math.floor(Math.random() * 10) * 500000 + 1000000
        const now = new Date()
        const konversi = await prisma.konversi_customer.create({
          data: {
            prospekId: prospek.id,
            tanggalKonversi: now,
            totalNilaiTransaksi: nilaiTransaksi,
            keterangan: `Conversion for prospek ${prospek.id}`,
            updatedAt: now,
          },
        })

        // Add conversion items for each layanan
        for (const layanan of layananList) {
          const produkId = produkMap[layanan.id]
          const itemValue = Math.floor(Math.random() * 5) * 500000 + 1000000

          try {
            await prisma.konversi_customer_item.create({
              data: {
                konversiCustomerId: konversi.id,
                layananId: layanan.id,
                produkId: produkId,
                nilaiTransaksi: itemValue,
                durasiLangganan: Math.floor(Math.random() * 12) + 1,
                tipeDurasi: 'bulan',
                updatedAt: now,
              },
            })
          } catch (itemError) {
            console.warn(`Warning: Could not create item for konversi ${konversi.id}:`, itemError.message)
          }
        }

        count++
      }
    }

    console.log(`✅ Created ${count} konversi records with items\n`)

    // Also mark some as Leads
    const statusLeads = await prisma.statusLeads.findFirst({
      where: { nama: 'Leads' },
    })

    if (statusLeads) {
      const updated = await prisma.prospek.updateMany({
        where: {
          tanggalProspek: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        data: {
          statusLeadsId: statusLeads.id,
        },
      })
      console.log(`✅ Updated ${updated.count} prospek to Leads status`)
    }

    console.log('\n✨ Conversion data setup completed!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
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
