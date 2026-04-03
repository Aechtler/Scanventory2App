import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FlatList,
  ScrollView,
  View,
  Alert,
  RefreshControl,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore } from '../../features/history/store/historyStore';
import { useUIStore } from '../../shared/store/uiStore';
import { generatePlatformLinks, type PlatformLink } from '../../features/market/services/quicklinks';
import { useMarketData } from '../../features/market/hooks';
import { HistoryDetailHeader } from '../../features/history/components/HistoryDetailHeader';
import { HistoryDetailNotFound } from '../../features/history/components/HistoryDetailNotFound';
import { PriceEditSheet } from '../../features/history/components/PriceEditSheet';
import { HistoryDetailHeaderActions } from '../../features/history/components/HistoryDetailHeaderActions';
import { HistoryDetailMarketSection } from '../../features/history/components/HistoryDetailMarketSection';
import { buildHistoryDetailState } from '../../features/history/utils/historyDetail';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import { useTabBarPadding } from '../../shared/hooks/useTabBarPadding';

// ─── Per-item detail page ────────────────────────────────────────────────────

interface DetailPageProps {
  itemId: string;
  isActive: boolean;
  pageWidth: number;
  onDeleteRequest: (id: string, name: string) => void;
}

function DetailPage({ itemId, isActive, pageWidth, onDeleteRequest }: DetailPageProps) {
  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();
  const item = useHistoryStore((state) => state.items.find((i) => i.id === itemId)) ?? null;
  const updateMarketValue = useHistoryStore((state) => state.updateMarketValue);
  const updateItemPrices = useHistoryStore((state) => state.updateItemPrices);
  const updateItem = useHistoryStore((state) => state.updateItem);

  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [priceSheetVisible, setPriceSheetVisible] = useState(false);

  const detailState = useMemo(
    () => (item ? buildHistoryDetailState(item) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item?.id, item?.productName, item?.brand, item?.searchQuery, item?.marketValue, item?.ebayListings?.length],
  );

  const onEbayDataLoaded = useCallback((priceStats: any, listings: any) => {
    updateItemPrices(itemId, priceStats, listings);
  }, [itemId, updateItemPrices]);

  const onMarketValueLoaded = useCallback((value: any) => {
    updateMarketValue(itemId, value);
  }, [itemId, updateMarketValue]);

  const {
    ebayPriceStats,
    ebayListings,
    ebayLoading,
    marketValue,
    marketValueLoading,
    loadEbayData,
    loadMarketValue,
    loadAllData,
    setEbayData,
    setMarketValue,
  } = useMarketData({ onEbayDataLoaded, onMarketValueLoaded });

  const initialLoadDone = useRef<string | null>(null);

  useEffect(() => {
    if (!item || !detailState || !isActive) return;
    if (initialLoadDone.current === item.id) return;
    initialLoadDone.current = item.id;

    setPlatformLinks(generatePlatformLinks(detailState.platformQueries));
    if (item.marketValue) setMarketValue(item.marketValue);
    if (item.priceStats) setEbayData(item.priceStats, item.ebayListings);
    if (detailState.shouldLoadMarketValue) {
      loadMarketValue(item.productName, item.category);
    }
    if (detailState.shouldLoadEbayData) {
      loadEbayData(detailState.searchQuery, item.gtin || undefined);
    }
  }, [item?.id, detailState, isActive]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (item && detailState) {
      await loadAllData({
        searchQuery: detailState.searchQuery,
        productName: item.productName,
        category: item.category,
        forceRefresh: true,
      });
    }
    setRefreshing(false);
  }, [detailState, item, loadAllData]);

  const handlePriceSave = useCallback((price?: number, note?: string) => {
    updateItem(itemId, { finalPrice: price, finalPriceNote: note || undefined });
  }, [itemId, updateItem]);

  if (!item) {
    return (
      <View style={{ width: pageWidth, flex: 1 }}>
        <HistoryDetailNotFound />
      </View>
    );
  }

  return (
    <View style={{ width: pageWidth, flex: 1 }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: tabBarPadding }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <HistoryDetailHeader item={item} />
        <HistoryDetailMarketSection
          links={platformLinks}
          marketValue={marketValue}
          marketValueLoading={marketValueLoading}
          onRefreshMarketValue={() => loadMarketValue(item.productName, item.category, true)}
          ebayPriceStats={ebayPriceStats}
          ebayListings={ebayListings}
          ebayLoading={ebayLoading}
          onRefreshEbay={() => detailState && loadEbayData(detailState.searchQuery, item.gtin || undefined)}
          finalPrice={item.finalPrice}
          onPricePress={() => setPriceSheetVisible(true)}
        />
      </ScrollView>
      <PriceEditSheet
        visible={priceSheetVisible}
        currentPrice={item.finalPrice}
        currentNote={item.finalPriceNote}
        onSave={handlePriceSave}
        onClose={() => setPriceSheetVisible(false)}
      />
    </View>
  );
}

// ─── Screen (pager shell) ────────────────────────────────────────────────────

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

  const itemNavigationIds = useUIStore((s) => s.itemNavigationIds);
  const removeItem = useHistoryStore((state) => state.removeItem);
  const items = useHistoryStore((state) => state.items);

  // Fall back to single-item list when navigating without context (deep link, scan result)
  const ids = itemNavigationIds.length > 0 ? itemNavigationIds : (id ? [id] : []);
  const initialIndex = Math.max(0, ids.indexOf(id ?? ''));

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeId = ids[activeIndex] ?? id ?? '';
  const activeItem = items.find((i) => i.id === activeId);

  const handleDeleteRequest = useCallback((deletedId: string, name: string) => {
    Alert.alert(
      'Löschen?',
      `${name} wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => { removeItem(deletedId); router.back(); },
        },
      ],
    );
  }, [removeItem]);

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
      setActiveIndex(newIndex);
    },
    [width],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({ length: width, offset: width * index, index }),
    [width],
  );

  const renderPage = useCallback(
    ({ item: pageId }: { item: string }) => (
      <DetailPage
        itemId={pageId}
        isActive={pageId === activeId}
        pageWidth={width}
        onDeleteRequest={handleDeleteRequest}
      />
    ),
    [activeId, width, handleDeleteRequest],
  );

  if (ids.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'Nicht gefunden' }} />
        <HistoryDetailNotFound />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Details',
          headerBackTitle: 'Zurück',
          headerRight: () => (
            <HistoryDetailHeaderActions
              onDelete={() => handleDeleteRequest(activeId, activeItem?.productName ?? 'Eintrag')}
            />
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <FlatList
          data={ids}
          keyExtractor={(item) => item}
          renderItem={renderPage}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={getItemLayout}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          windowSize={3}
          maxToRenderPerBatch={1}
          initialNumToRender={1}
          removeClippedSubviews={false}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    </>
  );
}
