"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../generated/prisma");
const auth_utils_1 = require("../src/lib/auth-utils");
const prisma = new prisma_1.PrismaClient();
async function main() {
    console.log('🌱 Starting comprehensive database seed...');
    try {
        // 1. Seed Status Leads
        console.log('\n📍 Seeding StatusLeads...');
        const statusLeadsData = [
            { nama: 'Leads' },
            { nama: 'Customer' },
            { nama: 'Follow Up' },
            { nama: 'Bukan Leads' },
        ];
        for (const status of statusLeadsData) {
            const existing = await prisma.statusLeads.findFirst({
                where: { nama: status.nama },
            });
            if (!existing) {
                await prisma.statusLeads.create({ data: status });
                console.log(`  ✅ Created: ${status.nama}`);
            }
        }
        // 2. Seed Layanan
        console.log('\n🏥 Seeding Layanan...');
        const layananData = [
            { nama: 'RME', deskripsi: 'Rekam Medis Elektronik' },
            { nama: 'Solmet', deskripsi: 'Solusi Medis Terintegrasi' },
            { nama: 'Klinik App', deskripsi: 'Aplikasi Klinik' },
        ];
        for (const layanan of layananData) {
            const existing = await prisma.layanan.findFirst({
                where: { nama: layanan.nama },
            });
            if (!existing) {
                await prisma.layanan.create({ data: layanan });
                console.log(`  ✅ Created: ${layanan.nama}`);
            }
        }
        // 3. Seed Tipe Faskes
        console.log('\n🏢 Seeding TipeFaskes...');
        const tipeFaskesData = [
            { nama: 'Klinik Pratama' },
            { nama: 'Praktek Mandiri' },
            { nama: 'Klinik Kecantikan' },
            { nama: 'Rumah Sakit' },
            { nama: 'Apotek' },
        ];
        for (const tipe of tipeFaskesData) {
            const existing = await prisma.tipeFaskes.findFirst({
                where: { nama: tipe.nama },
            });
            if (!existing) {
                await prisma.tipeFaskes.create({ data: tipe });
                console.log(`  ✅ Created: ${tipe.nama}`);
            }
        }
        // 4. Seed Kode Ads
        console.log('\n📱 Seeding KodeAds...');
        const kodeAdsData = [
            { kode: '000', deskripsi: 'Direct/Organic' },
            { kode: '200', deskripsi: 'Google Search' },
            { kode: '201', deskripsi: 'Google Display' },
            { kode: '202', deskripsi: 'Facebook Ads' },
            { kode: '203', deskripsi: 'Instagram Ads' },
            { kode: '204', deskripsi: 'TikTok Ads' },
        ];
        for (const kode of kodeAdsData) {
            const existing = await prisma.kodeAds.findFirst({
                where: { kode: kode.kode },
            });
            if (!existing) {
                await prisma.kodeAds.create({ data: kode });
                console.log(`  ✅ Created: ${kode.kode} - ${kode.deskripsi}`);
            }
        }
        // 5. Seed Sumber Leads
        console.log('\n📊 Seeding SumberLeads...');
        const sumberLeadsData = [
            { nama: 'Direct' },
            { nama: 'Google Ads' },
            { nama: 'Facebook Ads' },
            { nama: 'Instagram Ads' },
            { nama: 'TikTok Ads' },
            { nama: 'Website' },
            { nama: 'Referral' },
        ];
        for (const sumber of sumberLeadsData) {
            const existing = await prisma.sumberLeads.findFirst({
                where: { nama: sumber.nama },
            });
            if (!existing) {
                await prisma.sumberLeads.create({ data: sumber });
                console.log(`  ✅ Created: ${sumber.nama}`);
            }
        }
        // 6. Seed Users
        console.log('\n👥 Seeding Users...');
        const usersData = [
            {
                email: 'admin@neoassist.com',
                name: 'Administrator',
                password: await (0, auth_utils_1.hashPassword)('admin123'),
                role: prisma_1.UserRole.admin,
                companyId: 1,
            },
            {
                email: 'cs@neoassist.com',
                name: 'CS Representative',
                password: await (0, auth_utils_1.hashPassword)('cs123'),
                role: prisma_1.UserRole.cs_representative,
                companyId: 1,
            },
            {
                email: 'advertiser@neoassist.com',
                name: 'Advertiser',
                password: await (0, auth_utils_1.hashPassword)('ads123'),
                role: prisma_1.UserRole.advertiser,
                companyId: 1,
            },
        ];
        for (const user of usersData) {
            const existing = await prisma.user.findFirst({
                where: { email: user.email },
            });
            if (!existing) {
                await prisma.user.create({
                    data: {
                        email: user.email,
                        name: user.name,
                        password: user.password,
                        role: user.role,
                        companyId: user.companyId,
                    },
                });
                console.log(`  ✅ Created user: ${user.email}`);
            }
        }
        // 7. Create sample Prospek data
        console.log('\n🎯 Creating sample Prospek data...');
        const tipeFaskesId = await prisma.tipeFaskes.findFirst({
            where: { nama: 'Klinik Pratama' },
        }).then(t => t?.id);
        const layananId = await prisma.layanan.findFirst({
            where: { nama: 'RME' },
        }).then(l => l?.id);
        const statusLeadsId = await prisma.statusLeads.findFirst({
            where: { nama: 'Leads' },
        }).then(s => s?.id);
        if (tipeFaskesId && layananId && statusLeadsId) {
            const sampleCount = await prisma.prospek.count();
            if (sampleCount === 0) {
                // Get a sumberLeads for linking
                const sumberLeads = await prisma.sumberLeads.findFirst();
                if (sumberLeads) {
                    for (let i = 1; i <= 10; i++) {
                        await prisma.prospek.create({
                            data: {
                                namaProspek: `Prospek Sample ${i}`,
                                email: `prospek${i}@example.com`,
                                noWhatsApp: `0812345678${i}`,
                                sumberLeadsId: sumberLeads.id,
                                tipeFaskesId,
                                layananAssistId: layananId.toString(),
                                statusLeadsId,
                                tanggalProspek: new Date(2025, 9, 19 - (i % 15)),
                                namaFaskes: 'Klinik Pratama',
                                picLeads: 'admin@neoassist.com',
                            },
                        });
                    }
                    console.log(`  ✅ Created 10 sample Prospek records`);
                }
            }
        }
        // 8. Create sample AdsSpend data
        console.log('\n💰 Creating sample AdsSpend data...');
        const adsBudgetCount = await prisma.adsBudget.count();
        if (adsBudgetCount === 0) {
            const kodeAds200 = await prisma.kodeAds.findFirst({
                where: { kode: '200' },
            });
            const sumberGoogleAds = await prisma.sumberLeads.findFirst({
                where: { nama: 'Google Ads' },
            });
            if (kodeAds200 && sumberGoogleAds) {
                const currentPeriode = new Date().toISOString().slice(0, 7);
                await prisma.adsBudget.create({
                    data: {
                        kodeAdsId: kodeAds200.id,
                        sumberLeadsId: sumberGoogleAds.id,
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
                                createdAt: new Date().toISOString(),
                            },
                        ],
                        spentHistory: [
                            {
                                id: Date.now() + 1,
                                type: 'spend',
                                amount: 2000000,
                                note: 'Initial spend recorded',
                                createdBy: 'admin@neoassist.com',
                                createdAt: new Date().toISOString(),
                            },
                        ],
                        createdBy: 'admin@neoassist.com',
                    },
                });
                console.log(`  ✅ Created sample AdsSpend data`);
            }
        }
        console.log('\n✨ Database seed completed successfully!');
        console.log('\n📝 Demo Credentials:');
        console.log('  - Email: admin@neoassist.com');
        console.log('  - Password: admin123');
        console.log('  - Role: Administrator');
    }
    catch (error) {
        console.error('❌ Error during seed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
main()
    .then(() => {
    console.log('\n✅ Seed completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
