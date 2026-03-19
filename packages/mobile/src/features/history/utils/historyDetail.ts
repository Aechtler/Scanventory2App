import type { HistoryItem } from '../store/historyStore';

export interface HistoryDetailState {
  platformQueries: {
    ebay: string;
    amazon: string;
    idealo: string;
    generic: string;
  };
  searchQuery: string;
  shouldLoadMarketValue: boolean;
  shouldLoadEbayData: boolean;
}

type HistoryDetailInput = Pick<
  HistoryItem,
  'productName' | 'brand' | 'searchQuery' | 'searchQueries' | 'marketValue' | 'ebayListings'
>;

export function getHistoryDetailFallbackQuery(item: HistoryDetailInput): string {
  return item.searchQuery || `${item.brand || ''} ${item.productName}`.trim();
}

export function getHistoryDetailSearchQuery(item: HistoryDetailInput): string {
  return item.searchQueries?.generic || item.productName;
}

export function buildHistoryDetailState(item: HistoryDetailInput): HistoryDetailState {
  const fallbackQuery = getHistoryDetailFallbackQuery(item);
  const genericQuery = item.searchQueries?.generic || fallbackQuery;

  return {
    platformQueries: {
      ebay: item.searchQueries?.ebay || fallbackQuery,
      amazon: item.searchQueries?.amazon || genericQuery,
      idealo: item.searchQueries?.idealo || genericQuery,
      generic: genericQuery,
    },
    searchQuery: getHistoryDetailSearchQuery(item),
    shouldLoadMarketValue: !item.marketValue,
    shouldLoadEbayData: !item.ebayListings?.length,
  };
}
