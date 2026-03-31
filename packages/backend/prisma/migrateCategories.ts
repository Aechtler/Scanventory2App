/**
 * Kategorie-Migration — Mappt legacy category-Strings auf categoryId/categoryPath.
 *
 * Läuft idempotent: Nur Items ohne categoryId werden angefasst.
 * Aufruf: npm run db:migrate:categories
 *
 * Mapping-Strategie:
 *   1. Exakter Name-Match (case-insensitive) gegen root-Kategorien
 *   2. Bekannte Legacy-Aliases (z.B. "Sammlerstück" → "Sammlerstücke")
 *   3. Kein Match → bleibt unverändert (manuell nachpflegen)
 */

import { config } from 'dotenv';
import path from 'node:path';
config({ path: path.join(__dirname, '../.env') });

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/** Bekannte Legacy-Namen → aktueller Kategorie-Name */
const LEGACY_ALIASES: Record<string, string> = {
  'sammlerstück':  'Sammlerstücke',
  'sammlerstucke': 'Sammlerstücke',
  'elektronik':    'Elektronik',
  'kleidung':      'Kleidung',
  'möbel':         'Möbel',
  'mobel':         'Möbel',
  'spielzeug':     'Spielzeug',
  'videospiele':   'Videospiele',
  'haushalt':      'Haushalt',
  'sport':         'Sport',
  'bücher':        'Bücher',
  'bucher':        'Bücher',
  'sonstiges':     'Sonstiges',
};

async function main() {
  console.log('Kategorie-Migration gestartet...\n');

  // Alle root-Kategorien laden (parentId = null)
  const rootCategories = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    select: { id: true, name: true },
  });

  if (rootCategories.length === 0) {
    console.error('Keine Kategorien in der DB gefunden. Bitte zuerst npm run db:seed:categories ausführen.');
    process.exit(1);
  }

  console.log(`Verfügbare Root-Kategorien: ${rootCategories.map((c) => c.name).join(', ')}\n`);

  // Name → ID Map für schnellen Lookup
  const categoryByName = new Map(
    rootCategories.map((c) => [c.name.toLowerCase(), c])
  );

  // Alle Items ohne categoryId
  const itemsToMigrate = await prisma.scannedItem.findMany({
    where: { categoryId: null },
    select: { id: true, category: true },
  });

  console.log(`Items ohne categoryId: ${itemsToMigrate.length}\n`);

  if (itemsToMigrate.length === 0) {
    console.log('Nichts zu tun – alle Items haben bereits eine categoryId.');
    return;
  }

  const stats = {
    migrated: 0,
    skipped: 0,
    skippedCategories: new Set<string>(),
  };

  for (const item of itemsToMigrate) {
    const legacyName = item.category?.trim() ?? '';
    const lookupKey = legacyName.toLowerCase();

    // 1. Direkter Match
    let target = categoryByName.get(lookupKey);

    // 2. Alias-Lookup
    if (!target) {
      const aliasName = LEGACY_ALIASES[lookupKey];
      if (aliasName) {
        target = categoryByName.get(aliasName.toLowerCase());
      }
    }

    if (!target) {
      stats.skipped++;
      stats.skippedCategories.add(legacyName || '(leer)');
      continue;
    }

    await prisma.scannedItem.update({
      where: { id: item.id },
      data: {
        categoryId:   target.id,
        categoryPath: target.name,
      },
    });

    stats.migrated++;
  }

  console.log('─────────────────────────────────────');
  console.log(`✓ Migriert:    ${stats.migrated} Items`);
  console.log(`⚠ Übersprungen: ${stats.skipped} Items (kein Mapping)`);

  if (stats.skippedCategories.size > 0) {
    console.log(`\nUnbekannte Kategorie-Strings (bitte manuell prüfen):`);
    for (const name of stats.skippedCategories) {
      const count = itemsToMigrate.filter(
        (i) => (i.category?.trim() || '(leer)') === name
      ).length;
      console.log(`  - "${name}" (${count}x)`);
    }
  }

  console.log('\nMigration abgeschlossen.');
}

main()
  .catch((e) => {
    console.error('Fehler:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
