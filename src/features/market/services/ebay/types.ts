/**
 * eBay Service Types
 * Alle Interfaces und Typen für den eBay Service
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
  platform: 'ebay' | 'kleinanzeigen' | 'amazon' | 'idealo';
  priceStats: PriceStats;
  listings: MarketListing[];
  fetchedAt: Date;
}

export interface EbaySearchResult {
  data: any;
  total: number;
}

export interface EbayConfig {
  authUrl: string;
  apiUrl: string;
  marketplaceId: string;
  fallbackMarketplaces: string[];
}

export const EBAY_CONFIG: EbayConfig = {
  authUrl: 'https://api.ebay.com/identity/v1/oauth2/token',
  apiUrl: 'https://api.ebay.com/buy/browse/v1',
  marketplaceId: 'EBAY_DE',
  // Fallback marketplaces if DE has no results (for rare/collectible items)
  fallbackMarketplaces: ['EBAY_US', 'EBAY_GB', 'EBAY_FR', 'EBAY_AU'],
};
