/**
 * Database Seed - Erstellt den Admin-User
 */

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const apiKey = process.env.API_KEY || 'change-me-to-a-secure-key';

  const user = await prisma.user.upsert({
    where: { apiKey },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Admin',
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
