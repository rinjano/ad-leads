const { PrismaClient } = require('../generated/prisma')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function backupDatabase() {
  try {
    console.log('🔄 Starting database backup...\n')
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupDir = path.join(__dirname, '..', 'backups')
    
    // Create backups directory if not exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    const backupFile = path.join(backupDir, `backup-${timestamp}.sql`)
    
    let sqlContent = `-- Database Backup
-- Generated on: ${new Date().toISOString()}
-- Lead Management System
-- =============================================

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

`

    // Backup Users
    console.log('📦 Backing up Users...')
    const users = await prisma.user.findMany()
    if (users.length > 0) {
      sqlContent += `\n-- Users Table\n`
      for (const user of users) {
        const values = [
          user.id,
          user.email ? `'${user.email.replace(/'/g, "''")}'` : 'NULL',
          user.password ? `'${user.password.replace(/'/g, "''")}'` : 'NULL',
          user.name ? `'${user.name.replace(/'/g, "''")}'` : 'NULL',
          user.role ? `'${user.role.replace(/'/g, "''")}'` : 'NULL',
          `'${user.createdAt.toISOString()}'`,
          `'${user.updatedAt.toISOString()}'`
        ].join(', ')
        
        sqlContent += `INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt") VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`
      }
      console.log(`   ✅ ${users.length} users backed up`)
    }

    // Backup StatusLeads
    console.log('📦 Backing up StatusLeads...')
    const statusLeads = await prisma.statusLeads.findMany()
    if (statusLeads.length > 0) {
      sqlContent += `\n-- StatusLeads Table\n`
      for (const status of statusLeads) {
        const values = [
          status.id,
          `'${status.nama.replace(/'/g, "''")}'`
        ].join(', ')
        
        sqlContent += `INSERT INTO "StatusLeads" (id, nama) VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`
      }
      console.log(`   ✅ ${statusLeads.length} status leads backed up`)
    }

    // Backup Layanan
    console.log('📦 Backing up Layanan...')
    const layanan = await prisma.layanan.findMany()
    if (layanan.length > 0) {
      sqlContent += `\n-- Layanan Table\n`
      for (const item of layanan) {
        const values = [
          item.id,
          `'${item.nama.replace(/'/g, "''")}'`
        ].join(', ')
        
        sqlContent += `INSERT INTO "Layanan" (id, nama) VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`
      }
      console.log(`   ✅ ${layanan.length} layanan backed up`)
    }

    // Backup TipeFaskes
    console.log('📦 Backing up TipeFaskes...')
    const tipeFaskes = await prisma.tipeFaskes.findMany()
    if (tipeFaskes.length > 0) {
      sqlContent += `\n-- TipeFaskes Table\n`
      for (const item of tipeFaskes) {
        const values = [
          item.id,
          `'${item.nama.replace(/'/g, "''")}'`
        ].join(', ')
        
        sqlContent += `INSERT INTO "TipeFaskes" (id, nama) VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`
      }
      console.log(`   ✅ ${tipeFaskes.length} tipe faskes backed up`)
    }

    // Backup KodeAds
    console.log('📦 Backing up KodeAds...')
    const kodeAds = await prisma.kodeAds.findMany()
    if (kodeAds.length > 0) {
      sqlContent += `\n-- KodeAds Table\n`
      for (const item of kodeAds) {
        const values = [
          item.id,
          `'${item.kode.replace(/'/g, "''")}'`,
          item.idAds ? `'${item.idAds.replace(/'/g, "''")}'` : 'NULL'
        ].join(', ')
        
        sqlContent += `INSERT INTO "KodeAds" (id, kode, "idAds") VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`
      }
      console.log(`   ✅ ${kodeAds.length} kode ads backed up`)
    }

    // Backup SumberLeads
    console.log('📦 Backing up SumberLeads...')
    const sumberLeads = await prisma.sumberLeads.findMany()
    if (sumberLeads.length > 0) {
      sqlContent += `\n-- SumberLeads Table\n`
      for (const item of sumberLeads) {
        const values = [
          item.id,
          `'${item.nama.replace(/'/g, "''")}'`
        ].join(', ')
        
        sqlContent += `INSERT INTO "SumberLeads" (id, nama) VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`
      }
      console.log(`   ✅ ${sumberLeads.length} sumber leads backed up`)
    }

    // Backup BukanLeads
    console.log('📦 Backing up BukanLeads...')
    const bukanLeads = await prisma.bukanLeads.findMany()
    if (bukanLeads.length > 0) {
      sqlContent += `\n-- BukanLeads Table\n`
      for (const item of bukanLeads) {
        const values = [
          item.id,
          `'${item.nama.replace(/'/g, "''")}'`
        ].join(', ')
        
        sqlContent += `INSERT INTO "BukanLeads" (id, nama) VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`
      }
      console.log(`   ✅ ${bukanLeads.length} bukan leads backed up`)
    }

    // Backup Prospek
    console.log('📦 Backing up Prospek...')
    const prospek = await prisma.prospek.findMany()
    if (prospek.length > 0) {
      sqlContent += `\n-- Prospek Table\n`
      for (const item of prospek) {
        const values = [
          item.id,
          item.namaProspek ? `'${item.namaProspek.replace(/'/g, "''")}'` : 'NULL',
          item.noHP ? `'${item.noHP.replace(/'/g, "''")}'` : 'NULL',
          item.kotaKabupaten ? `'${item.kotaKabupaten.replace(/'/g, "''")}'` : 'NULL',
          item.kecamatan ? `'${item.kecamatan.replace(/'/g, "''")}'` : 'NULL',
          item.namaPIC ? `'${item.namaPIC.replace(/'/g, "''")}'` : 'NULL',
          item.layananId || 'NULL',
          item.tipeFaskesId || 'NULL',
          item.statusLeadsId || 'NULL',
          item.kodeAdsId || 'NULL',
          item.sumberLeadsId || 'NULL',
          item.tanggalProspek ? `'${item.tanggalProspek.toISOString()}'` : 'NULL',
          item.tanggalJadiLeads ? `'${item.tanggalJadiLeads.toISOString()}'` : 'NULL',
          item.bukanLeadsId || 'NULL',
          item.keterangan ? `'${item.keterangan.replace(/'/g, "''")}'` : 'NULL',
          item.userId || 'NULL',
          `'${item.createdAt.toISOString()}'`,
          `'${item.updatedAt.toISOString()}'`
        ].join(', ')
        
        sqlContent += `INSERT INTO "Prospek" (id, "namaProspek", "noHP", "kotaKabupaten", kecamatan, "namaPIC", "layananId", "tipeFaskesId", "statusLeadsId", "kodeAdsId", "sumberLeadsId", "tanggalProspek", "tanggalJadiLeads", "bukanLeadsId", keterangan, "userId", "createdAt", "updatedAt") VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`
      }
      console.log(`   ✅ ${prospek.length} prospek backed up`)
    }

    // Backup konversi_customer
    console.log('📦 Backing up konversi_customer...')
    const konversi = await prisma.konversi_customer.findMany()
    if (konversi.length > 0) {
      sqlContent += `\n-- konversi_customer Table\n`
      for (const item of konversi) {
        const values = [
          item.id,
          item.prospekId,
          `'${item.tanggalKonversi.toISOString()}'`,
          item.totalNilaiTransaksi || 'NULL',
          item.keterangan ? `'${item.keterangan.replace(/'/g, "''")}'` : 'NULL',
          `'${item.createdAt.toISOString()}'`,
          `'${item.updatedAt.toISOString()}'`
        ].join(', ')
        
        sqlContent += `INSERT INTO "konversi_customer" (id, "prospekId", "tanggalKonversi", "totalNilaiTransaksi", keterangan, "createdAt", "updatedAt") VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`
      }
      console.log(`   ✅ ${konversi.length} konversi customer backed up`)
    }

    // Backup konversi_customer_item
    console.log('📦 Backing up konversi_customer_item...')
    const konversiItem = await prisma.konversi_customer_item.findMany()
    if (konversiItem.length > 0) {
      sqlContent += `\n-- konversi_customer_item Table\n`
      for (const item of konversiItem) {
        const values = [
          item.id,
          item.konversiCustomerId,
          item.layananId,
          item.produkId,
          item.nilaiTransaksi || 'NULL',
          item.durasiLangganan,
          `'${item.tipeDurasi.replace(/'/g, "''")}'`,
          `'${item.createdAt.toISOString()}'`,
          `'${item.updatedAt.toISOString()}'`
        ].join(', ')
        
        sqlContent += `INSERT INTO "konversi_customer_item" (id, "konversiCustomerId", "layananId", "produkId", "nilaiTransaksi", "durasiLangganan", "tipeDurasi", "createdAt", "updatedAt") VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`
      }
      console.log(`   ✅ ${konversiItem.length} konversi customer item backed up`)
    }

    // Backup AdsBudget
    console.log('📦 Backing up AdsBudget...')
    const adsBudget = await prisma.adsBudget.findMany()
    if (adsBudget.length > 0) {
      sqlContent += `\n-- AdsBudget Table (ads_budget)\n`
      for (const item of adsBudget) {
        const values = [
          item.id,
          item.kodeAdsId,
          item.sumberLeadsId,
          item.budget || 0,
          item.spent || 0,
          `'${item.periode.replace(/'/g, "''")}'`,
          `'${JSON.stringify(item.budgetHistory).replace(/'/g, "''")}'`,
          `'${JSON.stringify(item.spentHistory).replace(/'/g, "''")}'`,
          item.createdBy ? `'${item.createdBy.replace(/'/g, "''")}'` : 'NULL',
          item.updatedBy ? `'${item.updatedBy.replace(/'/g, "''")}'` : 'NULL',
          `'${item.createdAt.toISOString()}'`,
          `'${item.updatedAt.toISOString()}'`
        ].join(', ')
        
        sqlContent += `INSERT INTO "ads_budget" (id, "kodeAdsId", "sumberLeadsId", budget, spent, periode, "budgetHistory", "spentHistory", "createdBy", "updatedBy", "createdAt", "updatedAt") VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`
      }
      console.log(`   ✅ ${adsBudget.length} ads budget backed up`)
    }

    // Backup AdsBudgetHistory  
    console.log('📦 Backing up AdsBudgetHistory...')
    const adsBudgetHistory = await prisma.adsBudgetHistory.findMany()
    if (adsBudgetHistory.length > 0) {
      sqlContent += `\n-- AdsBudgetHistory Table (ads_budget_history)\n`
      for (const item of adsBudgetHistory) {
        const values = [
          item.id,
          item.adsBudgetId,
          `'${item.type.replace(/'/g, "''")}'`,
          item.amount || 0,
          item.note ? `'${item.note.replace(/'/g, "''")}'` : 'NULL',
          item.createdBy ? `'${item.createdBy.replace(/'/g, "''")}'` : 'NULL',
          `'${item.createdAt.toISOString()}'`
        ].join(', ')
        
        sqlContent += `INSERT INTO "ads_budget_history" (id, "adsBudgetId", type, amount, note, "createdBy", "createdAt") VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`
      }
      console.log(`   ✅ ${adsBudgetHistory.length} ads budget history backed up`)
    }

    // Backup UserKodeAds
    console.log('📦 Backing up UserKodeAds...')
    const userKodeAds = await prisma.userKodeAds.findMany()
    if (userKodeAds.length > 0) {
      sqlContent += `\n-- UserKodeAds Table\n`
      for (const item of userKodeAds) {
        const values = [
          item.id,
          item.userId,
          item.kodeAdsId,
          `'${item.assignedAt.toISOString()}'`
        ].join(', ')
        
        sqlContent += `INSERT INTO "UserKodeAds" (id, "userId", "kodeAdsId", "assignedAt") VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`
      }
      console.log(`   ✅ ${userKodeAds.length} user kode ads backed up`)
    }

    // Update sequences
    sqlContent += `\n-- Update Sequences\n`
    
    if (users.length > 0) {
      const maxUserId = Math.max(...users.map(u => u.id))
      sqlContent += `SELECT setval('"User_id_seq"', ${maxUserId}, true);\n`
    }
    
    if (statusLeads.length > 0) {
      const maxStatusId = Math.max(...statusLeads.map(s => s.id))
      sqlContent += `SELECT setval('"StatusLeads_id_seq"', ${maxStatusId}, true);\n`
    }
    
    if (layanan.length > 0) {
      const maxLayananId = Math.max(...layanan.map(l => l.id))
      sqlContent += `SELECT setval('"Layanan_id_seq"', ${maxLayananId}, true);\n`
    }
    
    if (tipeFaskes.length > 0) {
      const maxTipeFaskesId = Math.max(...tipeFaskes.map(t => t.id))
      sqlContent += `SELECT setval('"TipeFaskes_id_seq"', ${maxTipeFaskesId}, true);\n`
    }
    
    if (kodeAds.length > 0) {
      const maxKodeAdsId = Math.max(...kodeAds.map(k => k.id))
      sqlContent += `SELECT setval('"KodeAds_id_seq"', ${maxKodeAdsId}, true);\n`
    }
    
    if (sumberLeads.length > 0) {
      const maxSumberLeadsId = Math.max(...sumberLeads.map(s => s.id))
      sqlContent += `SELECT setval('"SumberLeads_id_seq"', ${maxSumberLeadsId}, true);\n`
    }
    
    if (bukanLeads.length > 0) {
      const maxBukanLeadsId = Math.max(...bukanLeads.map(b => b.id))
      sqlContent += `SELECT setval('"BukanLeads_id_seq"', ${maxBukanLeadsId}, true);\n`
    }
    
    if (prospek.length > 0) {
      const maxProspekId = Math.max(...prospek.map(p => p.id))
      sqlContent += `SELECT setval('"Prospek_id_seq"', ${maxProspekId}, true);\n`
    }
    
    if (konversi.length > 0) {
      const maxKonversiId = Math.max(...konversi.map(k => k.id))
      sqlContent += `SELECT setval('"konversi_customer_id_seq"', ${maxKonversiId}, true);\n`
    }
    
    if (konversiItem.length > 0) {
      const maxKonversiItemId = Math.max(...konversiItem.map(k => k.id))
      sqlContent += `SELECT setval('"konversi_customer_item_id_seq"', ${maxKonversiItemId}, true);\n`
    }
    
    if (adsBudget.length > 0) {
      const maxAdsBudgetId = Math.max(...adsBudget.map(a => a.id))
      sqlContent += `SELECT setval('"ads_budget_id_seq"', ${maxAdsBudgetId}, true);\n`
    }
    
    if (adsBudgetHistory.length > 0) {
      const maxAdsBudgetHistoryId = Math.max(...adsBudgetHistory.map(a => a.id))
      sqlContent += `SELECT setval('"ads_budget_history_id_seq"', ${maxAdsBudgetHistoryId}, true);\n`
    }
    
    if (userKodeAds.length > 0) {
      const maxUserKodeAdsId = Math.max(...userKodeAds.map(a => a.id))
      sqlContent += `SELECT setval('"UserKodeAds_id_seq"', ${maxUserKodeAdsId}, true);\n`
    }

    // Write to file
    fs.writeFileSync(backupFile, sqlContent)
    
    console.log('\n✅ Backup completed successfully!')
    console.log(`📁 Backup file: ${backupFile}`)
    console.log(`📊 File size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`)
    
    // Summary
    console.log('\n📈 Backup Summary:')
    console.log(`   - Users: ${users.length}`)
    console.log(`   - Status Leads: ${statusLeads.length}`)
    console.log(`   - Layanan: ${layanan.length}`)
    console.log(`   - Tipe Faskes: ${tipeFaskes.length}`)
    console.log(`   - Kode Ads: ${kodeAds.length}`)
    console.log(`   - Sumber Leads: ${sumberLeads.length}`)
    console.log(`   - Bukan Leads: ${bukanLeads.length}`)
    console.log(`   - Prospek: ${prospek.length}`)
    console.log(`   - Konversi Customer: ${konversi.length}`)
    console.log(`   - Konversi Customer Item: ${konversiItem.length}`)
    console.log(`   - Ads Budget: ${adsBudget.length}`)
    console.log(`   - Ads Budget History: ${adsBudgetHistory.length}`)
    console.log(`   - User Kode Ads: ${userKodeAds.length}`)
    
  } catch (error) {
    console.error('❌ Error during backup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

backupDatabase()
  .then(() => {
    console.log('\n✨ Backup process finished!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Backup failed:', error)
    process.exit(1)
  })
