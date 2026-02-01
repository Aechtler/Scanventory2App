/**
 * eBay Search Utilities
 * Helper functions for query normalization and price formatting
 */

/**
 * Normalizes a search query for better API results
 */
export function normalizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Creates search variants for better hit rate
 */
export function createSearchVariants(query: string): string[] {
  const normalized = normalizeSearchQuery(query);
  const variants: string[] = [normalized];

  // Variant without special characters
  const withoutSpecial = normalized.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (withoutSpecial !== normalized) {
    variants.push(withoutSpecial);
  }

  // Variant: Only main words (> 3 chars)
  const mainWords = normalized.split(' ').filter(word => word.length > 3).join(' ');
  if (mainWords && mainWords !== normalized) {
    variants.push(mainWords);
  }

  return variants;
}

/**
 * Formats a price for display
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Formats a price range for display
 */
export function formatPriceRange(min: number, max: number, currency: string = 'EUR'): string {
  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
}
