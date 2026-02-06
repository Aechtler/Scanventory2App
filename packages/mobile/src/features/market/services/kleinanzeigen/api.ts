/**
 * Kleinanzeigen API Search
 */

import { PriceStats, MarketResult, MarketListing } from '@/features/market/services/ebay/types';
import { KLEINANZEIGEN_CONFIG } from '@/features/market/services/kleinanzeigen/types';

/**
 * Searches Kleinanzeigen using the real API
 */
export async function searchKleinanzeigenReal(query: string): Promise<MarketResult | null> {
  const token = process.env.EXPO_PUBLIC_KLEINANZEIGEN_TOKEN;

  if (!token) {
    console.log('[Kleinanzeigen] No API token configured');
    return null;
  }

  try {
    console.log('[Kleinanzeigen] Starting search for:', query);

    const encodedQuery = encodeURIComponent(query);
    const url = `${KLEINANZEIGEN_CONFIG.apiUrl}/api/ads?q=${encodedQuery}&limit=50&locationId=0`;

    console.log('[Kleinanzeigen] Request URL:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), KLEINANZEIGEN_CONFIG.timeout);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('[Kleinanzeigen] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Kleinanzeigen] Search failed:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const items = data.ads || data.items || data.results || [];

    if (items.length === 0) {
      console.log('[Kleinanzeigen] No items found');
      return null;
    }

    const listings: MarketListing[] = [];
    const prices: number[] = [];

    for (const item of items) {
      const priceData = item.price || item.attributes?.price || {};
      const priceValue = parseFloat(
        priceData.amount ||
        priceData.value ||
        item.priceAmount ||
        '0'
      );

      if (priceValue > 0) {
        prices.push(priceValue);
        listings.push({
          id: item.id || item.adId || `ka-${listings.length}`,
          title: item.title || item.subject || 'Unbekannt',
          price: priceValue,
          currency: priceData.currency || 'EUR',
          condition: item.condition || item.attributes?.condition || 'Unbekannt',
          imageUrl: item.images?.[0]?.url || item.pictures?.[0]?.url || '',
          itemUrl: item.url || item.link || `https://www.kleinanzeigen.de/s-anzeige/${item.id}`,
          sold: item.status === 'SOLD' || item.sold === true,
          marketplace: 'KLEINANZEIGEN',
        });
      }
    }

    if (prices.length === 0) {
      console.log('[Kleinanzeigen] No valid prices found');
      return null;
    }

    prices.sort((a, b) => a - b);

    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const medianPrice = prices[Math.floor(prices.length / 2)];
    const soldCount = listings.filter(l => l.sold).length;

    console.log('[Kleinanzeigen] Parsed', listings.length, 'listings with prices');

    return {
      query,
      platform: 'kleinanzeigen',
      priceStats: {
        minPrice: prices[0],
        maxPrice: prices[prices.length - 1],
        avgPrice: Math.round(avgPrice * 100) / 100,
        medianPrice,
        totalListings: listings.length,
        soldListings: soldCount,
      },
      listings,
      fetchedAt: new Date(),
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Kleinanzeigen] Request timeout');
    } else {
      console.error('[Kleinanzeigen] Search error:', error);
    }
    return null;
  }
}
