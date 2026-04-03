import { LibraryListCard } from './LibraryListCard';
import type { LibraryItem } from '../utils/libraryRows';

interface LibraryListItemProps {
  item: LibraryItem;
  index: number;
  onDelete?: (itemId: string) => void;
  onShare?: (itemId: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onItemPress?: (id: string) => void;
}

export function LibraryListItem({ item, index, onDelete, onShare, selectable, selected, onSelect, onItemPress }: LibraryListItemProps) {
  return (
    <LibraryListCard
      item={item}
      index={index}
      onDelete={onDelete ? () => onDelete(item.id) : undefined}
      onShare={onShare ? () => onShare(item.id) : undefined}
      selectable={selectable}
      selected={selected}
      onSelect={onSelect}
      onPress={onItemPress ? () => onItemPress(item.id) : undefined}
    />
  );
}
