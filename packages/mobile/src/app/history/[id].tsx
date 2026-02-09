import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore, HistoryItem } from '../../features/history/store/historyStore';
import { Button } from '../../shared/components';
import { generatePlatformLinks, PlatformLink } from '../../features/market/services/quicklinks';
import { useMarketData } from '../../features/market/hooks';
import { PlatformQuicklinks } from '../../features/market/components/PlatformQuicklinks';
import { MarketSlider } from '../../features/market/components/MarketSlider';
import { HistoryDetailHeader } from '../../features/history/components/HistoryDetailHeader';
import { PriceEditSheet } from '../../features/history/components/PriceEditSheet';
import { FadeInView, AnimatedButton } from '../../shared/components/Animated';

/**
 * History Detail Screen - Zeigt Item mit Preisen, Quicklinks und Edit-Navigation
 */
export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getItemById = useHistoryStore((state: { getItemById: (id: string) => HistoryItem | undefined }) => state.getItemById);
  const removeItem = useHistoryStore((state) => state.removeItem);
  const updateMarketValue = useHistoryStore((state) => state.updateMarketValue);
  const updateItemPrices = useHistoryStore((state) => state.updateItemPrices);
  const updateItemKleinanzeigenPrices = useHistoryStore((state) => state.updateItemKleinanzeigenPrices);
  const updateItem = useHistoryStore((state) => state.updateItem);

  const item = id ? getItemById(id) : null;
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [priceSheetVisible, setPriceSheetVisible] = useState(false);

  // Use shared market data hook with persistence callbacks
  const {
    ebayPriceStats,
    ebayListings,
    ebayLoading,
    kleinanzeigenPriceStats,
    kleinanzeigenListings,
    kleinanzeigenLoading,
    marketValue,
    marketValueLoading,
    loadEbayData,
    loadKleinanzeigenData,
    loadMarketValue,
    loadAllData,
    setEbayData,
    setKleinanzeigenData,
    setMarketValue,
  } = useMarketData({
    onEbayDataLoaded: (priceStats, listings) => {
      if (item) {
        updateItemPrices(item.id, priceStats, listings);
      }
    },
    onKleinanzeigenDataLoaded: (listings) => {
      if (item) {
        updateItemKleinanzeigenPrices(item.id, listings);
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
        kleinanzeigen: item.searchQueries?.kleinanzeigen || fallback,
        amazon: item.searchQueries?.amazon || fallback,
        idealo: item.searchQueries?.idealo || fallback,
        generic: item.searchQueries?.generic || fallback,
      }));
      
      // Load cached data
      if (item.marketValue) setMarketValue(item.marketValue);
      if (item.priceStats) setEbayData(item.priceStats, item.ebayListings);
      
      if (item.kleinanzeigenListings?.length) {
        const prices = item.kleinanzeigenListings.map(l => l.price).filter(p => p > 0);
        if (prices.length) {
          prices.sort((a, b) => a - b);
          const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
          setKleinanzeigenData({
            minPrice: prices[0],
            maxPrice: prices[prices.length - 1],
            avgPrice: Math.round(avg * 100) / 100,
            medianPrice: prices[Math.floor(prices.length / 2)],
            totalListings: item.kleinanzeigenListings.length,
            soldListings: item.kleinanzeigenListings.filter(l => l.sold).length,
          }, item.kleinanzeigenListings);
        }
      }
    }
  }, [item]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (item) {
      const searchQuery = item.searchQueries?.generic || item.productName;
      await loadAllData({
        searchQuery,
        productName: item.productName,
        category: item.category,
        kleinanzeigenQuery: item.searchQueries?.kleinanzeigen || searchQuery,
        forceRefresh: true,
      });
    }
    setRefreshing(false);
  }, [item, loadAllData]);

  if (!item) {
    return (
      <>
        <Stack.Screen options={{ title: 'Nicht gefunden' }} />
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
          <Text className="text-white text-lg">Item nicht gefunden</Text>
          <AnimatedButton onPress={() => router.back()} className="mt-4 bg-primary-500 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Zurück</Text>
          </AnimatedButton>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Details', headerBackTitle: 'Verlauf' }} />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
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
              kleinanzeigenPriceStats={kleinanzeigenPriceStats}
              kleinanzeigenListings={kleinanzeigenListings}
              kleinanzeigenLoading={kleinanzeigenLoading}
              onRefreshKleinanzeigen={() => loadKleinanzeigenData(
                item.searchQueries?.kleinanzeigen || item.searchQueries?.generic || item.productName,
                item.category
              )}
            />
          </FadeInView>

          {/* Platform Quicklinks */}
          <FadeInView delay={125}>
            <PlatformQuicklinks links={platformLinks} />
          </FadeInView>

          {/* Delete Button */}
          <FadeInView delay={150}>
            <View className="mt-8 mb-4">
              <Button
                title="Eintrag löschen"
                variant="danger"
                size="lg"
                onPress={() => { if (id) { removeItem(id); router.back(); } }}
              />
            </View>
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
