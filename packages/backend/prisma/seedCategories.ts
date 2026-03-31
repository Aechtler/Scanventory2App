/**
 * Kategorie-Seed — Befüllt das hierarchische Kategorie-System mit Basis-Daten.
 * Aufruf: tsx prisma/seedCategories.ts
 *
 * Struktur: Hauptkategorie → Marke/Plattform → Produkt → Typ
 */

import { config } from 'dotenv';
import path from 'node:path';
config({ path: path.join(__dirname, '../.env') });

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

interface CategoryDef {
  name: string;
  iconName?: string;
  sortOrder?: number;
  children?: CategoryDef[];
}

const CATEGORIES: CategoryDef[] = [
  {
    name: 'Videospiele',
    iconName: 'gamepad-2',
    sortOrder: 1,
    children: [
      {
        name: 'Sony',
        sortOrder: 1,
        children: [
          {
            name: 'PlayStation 5',
            sortOrder: 1,
            children: [
              { name: 'Games', sortOrder: 1 },
              { name: 'Konsolen', sortOrder: 2 },
              { name: 'Zubehör', sortOrder: 3 },
            ],
          },
          {
            name: 'PlayStation 4',
            sortOrder: 2,
            children: [
              { name: 'Games', sortOrder: 1 },
              { name: 'Konsolen', sortOrder: 2 },
              { name: 'Zubehör', sortOrder: 3 },
            ],
          },
          {
            name: 'PlayStation 3',
            sortOrder: 3,
            children: [
              { name: 'Games', sortOrder: 1 },
              { name: 'Konsolen', sortOrder: 2 },
              { name: 'Zubehör', sortOrder: 3 },
            ],
          },
        ],
      },
      {
        name: 'Microsoft',
        sortOrder: 2,
        children: [
          {
            name: 'Xbox Series X/S',
            sortOrder: 1,
            children: [
              { name: 'Games', sortOrder: 1 },
              { name: 'Konsolen', sortOrder: 2 },
              { name: 'Zubehör', sortOrder: 3 },
            ],
          },
          {
            name: 'Xbox One',
            sortOrder: 2,
            children: [
              { name: 'Games', sortOrder: 1 },
              { name: 'Konsolen', sortOrder: 2 },
              { name: 'Zubehör', sortOrder: 3 },
            ],
          },
          {
            name: 'Xbox 360',
            sortOrder: 3,
            children: [
              { name: 'Games', sortOrder: 1 },
              { name: 'Konsolen', sortOrder: 2 },
              { name: 'Zubehör', sortOrder: 3 },
            ],
          },
        ],
      },
      {
        name: 'Nintendo',
        sortOrder: 3,
        children: [
          {
            name: 'Nintendo Switch',
            sortOrder: 1,
            children: [
              { name: 'Games', sortOrder: 1 },
              { name: 'Konsolen', sortOrder: 2 },
              { name: 'Zubehör', sortOrder: 3 },
            ],
          },
          {
            name: 'Nintendo Wii U',
            sortOrder: 2,
            children: [
              { name: 'Games', sortOrder: 1 },
              { name: 'Konsolen', sortOrder: 2 },
              { name: 'Zubehör', sortOrder: 3 },
            ],
          },
          {
            name: 'Nintendo DS / 3DS',
            sortOrder: 3,
            children: [
              { name: 'Games', sortOrder: 1 },
              { name: 'Konsolen', sortOrder: 2 },
              { name: 'Zubehör', sortOrder: 3 },
            ],
          },
        ],
      },
      {
        name: 'PC / Steam',
        sortOrder: 4,
        children: [
          { name: 'Games', sortOrder: 1 },
          { name: 'Hardware', sortOrder: 2 },
          { name: 'Zubehör', sortOrder: 3 },
        ],
      },
    ],
  },
  {
    name: 'Trading Cards',
    iconName: 'layers',
    sortOrder: 2,
    children: [
      {
        name: 'Pokémon',
        sortOrder: 1,
        children: [
          { name: 'Booster Packs', sortOrder: 1 },
          { name: 'Booster Boxen', sortOrder: 2 },
          { name: 'Einzelkarten', sortOrder: 3 },
          { name: 'Elite Trainer Box', sortOrder: 4 },
          { name: 'Tin-Boxen', sortOrder: 5 },
        ],
      },
      {
        name: 'Magic: The Gathering',
        sortOrder: 2,
        children: [
          { name: 'Booster Packs', sortOrder: 1 },
          { name: 'Einzelkarten', sortOrder: 2 },
          { name: 'Commander Decks', sortOrder: 3 },
        ],
      },
      {
        name: 'Yu-Gi-Oh!',
        sortOrder: 3,
        children: [
          { name: 'Booster Packs', sortOrder: 1 },
          { name: 'Einzelkarten', sortOrder: 2 },
          { name: 'Structure Decks', sortOrder: 3 },
        ],
      },
      {
        name: 'One Piece',
        sortOrder: 4,
        children: [
          { name: 'Booster Packs', sortOrder: 1 },
          { name: 'Einzelkarten', sortOrder: 2 },
        ],
      },
    ],
  },
  {
    name: 'LEGO',
    iconName: 'blocks',
    sortOrder: 3,
    children: [
      {
        name: 'Star Wars',
        sortOrder: 1,
        children: [
          { name: 'Sets (neu)', sortOrder: 1 },
          { name: 'Sets (gebraucht)', sortOrder: 2 },
          { name: 'Minifiguren', sortOrder: 3 },
        ],
      },
      {
        name: 'Technic',
        sortOrder: 2,
        children: [
          { name: 'Sets (neu)', sortOrder: 1 },
          { name: 'Sets (gebraucht)', sortOrder: 2 },
        ],
      },
      {
        name: 'Creator',
        sortOrder: 3,
        children: [
          { name: 'Sets (neu)', sortOrder: 1 },
          { name: 'Sets (gebraucht)', sortOrder: 2 },
        ],
      },
      {
        name: 'City',
        sortOrder: 4,
        children: [
          { name: 'Sets (neu)', sortOrder: 1 },
          { name: 'Sets (gebraucht)', sortOrder: 2 },
        ],
      },
      {
        name: 'Ninjago',
        sortOrder: 5,
        children: [
          { name: 'Sets (neu)', sortOrder: 1 },
          { name: 'Sets (gebraucht)', sortOrder: 2 },
          { name: 'Minifiguren', sortOrder: 3 },
        ],
      },
      {
        name: 'Harry Potter',
        sortOrder: 6,
        children: [
          { name: 'Sets (neu)', sortOrder: 1 },
          { name: 'Sets (gebraucht)', sortOrder: 2 },
          { name: 'Minifiguren', sortOrder: 3 },
        ],
      },
    ],
  },
  {
    name: 'Elektronik',
    iconName: 'cpu',
    sortOrder: 4,
    children: [
      {
        name: 'Smartphones',
        sortOrder: 1,
        children: [
          { name: 'Apple iPhone', sortOrder: 1 },
          { name: 'Samsung Galaxy', sortOrder: 2 },
          { name: 'Sonstige', sortOrder: 3 },
        ],
      },
      {
        name: 'Tablets',
        sortOrder: 2,
        children: [
          { name: 'Apple iPad', sortOrder: 1 },
          { name: 'Samsung Tab', sortOrder: 2 },
          { name: 'Sonstige', sortOrder: 3 },
        ],
      },
      {
        name: 'Laptops',
        sortOrder: 3,
        children: [
          { name: 'Apple MacBook', sortOrder: 1 },
          { name: 'Windows Laptop', sortOrder: 2 },
        ],
      },
      {
        name: 'Kopfhörer',
        sortOrder: 4,
        children: [
          { name: 'Over-Ear', sortOrder: 1 },
          { name: 'In-Ear', sortOrder: 2 },
          { name: 'True Wireless', sortOrder: 3 },
        ],
      },
      {
        name: 'Kameras',
        sortOrder: 5,
        children: [
          { name: 'Spiegelreflex', sortOrder: 1 },
          { name: 'Systemkameras', sortOrder: 2 },
          { name: 'Kompaktkameras', sortOrder: 3 },
          { name: 'Zubehör', sortOrder: 4 },
        ],
      },
    ],
  },
  {
    name: 'Kleidung',
    iconName: 'shirt',
    sortOrder: 5,
    children: [
      { name: 'Herren', sortOrder: 1 },
      { name: 'Damen', sortOrder: 2 },
      { name: 'Kinder', sortOrder: 3 },
      { name: 'Schuhe', sortOrder: 4 },
    ],
  },
  {
    name: 'Sport',
    iconName: 'dumbbell',
    sortOrder: 6,
    children: [
      { name: 'Fahrräder & E-Bikes', sortOrder: 1 },
      { name: 'Fitness & Kraft', sortOrder: 2 },
      { name: 'Outdoor & Camping', sortOrder: 3 },
      { name: 'Ballsport', sortOrder: 4 },
    ],
  },
  {
    name: 'Bücher',
    iconName: 'book-open',
    sortOrder: 7,
    children: [
      { name: 'Roman & Belletristik', sortOrder: 1 },
      { name: 'Sachbuch', sortOrder: 2 },
      { name: 'Manga & Comics', sortOrder: 3 },
      { name: 'Fachbücher', sortOrder: 4 },
      { name: 'Kinderbücher', sortOrder: 5 },
    ],
  },
  {
    name: 'Möbel',
    iconName: 'armchair',
    sortOrder: 8,
    children: [
      { name: 'Wohnzimmer', sortOrder: 1 },
      { name: 'Schlafzimmer', sortOrder: 2 },
      { name: 'Küche & Esszimmer', sortOrder: 3 },
      { name: 'Büro', sortOrder: 4 },
    ],
  },
  {
    name: 'Haushalt',
    iconName: 'home',
    sortOrder: 9,
    children: [
      { name: 'Küche & Kochen', sortOrder: 1 },
      { name: 'Deko & Einrichten', sortOrder: 2 },
      { name: 'Haushaltsgeräte', sortOrder: 3 },
    ],
  },
  {
    name: 'Sammlerstücke',
    iconName: 'star',
    sortOrder: 10,
    children: [
      { name: 'Figuren & Statuen', sortOrder: 1 },
      { name: 'Münzen & Briefmarken', sortOrder: 2 },
      { name: 'Vintage & Retro', sortOrder: 3 },
      { name: 'Kunst', sortOrder: 4 },
    ],
  },
  {
    name: 'Spielzeug',
    iconName: 'toy-brick',
    sortOrder: 11,
    children: [
      { name: 'Actionfiguren', sortOrder: 1 },
      { name: 'Puppen & Zubehör', sortOrder: 2 },
      { name: 'Brettspiele', sortOrder: 3 },
      { name: 'RC-Fahrzeuge', sortOrder: 4 },
    ],
  },
  {
    name: 'Sonstiges',
    iconName: 'package',
    sortOrder: 99,
  },
];

