#!/bin/bash

# Automated Database Backup Script
# This script can be scheduled with cron for automatic backups

# Change to project directory
cd "$(dirname "$0")/.."

# Run backup
echo "🕐 $(date): Starting automated backup..."
node scripts/backup-database.js

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✅ $(date): Backup completed successfully"
    
    # Optional: Delete backups older than 30 days
    # find backups/ -name "backup-*.sql" -mtime +30 -delete
    # echo "🗑️  Cleaned up old backups (>30 days)"
    
    # Optional: Upload to cloud storage (uncomment and configure)
    # LATEST_BACKUP=$(ls -t backups/backup-*.sql | head -1)
    # Upload to Google Drive, Dropbox, S3, etc.
    # rclone copy "$LATEST_BACKUP" remote:backups/
    
else
    echo "❌ $(date): Backup failed"
    exit 1
fi
