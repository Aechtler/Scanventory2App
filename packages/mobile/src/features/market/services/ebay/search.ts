/**
 * eBay Search API
 * Handles product search across multiple marketplaces in parallel
 */

import { getEbayAccessToken } from './auth';
import { 
  EBAY_CONFIG, 
  MarketListing, 
  MarketResult, 
  EbaySearchResult,
  MarketplaceResult,
  MARKETPLACE_NAMES
} from './types';
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
 * Parses eBay item summaries into listings with marketplace info
 */
function parseListingsWithMarketplace(itemSummaries: any[], marketplaceId: string): MarketListing[] {
  const listings: MarketListing[] = [];

  for (const item of itemSummaries) {
    const priceValue = parseFloat(item.price?.value || '0');
    if (priceValue > 0) {
      listings.push({
        id: item.itemId,
        title: item.title,
        price: priceValue,
        currency: item.price?.currency || 'EUR',
        condition: item.condition || 'Unbekannt',
        imageUrl: item.thumbnailImages?.[0]?.imageUrl || '',
        itemUrl: item.itemWebUrl || '',
        sold: false,
        marketplace: marketplaceId,
        selected: false, // Default NOT selected - user picks reference items
      });
    }
  }

  return listings;
}

/**
 * Calculates price statistics from an array of prices
 */
function calculatePriceStats(listings: MarketListing[]): {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  medianPrice: number;
} {
  const prices = listings.map(l => l.price).sort((a, b) => a - b);
  
  if (prices.length === 0) {
    return { minPrice: 0, maxPrice: 0, avgPrice: 0, medianPrice: 0 };
  }

  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const mid = Math.floor(prices.length / 2);
  const medianPrice = prices.length % 2 !== 0
    ? prices[mid]
    : (prices[mid - 1] + prices[mid]) / 2;

  return {
    minPrice: prices[0],
    maxPrice: prices[prices.length - 1],
    avgPrice: Math.round(avgPrice * 100) / 100,
    medianPrice,
  };
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

/**
 * Recalculates price stats based on selected listings only
 */
export function recalculatePriceStats(listings: MarketListing[]): {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  medianPrice: number;
  totalListings: number;
  soldListings: number;
} {
  const selectedListings = listings.filter(l => l.selected);
  const stats = calculatePriceStats(selectedListings);
  
  return {
    ...stats,
    totalListings: selectedListings.length,
    soldListings: 0,
  };
}
