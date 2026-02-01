/**
 * eBay Search API
 * Handles product search with multiple query variants
 */

import { getEbayAccessToken } from './auth';
import { EBAY_CONFIG, MarketListing, MarketResult, EbaySearchResult } from './types';
import { createSearchVariants } from './utils';

/**
 * Searches eBay with a specific query
 */
async function searchWithQuery(
  query: string,
  token: string
): Promise<EbaySearchResult | null> {
  const encodedQuery = encodeURIComponent(query);
  const url = `${EBAY_CONFIG.apiUrl}/item_summary/search?q=${encodedQuery}&limit=50&sort=price`;

  console.log('[eBay Search] Trying:', query);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': EBAY_CONFIG.marketplaceId,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('[eBay Search] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[eBay Search] Failed:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const total = data.total || 0;

    console.log('[eBay Search] Results:', total, 'items found');

    if (data.itemSummaries && data.itemSummaries.length > 0) {
      return { data, total };
    }

    return null;
  } catch (error) {
    console.error('[eBay Search] Error:', error);
    return null;
  }
}

/**
 * Parses eBay item summaries into listings and prices
 */
function parseListings(itemSummaries: any[]): { listings: MarketListing[]; prices: number[] } {
  const listings: MarketListing[] = [];
  const prices: number[] = [];

  for (const item of itemSummaries) {
    const priceValue = parseFloat(item.price?.value || '0');
    if (priceValue > 0) {
      prices.push(priceValue);
      listings.push({
        id: item.itemId,
        title: item.title,
        price: priceValue,
        currency: item.price?.currency || 'EUR',
        condition: item.condition || 'Unbekannt',
        imageUrl: item.thumbnailImages?.[0]?.imageUrl || '',
        itemUrl: item.itemWebUrl || '',
        sold: false,
      });
    }
  }

  return { listings, prices };
}

/**
 * Calculates price statistics from an array of prices
 */
function calculatePriceStats(prices: number[]): {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  medianPrice: number;
} {
  const sorted = [...prices].sort((a, b) => a - b);
  const avgPrice = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const medianPrice = sorted[Math.floor(sorted.length / 2)];

  return {
    minPrice: sorted[0],
    maxPrice: sorted[sorted.length - 1],
    avgPrice: Math.round(avgPrice * 100) / 100,
    medianPrice,
  };
}

/**
 * Searches eBay for products with multiple search strategies
 */
export async function searchEbay(query: string): Promise<MarketResult | null> {
  console.log('[eBay] ═══════════════════════════════════════');
  console.log('[eBay] Starting search for:', query);
  console.log('[eBay] ═══════════════════════════════════════');

  const token = await getEbayAccessToken();
  if (!token) {
    console.log('[eBay] No token available, skipping search');
    return null;
  }

  try {
    const searchVariants = createSearchVariants(query);
    console.log('[eBay] Search variants:', searchVariants);

    let bestResult: EbaySearchResult | null = null;

    for (const variant of searchVariants) {
      const result = await searchWithQuery(variant, token);

      if (result && result.total > 0) {
        if (!bestResult || result.total > bestResult.total) {
          bestResult = result;
        }

        if (result.total >= 10) {
          console.log('[eBay] Found sufficient results, stopping search');
          break;
        }
      }
    }

    if (!bestResult?.data?.itemSummaries?.length) {
      console.log('[eBay] ❌ No items found with any search variant');
      console.log('[eBay] ═══════════════════════════════════════');
      return null;
    }

    const { listings, prices } = parseListings(bestResult.data.itemSummaries);

    if (prices.length === 0) {
      console.log('[eBay] ❌ No valid prices found in items');
      console.log('[eBay] ═══════════════════════════════════════');
      return null;
    }

    const priceStats = calculatePriceStats(prices);

    console.log('[eBay] ✅ Parsed', listings.length, 'listings');
    console.log('[eBay] Price range:', priceStats.minPrice, '€ -', priceStats.maxPrice, '€');
    console.log('[eBay] ═══════════════════════════════════════');

    return {
      query,
      platform: 'ebay',
      priceStats: {
        ...priceStats,
        totalListings: listings.length,
        soldListings: 0,
      },
      listings,
      fetchedAt: new Date(),
    };
  } catch (error) {
    console.error('[eBay] ❌ Search error:', error);
    console.log('[eBay] ═══════════════════════════════════════');
    return null;
  }
}
