/**
 * eBay Market Service
 * Sucht nach Produkten und berechnet Preisstatistiken
 * 
 * Aktuell: Mock-Daten für Entwicklung
 * TODO: Echte eBay API Integration
 */

export interface MarketListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  imageUrl: string;
  itemUrl: string;
  sold: boolean;
}

export interface PriceStats {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  medianPrice: number;
  totalListings: number;
  soldListings: number;
}

export interface MarketResult {
  query: string;
  platform: 'ebay' | 'kleinanzeigen' | 'amazon';
  priceStats: PriceStats;
  listings: MarketListing[];
  fetchedAt: Date;
}

// Mock-Preisdaten basierend auf Produktkategorie
const MOCK_PRICE_RANGES: Record<string, { min: number; max: number }> = {
  Elektronik: { min: 50, max: 1200 },
  Kleidung: { min: 10, max: 200 },
  Möbel: { min: 30, max: 800 },
  Spielzeug: { min: 5, max: 150 },
  Sammlerstück: { min: 20, max: 500 },
  Sonstiges: { min: 10, max: 300 },
};

/**
 * Sucht nach Produkten auf dem Markt
 * @param query - Suchbegriff
 * @param category - Produktkategorie für bessere Mock-Daten
 */
export async function searchMarket(
  query: string,
  category: string = 'Sonstiges'
): Promise<MarketResult> {
  // TODO: Echte eBay API Implementation
  // if (process.env.EXPO_PUBLIC_EBAY_API_KEY) {
  //   return searchEbayReal(query);
  // }

  return searchMarketMock(query, category);
}

/**
 * Mock-Implementierung für Entwicklung
 */
async function searchMarketMock(
  query: string,
  category: string
): Promise<MarketResult> {
  // Simuliere API-Latenz
  await new Promise((resolve) => setTimeout(resolve, 800));

  const priceRange = MOCK_PRICE_RANGES[category] || MOCK_PRICE_RANGES['Sonstiges'];
  
  // Generiere realistische Preise
  const prices: number[] = [];
  const listingCount = 8 + Math.floor(Math.random() * 12);
  
  for (let i = 0; i < listingCount; i++) {
    const price = priceRange.min + Math.random() * (priceRange.max - priceRange.min);
    prices.push(Math.round(price * 100) / 100);
  }
  
  prices.sort((a, b) => a - b);

  const listings: MarketListing[] = prices.map((price, index) => ({
    id: `mock-${index}`,
    title: `${query} - Angebot ${index + 1}`,
    price,
    currency: 'EUR',
    condition: ['Neu', 'Wie neu', 'Gut', 'Akzeptabel'][Math.floor(Math.random() * 4)],
    imageUrl: '',
    itemUrl: `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(query)}`,
    sold: Math.random() > 0.5,
  }));

  const soldPrices = listings.filter((l) => l.sold).map((l) => l.price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  return {
    query,
    platform: 'ebay',
    priceStats: {
      minPrice: prices[0],
      maxPrice: prices[prices.length - 1],
      avgPrice: Math.round(avgPrice * 100) / 100,
      medianPrice: prices[Math.floor(prices.length / 2)],
      totalListings: listings.length,
      soldListings: soldPrices.length,
    },
    listings,
    fetchedAt: new Date(),
  };
}

/**
 * Formatiert einen Preis für die Anzeige
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(price);
}
