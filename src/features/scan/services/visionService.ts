/**
 * Gemini Vision API Service
 * Analysiert Bilder und erkennt Produkte
 */

import * as FileSystem from 'expo-file-system/legacy';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface VisionMatch {
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  description: string;
  confidence: number;
  searchQuery: string;
}

export interface VisionResult {
  matches: VisionMatch[];
  selectedIndex: number | null;
}

export interface VisionError {
  message: string;
  code: string;
}

/**
 * Analysiert ein Bild mit Gemini Vision API
 * @param imageUri - Lokaler URI des Bildes
 * @returns VisionResult mit bis zu 3 möglichen Treffern
 */
export async function analyzeImage(imageUri: string): Promise<VisionResult> {
  const base64Image = await FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64',
  });

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Analysiere dieses Bild und identifiziere den Gegenstand. Gib mir die 3 wahrscheinlichsten Treffer als JSON-Array zurück.

Für jeden Treffer:
- productName: Genauer Produktname mit Modell/Variante falls erkennbar
- category: Elektronik, Kleidung, Möbel, Spielzeug, Sammlerstück, oder Sonstiges
- brand: Marke falls erkennbar, sonst null
- condition: Neu, Wie neu, Gut, Akzeptabel, oder Für Ersatzteile
- description: 1 Satz Beschreibung
- confidence: Zahl zwischen 0 und 1
- searchQuery: Optimierter Suchbegriff für Marktplatz-Suche

Beispiel-Antwort:
{
  "matches": [
    {"productName": "...", "category": "...", "brand": "...", "condition": "...", "description": "...", "confidence": 0.9, "searchQuery": "..."},
    {"productName": "...", "category": "...", "brand": null, "condition": "...", "description": "...", "confidence": 0.7, "searchQuery": "..."},
    {"productName": "...", "category": "...", "brand": null, "condition": "...", "description": "...", "confidence": 0.5, "searchQuery": "..."}
  ]
}

Sortiere nach Konfidenz (höchste zuerst). Antworte NUR mit dem JSON.`,
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Fehler bei der Bildanalyse');
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textContent) {
    throw new Error('Keine Analyse erhalten');
  }

  // JSON aus der Antwort extrahieren
  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Ungültiges Antwortformat');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  
  // Handle both old (single result) and new (matches array) format
  if (parsed.matches && Array.isArray(parsed.matches)) {
    return {
      matches: parsed.matches,
      selectedIndex: null,
    };
  }
  
  // Fallback for single result
  return {
    matches: [parsed as VisionMatch],
    selectedIndex: 0,
  };
}

/**
 * Mock-Funktion für Tests ohne API Key
 */
export async function analyzeImageMock(_imageUri: string): Promise<VisionResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    matches: [
      {
        productName: 'Apple iPhone 14 Pro 128GB Space Black',
        category: 'Elektronik',
        brand: 'Apple',
        condition: 'Gut',
        description: 'iPhone 14 Pro in gutem Zustand mit leichten Gebrauchsspuren.',
        confidence: 0.92,
        searchQuery: 'iPhone 14 Pro 128GB',
      },
      {
        productName: 'Apple iPhone 14 128GB',
        category: 'Elektronik',
        brand: 'Apple',
        condition: 'Gut',
        description: 'iPhone 14 Standard-Modell.',
        confidence: 0.75,
        searchQuery: 'iPhone 14 128GB',
      },
      {
        productName: 'Apple iPhone 13 Pro 128GB',
        category: 'Elektronik',
        brand: 'Apple',
        condition: 'Gut',
        description: 'iPhone 13 Pro Vorgängermodell.',
        confidence: 0.55,
        searchQuery: 'iPhone 13 Pro 128GB',
      },
    ],
    selectedIndex: null,
  };
}
