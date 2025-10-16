import { PrismaClient, UserRole } from '../generated/prisma'
import { hashPassword } from '../src/lib/auth-utils'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Seed Status Leads - Make sure "Customer" status exists
  const statusLeadsData = [
    { nama: 'Leads' },
    { nama: 'Customer' },
    { nama: 'Follow Up' },
    { nama: 'Bukan Leads' },
  ]

  for (const status of statusLeadsData) {
    const existingStatus = await prisma.statusLeads.findFirst({
      where: { nama: status.nama },
    })

    if (!existingStatus) {
      await prisma.statusLeads.create({
        data: status,
      })
      console.log(`✅ Created status: ${status.nama}`)
    } else {
      console.log(`⏭️  Status "${status.nama}" already exists, skipping...`)
    }
  }

  // Demo accounts with roles
  const demoAccounts = [
    {
      email: 'admin@demo.com',
      password: 'demo123',
      name: 'Super Admin',
      role: UserRole.admin,
      companyId: 1,
    },
    {
      email: 'representative@demo.com',
      password: 'demo123',
      name: 'CS Representative',
      role: UserRole.cs_representative,
      companyId: 1,
    },
    {
      email: 'advertiser@demo.com',
      password: 'demo123',
      name: 'Advertiser',
      role: UserRole.advertiser,
      companyId: 1,
    },
    {
      email: 'support@demo.com',
      password: 'demo123',
      name: 'CS Support',
      role: UserRole.cs_support,
      companyId: 1,
    },
    {
      email: 'retention@demo.com',
      password: 'demo123',
      name: 'Retention Specialist',
      role: UserRole.retention_specialist,
      companyId: 1,
    },
  ]

  for (const account of demoAccounts) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: account.email },
    })

    if (existingUser) {
      console.log(`⏭️  User ${account.email} already exists, skipping...`)
      continue
    }

    // Hash password
    const hashedPassword = await hashPassword(account.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: account.email,
        password: hashedPassword,
        name: account.name,
        role: account.role,
        companyId: account.companyId,
      },
    })

    console.log(`✅ Created user: ${user.email} (${user.role})`)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
