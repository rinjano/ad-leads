const { PrismaClient } = require('../generated/prisma/index.js')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Hash password using bcrypt (matching auth-utils.ts)
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

async function main() {
  console.log('👤 Setting up admin account...\n')

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@demo.com' },
    })

    if (existingAdmin) {
      console.log('⏭️  Admin account already exists')
      console.log('Email: admin@demo.com')
      console.log('Password: demo123')
      return
    }

    // Hash password
    const hashedPassword = await hashPassword('demo123')

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'admin',
        companyId: 1,
      },
    })

    console.log('✅ Admin account created successfully!')
    console.log('\n📝 Login Credentials:')
    console.log('  Email: admin@demo.com')
    console.log('  Password: demo123')
    console.log('\n🔗 Login URL: http://localhost:3000/login')

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
