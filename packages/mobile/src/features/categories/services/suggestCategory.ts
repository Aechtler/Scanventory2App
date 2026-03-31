/**
 * KI-gestützte Kategorie-Vorauswahl via Gemini.
 * Gibt den besten Pfad im Kategorie-Baum zurück.
 */

import type { CategoryNode } from '../types';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/** Baut eine flache Liste aller vollständigen Pfade aus dem Baum */
function flattenPaths(nodes: CategoryNode[], prefix = ''): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    const current = prefix ? `${prefix} > ${node.name}` : node.name;
    paths.push(current);
    if (node.children.length > 0) {
      paths.push(...flattenPaths(node.children, current));
    }
  }
  return paths;
}

/** Findet den Node-Pfad für einen Array von Namen */
export function resolvePathToNode(
  tree: CategoryNode[],
  names: string[]
): { node: CategoryNode; pathString: string } | null {
  if (names.length === 0) return null;

  let current = tree;
  let node: CategoryNode | undefined;
  const resolved: string[] = [];

  for (const name of names) {
    const match = current.find(
      (n) => n.name.toLowerCase() === name.toLowerCase()
    );
    if (!match) break;
    node = match;
    resolved.push(match.name);
    current = match.children;
  }

  if (!node) return null;
  return { node, pathString: resolved.join(' > ') };
}

/**
 * Schlägt via Gemini den besten Kategorie-Pfad für ein Produkt vor.
 * Gibt ein Array von Kategorie-Namen zurück: ['Videospiele', 'Sony', 'PlayStation 5', 'Games']
 * oder leeres Array wenn keine passende Kategorie gefunden.
 */
export async function suggestCategoryPath(
  product: { name: string; category: string; brand: string | null },
  tree: CategoryNode[]
): Promise<string[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || tree.length === 0) return [];

  const paths = flattenPaths(tree);

  // Nur die letzten Ebenen (Blätter) sind auswählbar – Top-Level-Pfade als Kontext
  const pathList = paths.map((p, i) => `${i + 1}. ${p}`).join('\n');

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Du bist ein Experte für Produktkategorisierung.

Produkt: "${product.name}"
Marke: "${product.brand ?? 'unbekannt'}"
Erkannte Kategorie: "${product.category}"

Verfügbare Kategorie-Pfade:
${pathList}

Wähle den EINEN am besten passenden Pfad aus der Liste.
Antworte NUR mit dem exakten Pfad-String aus der Liste, z.B.: "Videospiele > Sony > PlayStation 5 > Games"
Wenn kein Pfad passt, antworte mit: "null"`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.0, maxOutputTokens: 60 },
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    if (!text || text.toLowerCase() === 'null') return [];

    // Entferne Anführungszeichen falls vorhanden
    const clean = text.replace(/^"|"$/g, '').trim();

    // Validiere: muss ein Pfad aus der Liste sein
    if (!paths.includes(clean)) return [];

    return clean.split(' > ').map((s) => s.trim());
  } catch {
    return [];
  }
}
