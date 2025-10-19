# Database Backup & Restore

Script untuk backup dan restore database Lead Management System.

## 📦 Backup Database

### Cara Menggunakan

**Menggunakan npm (Recommended):**
```bash
npm run db:backup
```

**Atau langsung dengan node:**
```bash
node scripts/backup-database.js
```

Script akan:
- ✅ Membuat file backup dalam format SQL
- ✅ Menyimpan di folder `backups/` dengan timestamp
- ✅ Backup semua tabel: Users, StatusLeads, Layanan, TipeFaskes, KodeAds, SumberLeads, BukanLeads, Prospek, KonversiCustomer, AdsSpend
- ✅ Memperbarui sequences untuk auto-increment
- ✅ Menampilkan summary jumlah data yang di-backup

### Output

File backup akan tersimpan dengan format:
```
backups/backup-2025-10-19T12-30-45.sql
```

## 🔄 Restore Database

### Cara Menggunakan

1. **List backup yang tersedia:**
```bash
npm run db:restore
```
atau
```bash
node scripts/restore-database.js
```

2. **Restore dari file backup tertentu:**
```bash
npm run db:restore backup-2025-10-19T12-30-45.sql
```
atau
```bash
node scripts/restore-database.js backup-2025-10-19T12-30-45.sql
```

Script akan:
- ✅ Menampilkan konfirmasi sebelum restore
- ✅ Membaca file SQL backup
- ✅ Mengeksekusi semua INSERT statements
- ✅ Skip data yang sudah ada (duplicate keys)
- ✅ Menampilkan progress dan summary

### Catatan Penting

⚠️ **PERINGATAN:**
- Restore tidak akan menghapus data existing
- Data dengan ID yang sama akan di-skip
- Sebaiknya lakukan backup dulu sebelum restore
- Untuk fresh restore, sebaiknya reset database dulu

## 🔐 Best Practices

### Backup Rutin

Sebaiknya lakukan backup:
- ✅ Sebelum update/upgrade aplikasi
- ✅ Setelah entry data penting
- ✅ Secara berkala (harian/mingguan)
- ✅ Sebelum melakukan perubahan schema

### Auto Backup (Scheduled)

Untuk backup otomatis dengan cron:

```bash
# Edit crontab
crontab -e

# Tambahkan line ini untuk backup setiap hari jam 2 pagi
0 2 * * * cd /path/to/lead-management && npm run db:auto-backup >> logs/backup.log 2>&1

# Atau setiap 6 jam
0 */6 * * * cd /path/to/lead-management && npm run db:auto-backup >> logs/backup.log 2>&1
```

Atau jalankan manual:
```bash
npm run db:auto-backup
```

### Storage Backup

- 💾 Simpan backup di multiple lokasi
- ☁️ Upload ke cloud storage (Google Drive, Dropbox, dll)
- 🔒 Enkripsi backup yang berisi data sensitif
- 🗄️ Arsipkan backup lama tapi tetap simpan

## 📂 Struktur Backup

File backup berisi:
```sql
-- Header dengan timestamp
-- INSERT statements untuk setiap tabel
-- UPDATE sequences
```

Format SQL standard yang bisa digunakan dengan tools PostgreSQL lainnya.

## 🚨 Recovery dari Disaster

Jika database hilang total:

1. **Setup database baru:**
```bash
npx prisma migrate deploy
```

2. **Restore dari backup terbaru:**
```bash
node scripts/restore-database.js backup-YYYY-MM-DDTHH-MM-SS.sql
```

3. **Verifikasi data:**
- Login ke aplikasi
- Cek dashboard
- Cek laporan
- Test semua fitur

## 💡 Tips

- Beri nama file backup yang descriptive jika perlu
- Compress file backup besar dengan gzip
- Test restore di development environment dulu
- Dokumentasikan setiap restore yang dilakukan

## 🔧 Troubleshooting

**Error: "Backup file not found"**
- Pastikan path file benar
- Cek folder backups/ ada atau tidak

**Error: "Permission denied"**
- Pastikan folder backups/ bisa di-write
- Cek permission file

**Restore lambat:**
- Normal untuk database besar
- Biarkan process selesai
- Jangan interrupt process

## 📞 Support

Jika ada masalah dengan backup/restore, hubungi tim development.
