import type { HistoryItem } from '../store/historyStore';

type PricedHistoryItem = Pick<HistoryItem, 'finalPrice' | 'priceStats'>;

export function getLibraryDisplayPrice(item: PricedHistoryItem): number | undefined {
  if (item.finalPrice != null) {
    return item.finalPrice;
  }

  return item.priceStats?.avgPrice;
}

export function hasLibraryDisplayPrice(item: PricedHistoryItem): boolean {
  return getLibraryDisplayPrice(item) != null;
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
