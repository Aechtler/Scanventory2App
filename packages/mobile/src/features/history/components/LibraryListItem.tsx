import { LibraryListCard } from './LibraryListCard';
import type { HistoryItem } from '../store/historyStore';

interface LibraryListItemProps {
  item: HistoryItem;
  index: number;
  onDelete: (itemId: string) => void;
}

export function LibraryListItem({ item, index, onDelete }: LibraryListItemProps) {
  return (
    <LibraryListCard
      item={item}
      index={index}
      onDelete={() => onDelete(item.id)}
    />
  );
}
