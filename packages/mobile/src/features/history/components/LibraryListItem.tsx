import { LibraryListCard } from './LibraryListCard';
import type { LibraryItem } from '../utils/libraryRows';

interface LibraryListItemProps {
  item: LibraryItem;
  index: number;
  onDelete?: (itemId: string) => void;
  onShare?: (itemId: string) => void;
}

export function LibraryListItem({ item, index, onDelete, onShare }: LibraryListItemProps) {
  return (
    <LibraryListCard
      item={item}
      index={index}
      onDelete={onDelete ? () => onDelete(item.id) : undefined}
      onShare={onShare ? () => onShare(item.id) : undefined}
    />
  );
}
