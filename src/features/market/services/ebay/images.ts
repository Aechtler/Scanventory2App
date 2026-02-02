/**
 * eBay Product Image Fetcher
 * Quickly fetches the first product image for a given query
 */

import { getEbayAccessToken } from './auth';
import { EBAY_CONFIG } from './types';

/**
 * Fetches the first product image from eBay for a given search query
 * @param query - Product name or search term
 * @returns Image URL or null if not found
 */
export async function getProductImage(query: string): Promise<string | null> {
  const token = await getEbayAccessToken();
  if (!token) {
    return null;
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `${EBAY_CONFIG.apiUrl}/item_summary/search?q=${encodedQuery}&limit=1`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': EBAY_CONFIG.marketplaceId,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const firstItem = data.itemSummaries?.[0];

    if (firstItem?.image?.imageUrl) {
      return firstItem.image.imageUrl;
    }

    if (firstItem?.thumbnailImages?.[0]?.imageUrl) {
      return firstItem.thumbnailImages[0].imageUrl;
    }

    return null;
  } catch (error) {
    console.error('[eBay Images] Error fetching image:', error);
    return null;
  }
}
