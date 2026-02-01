/**
 * eBay Search API
 * Handles product search with multiple query variants and international fallback
 */

import { getEbayAccessToken } from './auth';
import { EBAY_CONFIG, MarketListing, MarketResult, EbaySearchResult } from './types';
import { createSearchVariants } from './utils';

/**
 * Searches eBay with a specific query on a specific marketplace
 */
async function searchWithQuery(
  query: string,
  token: string,
  marketplaceId: string = EBAY_CONFIG.marketplaceId
): Promise<EbaySearchResult | null> {
  const encodedQuery = encodeURIComponent(query);
  const url = `${EBAY_CONFIG.apiUrl}/item_summary/search?q=${encodedQuery}&limit=50&sort=price`;

  console.log(`[eBay Search] ${marketplaceId}: ${query}`);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[eBay Search] ${marketplaceId} failed:`, response.status, errorText);
      return null;
    }

    const data = await response.json();
    const total = data.total || 0;

    console.log(`[eBay Search] ${marketplaceId}: ${total} items found`);

    if (data.itemSummaries && data.itemSummaries.length > 0) {
      return { data, total };
    }

    return null;
  } catch (error) {
    console.error(`[eBay Search] ${marketplaceId} error:`, error);
    return null;
  }
}

/**
 * Searches on a marketplace with multiple query variants
 */
async function searchMarketplaceWithVariants(
  query: string,
  token: string,
  marketplaceId: string
): Promise<EbaySearchResult | null> {
  const searchVariants = createSearchVariants(query);
  
  for (const variant of searchVariants) {
    const result = await searchWithQuery(variant, token, marketplaceId);
    
    if (result && result.total > 0) {
      return result;
    }
  }
  
  return null;
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
 * Searches eBay for products - first on DE, then international fallbacks
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
    let bestResult: EbaySearchResult | null = null;
    let usedMarketplace = EBAY_CONFIG.marketplaceId;

    // 1. Try German marketplace first
    bestResult = await searchMarketplaceWithVariants(query, token, EBAY_CONFIG.marketplaceId);

    // 2. If no results in Germany, try international marketplaces as fallback
    if (!bestResult) {
      console.log('[eBay] No DE results, trying international marketplaces...');
      
      for (const fallbackMarketplace of EBAY_CONFIG.fallbackMarketplaces) {
        const result = await searchMarketplaceWithVariants(query, token, fallbackMarketplace);
        
        if (result && result.total > 0) {
          console.log(`[eBay] ✅ Found ${result.total} items on ${fallbackMarketplace}`);
          bestResult = result;
          usedMarketplace = fallbackMarketplace;
          break; // Stop at first marketplace with results
        }
      }
    }

    if (!bestResult?.data?.itemSummaries?.length) {
      console.log('[eBay] ❌ No items found on any marketplace');
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

    console.log(`[eBay] ✅ Parsed ${listings.length} listings from ${usedMarketplace}`);
    console.log('[eBay] Price range:', priceStats.minPrice, '-', priceStats.maxPrice);
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
