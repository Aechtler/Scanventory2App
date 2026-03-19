import { View } from 'react-native';
import { LibraryGridCard } from './LibraryGridCard';
import type { HistoryItem } from '../store/historyStore';

interface LibraryGridItemProps {
  items: [HistoryItem, HistoryItem?];
  rowIndex: number;
}

export function LibraryGridItem({ items, rowIndex }: LibraryGridItemProps) {
  const [leftItem, rightItem] = items;
  const leftIndex = rowIndex * 2;

  return (
    <View className="flex-row gap-4 mb-4">
      <View style={{ flex: 1 }}>
        <LibraryGridCard item={leftItem} index={leftIndex} />
      </View>
      <View style={{ flex: 1 }}>
        {rightItem ? (
          <LibraryGridCard item={rightItem} index={leftIndex + 1} />
        ) : null}
      </View>
    </View>
  );
}
