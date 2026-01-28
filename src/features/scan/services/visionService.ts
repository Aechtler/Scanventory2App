/**
 * Gemini Vision API Service
 * Analysiert Bilder und erkennt Produkte
 */

import * as FileSystem from 'expo-file-system/legacy';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface VisionResult {
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  description: string;
  confidence: number;
  searchQuery: string; // Optimierter Suchbegriff für Marktsuche
}

export interface VisionError {
  message: string;
  code: string;
}

/**
 * Analysiert ein Bild mit Gemini Vision API
 * @param imageUri - Lokaler URI des Bildes
 * @returns VisionResult mit erkanntem Produkt
 */
export async function analyzeImage(imageUri: string): Promise<VisionResult> {
  // Bild zu Base64 konvertieren
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
              text: `Analysiere dieses Bild eines Gegenstands und gib mir folgende Informationen im JSON-Format zurück:

{
  "productName": "Genauer Produktname (z.B. 'Apple iPhone 14 Pro 256GB')",
  "category": "Kategorie (Elektronik, Kleidung, Möbel, Spielzeug, Sammlerstück, Sonstiges)",
  "brand": "Marke falls erkennbar, sonst null",
  "condition": "Geschätzter Zustand (Neu, Wie neu, Gut, Akzeptabel, Für Ersatzteile)",
  "description": "Kurze Beschreibung des Gegenstands (1-2 Sätze)",
  "confidence": 0.85,
  "searchQuery": "Optimierter Suchbegriff für eBay-Suche"
}

Antworte NUR mit dem JSON, ohne zusätzlichen Text.`,
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
        temperature: 0.2,
        maxOutputTokens: 500,
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

  const result = JSON.parse(jsonMatch[0]) as VisionResult;
  return result;
}

/**
 * Mock-Funktion für Tests ohne API Key
 */
export async function analyzeImageMock(imageUri: string): Promise<VisionResult> {
  // Simuliere API-Latenz
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    productName: 'Apple iPhone 14 Pro 128GB Space Black',
    category: 'Elektronik',
    brand: 'Apple',
    condition: 'Gut',
    description: 'iPhone 14 Pro in gutem Zustand mit leichten Gebrauchsspuren.',
    confidence: 0.92,
    searchQuery: 'iPhone 14 Pro 128GB',
  };
}
