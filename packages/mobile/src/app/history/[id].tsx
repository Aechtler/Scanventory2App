import { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, RefreshControl } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore, HistoryItem } from '../../features/history/store/historyStore';
import { Button } from '../../shared/components';
import { generatePlatformLinks, PlatformLink } from '../../features/market/services/quicklinks';
import { searchMarket, PriceStats, MarketListing } from '../../features/market/services/ebay';
import { searchKleinanzeigen } from '../../features/market/services/kleinanzeigen';
import { getMarketValue, MarketValueResult } from '../../features/market/services/perplexity';
import { PlatformQuicklinks } from '../../features/market/components/PlatformQuicklinks';
import { MarketSlider } from '../../features/market/components/MarketSlider';
import { EditableProductCard } from '../../features/history/components/EditableProductCard';
import { FinalPriceCard } from '../../features/history/components/FinalPriceCard';
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
  const updateItemKleinanzeigenPrices = useHistoryStore((state) => state.updateItemKleinanzeigenPrices);
  const updateItem = useHistoryStore((state) => state.updateItem);

  const item = id ? getItemById(id) : null;
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([]);
  const [priceStats, setPriceStats] = useState<PriceStats | null>(null);
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [marketValue, setMarketValue] = useState<MarketValueResult | null>(null);
  const [marketValueLoading, setMarketValueLoading] = useState(false);
  const [kleinanzeigenStats, setKleinanzeigenStats] = useState<PriceStats | null>(null);
  const [kleinanzeigenListings, setKleinanzeigenListings] = useState<MarketListing[]>([]);
  const [kleinanzeigenLoading, setKleinanzeigenLoading] = useState(false);
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

      // Load cached Kleinanzeigen data if available
      if (item.kleinanzeigenListings && item.kleinanzeigenListings.length > 0) {
        setKleinanzeigenListings(item.kleinanzeigenListings);
        // Compute stats from cached listings
        const prices = item.kleinanzeigenListings.map(l => l.price).filter(p => p > 0);
        if (prices.length > 0) {
          prices.sort((a, b) => a - b);
          const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
          setKleinanzeigenStats({
            minPrice: prices[0],
            maxPrice: prices[prices.length - 1],
            avgPrice: Math.round(avg * 100) / 100,
            medianPrice: prices[Math.floor(prices.length / 2)],
            totalListings: item.kleinanzeigenListings.length,
            soldListings: item.kleinanzeigenListings.filter(l => l.sold).length,
          });
        }
        console.log('[History] Using cached KA listings from', item.kleinanzeigenListingsFetchedAt);
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

    // Load Kleinanzeigen prices
    const kaQuery = historyItem.searchQueries?.kleinanzeigen || searchQuery;
    loadKleinanzeigenData(kaQuery, historyItem.category);
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

  const loadKleinanzeigenData = async (searchQuery: string, category?: string) => {
    setKleinanzeigenLoading(true);
    setKleinanzeigenStats(null);
    setKleinanzeigenListings([]);

    try {
      const result = await searchKleinanzeigen(searchQuery, category);
      if (result) {
        setKleinanzeigenStats(result.priceStats);
        setKleinanzeigenListings(result.listings || []);

        // Save to storage for next time
        if (item) {
          updateItemKleinanzeigenPrices(item.id, result.listings || []);
          console.log('[History] Saved KA data:', result.listings?.length, 'listings');
        }
      }
    } catch (err) {
      console.error('Kleinanzeigen loading error:', err);
    } finally {
      setKleinanzeigenLoading(false);
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

          {/* Produkt-Info (editierbar) */}
          <FadeInView delay={50}>
            <EditableProductCard
              productName={item.productName}
              category={item.category}
              brand={item.brand}
              condition={item.condition}
              confidence={item.confidence}
              gtin={item.gtin}
              searchQueries={item.searchQueries}
              scannedAt={item.scannedAt}
              onUpdate={(fields) => {
                if (!id) return;
                updateItem(id, fields);
                // Regenerate quicklinks when search queries change
                if (fields.searchQueries) {
                  const queries = fields.searchQueries as NonNullable<HistoryItem['searchQueries']>;
                  const ebayQuery = queries.ebay || item.searchQueries?.ebay || item.searchQuery || item.productName;
                  setPlatformLinks(generatePlatformLinks(ebayQuery));
                }
              }}
            />
          </FadeInView>

          {/* Finaler Verkaufspreis */}
          <FadeInView delay={60}>
            <FinalPriceCard
              finalPrice={item.finalPrice}
              finalPriceNote={item.finalPriceNote}
              comparison={{
                aiPrice: marketValue?.estimatedPrice,
                ebayAvg: priceStats?.avgPrice,
                kleinanzeigenAvg: kleinanzeigenStats?.avgPrice,
              }}
              onSavePrice={(price) => {
                if (id) updateItem(id, { finalPrice: price });
              }}
              onSaveNote={(note) => {
                if (id) updateItem(id, { finalPriceNote: note });
              }}
            />
          </FadeInView>

          {/* Market Slider: Summary + eBay + Kleinanzeigen */}
          <FadeInView delay={75} className="mb-4">
            <MarketSlider
              marketValue={marketValue}
              marketValueLoading={marketValueLoading}
              onRefreshMarketValue={handleRefreshMarketValue}
              ebayPriceStats={priceStats}
              ebayListings={listings}
              ebayLoading={priceLoading}
              onRefreshEbay={() => {
                const searchQuery = item.searchQueries?.generic || item.productName;
                loadPriceData(searchQuery);
              }}
              kleinanzeigenPriceStats={kleinanzeigenStats}
              kleinanzeigenListings={kleinanzeigenListings}
              kleinanzeigenLoading={kleinanzeigenLoading}
              onRefreshKleinanzeigen={() => {
                const searchQuery = item.searchQueries?.kleinanzeigen || item.searchQueries?.generic || item.productName;
                loadKleinanzeigenData(searchQuery, item.category);
              }}
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
