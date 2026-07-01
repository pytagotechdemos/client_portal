import { prisma } from './lib/prisma';

import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.agencyUser.upsert({
    where: { email: 'admin@pytagotech.com' },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      name: 'Admin Volta',
      email: 'admin@pytagotech.com',
      passwordHash: hashedPassword,
    },
  });
  console.log('Admin user created/updated:', admin);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
