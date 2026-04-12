import { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore } from '../../features/history/store/historyStore';
import { useLibraryFilters } from '../../features/library/hooks/useLibraryFilters';
import { LibrarySearchBar, ViewMode } from '../../features/library/components/LibrarySearchBar';
import { LibraryListItem } from '../../features/library/components/LibraryListItem';
import { LibraryGridItem } from '../../features/library/components/LibraryGridItem';
import {
  LibraryEmptyState,
  LibraryFilteredEmptyState,
} from '../../features/library/components/LibraryEmptyStates';
import { ShareSheet } from '../../features/sharing/components/ShareSheet';
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
} from '../../features/library/utils/libraryRows';
import { Icons } from '../../shared/components/Icons';
import { CampaignSelectionBar } from '../../features/campaigns/components/CampaignSelectionBar';
import { CampaignSaveDialog } from '../../features/campaigns/components/CampaignSaveDialog';
import { useCampaignStore } from '../../features/campaigns/store/campaignStore';
import { useUIStore } from '../../shared/store/uiStore';

export default function LibraryTab() {
  const items = useHistoryStore((state) => state.items);
  const removeItem = useHistoryStore((state) => state.removeItem);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);
  const { user } = useAuthStore();
  const createCampaign = useCampaignStore((state) => state.createCampaign);

  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(LIBRARY_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const setCampaignSheetVisible = useUIStore((s) => s.setCampaignSheetVisible);
  const campaignSelectionRequested = useUIStore((s) => s.campaignSelectionRequested);
  const setCampaignSelectionRequested = useUIStore((s) => s.setCampaignSelectionRequested);
  const setItemNavigationIds = useUIStore((s) => s.setItemNavigationIds);

  // Campaign state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saveDialogVisible, setSaveDialogVisible] = useState(false);

  const { items: followingItems, loading: followingLoading, refetch: refetchFollowing } = useFollowingItems();

  const [shareItemId, setShareItemId] = useState<string | null>(null);
  const shareItemName = useMemo(
    () => items.find((i) => i.id === shareItemId)?.productName ?? '',
    [items, shareItemId]
  );

  useEffect(() => {
    if (campaignSelectionRequested) {
      setSelectionMode(true);
      setCampaignSelectionRequested(false);
    }
  }, [campaignSelectionRequested]);

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

  const listKey = `${filters.sortBy}-${filters.selectedCategories.join(',')}-${filters.searchQuery}-${filters.productType}-${viewMode}-${selectionMode}`;

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setVisibleCount(LIBRARY_PAGE_SIZE);
    await Promise.all([fetchHistory(), refetchFollowing()]);
    setRefreshing(false);
  }, [fetchHistory, refetchFollowing]);

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

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allFilteredSelected = filteredItems.length > 0 && filteredItems.every((i) => selectedIds.has(i.id));

  const handleSelectAll = useCallback(() => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  }, [allFilteredSelected, filteredItems]);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setSaveDialogVisible(false);
  }, [setSaveDialogVisible]);

  const handleSaveCampaign = useCallback(
    (name: string, startsAt: string | null, endsAt: string | null) => {
      createCampaign({ name, itemIds: Array.from(selectedIds), startsAt, endsAt });
      setSaveDialogVisible(false);
      exitSelectionMode();
    },
    [selectedIds, createCampaign, exitSelectionMode]
  );

  const handleItemPress = useCallback((id: string) => {
    setItemNavigationIds(filteredItems.map((i) => i.id));
    router.push(`/history/${id}`);
  }, [filteredItems, setItemNavigationIds]);

  const renderItem = useCallback(({ item, index }: { item: LibraryRow; index: number }) => {
    const staggerIndex = Math.min(index, 12);
    if (item.type === 'list') {
      const isOwn = !item.item.owner;
      return (
        <StaggeredItem index={staggerIndex}>
          <LibraryListItem
            item={item.item}
            index={index}
            onDelete={!selectionMode && isOwn ? handleDelete : undefined}
            onShare={!selectionMode && isOwn ? (id) => setShareItemId(id) : undefined}
            selectable={selectionMode}
            selected={selectedIds.has(item.item.id)}
            onSelect={toggleSelection}
            onItemPress={!selectionMode ? handleItemPress : undefined}
          />
        </StaggeredItem>
      );
    }
    return (
      <StaggeredItem index={staggerIndex}>
        <LibraryGridItem
          items={item.items}
          rowIndex={index}
          selectable={selectionMode}
          selectedIds={selectedIds}
          onSelect={toggleSelection}
          onItemPress={!selectionMode ? handleItemPress : undefined}
        />
      </StaggeredItem>
    );
  }, [handleDelete, handleItemPress, selectionMode, selectedIds, toggleSelection]);

  const toggleViewMode = useCallback(() => {
    setVisibleCount(LIBRARY_PAGE_SIZE);
    setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {selectionMode ? (
        <CampaignSelectionBar
          selectedCount={selectedIds.size}
          onCancel={exitSelectionMode}
          onSave={() => setSaveDialogVisible(true)}
        />
      ) : (
        <View className="px-5 pt-5 pb-1 flex-row items-center justify-between">
          <Text className="text-foreground text-2xl font-bold">Inventar</Text>
          <Pressable
            onPress={() => setCampaignSheetVisible(true)}

            hitSlop={8}
            className="w-9 h-9 rounded-xl bg-background-elevated/60 items-center justify-center active:opacity-60"
          >
            <Icons.Flag size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      )}

      {followingLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isEmpty ? (
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
            selectionMode={selectionMode}
            allSelected={allFilteredSelected}
            onSelectAll={handleSelectAll}
          />
          <FlashList
            key={listKey}
            data={libraryRows}
            keyExtractor={(item: LibraryRow) => item.id}
contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: tabBarPadding }}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              !selectionMode ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
              ) : undefined
            }
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

<CampaignSaveDialog
        visible={saveDialogVisible}
        selectedCount={selectedIds.size}
        onSave={handleSaveCampaign}
        onSelectMore={() => setSaveDialogVisible(false)}
        onCancel={exitSelectionMode}
      />

    </SafeAreaView>
  );
}
