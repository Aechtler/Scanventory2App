/**
 * KI-Plattformempfehlung via Claude API
 * Analysiert Item-Daten und empfiehlt die beste Verkaufsplattform + Preis.
 */

import { config } from '../config';

export interface ItemData {
  productName: string;
  category: string;
  condition: string;
  brand?: string | null;
  priceStats?: {
    minPrice?: number;
    maxPrice?: number;
    avgPrice?: number;
    medianPrice?: number;
    totalListings?: number;
  } | null;
  finalPrice?: number | null;
}

export type Platform = 'ebay' | 'amazon' | 'vinted';
export type ListingType = 'auction' | 'fixed_price';

export interface PlatformRecommendation {
  platform: Platform;
  listingType: ListingType;
  suggestedPrice: number;
  reasoning: string;
}

const SYSTEM_PROMPT = `Du bist ein Experte für Online-Verkäufe in Deutschland. Analysiere den Artikel und empfehle die optimale Verkaufsplattform.

Entscheidungsregeln:
- eBay: beste Wahl für Elektronik, Sammler-Artikel, Markenware, Preise über 20€. Auktion wenn < 3 Vergleichsartikel vorhanden.
- Amazon: nur für neue oder wie-neue Artikel, Standardprodukte mit EAN/GTIN, Preise über 15€.
- Vinted: ideal für Kleidung, Mode, Schuhe, Accessoires unter 100€.

Antworte NUR mit validem JSON, kein Markdown, keine Erklärung außerhalb des JSON:
{
  "platform": "ebay" | "amazon" | "vinted",
  "listingType": "auction" | "fixed_price",
  "suggestedPrice": <Zahl in Euro>,
  "reasoning": "<1-2 Sätze Begründung auf Deutsch>"
}`;

export async function recommendPlatform(
  item: ItemData,
): Promise<PlatformRecommendation> {
  if (!config.anthropic.apiKey) {
    return fallbackRecommendation(item);
  }

  const userMessage = buildPrompt(item);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.anthropic.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!res.ok) {
      console.error('[AI] Claude API error:', res.status, await res.text());
      return fallbackRecommendation(item);
    }

    const data = await res.json() as {
      content: { type: string; text: string }[];
    };

    const text = data.content.find((c) => c.type === 'text')?.text ?? '';
    const parsed = JSON.parse(text) as PlatformRecommendation;

    // Validieren
    if (!['ebay', 'amazon', 'vinted'].includes(parsed.platform)) {
      throw new Error('Invalid platform in response');
    }

    return {
      platform: parsed.platform,
      listingType: parsed.listingType === 'auction' ? 'auction' : 'fixed_price',
      suggestedPrice: Number(parsed.suggestedPrice) || fallbackPrice(item),
      reasoning: parsed.reasoning ?? '',
    };
  } catch (e) {
    console.error('[AI] Recommendation failed, using fallback:', e);
    return fallbackRecommendation(item);
  }
}

function buildPrompt(item: ItemData): string {
  const lines = [
    `Artikel: ${item.productName}`,
    `Kategorie: ${item.category}`,
    `Zustand: ${item.condition}`,
  ];

  if (item.brand) lines.push(`Marke: ${item.brand}`);
  if (item.finalPrice) lines.push(`Vom User gesetzter Preis: ${item.finalPrice}€`);

  if (item.priceStats) {
    const s = item.priceStats;
    if (s.avgPrice) lines.push(`eBay Durchschnittspreis: ${s.avgPrice.toFixed(2)}€`);
    if (s.minPrice && s.maxPrice) lines.push(`eBay Preisspanne: ${s.minPrice.toFixed(2)}€ – ${s.maxPrice.toFixed(2)}€`);
    if (s.totalListings) lines.push(`Aktive eBay-Inserate: ${s.totalListings}`);
  }

  return lines.join('\n');
}

/** Regelbasierter Fallback wenn Claude nicht verfügbar */
function fallbackRecommendation(item: ItemData): PlatformRecommendation {
  const category = item.category.toLowerCase();
  const price = fallbackPrice(item);
  const isClothing = ['kleidung', 'mode', 'schuhe', 'bekleidung', 'fashion', 'clothing'].some((k) =>
    category.includes(k),
  );
  const isNew = ['neu', 'new'].includes(item.condition.toLowerCase());

  if (isClothing && price < 100) {
    return {
      platform: 'vinted',
      listingType: 'fixed_price',
      suggestedPrice: price,
      reasoning: 'Kleidung verkauft sich auf Vinted am besten.',
    };
  }

  if (isNew && price > 15) {
    return {
      platform: 'amazon',
      listingType: 'fixed_price',
      suggestedPrice: price,
      reasoning: 'Neue Artikel erzielen auf Amazon gute Preise.',
    };
  }

  const hasCompetition = (item.priceStats?.totalListings ?? 0) > 5;
  return {
    platform: 'ebay',
    listingType: hasCompetition ? 'fixed_price' : 'auction',
    suggestedPrice: price,
    reasoning: 'eBay ist die empfohlene Plattform für diesen Artikel.',
  };
}

function fallbackPrice(item: ItemData): number {
  if (item.finalPrice) return item.finalPrice;
  if (item.priceStats?.medianPrice) return Math.round(item.priceStats.medianPrice);
  if (item.priceStats?.avgPrice) return Math.round(item.priceStats.avgPrice * 0.9);
  return 0;
}
