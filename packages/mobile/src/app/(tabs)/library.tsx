import { useState, useCallback, useMemo } from 'react';
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
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
import { ShareSheet } from '../../features/library/components/ShareSheet';
import { useFollowingItems } from '../../features/history/hooks/useFollowingItems';
import { syncDeleteItem } from '../../features/history/services/syncService';
import { StaggeredItem } from '../../shared/components/Animated';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import { useTabBarPadding } from '../../shared/hooks/useTabBarPadding';
import { useAuthStore } from '../../features/auth/store/authStore';
import {
  buildLibraryRows,
  LIBRARY_PAGE_SIZE,
  type LibraryRow,
  type LibraryItem,
} from '../../features/history/utils/libraryRows';

export default function LibraryTab() {
  const items = useHistoryStore((state) => state.items);
  const removeItem = useHistoryStore((state) => state.removeItem);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);
  const { user } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(LIBRARY_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const { items: followingItems, refetch: refetchFollowing } = useFollowingItems();

  const [shareItemId, setShareItemId] = useState<string | null>(null);
  const shareItemName = useMemo(
    () => items.find((i) => i.id === shareItemId)?.productName ?? '',
    [items, shareItemId]
  );

  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();

  // Eigene Items + Items von Gefolgten zusammenführen
  const mergedItems = useMemo<LibraryItem[]>(() => {
    const followingAsLibrary: LibraryItem[] = followingItems.map((fi) => ({
      id: fi.id,
      imageUri: fi.imageUri,
      productName: fi.productName,
      category: fi.category,
      brand: fi.brand,
      condition: fi.condition,
      confidence: 0,
      searchQuery: '',
      priceStats: fi.priceStats,
      scannedAt: fi.scannedAt,
      owner: fi.owner,
    }));
    return [...items, ...followingAsLibrary];
  }, [items, followingItems]);

  const isEmpty = mergedItems.length === 0;

  const { filters, setSearchQuery, setCategories, setSortBy, setProductType, filteredItems, categories, isFiltered } =
    useLibraryFilters(mergedItems);

  // listKey zwingt FlashList zum Remount → Items animieren frisch rein
  const listKey = `${filters.sortBy}-${filters.selectedCategories.join(',')}-${filters.searchQuery}-${filters.productType}-${viewMode}`;

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setVisibleCount(LIBRARY_PAGE_SIZE);
    await fetchHistory();
    setRefreshing(false);
  }, [fetchHistory]);

  const paginatedItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);
  const hasMore = visibleCount < filteredItems.length;
  const loadMore = useCallback(() => {
    if (hasMore) setVisibleCount((p) => p + LIBRARY_PAGE_SIZE);
  }, [hasMore]);

  const libraryRows = useMemo(() => buildLibraryRows(paginatedItems, viewMode), [paginatedItems, viewMode]);

  const handleDelete = useCallback((id: string) => {
    const isOwn = !mergedItems.find((i) => i.id === id)?.owner;
    if (isOwn) {
      removeItem(id);
    } else {
      syncDeleteItem(id).then(() => refetchFollowing());
    }
  }, [mergedItems, removeItem, refetchFollowing]);

  const renderItem = useCallback(({ item, index }: { item: LibraryRow; index: number }) => {
    const staggerIndex = Math.min(index, 12);
    if (item.type === 'list') {
      const isOwn = !item.item.owner;
      return (
        <StaggeredItem index={staggerIndex}>
          <LibraryListItem
            item={item.item}
            index={index}
            onDelete={handleDelete}
            onShare={isOwn ? (id) => setShareItemId(id) : undefined}
          />
        </StaggeredItem>
      );
    }
    return (
      <StaggeredItem index={staggerIndex}>
        <LibraryGridItem items={item.items} rowIndex={index} />
      </StaggeredItem>
    );
  }, [handleDelete]);

  const toggleViewMode = useCallback(() => {
    setVisibleCount(LIBRARY_PAGE_SIZE);
    setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 pt-5 pb-1">
        <Text className="text-foreground text-2xl font-bold">Inventar</Text>
      </View>

      {isEmpty ? (
        <LibraryEmptyState iconColor={colors.textSecondary} />
      ) : (
        <View className="flex-1">
          <LibrarySearchBar
            value={filters.searchQuery}
            onChangeText={setSearchQuery}
            categories={categories}
            selectedCategories={filters.selectedCategories}
            onSelectCategories={setCategories}
            sortBy={filters.sortBy}
            onSelectSort={setSortBy}
            productType={filters.productType}
            onSelectProductType={setProductType}
            itemCount={items.length}
            filteredCount={filteredItems.length}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
          />
          <FlashList
            key={listKey}
            data={libraryRows}
            keyExtractor={(item: LibraryRow) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: tabBarPadding }}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ListFooterComponent={
              hasMore ? <View className="items-center py-6"><ActivityIndicator size="small" color={colors.primary} /></View> : null
            }
            ListEmptyComponent={
              isFiltered ? (
                <LibraryFilteredEmptyState
                  iconColor={colors.textSecondary}
                  onResetFilters={() => { setSearchQuery(''); setCategories([]); setProductType(null); }}
                />
              ) : null
            }
          />
        </View>
      )}

      <ShareSheet
        visible={shareItemId !== null}
        itemId={shareItemId ?? ''}
        itemName={shareItemName}
        ownUserId={user?.id ?? ''}
        onClose={() => setShareItemId(null)}
        onShared={() => setShareItemId(null)}
      />
    </SafeAreaView>
  );
}
