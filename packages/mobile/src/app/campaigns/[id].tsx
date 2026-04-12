import { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCampaignStore } from '../../features/campaigns/store/campaignStore';
import { useHistoryStore } from '../../features/history/store/historyStore';
import { useUIStore } from '../../shared/store/uiStore';
import { useLibraryFilters } from '../../features/library/hooks/useLibraryFilters';
import { LibrarySearchBar, ViewMode } from '../../features/library/components/LibrarySearchBar';
import { LibraryListItem } from '../../features/library/components/LibraryListItem';
import { LibraryGridItem } from '../../features/library/components/LibraryGridItem';
import { LibraryFilteredEmptyState } from '../../features/library/components/LibraryEmptyStates';
import { StaggeredItem } from '../../shared/components/Animated';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import { useTabBarPadding } from '../../shared/hooks/useTabBarPadding';
import {
  buildLibraryRows,
  LIBRARY_PAGE_SIZE,
  type LibraryRow,
} from '../../features/library/utils/libraryRows';
import { Icons } from '../../shared/components/Icons';

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const campaigns = useCampaignStore((state) => state.campaigns);
  const campaign = campaigns.find((c) => c.id === id);
  const historyItems = useHistoryStore((state) => state.items);
  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();

  const [visibleCount, setVisibleCount] = useState(LIBRARY_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const campaignItems = useMemo(() => {
    if (!campaign) return [];
    return campaign.itemIds
      .map((itemId) => historyItems.find((item) => item.id === itemId))
      .filter((item): item is NonNullable<typeof item> => item !== undefined);
  }, [campaign, historyItems]);

  const { filters, setSearchQuery, setCategories, setSortBy, setProductType, filteredItems, categories, isFiltered } =
    useLibraryFilters(campaignItems);

  const listKey = `${filters.sortBy}-${filters.selectedCategories.join(',')}-${filters.searchQuery}-${filters.productType}-${viewMode}`;

  const paginatedItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);
  const hasMore = visibleCount < filteredItems.length;
  const loadMore = useCallback(() => {
    if (hasMore) setVisibleCount((p) => p + LIBRARY_PAGE_SIZE);
  }, [hasMore]);

  const libraryRows = useMemo(() => buildLibraryRows(paginatedItems, viewMode), [paginatedItems, viewMode]);

  const setItemNavigationIds = useUIStore((s) => s.setItemNavigationIds);

  const handleItemPress = useCallback((pressedId: string) => {
    setItemNavigationIds(filteredItems.map((i) => i.id));
    router.push(`/history/${pressedId}`);
  }, [filteredItems, setItemNavigationIds]);

  const toggleViewMode = useCallback(() => {
    setVisibleCount(LIBRARY_PAGE_SIZE);
    setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'));
  }, []);

  const renderItem = useCallback(({ item, index }: { item: LibraryRow; index: number }) => {
    const staggerIndex = Math.min(index, 12);
    if (item.type === 'list') {
      return (
        <StaggeredItem index={staggerIndex}>
          <LibraryListItem item={item.item} index={index} onItemPress={handleItemPress} />
        </StaggeredItem>
      );
    }
    return (
      <StaggeredItem index={staggerIndex}>
        <LibraryGridItem items={item.items} rowIndex={index} onItemPress={handleItemPress} />
      </StaggeredItem>
    );
  }, [handleItemPress]);

  if (!campaign) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-5 pb-1 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="w-9 h-9 rounded-xl bg-background-elevated/60 items-center justify-center active:opacity-60"
        >
          <Icons.ArrowLeft size={20} color={colors.textSecondary} />
        </Pressable>
        <Text className="text-foreground text-2xl font-bold flex-1" numberOfLines={1}>
          {campaign.name}
        </Text>
      </View>

      {campaignItems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-3xl bg-primary-500/10 items-center justify-center mb-5">
            <Icons.Package size={32} color={colors.primary} />
          </View>
          <Text className="text-foreground text-xl font-bold text-center mb-2">Keine Items</Text>
          <Text className="text-foreground-secondary text-sm text-center leading-relaxed">
            Diese Kampagne enthält noch keine Items.
          </Text>
        </View>
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
            itemCount={campaignItems.length}
            filteredCount={filteredItems.length}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
            selectionMode={false}
            allSelected={false}
            onSelectAll={() => {}}
          />
          <FlashList
            key={listKey}
            data={libraryRows}
            keyExtractor={(item: LibraryRow) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: tabBarPadding }}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
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
                  onResetFilters={() => { setSearchQuery(''); setCategories([]); setProductType(null); }}
                />
              ) : null
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}
