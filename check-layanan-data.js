const { PrismaClient } = require('./generated/prisma')

const prisma = new PrismaClient();

(async () => {
  try {
    // Check konversi_customer_item with layanan
    const konversiItems = await prisma.konversiCustomerItem.findMany({
      include: {
        layanan: true,
        konversi_customer: {
          include: {
            prospek: {
              select: {
                id: true,
                tanggalJadiLeads: true,
                kodeAdsId: true,
                sumberLeadsId: true
              }
            }
          }
        }
      },
      take: 10
    });

    console.log('Konversi Customer Items with Layanan:');
    konversiItems.forEach((item, index) => {
      console.log(`${index + 1}. Layanan: ${item.layanan?.nama}, Prospek ID: ${item.konversi_customer.prospek.id}, Tanggal Leads: ${item.konversi_customer.prospek.tanggalJadiLeads}`);
    });

    // Check if there are any monthly ads spend records
    const monthlyAdsSpend = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', p."tanggalJadiLeads") as month_year,
        COUNT(*) as total_leads,
        COUNT(DISTINCT p.id) as unique_prospek
      FROM prospek p
      WHERE p."tanggalJadiLeads" IS NOT NULL
        AND p."kodeAdsId" IS NOT NULL
      GROUP BY DATE_TRUNC('month', p."tanggalJadiLeads")
      ORDER BY month_year DESC
      LIMIT 5
    `;

    console.log('\nMonthly Ads Spend Summary:');
    console.log(monthlyAdsSpend);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();