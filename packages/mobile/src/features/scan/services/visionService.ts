/**
 * Gemini Vision API Service
 * Analysiert Bilder und erkennt Produkte
 */

import * as FileSystem from 'expo-file-system/legacy';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const IMAGE_READ_ERROR_MESSAGE = 'Bilddatei konnte nicht gelesen werden. Bitte wähle das Bild erneut aus oder nutze ein anderes Bild.';

export interface VisionMatch {
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  description: string;
  confidence: number;
  isManual?: boolean;
  searchQuery: string; // Allgemeiner Suchbegriff
  searchQueries?: {
    ebay?: string;        // Optimiert für eBay (präzise mit Modell)
    amazon?: string;      // Optimiert für Amazon (mit Produktdetails)
    idealo?: string;      // Optimiert für Idealo (Produktname)
    generic?: string;     // Fallback für alle Plattformen
  };
  gtin?: string | null;   // EAN, GTIN oder ISBN
  imageUrl?: string | null; // Produkt-Bild aus eBay-Suche
}

export interface VisionResult {
  matches: VisionMatch[];
  selectedIndex: number | null;
}

export interface VisionError {
  message: string;
  code: string;
}

async function readImageAsBase64(imageUri: string, context: string): Promise<string> {
  try {
    return await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });
  } catch (error) {
    console.error(`[Vision] Failed to read image for ${context}:`, error);
    throw new Error(IMAGE_READ_ERROR_MESSAGE);
  }
}

/**
 * Analysiert ein Bild mit Gemini Vision API
 * @param imageUri - Lokaler URI des Bildes
 * @returns VisionResult mit bis zu 3 möglichen Treffern
 */
export async function analyzeImage(imageUri: string): Promise<VisionResult> {
  const base64Image = await readImageAsBase64(imageUri, 'analysis');

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
              text: `Du bist ein Experte für Produktidentifikation. Analysiere dieses Bild SEHR GENAU und identifiziere den EXAKTEN Gegenstand.

WICHTIG:
- Schau dir ALLE sichtbaren Details an: Text, Logos, Farben, Form, Material
- Der ERSTE Treffer muss das EXAKT sichtbare Produkt sein
- Nur Treffer 2 und 3 dürfen Alternativen sein (falls unsicher)
- Wenn du Text/Logo lesen kannst, nutze diesen für die genaue Identifikation
- Achte auf Verpackungen, Etiketten, Seriennummern

Antworte als JSON:
{
  "matches": [
    {
      "productName": "EXAKTER vollständiger Produktname (mit Modell, Edition, Variante)",
      "category": "Elektronik | Kleidung | Möbel | Spielzeug | Sammlerstück | Videospiele | Haushalt | Sport | Bücher | Sonstiges",
      "brand": "Markenname oder null",
      "condition": "Neu | Wie neu | Gut | Akzeptabel | Für Ersatzteile",
      "description": "1 Satz mit erkennbaren Details und Zustandsbeschreibung",
      "confidence": 0.0-1.0,
      "searchQuery": "Allgemeiner Suchbegriff (Marke + Produktname)",
      "searchQueries": {
        "ebay": "Präzise für eBay: Marke Produktname Modell Edition (detailliert)",
        "amazon": "Amazon-optimiert: Marke Produktname Modell (wie auf Amazon gelistet)",
        "idealo": "Produkt-fokussiert: Marke Produktname ohne Zustand",
        "generic": "Universal: Marke Produkttyp (funktioniert überall)"
      }
    }
  ]
}

REGELN:
- Treffer 1: Das EXAKTE Produkt im Bild (höchste Konfidenz)
- Treffer 2-3: Nur falls du unsicher bist, ähnliche Alternativen
- Wenn du dir SEHR sicher bist, gib nur 1 Treffer mit confidence >= 0.9

SUCHBEGRIFF-STRATEGIE:
- ebay: Sehr spezifisch mit allen Details (Nutzer suchen präzise)
- amazon: Wie auf Amazon gelistet (offizielle Produktnamen)
- idealo: Neutraler Produktname ohne Zustandsangaben
- generic: Fallback für alle Plattformen

Beispiel searchQueries für "iPhone 14 Pro 256GB Space Black":
{
  "ebay": "Apple iPhone 14 Pro 256GB Space Black",
  "amazon": "Apple iPhone 14 Pro 256GB Schwarz",
  "idealo": "Apple iPhone 14 Pro 256GB",
  "generic": "iPhone 14 Pro"
}

Antworte NUR mit dem JSON, kein anderer Text.`,
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
        temperature: 0.1,  // Niedrigere Temperature für präzisere Antworten
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!response.ok) {
    let message = 'Fehler bei der Bildanalyse';

    try {
      const error = await response.json();
      message = error.error?.message || message;
    } catch (error) {
      console.error('[Vision] Failed to parse analysis error response:', error);
    }

    throw new Error(message);
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
        searchQueries: {
          ebay: 'Apple iPhone 14 Pro 128GB Space Black',

          amazon: 'Apple iPhone 14 Pro 128GB Schwarz',
          idealo: 'Apple iPhone 14 Pro 128GB',
          generic: 'iPhone 14 Pro',
        },
      },
      {
        productName: 'Apple iPhone 14 128GB',
        category: 'Elektronik',
        brand: 'Apple',
        condition: 'Gut',
        description: 'iPhone 14 Standard-Modell.',
        confidence: 0.75,
        searchQuery: 'iPhone 14 128GB',
        searchQueries: {
          ebay: 'Apple iPhone 14 128GB',

          amazon: 'Apple iPhone 14 128GB',
          idealo: 'Apple iPhone 14 128GB',
          generic: 'iPhone 14',
        },
      },
      {
        productName: 'Apple iPhone 13 Pro 128GB',
        category: 'Elektronik',
        brand: 'Apple',
        condition: 'Gut',
        description: 'iPhone 13 Pro Vorgängermodell.',
        confidence: 0.55,
        searchQuery: 'iPhone 13 Pro 128GB',
        searchQueries: {
          ebay: 'Apple iPhone 13 Pro 128GB',

          amazon: 'Apple iPhone 13 Pro 128GB',
          idealo: 'Apple iPhone 13 Pro 128GB',
          generic: 'iPhone 13 Pro',
        },
      },
    ],
    selectedIndex: null,
  };
}

