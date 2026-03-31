import { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
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
import { ReceivedItemCard } from '../../features/library/components/ReceivedItemCard';
import { useSharedWithMe } from '../../features/library/hooks/useSharedWithMe';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import { useTabBarPadding } from '../../shared/hooks/useTabBarPadding';
import { useAuthStore } from '../../features/auth/store/authStore';
import {
  buildLibraryRows,
  LIBRARY_PAGE_SIZE,
  type LibraryRow,
} from '../../features/history/utils/libraryRows';

type LibraryTab = 'mine' | 'shared';

export default function LibraryTab() {
  const items = useHistoryStore((state) => state.items);
  const removeItem = useHistoryStore((state) => state.removeItem);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<LibraryTab>('mine');
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(LIBRARY_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Share sheet state
  const [shareItemId, setShareItemId] = useState<string | null>(null);
  const shareItemName = useMemo(
    () => items.find((i) => i.id === shareItemId)?.productName ?? '',
    [items, shareItemId]
  );

  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();

  const { items: receivedItems, loading: receivedLoading, refetch: refetchReceived } = useSharedWithMe();

  const isEmpty = items.length === 0;
  const { filters, setSearchQuery, setCategory, setSortBy, filteredItems, categories, isFiltered } =
    useLibraryFilters(items);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setVisibleCount(LIBRARY_PAGE_SIZE);
    if (activeTab === 'shared') {
      await refetchReceived();
    } else {
      await fetchHistory();
    }
    setRefreshing(false);
  }, [activeTab, refetchReceived, fetchHistory]);

  const paginatedItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);
  const hasMore = visibleCount < filteredItems.length;
  const loadMore = useCallback(() => {
    if (hasMore) setVisibleCount((p) => p + LIBRARY_PAGE_SIZE);
  }, [hasMore]);

  const libraryRows = useMemo(() => buildLibraryRows(paginatedItems, viewMode), [paginatedItems, viewMode]);

  const renderItem = useCallback(({ item, index }: { item: LibraryRow; index: number }) => {
    if (item.type === 'list') {
      return (
        <LibraryListItem
          item={item.item}
          index={index}
          onDelete={removeItem}
          onShare={(id) => setShareItemId(id)}
        />
      );
    }
    return <LibraryGridItem items={item.items} rowIndex={index} />;
  }, [removeItem]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Überschrift */}
      <View className="px-5 pt-5 pb-1">
        <Text className="text-foreground text-2xl font-bold">Inventar</Text>
      </View>

      {/* Segmented Control */}
      <View className="flex-row mx-4 mt-3 mb-1 bg-background-elevated rounded-xl p-1">
        {(['mine', 'shared'] as LibraryTab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === tab ? 'bg-background-card' : ''}`}
          >
            <Text className={`text-sm font-medium ${activeTab === tab ? 'text-foreground' : 'text-foreground-secondary'}`}>
              {tab === 'mine' ? 'Meine Items' : 'Für mich'}
            </Text>
            {tab === 'shared' && receivedItems.length > 0 && (
              <View className="absolute top-1 right-3 w-4 h-4 bg-primary rounded-full items-center justify-center">
                <Text className="text-white text-[9px] font-bold">
                  {receivedItems.length > 9 ? '9+' : receivedItems.length}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* Meine Items */}
      {activeTab === 'mine' && (
        isEmpty ? (
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
                    onResetFilters={() => { setSearchQuery(''); setCategory(null); }}
                  />
                ) : null
              }
            />
          </View>
        )
      )}

      {/* Für mich */}
      {activeTab === 'shared' && (
        receivedLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : receivedItems.length === 0 ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          >
            <View className="flex-1 items-center justify-center px-8 pt-16">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <View className="opacity-50">
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              </View>
              <Text className="text-foreground text-base font-semibold text-center">Noch nichts geteilt</Text>
              <Text className="text-foreground-secondary text-sm mt-1.5 text-center leading-5">
                Wenn Freunde oder Gruppen Items mit dir teilen, erscheinen sie hier.
              </Text>
            </View>
          </ScrollView>
        ) : (
          <FlashList
            data={receivedItems}
            keyExtractor={(item) => item.shareId}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: tabBarPadding }}
            renderItem={({ item }) => <ReceivedItemCard item={item} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          />
        )
      )}

      {/* Share Sheet */}
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
