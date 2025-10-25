const { PrismaClient } = require('../generated/prisma');

async function checkUser() {
  const prisma = new PrismaClient();

  try {
    console.log('Checking super admin user in database...');

    const user = await prisma.user.findUnique({
      where: { email: 'superadmin@example.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        userKodeAds: {
          include: {
            kodeAds: true
          }
        }
      }
    });

    if (user) {
      console.log('User found:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        kodeAds: user.userKodeAds?.map(uka => uka.kodeAds.kode) || []
      });
    } else {
      console.log('User not found');
    }

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();