/**
 * Identifiziert eine Produktnummer (EAN/GTIN/ISBN) für einen Artikel
 * @param productName - Der Name des Artikels
 * @param imageUri - Optionaler Bild-URI für visuelle Identifikation
 */
export async function identifyProductIdentifier(
  productName: string,
  imageUri?: string
): Promise<string | null> {
  try {
    const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [
      {
        text: `Du bist ein Experte für Produktkataloge. Deine Aufgabe ist es, die EAN (GTIN) oder ISBN für ein bestimmtes Produkt zu finden.
        
Produkt: ${productName}

REGELN:
- Antworte NUR mit der 13-stelligen Nummer (oder 10 bei ISBN).
- Wenn du die Nummer nicht exakt kennst, antworte mit "null".
- Keinen zusätzlichen Text, keine Erklärungen.`,
      },
    ];

    if (imageUri && GEMINI_API_KEY) {
      try {
        const base64Image = await readImageAsBase64(imageUri, 'identifier lookup');
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg',
            data: base64Image,
          },
        });

        if ('text' in parts[0]) {
          parts[0].text += '\n\nSchau dir auch das Bild an, um Barcodes oder aufgedruckte Nummern zu finden.';
        }
      } catch (error) {
        console.warn('[Vision] Identifier lookup continuing without image context:', error);
      }
    }

    if (!GEMINI_API_KEY) return null;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.0,
          maxOutputTokens: 20,
        },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!result || result.toLowerCase() === 'null') return null;

    // Nur Ziffern extrahieren
    const digits = result.replace(/\D/g, '');
    if (digits.length >= 8 && digits.length <= 14) {
      return digits;
    }

    return null;
  } catch (error) {
    console.error('[Vision] Error identifying identifier:', error);
    return null;
  }
}
