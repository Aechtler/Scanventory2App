/**
 * eBay Search API
 * Handles product search across multiple marketplaces in parallel
 */

import { getEbayAccessToken } from './auth';
import { 
  EBAY_CONFIG, 
  MarketResult, 
  EbaySearchResult,
  MarketplaceResult,
  MARKETPLACE_NAMES
} from './types';
import { calculatePriceStats, recalculatePriceStats } from './calculateStats';
import { parseListingsWithMarketplace } from './parseListings';
import { createSearchVariants } from './utils';

/**
 * Searches eBay with a specific query on a specific marketplace
 */
async function searchWithQuery(
  query: string,
  token: string,
  marketplaceId: string,
  gtin?: string
): Promise<EbaySearchResult | null> {
  const encodedQuery = encodeURIComponent(query);
  let url = `${EBAY_CONFIG.apiUrl}/item_summary/search?q=${encodedQuery}&limit=20`;

  // Note: GTIN filtering is too restrictive and leads to 0 results
  // Many listings don't have GTIN data, so we search by keyword only

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
      return null;
    }

    const data = await response.json();
    const total = data.total || 0;

    if (data.itemSummaries && data.itemSummaries.length > 0) {
      return { data, total };
    }

    return null;
  } catch (error) {
    console.error(`[eBay] ${marketplaceId} error:`, error);
    return null;
  }
}

/**
 * Searches a single marketplace with query variants
 */
async function searchMarketplace(
  query: string,
  token: string,
  marketplaceId: string,
  gtin?: string
): Promise<MarketplaceResult | null> {
  const searchVariants = createSearchVariants(query);
  
  
  for (const variant of searchVariants) {
    const result = await searchWithQuery(variant, token, marketplaceId, gtin);
    
    if (result && result.total > 0) {
      const listings = parseListingsWithMarketplace(result.data.itemSummaries, marketplaceId);
      
      return {
        marketplace: marketplaceId,
        marketplaceName: MARKETPLACE_NAMES[marketplaceId] || marketplaceId,
        listings,
        total: result.total,
      };
    }
  }
  
  return null;
}

/**
 * Searches eBay across ALL marketplaces in parallel
 */
export async function searchEbay(query: string, gtin?: string): Promise<MarketResult | null> {
  if (gtin) console.log('[eBay] Using GTIN/EAN filter:', gtin);

  const token = await getEbayAccessToken();
  if (!token) {
    return null;
  }

  try {
    // Search ALL marketplaces in parallel
    const searchPromises = EBAY_CONFIG.allMarketplaces.map(marketplace =>
      searchMarketplace(query, token, marketplace, gtin)
    );

    const results = await Promise.all(searchPromises);

    // Filter out null results
    const marketplaceResults: MarketplaceResult[] = results.filter(
      (r): r is MarketplaceResult => r !== null
    );

    if (marketplaceResults.length === 0) {
      return null;
    }

    // Combine all listings
    const allListings = marketplaceResults.flatMap(r => r.listings);
    const priceStats = calculatePriceStats(allListings);

    return {
      query,
      platform: 'ebay',
      priceStats: {
        ...priceStats,
        totalListings: allListings.length,
        soldListings: 0,
      },
      listings: allListings,
      marketplaceResults,
      fetchedAt: new Date(),
    };
  } catch (error) {
    console.error('[eBay] ❌ Search error:', error);
    return null;
  }
}

export { recalculatePriceStats };
