/**
 * Zentraler Prisma-Client für die App (Prisma 7 mit pg-Adapter).
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL muss gesetzt sein');
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
