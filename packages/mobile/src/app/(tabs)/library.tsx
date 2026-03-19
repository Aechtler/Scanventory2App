import { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MotiView } from 'moti';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore, HistoryItem } from '../../features/history/store/historyStore';
import { Icons } from '../../shared/components/Icons';
import { useLibraryFilters } from '../../features/history/hooks/useLibraryFilters';
import { LibrarySearchBar, ViewMode } from '../../features/history/components/LibrarySearchBar';
import { LibraryListCard } from '../../features/history/components/LibraryListCard';
import { LibraryGridCard } from '../../features/history/components/LibraryGridCard';
import { useThemeColors } from '../../shared/hooks/useThemeColors';

const PAGE_SIZE = 20;

type LibraryRow =
  | { type: 'list'; id: string; item: HistoryItem }
  | { type: 'grid'; id: string; items: [HistoryItem, HistoryItem?] };

function buildLibraryRows(items: HistoryItem[], viewMode: ViewMode): LibraryRow[] {
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

/**
 * Bibliothek Tab - Gescannte Gegenstände
 */
export default function LibraryTab() {
  const items = useHistoryStore((state) => state.items);
  const removeItem = useHistoryStore((state) => state.removeItem);
  const isEmpty = items.length === 0;
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const colors = useThemeColors();

  const {
    filters,
    setSearchQuery,
    setCategory,
    setSortBy,
    filteredItems,
    categories,
    isFiltered,
  } = useLibraryFilters(items);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setVisibleCount(PAGE_SIZE);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const paginatedItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  );
  const hasMore = visibleCount < filteredItems.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => prev + PAGE_SIZE);
    }
  }, [hasMore]);

  const libraryRows = useMemo(
    () => buildLibraryRows(paginatedItems, viewMode),
    [paginatedItems, viewMode]
  );

  const renderItem = useCallback(({ item, index }: { item: LibraryRow; index: number }) => {
    if (item.type === 'list') {
      return (
        <LibraryListCard
          item={item.item}
          index={index}
          onDelete={() => removeItem(item.item.id)}
        />
      );
    }

    const [leftItem, rightItem] = item.items;
    const leftIndex = index * 2;

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
  }, [removeItem]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {isEmpty ? (
        <View className="flex-1 items-center justify-center px-8">
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="mb-8 bg-background-elevated/50 p-8 rounded-full"
          >
            <Icons.Inbox size={56} color={colors.textSecondary} />
          </MotiView>
          <Text className="text-foreground text-2xl font-bold mb-3 text-center">
            Noch keine Scans
          </Text>
          <Text className="text-foreground-secondary text-base text-center leading-6 max-w-[280px]">
            Scanne deinen ersten Gegenstand und entdecke seinen Marktwert
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <LibrarySearchBar
            value={filters.searchQuery}
            onChangeText={setSearchQuery}
            categories={categories}
            selectedCategory={filters.category}
            onSelectCategory={setCategory}
            sortBy={filters.sortBy}
            onSelectSort={setSortBy}
            itemCount={items.length}
            filteredCount={filteredItems.length}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
          />

          <FlashList
            data={libraryRows}
            keyExtractor={(item: LibraryRow) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 }}
            renderItem={renderItem}
            estimatedItemSize={viewMode === 'grid' ? 240 : 135}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            ListFooterComponent={
              hasMore ? (
                <View className="items-center py-6">
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              isFiltered ? (
                <View className="items-center py-16">
                  <Icons.Search size={44} color={colors.textSecondary} />
                  <Text className="text-foreground-secondary text-base mt-4">
                    Keine Treffer
                  </Text>
                  <Pressable
                    onPress={() => { setSearchQuery(''); setCategory(null); }}
                    className="mt-3 px-5 py-2.5 rounded-xl bg-primary-500/10"
                  >
                    <Text className="text-primary text-[15px] font-medium">
                      Filter zurücksetzen
                    </Text>
                  </Pressable>
                </View>
              ) : null
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}
