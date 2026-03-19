import type { HistoryItem } from './types';

export const getHistoryItemById = (
  items: HistoryItem[],
  id: string,
): HistoryItem | undefined => items.find((item) => item.id === id);
