import type { HistoryItem } from '../store/historyStore';
import type { ViewMode } from '../components/LibrarySearchBar';

export const LIBRARY_PAGE_SIZE = 20;

export type LibraryRow =
  | { type: 'list'; id: string; item: HistoryItem }
  | { type: 'grid'; id: string; items: [HistoryItem, HistoryItem?] };

export function buildLibraryRows(items: HistoryItem[], viewMode: ViewMode): LibraryRow[] {
  if (viewMode === 'list') {
    return items.map((item) => ({ type: 'list', id: item.id, item }));
  }

  const rows: LibraryRow[] = [];

  for (let index = 0; index < items.length; index += 2) {
    const leftItem = items[index];
    const rightItem = items[index + 1];

    rows.push({
      type: 'grid',
      id: `${leftItem.id}-${rightItem?.id ?? 'empty'}`,
      items: [leftItem, rightItem],
    });
  }

  return rows;
}
