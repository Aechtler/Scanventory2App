import type { HistoryItem } from '@/features/history/store/historyStore';
import type { ViewMode } from '../components/LibrarySearchBar';

export const LIBRARY_PAGE_SIZE = 20;

/** HistoryItem + optionaler owner für Items von gefolgten Usern */
export type LibraryItem = HistoryItem & {
  owner?: {
    id: string;
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
};

export type LibraryRow =
  | { type: 'list'; id: string; item: LibraryItem }
  | { type: 'grid'; id: string; items: [LibraryItem, LibraryItem?] };

export function buildLibraryRows(items: LibraryItem[], viewMode: ViewMode): LibraryRow[] {
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
