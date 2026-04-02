import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ScrollView, RefreshControl, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore } from '../../features/history/store/historyStore';
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

/**
 * History Detail Screen - Zeigt Item mit Preisen, Quicklinks und Edit-Navigation
 */
export default function HistoryDetailScreen() {
  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useHistoryStore((state) => id ? state.items.find((i) => i.id === id) : undefined) ?? null;
  const removeItem = useHistoryStore((state) => state.removeItem);
  const updateMarketValue = useHistoryStore((state) => state.updateMarketValue);
  const updateItemPrices = useHistoryStore((state) => state.updateItemPrices);
  const updateItem = useHistoryStore((state) => state.updateItem);
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [priceSheetVisible, setPriceSheetVisible] = useState(false);

  // Memoize detailState to avoid creating a new object every render
  const detailState = useMemo(
    () => (item ? buildHistoryDetailState(item) : null),
    [item?.id, item?.productName, item?.brand, item?.searchQuery, item?.marketValue, item?.ebayListings?.length],
  );

  // Stabilize callbacks to avoid recreating useMarketData options each render
  const onEbayDataLoaded = useCallback((priceStats: any, listings: any) => {
    if (id) updateItemPrices(id, priceStats, listings);
  }, [id, updateItemPrices]);

  const onMarketValueLoaded = useCallback((value: any) => {
    if (id) updateMarketValue(id, value);
  }, [id, updateMarketValue]);

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
  } = useMarketData({
    onEbayDataLoaded,
    onMarketValueLoaded,
  });

  // Track whether initial data load has been performed for this item
  const initialLoadDone = useRef<string | null>(null);

  useEffect(() => {
    if (!item || !detailState) return;
    // Only run initial load once per item id
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
  }, [item?.id, detailState]);

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

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Löschen?',
      `${item?.productName ?? 'Eintrag'} wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => { removeItem(id); router.back(); },
        },
      ],
    );
  };

  const handlePriceSave = useCallback((price?: number, note?: string) => {
    if (id) {
      updateItem(id, { finalPrice: price, finalPriceNote: note || undefined });
    }
  }, [id, updateItem]);

  if (!item) {
    return (
      <>
        <Stack.Screen options={{ title: 'Nicht gefunden' }} />
        <HistoryDetailNotFound />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Details', headerBackTitle: 'Zurück', headerRight: () => <HistoryDetailHeaderActions onDelete={handleDelete} /> }} />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: tabBarPadding }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
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
      </SafeAreaView>
    </>
  );
}
