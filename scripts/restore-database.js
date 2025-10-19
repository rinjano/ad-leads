const { PrismaClient } = require('../generated/prisma')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const prisma = new PrismaClient()

async function restoreDatabase(backupFile) {
  try {
    console.log('🔄 Starting database restore...\n')
    
    if (!fs.existsSync(backupFile)) {
      console.error(`❌ Backup file not found: ${backupFile}`)
      process.exit(1)
    }

    console.log(`📁 Reading backup file: ${backupFile}`)
    const sqlContent = fs.readFileSync(backupFile, 'utf8')
    
    // Split by lines and filter out comments and empty lines
    const lines = sqlContent.split('\n').filter(line => {
      const trimmed = line.trim()
      return trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('SET')
    })
    
    console.log(`📦 Found ${lines.length} SQL statements to execute\n`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const line of lines) {
      try {
        if (line.trim()) {
          await prisma.$executeRawUnsafe(line)
          successCount++
          
          // Show progress every 10 statements
          if (successCount % 10 === 0) {
            process.stdout.write(`   ⏳ Processed ${successCount} statements...\r`)
          }
        }
      } catch (error) {
        errorCount++
        // Ignore duplicate key errors (data already exists)
        if (!error.message.includes('duplicate key') && !error.message.includes('already exists')) {
          console.error(`   ⚠️  Error executing: ${line.substring(0, 100)}...`)
          console.error(`      ${error.message}`)
        }
      }
    }
    
    console.log(`\n✅ Restore completed!`)
    console.log(`   - Successfully executed: ${successCount} statements`)
    if (errorCount > 0) {
      console.log(`   - Skipped (duplicates/errors): ${errorCount} statements`)
    }
    
  } catch (error) {
    console.error('❌ Error during restore:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get backup file from command line argument
const args = process.argv.slice(2)
let backupFile

if (args.length === 0) {
  // If no argument, list available backups and prompt user
  const backupDir = path.join(__dirname, '..', 'backups')
  
  if (!fs.existsSync(backupDir)) {
    console.error('❌ No backups directory found. Please create a backup first.')
    process.exit(1)
  }
  
  const backups = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
    .reverse()
  
  if (backups.length === 0) {
    console.error('❌ No backup files found. Please create a backup first.')
    process.exit(1)
  }
  
  console.log('📋 Available backups:')
  backups.forEach((backup, index) => {
    const filePath = path.join(backupDir, backup)
    const stats = fs.statSync(filePath)
    console.log(`   ${index + 1}. ${backup} (${(stats.size / 1024).toFixed(2)} KB, ${stats.mtime.toLocaleString()})`)
  })
  
  console.log('\n💡 Usage: node scripts/restore-database.js <backup-filename>')
  console.log(`   Example: node scripts/restore-database.js ${backups[0]}`)
  process.exit(0)
} else {
  // Use provided backup file
  const filename = args[0]
  
  // Check if it's a full path or just filename
  if (path.isAbsolute(filename)) {
    backupFile = filename
  } else {
    backupFile = path.join(__dirname, '..', 'backups', filename)
  }
}

// Confirm before restore
console.log('⚠️  WARNING: This will restore data from backup!')
console.log('   Existing data with the same IDs will be skipped.')
console.log('   This operation cannot be undone.\n')
console.log(`📁 Backup file: ${backupFile}\n`)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Do you want to continue? (yes/no): ', (answer) => {
  rl.close()
  
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    restoreDatabase(backupFile)
      .then(() => {
        console.log('\n✨ Restore process finished!')
        process.exit(0)
      })
      .catch((error) => {
        console.error('❌ Restore failed:', error)
        process.exit(1)
      })
  } else {
    console.log('❌ Restore cancelled.')
    process.exit(0)
  }
})
