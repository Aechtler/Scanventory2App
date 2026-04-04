type PricedHistoryItem = {
  finalPrice?: number | null;
  priceStats?: { avgPrice?: number } | null;
  marketValue?: { estimatedPrice?: string } | null;
};

/** Parst "15 €", "56,81 €", "~20 €" etc. zu einer Zahl */
function parseEstimatedPrice(str: string): number | undefined {
  const match = str.match(/\d+(?:[.,]\d+)?/);
  if (!match) return undefined;
  const num = parseFloat(match[0].replace(',', '.'));
  return isNaN(num) ? undefined : num;
}

/**
 * Priorität: Mein Preis → KI-Schätzung (marketValue) → eBay-Durchschnitt
 */
export function getLibraryDisplayPrice(item: PricedHistoryItem): number | undefined {
  if (item.finalPrice != null) return item.finalPrice;
  if (item.marketValue?.estimatedPrice) return parseEstimatedPrice(item.marketValue.estimatedPrice);
  return item.priceStats?.avgPrice;
}

export function hasLibraryDisplayPrice(item: PricedHistoryItem): boolean {
  return getLibraryDisplayPrice(item) != null;
}

/** Gibt zurück ob der angezeigte Preis vom User gesetzt wurde */
export function isUserSetPrice(item: PricedHistoryItem): boolean {
  return item.finalPrice != null;
}

/** Gibt zurück ob der angezeigte Preis eine KI-Schätzung ist */
export function isAiEstimatedPrice(item: PricedHistoryItem): boolean {
  return item.finalPrice == null && item.marketValue?.estimatedPrice != null;
}

export function parseLocalizedPriceInput(input: string): number | undefined {
  const normalized = input.trim();

  if (!normalized) {
    return undefined;
  }

  const cleaned = normalized.replace(/\./g, '').replace(',', '.');
  const parsed = Number.parseFloat(cleaned);

  if (Number.isNaN(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}
