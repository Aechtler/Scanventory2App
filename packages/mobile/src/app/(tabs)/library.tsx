import { useState, useCallback, useMemo } from 'react';
import { View, RefreshControl, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore } from '../../features/history/store/historyStore';
import { useLibraryFilters } from '../../features/history/hooks/useLibraryFilters';
import { LibrarySearchBar, ViewMode } from '../../features/history/components/LibrarySearchBar';
import { LibraryListItem } from '../../features/history/components/LibraryListItem';
import { LibraryGridItem } from '../../features/history/components/LibraryGridItem';
import {
  LibraryEmptyState,
  LibraryFilteredEmptyState,
} from '../../features/history/components/LibraryEmptyStates';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import {
  buildLibraryRows,
  LIBRARY_PAGE_SIZE,
  type LibraryRow,
} from '../../features/history/utils/libraryRows';

/**
 * Bibliothek Tab - Gescannte Gegenstände
 */
export default function LibraryTab() {
  const items = useHistoryStore((state) => state.items);
  const removeItem = useHistoryStore((state) => state.removeItem);
  const isEmpty = items.length === 0;
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(LIBRARY_PAGE_SIZE);
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
    setVisibleCount(LIBRARY_PAGE_SIZE);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const paginatedItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  );
  const hasMore = visibleCount < filteredItems.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => prev + LIBRARY_PAGE_SIZE);
    }
  }, [hasMore]);

  const libraryRows = useMemo(
    () => buildLibraryRows(paginatedItems, viewMode),
    [paginatedItems, viewMode]
  );

  const renderItem = useCallback(({ item, index }: { item: LibraryRow; index: number }) => {
    if (item.type === 'list') {
      return <LibraryListItem item={item.item} index={index} onDelete={removeItem} />;
    }

    return <LibraryGridItem items={item.items} rowIndex={index} />;
  }, [removeItem]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {isEmpty ? (
        <LibraryEmptyState iconColor={colors.textSecondary} />
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
                <LibraryFilteredEmptyState
                  iconColor={colors.textSecondary}
                  onResetFilters={() => {
                    setSearchQuery('');
                    setCategory(null);
                  }}
                />
              ) : null
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}
