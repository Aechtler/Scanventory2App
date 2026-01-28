import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyzeImage, analyzeImageMock, VisionResult } from '@/features/scan/services/visionService';
import { searchMarket, formatPrice, MarketResult } from '@/features/market/services/ebayService';
import { useHistoryStore } from '@/features/history/store/historyStore';

type AnalysisState = 'analyzing' | 'searching' | 'complete' | 'error';

/**
 * Analyse Screen - Zeigt Bildanalyse und Marktdaten
 */
export default function AnalyzeScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const addItem = useHistoryStore((state) => state.addItem);
  
  const [state, setState] = useState<AnalysisState>('analyzing');
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const [marketResult, setMarketResult] = useState<MarketResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (imageUri) {
      runAnalysis();
    }
  }, [imageUri]);

  const runAnalysis = async () => {
    try {
      setState('analyzing');
      setError(null);

      // 1. Bildanalyse mit Gemini
      const hasApiKey = !!process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      const vision = hasApiKey 
        ? await analyzeImage(decodeURIComponent(imageUri!))
        : await analyzeImageMock(decodeURIComponent(imageUri!));
      
      setVisionResult(vision);
      setState('searching');

      // 2. Marktsuche basierend auf Analyse
      const market = await searchMarket(vision.searchQuery, vision.category);
      setMarketResult(market);
      
      setState('complete');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setState('error');
    }
  };

  const handleSaveToHistory = () => {
    if (visionResult && marketResult) {
      addItem({
        imageUri: decodeURIComponent(imageUri!),
        productName: visionResult.productName,
        category: visionResult.category,
        brand: visionResult.brand,
        condition: visionResult.condition,
        confidence: visionResult.confidence,
        priceStats: marketResult.priceStats,
      });
    }
    router.replace('/');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Analyse',
          headerBackTitle: 'Zurück',
        }}
      />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {/* Bildvorschau */}
          {imageUri && (
            <View className="rounded-2xl overflow-hidden mb-6">
              <Image
                source={{ uri: decodeURIComponent(imageUri) }}
                style={{ width: '100%', aspectRatio: 4 / 3 }}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Loading States */}
          {(state === 'analyzing' || state === 'searching') && (
            <View className="bg-background-card rounded-xl p-6 items-center">
              <ActivityIndicator size="large" color="#6366f1" />
              <Text className="text-white mt-4 text-lg font-semibold">
                {state === 'analyzing' ? '🔍 Analysiere Bild...' : '💰 Suche Marktdaten...'}
              </Text>
              <Text className="text-gray-400 mt-2 text-center">
                {state === 'analyzing' 
                  ? 'KI erkennt den Gegenstand' 
                  : 'Suche aktuelle Preise auf eBay'}
              </Text>
            </View>
          )}

          {/* Error State */}
          {state === 'error' && (
            <View className="bg-red-900/30 border border-red-500 rounded-xl p-6">
              <Text className="text-red-400 text-lg font-semibold mb-2">
                ❌ Fehler bei der Analyse
              </Text>
              <Text className="text-red-300">{error}</Text>
              <Pressable
                onPress={runAnalysis}
                className="mt-4 bg-red-500 rounded-lg p-3"
              >
                <Text className="text-white text-center font-semibold">
                  Erneut versuchen
                </Text>
              </Pressable>
            </View>
          )}

          {/* Vision Result */}
          {visionResult && state !== 'analyzing' && (
            <View className="bg-background-card rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-start mb-3">
                <Text className="text-white text-xl font-bold flex-1">
                  {visionResult.productName}
                </Text>
                <View className="bg-primary-500/20 px-2 py-1 rounded">
                  <Text className="text-primary-400 text-sm">
                    {Math.round(visionResult.confidence * 100)}%
                  </Text>
                </View>
              </View>
              
              <View className="flex-row flex-wrap gap-2 mb-3">
                <View className="bg-gray-700 px-3 py-1 rounded-full">
                  <Text className="text-gray-300 text-sm">{visionResult.category}</Text>
                </View>
                {visionResult.brand && (
                  <View className="bg-gray-700 px-3 py-1 rounded-full">
                    <Text className="text-gray-300 text-sm">{visionResult.brand}</Text>
                  </View>
                )}
                <View className="bg-gray-700 px-3 py-1 rounded-full">
                  <Text className="text-gray-300 text-sm">{visionResult.condition}</Text>
                </View>
              </View>

              <Text className="text-gray-400">{visionResult.description}</Text>
            </View>
          )}

          {/* Market Result */}
          {marketResult && state === 'complete' && (
            <View className="bg-background-card rounded-xl p-4 mb-4">
              <Text className="text-white text-lg font-semibold mb-4">
                💰 Marktwert (eBay)
              </Text>

              {/* Preis-Übersicht */}
              <View className="bg-background rounded-xl p-4 mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-400">Durchschnitt</Text>
                  <Text className="text-white text-xl font-bold">
                    {formatPrice(marketResult.priceStats.avgPrice)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Preisspanne</Text>
                  <Text className="text-gray-300">
                    {formatPrice(marketResult.priceStats.minPrice)} - {formatPrice(marketResult.priceStats.maxPrice)}
                  </Text>
                </View>
              </View>

              {/* Statistiken */}
              <View className="flex-row gap-3">
                <View className="flex-1 bg-background rounded-lg p-3 items-center">
                  <Text className="text-2xl font-bold text-white">
                    {marketResult.priceStats.totalListings}
                  </Text>
                  <Text className="text-gray-400 text-sm">Angebote</Text>
                </View>
                <View className="flex-1 bg-background rounded-lg p-3 items-center">
                  <Text className="text-2xl font-bold text-green-400">
                    {marketResult.priceStats.soldListings}
                  </Text>
                  <Text className="text-gray-400 text-sm">Verkauft</Text>
                </View>
                <View className="flex-1 bg-background rounded-lg p-3 items-center">
                  <Text className="text-2xl font-bold text-primary-400">
                    {formatPrice(marketResult.priceStats.medianPrice)}
                  </Text>
                  <Text className="text-gray-400 text-sm">Median</Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {state === 'complete' && (
            <View className="gap-3 mt-4">
              <Pressable
                onPress={handleSaveToHistory}
                className="bg-primary-500 rounded-xl p-4 active:bg-primary-600"
              >
                <Text className="text-white text-center text-lg font-semibold">
                  ✓ Speichern
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => router.back()}
                className="bg-background-card border border-gray-700 rounded-xl p-4 active:bg-background-elevated"
              >
                <Text className="text-gray-300 text-center text-lg font-semibold">
                  Neuen Scan starten
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
