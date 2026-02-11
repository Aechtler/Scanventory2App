/**
 * Database Seed - Erstellt den Admin-User
 */

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable is required for seeding');
  }

  const email = process.env.ADMIN_EMAIL || 'admin@scanapp.local';
  const password = process.env.ADMIN_PASSWORD || 'change-me';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { apiKey },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Admin',
      email,
      password: hashedPassword,
      apiKey,
      isAdmin: true,
    },
  });

  console.log(`Admin user created/found: ${user.id} (${user.name})`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
