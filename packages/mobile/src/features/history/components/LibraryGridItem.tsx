import { View } from 'react-native';
import { LibraryGridCard } from './LibraryGridCard';
import type { LibraryItem } from '../utils/libraryRows';

interface LibraryGridItemProps {
  items: [LibraryItem, LibraryItem?];
  rowIndex: number;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
  onItemPress?: (id: string) => void;
}

export function LibraryGridItem({ items, rowIndex, selectable, selectedIds, onSelect, onItemPress }: LibraryGridItemProps) {
  const [leftItem, rightItem] = items;
  const leftIndex = rowIndex * 2;

  return (
    <View className="flex-row gap-4 mb-4">
      <View style={{ flex: 1 }}>
        <LibraryGridCard
          item={leftItem}
          index={leftIndex}
          selectable={selectable}
          selected={selectedIds?.has(leftItem.id)}
          onSelect={onSelect}
          onPress={onItemPress ? () => onItemPress(leftItem.id) : undefined}
        />
      </View>
      <View style={{ flex: 1 }}>
        {rightItem ? (
          <LibraryGridCard
            item={rightItem}
            index={leftIndex + 1}
            selectable={selectable}
            selected={selectedIds?.has(rightItem.id)}
            onSelect={onSelect}
            onPress={onItemPress ? () => onItemPress(rightItem.id) : undefined}
          />
        ) : null}
      </View>
    </View>
  );
}
