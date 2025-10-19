# Database Backup - Quick Reference

## 🚀 Quick Commands

### Backup Database
```bash
npm run db:backup
```
Creates: `backups/backup-YYYY-MM-DDTHH-MM-SS.sql`

### List Backups
```bash
npm run db:restore
```

### Restore Specific Backup
```bash
npm run db:restore backup-2025-10-19T12-30-45.sql
```

### Auto Backup (with logging)
```bash
npm run db:auto-backup
```

## 📋 What Gets Backed Up?

✅ All tables:
- User (Admin & CS accounts)
- StatusLeads (Leads, On Going, Bukan Leads, Customer)
- Layanan (RME, Solmet, etc)
- TipeFaskes (Types of healthcare facilities)
- KodeAds (Ad codes)
- SumberLeads (Lead sources)
- BukanLeads (Non-lead reasons)
- Prospek (All prospect data)
- konversi_customer (Customer conversions)
- konversi_customer_item (Conversion items)
- AdsBudget (Ad budgets)
- AdsBudgetHistory (Budget history)
- UserKodeAds (User ad assignments)

## ⚡ Best Practices

**ALWAYS backup before:**
- ❗ Running database migrations
- ❗ Updating Prisma schema
- ❗ Bulk data operations
- ❗ System upgrades

**Regular backups:**
- 📅 Daily (recommended)
- 📅 Weekly (minimum)
- 📅 Before major changes

## 🔄 Scheduled Backup (Cron)

```bash
# Daily at 2 AM
0 2 * * * cd /path/to/lead-management && npm run db:auto-backup >> logs/backup.log 2>&1

# Every 6 hours
0 */6 * * * cd /path/to/lead-management && npm run db:auto-backup >> logs/backup.log 2>&1
```

## 📁 Backup Location

All backups are stored in: `backups/`

File format: `backup-YYYY-MM-DDTHH-MM-SS.sql`

Example: `backup-2025-10-19T08-21-34.sql`

## 🆘 Emergency Restore

If database is corrupted:

1. Stop the application
2. Reset database schema:
   ```bash
   npx prisma migrate deploy
   ```
3. Restore latest backup:
   ```bash
   npm run db:restore backup-YYYY-MM-DDTHH-MM-SS.sql
   ```
4. Restart application
5. Verify data in dashboard

## 💾 Backup Storage

**Local:**
- Keep in `backups/` folder
- Don't commit to git (already in .gitignore)

**Cloud (Recommended):**
- Upload to Google Drive
- Sync to Dropbox
- Store in AWS S3
- Use cloud backup service

**Retention:**
- Keep daily backups for 7 days
- Keep weekly backups for 1 month
- Keep monthly backups for 1 year

## 📞 Support

Full documentation: [BACKUP_RESTORE.md](./BACKUP_RESTORE.md)

Questions? Contact development team.
