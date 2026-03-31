import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// .env laden (für prisma CLI-Aufrufe)
config({ path: path.join(__dirname, '.env') });

const directUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: directUrl,
  },
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';
      if (!url) throw new Error('DIRECT_URL oder DATABASE_URL muss gesetzt sein');
      return new PrismaPg({ connectionString: url });
    },
  },
});