async function createCategory(
  def: CategoryDef,
  parentId: string | null = null
): Promise<void> {
  const id = uuidv4();

  await prisma.category.upsert({
    where: {
      // Upsert über zusammengesetzten Unique-Key ist nicht möglich ohne @unique.
      // Stattdessen: Skip wenn (name + parentId) schon existiert.
      id: await findExistingId(def.name, parentId) ?? id,
    },
    update: {
      iconName: def.iconName,
      sortOrder: def.sortOrder ?? 0,
    },
    create: {
      id,
      name: def.name,
      parentId: parentId ?? undefined,
      iconName: def.iconName,
      sortOrder: def.sortOrder ?? 0,
      isActive: true,
    },
  });

  const actualId = await findExistingId(def.name, parentId) ?? id;

  if (def.children) {
    for (const child of def.children) {
      await createCategory(child, actualId);
    }
  }
}

async function findExistingId(
  name: string,
  parentId: string | null
): Promise<string | null> {
  const existing = await prisma.category.findFirst({
    where: { name, parentId: parentId ?? null },
    select: { id: true },
  });
  return existing?.id ?? null;
}

async function main() {
  console.log('Seed: Kategorien werden angelegt...');

  for (const root of CATEGORIES) {
    await createCategory(root, null);
    console.log(`  ✓ ${root.name}`);
  }

  const total = await prisma.category.count();
  console.log(`\nFertig! ${total} Kategorien in der Datenbank.`);
}

main()
  .catch((e) => {
    console.error('Seed-Fehler:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
