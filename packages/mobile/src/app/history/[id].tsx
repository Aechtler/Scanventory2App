import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore } from '../../features/history/store/historyStore';
import { generatePlatformLinks, PlatformLink } from '../../features/market/services/quicklinks';
import { useMarketData } from '../../features/market/hooks';
import { PlatformQuicklinks } from '../../features/market/components/PlatformQuicklinks';
import { MarketSlider } from '../../features/market/components/MarketSlider';
import { HistoryDetailHeader } from '../../features/history/components/HistoryDetailHeader';
import { PriceEditSheet } from '../../features/history/components/PriceEditSheet';
import { FadeInView, AnimatedButton } from '../../shared/components/Animated';
import { Icons } from '../../shared/components/Icons';
import { useThemeColors } from '../../shared/hooks/useThemeColors';

/**
 * History Detail Screen - Zeigt Item mit Preisen, Quicklinks und Edit-Navigation
 */
export default function HistoryDetailScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useHistoryStore((state) => id ? state.items.find((i) => i.id === id) : undefined) ?? null;
  const removeItem = useHistoryStore((state) => state.removeItem);
  const updateMarketValue = useHistoryStore((state) => state.updateMarketValue);
  const updateItemPrices = useHistoryStore((state) => state.updateItemPrices);
  const updateItem = useHistoryStore((state) => state.updateItem);
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [priceSheetVisible, setPriceSheetVisible] = useState(false);

  // Use shared market data hook with persistence callbacks
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
    onEbayDataLoaded: (priceStats, listings) => {
      if (item) {
        updateItemPrices(item.id, priceStats, listings);
      }
    },
    onMarketValueLoaded: (value) => {
      if (item) {
        updateMarketValue(item.id, value);
      }
    },
  });

  // Load cached data on mount
  useEffect(() => {
    if (item) {
      // Generate quicklinks mit plattformspezifischen Queries
      const fallback = item.searchQuery || `${item.brand || ''} ${item.productName}`.trim();
      setPlatformLinks(generatePlatformLinks({
        ebay: item.searchQueries?.ebay || fallback,
        amazon: item.searchQueries?.amazon || fallback,
        idealo: item.searchQueries?.idealo || fallback,
        generic: item.searchQueries?.generic || fallback,
      }));
      
      // Load cached data
      if (item.marketValue) setMarketValue(item.marketValue);
      if (item.priceStats) setEbayData(item.priceStats, item.ebayListings);

      // Auto-load market data if not yet fetched
      const searchQuery = item.searchQueries?.generic || item.productName;
      if (!item.marketValue) {
        loadMarketValue(item.productName, item.category);
      }
      if (!item.ebayListings?.length) {
        loadEbayData(searchQuery, item.gtin || undefined);
      }
    }
  }, [item?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (item) {
      const searchQuery = item.searchQueries?.generic || item.productName;
      await loadAllData({
        searchQuery,
        productName: item.productName,
        category: item.category,
        forceRefresh: true,
      });
    }
    setRefreshing(false);
  }, [item, loadAllData]);

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

  if (!item) {
    return (
      <>
        <Stack.Screen options={{ title: 'Nicht gefunden' }} />
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
          <Text className="text-foreground text-lg">Item nicht gefunden</Text>
          <AnimatedButton onPress={() => router.back()} className="mt-4 bg-primary-500 px-6 py-3 rounded-xl">
            <Text className="text-foreground font-semibold">Zurück</Text>
          </AnimatedButton>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Details',
          headerBackTitle: 'Verlauf',
          headerRight: () => (
            <Pressable
              onPress={handleDelete}
              className="p-2 rounded-full active:bg-red-500/20"
              hitSlop={8}
            >
              <Icons.Close size={20} color="#ef4444" />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {/* Hero Header — Preis-Badge oben rechts, Tap auf Bild → Edit */}
          <HistoryDetailHeader
            item={item}
            onPriceBadgePress={() => setPriceSheetVisible(true)}
          />

          {/* Market Slider */}
          <FadeInView delay={75} className="mb-4">
            <MarketSlider
              marketValue={marketValue}
              marketValueLoading={marketValueLoading}
              onRefreshMarketValue={() => item && loadMarketValue(item.productName, item.category, true)}
              ebayPriceStats={ebayPriceStats}
              ebayListings={ebayListings}
              ebayLoading={ebayLoading}
              onRefreshEbay={() => loadEbayData(item.searchQueries?.generic || item.productName)}
            />
          </FadeInView>

          {/* Platform Quicklinks */}
          <FadeInView delay={125}>
            <PlatformQuicklinks links={platformLinks} />
          </FadeInView>

        </ScrollView>

        {/* Preis-Sheet */}
        <PriceEditSheet
          visible={priceSheetVisible}
          currentPrice={item.finalPrice}
          currentNote={item.finalPriceNote}
          onSave={(price, note) => {
            if (id) {
              updateItem(id, { finalPrice: price, finalPriceNote: note || undefined });
            }
          }}
          onClose={() => setPriceSheetVisible(false)}
        />
      </SafeAreaView>
    </>
  );
}
