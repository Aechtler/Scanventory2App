/**
 * eBay Service
 * 
 * Modular eBay Browse API integration for product search and price statistics.
 * 
 * @example
 * import { searchMarket, formatPrice, PriceStats } from '@/features/market/services/ebay';
 */

// Re-export types
export type { 
  MarketListing, 
  PriceStats, 
  MarketResult, 
  MarketplaceResult,
  EbaySearchResult,
  EbayConfig 
} from '@/features/market/services/ebay/types';

export { EBAY_CONFIG, MARKETPLACE_NAMES } from '@/features/market/services/ebay/types';

// Re-export auth functions
export { 
  getEbayAccessToken, 
  isSandboxMode, 
  clearTokenCache 
} from '@/features/market/services/ebay/auth';

// Re-export search functions
export { searchEbay, recalculatePriceStats } from '@/features/market/services/ebay/search';

// Re-export utilities
export { 
  formatPrice, 
  formatPriceRange, 
  normalizeSearchQuery, 
  createSearchVariants 
} from '@/features/market/services/ebay/utils';

/**
 * Main search function - searches for products on the market
 * Alias for searchEbay for backward compatibility
 */
export { searchEbay as searchMarket } from '@/features/market/services/ebay/search';
