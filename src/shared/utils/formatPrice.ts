/**
 * Formatiert einen Preis für die Anzeige
 *
 * @param price - Der Preis als Zahl
 * @param currency - Währungscode (default: EUR)
 * @returns Formatierter Preis-String
 *
 * @example
 * formatPrice(1234.56) // "1.234,56 €"
 * formatPrice(99.99, 'USD') // "$99.99"
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Formatiert eine Preisspanne
 *
 * @example
 * formatPriceRange(50, 150) // "50,00 € - 150,00 €"
 */
export function formatPriceRange(
  min: number,
  max: number,
  currency: string = 'EUR'
): string {
  return `${formatPrice(min, currency)} - ${formatPrice(max, currency)}`;
}

/**
 * Berechnet Statistiken für eine Liste von Preisen
 */
export function calculatePriceStats(prices: number[]): {
  min: number;
  max: number;
  average: number;
  median: number;
} {
  if (prices.length === 0) {
    return { min: 0, max: 0, average: 0, median: 0 };
  }

  const sorted = [...prices].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;

  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;

  return { min, max, average, median };
}
