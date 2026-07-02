import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@studiovolta.com' },
    update: { passwordHash },
    create: {
      name: 'Admin Volta',
      email: 'admin@studiovolta.com',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('Seeded admin:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
