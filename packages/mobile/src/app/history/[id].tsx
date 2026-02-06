import { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, RefreshControl } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore, HistoryItem } from '../../features/history/store/historyStore';
import { Button } from '../../shared/components';
import { generatePlatformLinks, PlatformLink } from '../../features/market/services/quicklinks';
import { searchMarket, PriceStats, MarketListing } from '../../features/market/services/ebay';
import { getMarketValue, MarketValueResult } from '../../features/market/services/perplexity';
import { PlatformQuicklinks } from '../../features/market/components/PlatformQuicklinks';
import { PriceEstimate } from '../../features/market/components/PriceEstimate';
import { MarketValueCard } from '../../features/market/components/MarketValue';
import { FadeInView, AnimatedButton, StaggeredItem } from '../../shared/components/Animated';
import { MotiView } from 'moti';

/**
 * History Detail Screen - Zeigt ein Item mit KI-Marktwert, Preisschätzung und Quicklinks
 */
export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getItemById = useHistoryStore((state: { getItemById: (id: string) => HistoryItem | undefined }) => state.getItemById);
  const removeItem = useHistoryStore((state) => state.removeItem);
  const updateMarketValue = useHistoryStore((state) => state.updateMarketValue);
  const updateItemPrices = useHistoryStore((state) => state.updateItemPrices);
  
  const item = id ? getItemById(id) : null;
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([]);
  const [priceStats, setPriceStats] = useState<PriceStats | null>(null);
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [marketValue, setMarketValue] = useState<MarketValueResult | null>(null);
  const [marketValueLoading, setMarketValueLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (item) {
      // Generate quicklinks
      const ebayQuery = item.searchQueries?.ebay || item.searchQuery || `${item.brand || ''} ${item.productName}`.trim();
      setPlatformLinks(generatePlatformLinks(ebayQuery));
      
      // Load cached market value if available (no API call needed)
      if (item.marketValue) {
        setMarketValue(item.marketValue);
        console.log('[History] Using cached market value from', item.marketValueFetchedAt);
      }
      
      // Load cached price stats and listings if available
      if (item.priceStats) {
        setPriceStats(item.priceStats);
      }
      if (item.ebayListings) {
        setListings(item.ebayListings);
        console.log('[History] Using cached listings from', item.ebayListingsFetchedAt);
      }
    }
  }, [item]);

  const loadAllData = async (historyItem: HistoryItem, forceRefresh = false) => {
    // Use generic/shorter query for better search results (too specific = no hits)
    const searchQuery = historyItem.searchQueries?.generic || historyItem.productName;
    
    // Load eBay prices
    loadPriceData(searchQuery);
    
    // Load Perplexity market value (force refresh to get new data)
    loadMarketValue(historyItem.productName, historyItem.category, forceRefresh);
  };

  const loadPriceData = async (searchQuery: string) => {
    setPriceLoading(true);
    setPriceStats(null);
    setListings([]);
    
    try {
      const result = await searchMarket(searchQuery);
      if (result) {
        setPriceStats(result.priceStats);
        setListings(result.listings || []);
        
        // Save to storage for next time
        if (item) {
          updateItemPrices(item.id, result.priceStats, result.listings);
          console.log('[History] Saved price data and', result.listings.length, 'listings to storage');
        }
      }
    } catch (err) {
      console.error('Price loading error:', err);
    } finally {
      setPriceLoading(false);
    }
  };

  const loadMarketValue = async (productName: string, category?: string, forceRefresh = false) => {
    // Use cached value if available and not forcing refresh
    if (!forceRefresh && item?.marketValue) {
      setMarketValue(item.marketValue);
      return;
    }
    
    setMarketValueLoading(true);
    setMarketValue(null);
    
    try {
      const result = await getMarketValue(productName, category);
      setMarketValue(result);
      
      // Save to storage for next time
      if (result && item) {
        updateMarketValue(item.id, result);
        console.log('[History] Saved market value to storage');
      }
    } catch (err) {
      console.error('Market value loading error:', err);
    } finally {
      setMarketValueLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (item) {
      await loadAllData(item, true); // Force refresh to get new data
    }
    setRefreshing(false);
  }, [item]);

  const handleRefreshMarketValue = () => {
    if (item) {
      loadMarketValue(item.productName, item.category);
    }
  };

  if (!item) {
    return (
      <>
        <Stack.Screen options={{ title: 'Nicht gefunden' }} />
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
          <Text className="text-white text-lg">Item nicht gefunden</Text>
          <AnimatedButton
            onPress={() => router.back()}
            className="mt-4 bg-primary-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Zurück</Text>
          </AnimatedButton>
        </SafeAreaView>
      </>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Details',
          headerBackTitle: 'Verlauf',
        }}
      />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366f1"
            />
          }
        >
          {/* Bild */}
          <FadeInView delay={0}>
            <MotiView
              from={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="rounded-2xl overflow-hidden mb-6"
            >
              <Image
                source={{ uri: item.cachedImageUri || item.imageUri }}
                style={{ width: '100%', aspectRatio: 4 / 3 }}
                resizeMode="cover"
              />
            </MotiView>
          </FadeInView>

          {/* Produkt-Info */}
          <FadeInView delay={50}>
            <View className="bg-background-card rounded-xl p-4 mb-4 border border-gray-800">
              <View className="flex-row justify-between items-start mb-3">
                <Text className="text-white text-xl font-bold flex-1">
                  {item.productName}
                </Text>
                <View className="bg-primary-500/20 px-3 py-1 rounded-lg">
                  <Text className="text-primary-400 font-bold">
                    {Math.round(item.confidence * 100)}%
                  </Text>
                </View>
              </View>

              {item.gtin && (
                <View className="flex-row items-center mb-3 bg-gray-800/40 self-start px-2 py-1 rounded border border-gray-700">
                  <Text className="text-gray-400 text-xs font-mono">
                    Artikelnummer: {item.gtin}
                  </Text>
                </View>
              )}

              <View className="flex-row flex-wrap gap-2 mb-3">
                {[item.category, item.brand, item.condition]
                  .filter(Boolean)
                  .map((tag, i) => (
                    <StaggeredItem key={i} index={i}>
                      <View className="bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600">
                        <Text className="text-gray-200 text-sm">{tag}</Text>
                      </View>
                    </StaggeredItem>
                  ))}
              </View>

              <Text className="text-gray-500 text-sm">
                Gescannt: {formatDate(item.scannedAt)}
              </Text>
            </View>
          </FadeInView>

          {/* KI-Marktwertanalyse (Perplexity) */}
          <FadeInView delay={75}>
            <MarketValueCard 
              result={marketValue} 
              isLoading={marketValueLoading}
              onRefresh={handleRefreshMarketValue}
            />
          </FadeInView>

          {/* eBay Price Estimate */}
          <FadeInView delay={100}>
            <PriceEstimate 
              priceStats={priceStats}
              listings={listings}
              isLoading={priceLoading}
            />
          </FadeInView>

          {/* Platform Quicklinks */}
          <FadeInView delay={125}>
            <PlatformQuicklinks links={platformLinks} />
          </FadeInView>

          {/* Eintrag löschen */}
          <FadeInView delay={150}>
            <View className="mt-8 mb-4">
              <Button
                title="Eintrag löschen"
                variant="danger"
                size="lg"
                onPress={() => {
                  if (id) {
                    removeItem(id);
                    router.back();
                  }
                }}
              />
            </View>
          </FadeInView>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
