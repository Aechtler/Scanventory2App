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
} from './types';

export { EBAY_CONFIG, MARKETPLACE_NAMES } from './types';

// Re-export auth functions
export { 
  getEbayAccessToken, 
  isSandboxMode, 
  clearTokenCache 
} from './auth';

// Re-export search functions
export { searchEbay, recalculatePriceStats } from './search';

// Re-export utilities
export { 
  formatPrice, 
  formatPriceRange, 
  normalizeSearchQuery, 
  createSearchVariants 
} from './utils';

/**
 * Main search function - searches for products on the market
 * Alias for searchEbay for backward compatibility
 */
export { searchEbay as searchMarket } from './search';
