import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function checkUsers() {
  console.log('🔍 Checking users in database...\n')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  })

  if (users.length === 0) {
    console.log('❌ No users found in database!')
  } else {
    console.log(`✅ Found ${users.length} user(s):\n`)
    users.forEach((user) => {
      console.log(`  - ${user.email} (${user.role}) - ${user.name}`)
    })
  }

  await prisma.$disconnect()
}

checkUsers().catch(console.error)
