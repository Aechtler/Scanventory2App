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
 * More variants = more chances to find rare items
 */
export function createSearchVariants(query: string): string[] {
  const normalized = normalizeSearchQuery(query);
  const words = normalized.split(' ').filter(w => w.length > 0);
  const variants: string[] = [];

  // 1. Full query
  variants.push(normalized);

  // 2. Without special characters
  const withoutSpecial = normalized.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (withoutSpecial !== normalized && withoutSpecial.length > 0) {
    variants.push(withoutSpecial);
  }

  // 3. Only main words (> 3 chars)
  const mainWords = words.filter(word => word.length > 3).join(' ');
  if (mainWords && mainWords !== normalized) {
    variants.push(mainWords);
  }

  // 4. First 4 words (for long product names)
  if (words.length > 4) {
    variants.push(words.slice(0, 4).join(' '));
  }

  // 5. First 3 words (even shorter)
  if (words.length > 3) {
    variants.push(words.slice(0, 3).join(' '));
  }

  // 6. First 2 important words (brand + product type)
  if (words.length >= 2) {
    const shortQuery = words.slice(0, 2).join(' ');
    if (!variants.includes(shortQuery)) {
      variants.push(shortQuery);
    }
  }

  console.log('[eBay] Search variants:', variants);
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
