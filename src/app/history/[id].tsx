import { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, RefreshControl } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore, HistoryItem } from '../../features/history/store/historyStore';
import { generatePlatformLinks, PlatformLink } from '../../features/market/services/quicklinksService';
import { searchMarket, PriceStats } from '../../features/market/services/ebayService';
import { PlatformQuicklinks } from '../../features/market/components/PlatformQuicklinks';
import { PriceEstimate } from '../../features/market/components/PriceEstimate';
import { FadeInView, BounceInView, AnimatedButton, StaggeredItem } from '../../shared/components/Animated';
import { MotiView } from 'moti';

/**
 * History Detail Screen - Zeigt ein Item mit Preisschätzung und Quicklinks zu Marktplätzen
 */
export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getItemById = useHistoryStore((state: { getItemById: (id: string) => HistoryItem | undefined }) => state.getItemById);
  
  const item = id ? getItemById(id) : null;
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([]);
  const [priceStats, setPriceStats] = useState<PriceStats | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (item) {
      const searchQuery = item.searchQuery || `${item.brand || ''} ${item.productName}`.trim();
      setPlatformLinks(generatePlatformLinks(searchQuery));
      loadPriceData(searchQuery);
    }
  }, [item]);

  const loadPriceData = async (searchQuery: string) => {
    setPriceLoading(true);
    setPriceStats(null);
    
    try {
      const result = await searchMarket(searchQuery);
      if (result) {
        setPriceStats(result.priceStats);
      }
    } catch (err) {
      console.error('Price loading error:', err);
      // Graceful degradation - just don't show price
    } finally {
      setPriceLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (item) {
      const searchQuery = item.searchQuery || `${item.brand || ''} ${item.productName}`.trim();
      setPlatformLinks(generatePlatformLinks(searchQuery));
      loadPriceData(searchQuery).finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  }, [item]);

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
              transition={{ type: 'spring', damping: 15, stiffness: 400 }}
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

          {/* Price Estimate */}
          <FadeInView delay={75}>
            <PriceEstimate 
              priceStats={priceStats} 
              isLoading={priceLoading}
            />
          </FadeInView>

          {/* Platform Quicklinks */}
          <FadeInView delay={100}>
            <PlatformQuicklinks links={platformLinks} />
          </FadeInView>

          {/* Hinweis */}
          <FadeInView delay={150}>
            <View className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
              <Text className="text-gray-400 text-center text-sm">
                Ziehe nach unten um die Preise zu aktualisieren
              </Text>
            </View>
          </FadeInView>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
