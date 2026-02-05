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
  marketplace?: string;  // e.g. 'EBAY_DE', 'EBAY_US'
  selected?: boolean;    // For user selection in price calculation
}

export interface PriceStats {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  medianPrice: number;
  totalListings: number;
  soldListings: number;
}

export interface MarketplaceResult {
  marketplace: string;
  marketplaceName: string;  // e.g. '🇩🇪 Deutschland'
  listings: MarketListing[];
  total: number;
}

export interface MarketResult {
  query: string;
  platform: 'ebay' | 'kleinanzeigen' | 'amazon' | 'idealo';
  priceStats: PriceStats;
  listings: MarketListing[];
  marketplaceResults?: MarketplaceResult[];  // Results grouped by marketplace
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
  allMarketplaces: string[];  // All marketplaces to search
}

// Marketplace display names
export const MARKETPLACE_NAMES: Record<string, string> = {
  'EBAY_DE': '🇩🇪 Deutschland',
  'EBAY_US': '🇺🇸 USA',
  'EBAY_GB': '🇬🇧 Großbritannien',
  'EBAY_FR': '🇫🇷 Frankreich',
  'EBAY_AU': '🇦🇺 Australien',
  'EBAY_CA': '🇨🇦 Kanada',
  'EBAY_IT': '🇮🇹 Italien',
  'EBAY_ES': '🇪🇸 Spanien',
};

export const EBAY_CONFIG: EbayConfig = {
  authUrl: 'https://api.ebay.com/identity/v1/oauth2/token',
  apiUrl: 'https://api.ebay.com/buy/browse/v1',
  marketplaceId: 'EBAY_DE',
  // All marketplaces to search in parallel
  allMarketplaces: ['EBAY_DE', 'EBAY_US', 'EBAY_GB', 'EBAY_FR', 'EBAY_CA', 'EBAY_AU'],
};
