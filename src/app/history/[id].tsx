import { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, RefreshControl, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore, HistoryItem } from '../../features/history/store/historyStore';
import { searchAllMarkets, formatPrice, AggregatedMarketResult } from '../../features/market/services/marketAggregator';
import { MarketResult } from '../../features/market/services/ebayService';
import { FadeInView, BounceInView, AnimatedButton, StaggeredItem } from '../../shared/components/Animated';
import { PriceStatsSkeleton } from '../../shared/components/Skeleton';
import { MotiView } from 'moti';

/**
 * History Detail Screen - Zeigt ein Item mit aktualisierbaren Marktdaten
 */
export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getItemById = useHistoryStore((state: { getItemById: (id: string) => HistoryItem | undefined }) => state.getItemById);
  const updateItemPrices = useHistoryStore((state: { updateItemPrices: (id: string, priceStats: any) => void }) => state.updateItemPrices);
  
  const item = id ? getItemById(id) : null;
  const [marketResult, setMarketResult] = useState<AggregatedMarketResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMarketData = useCallback(async () => {
    if (!item) return;
    
    try {
      const searchQuery = `${item.brand || ''} ${item.productName}`.trim();
      const result = await searchAllMarkets(searchQuery, item.category);
      setMarketResult(result);
      setLastUpdated(new Date());
      
      // Update price stats in store
      if (updateItemPrices) {
        updateItemPrices(item.id, result.combined);
      }
    } catch (err) {
      console.error('Market fetch error:', err);
      Alert.alert('Fehler', 'Marktdaten konnten nicht geladen werden');
    }
  }, [item, updateItemPrices]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchMarketData();
      setLoading(false);
    };
    loadInitialData();
  }, [fetchMarketData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMarketData();
    setRefreshing(false);
  }, [fetchMarketData]);

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
              title="Aktualisiere Preise..."
              titleColor="#9ca3af"
            />
          }
        >
          {/* Bild */}
          <FadeInView delay={0}>
            <MotiView
              from={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
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
          <FadeInView delay={100}>
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
              
              <View className="flex-row flex-wrap gap-2">
                {[item.category, item.brand, item.condition]
                  .filter(Boolean)
                  .map((tag, i) => (
                    <View key={i} className="bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600">
                      <Text className="text-gray-200 text-sm">{tag}</Text>
                    </View>
                  ))}
              </View>
            </View>
          </FadeInView>

          {/* Letzte Aktualisierung */}
          {lastUpdated && (
            <FadeInView delay={150}>
              <View className="flex-row items-center justify-center mb-4">
                <Text className="text-gray-500 text-xs">
                  🔄 Zuletzt aktualisiert: {lastUpdated.toLocaleTimeString('de-DE')}
                </Text>
              </View>
            </FadeInView>
          )}

          {/* Loading State */}
          {loading && <PriceStatsSkeleton />}

          {/* Marktdaten */}
          {marketResult && !loading && (
            <>
              {/* Hauptpreis - Hero Section */}
              <BounceInView delay={200}>
                <View className="bg-gradient-to-b from-primary-500/20 to-primary-500/5 border border-primary-500/30 rounded-2xl p-6 mb-4">
                  <Text className="text-gray-400 text-center text-sm mb-1">
                    Aktueller Marktwert
                  </Text>
                  <Text className="text-white text-4xl font-bold text-center">
                    {formatPrice(marketResult.combined.avgPrice)}
                  </Text>
                  <Text className="text-gray-400 text-center text-sm mt-2">
                    {formatPrice(marketResult.combined.minPrice)} – {formatPrice(marketResult.combined.maxPrice)}
                  </Text>
                  
                  {/* Stats Row */}
                  <View className="flex-row justify-around mt-6 pt-4 border-t border-gray-700">
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-white">
                        {marketResult.combined.totalListings}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1">Angebote</Text>
                    </View>
                    <View className="w-px h-10 bg-gray-700" />
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-green-400">
                        {marketResult.combined.soldListings}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1">Verkauft</Text>
                    </View>
                    <View className="w-px h-10 bg-gray-700" />
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-primary-400">
                        {formatPrice(marketResult.combined.medianPrice)}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1">Median</Text>
                    </View>
                  </View>
                </View>
              </BounceInView>

              {/* Plattform-Vergleich */}
              <FadeInView delay={400}>
                <Text className="text-white text-lg font-semibold mb-3">
                  📊 Plattform-Vergleich
                </Text>
                
                <View className="gap-2">
                  {marketResult.platforms.map((platform, index) => (
                    <StaggeredItem key={platform.platform} index={index}>
                      <View className="bg-background-card rounded-xl p-4 flex-row items-center border border-gray-800">
                        <View className="w-12 h-12 bg-gray-700/50 rounded-xl items-center justify-center mr-4">
                          <Text className="text-2xl">
                            {platform.platform === 'ebay' && '🛒'}
                            {platform.platform === 'kleinanzeigen' && '📦'}
                            {platform.platform === 'amazon' && '📱'}
                            {platform.platform === 'idealo' && '🔍'}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-semibold capitalize">
                            {platform.platform}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            {platform.priceStats.totalListings} Angebote
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-white text-lg font-bold">
                            {formatPrice(platform.priceStats.avgPrice)}
                          </Text>
                          <Text className="text-gray-500 text-xs">
                            Ø Preis
                          </Text>
                        </View>
                      </View>
                    </StaggeredItem>
                  ))}
                </View>
              </FadeInView>
            </>
          )}

          {/* Hinweis */}
          <FadeInView delay={500}>
            <View className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
              <Text className="text-gray-400 text-center text-sm">
                ↓ Ziehe nach unten um Preise zu aktualisieren
              </Text>
            </View>
          </FadeInView>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
