const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.agencyUser.upsert({
    where: { email: 'admin@studiovolta.com' },
    update: {},
    create: {
      name: 'Admin Volta',
      email: 'admin@studiovolta.com',
      passwordHash: 'admin123',
    },
  });
  console.log('Admin user created:', admin);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
