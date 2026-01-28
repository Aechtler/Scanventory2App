import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyzeImage, analyzeImageMock, VisionResult, VisionMatch } from '../features/scan/services/visionService';
import { searchAllMarkets, formatPrice, AggregatedMarketResult } from '../features/market/services/marketAggregator';
import { useHistoryStore } from '../features/history/store/historyStore';
import { MatchSelectionSheet } from '../features/scan/components/MatchSelectionSheet';
import { FadeInView, BounceInView, AnimatedButton, StaggeredItem } from '../shared/components/Animated';
import { ImageSkeleton, AnalysisResultSkeleton, PriceStatsSkeleton } from '../shared/components/Skeleton';
import { MotiView } from 'moti';

type AnalysisState = 'analyzing' | 'selecting' | 'searching' | 'complete' | 'error';

/**
 * Analyse Screen - Premium UI mit Animationen
 */
export default function AnalyzeScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const addItem = useHistoryStore((state) => state.addItem);
  
  const [state, setState] = useState<AnalysisState>('analyzing');
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<VisionMatch | null>(null);
  const [marketResult, setMarketResult] = useState<AggregatedMarketResult | null>(null);
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

      const hasApiKey = !!process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      const vision = hasApiKey 
        ? await analyzeImage(decodeURIComponent(imageUri!))
        : await analyzeImageMock(decodeURIComponent(imageUri!));
      
      setVisionResult(vision);

      if (vision.matches.length === 1 || vision.matches[0].confidence >= 0.9) {
        handleMatchSelect(0, vision);
      } else {
        setState('selecting');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setState('error');
    }
  };

  const handleMatchSelect = async (index: number, result?: VisionResult) => {
    const vision = result || visionResult;
    if (!vision) return;

    const match = vision.matches[index];
    setSelectedMatch(match);
    setState('searching');

    try {
      const market = await searchAllMarkets(match.searchQuery, match.category);
      setMarketResult(market);
      setState('complete');
    } catch (err) {
      console.error('Market search error:', err);
      setError(err instanceof Error ? err.message : 'Marktsuche fehlgeschlagen');
      setState('error');
    }
  };

  const handleManualEntry = () => {
    Alert.alert(
      'Manuelle Eingabe',
      'Diese Funktion wird in einer späteren Version verfügbar sein.',
      [{ text: 'OK' }]
    );
  };

  const handleSaveToHistory = async () => {
    if (selectedMatch && marketResult) {
      await addItem({
        imageUri: decodeURIComponent(imageUri!),
        productName: selectedMatch.productName,
        category: selectedMatch.category,
        brand: selectedMatch.brand,
        condition: selectedMatch.condition,
        confidence: selectedMatch.confidence,
        priceStats: marketResult.combined,
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
          {/* Animiertes Bild */}
          <FadeInView delay={0}>
            {imageUri ? (
              <MotiView
                from={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="rounded-2xl overflow-hidden mb-6 shadow-lg"
              >
                <Image
                  source={{ uri: decodeURIComponent(imageUri) }}
                  style={{ width: '100%', aspectRatio: 4 / 3 }}
                  resizeMode="cover"
                />
                
              </MotiView>
            ) : (
              <ImageSkeleton />
            )}
          </FadeInView>

          {/* Loading States mit Skeleton */}
          {state === 'analyzing' && (
            <FadeInView delay={200}>
              <View className="bg-background-card rounded-xl p-6 items-center mb-4">
                <MotiView
                  from={{ rotate: '0deg' }}
                  animate={{ rotate: '360deg' }}
                  transition={{ type: 'timing', duration: 2000, loop: true }}
                >
                  <Text className="text-5xl">🔍</Text>
                </MotiView>
                <Text className="text-white mt-4 text-lg font-semibold">
                  Analysiere Bild...
                </Text>
                <Text className="text-gray-400 mt-2 text-center">
                  KI erkennt den Gegenstand
                </Text>
                
                {/* Loading Bar Animation */}
                <View className="w-full h-1 bg-gray-700 rounded-full mt-4 overflow-hidden">
                  <MotiView
                    from={{ translateX: -200 }}
                    animate={{ translateX: 200 }}
                    transition={{ type: 'timing', duration: 1500, loop: true }}
                    className="w-20 h-full bg-primary-500 rounded-full"
                  />
                </View>
              </View>
              <AnalysisResultSkeleton />
            </FadeInView>
          )}

          {state === 'searching' && (
            <FadeInView delay={0}>
              <View className="bg-background-card rounded-xl p-6 items-center mb-4">
                <MotiView
                  from={{ scale: 0.9 }}
                  animate={{ scale: 1.1 }}
                  transition={{ type: 'timing', duration: 800, loop: true }}
                >
                  <Text className="text-5xl">💰</Text>
                </MotiView>
                <Text className="text-white mt-4 text-lg font-semibold">
                  Suche Marktdaten...
                </Text>
                <Text className="text-gray-400 mt-2 text-center">
                  Durchsuche eBay, Kleinanzeigen, Amazon & Idealo
                </Text>
              </View>
              <PriceStatsSkeleton />
            </FadeInView>
          )}

          {/* Error State */}
          {state === 'error' && (
            <BounceInView>
              <View className="bg-red-900/30 border border-red-500 rounded-xl p-6">
                <Text className="text-red-400 text-lg font-semibold mb-2">
                  ❌ Fehler bei der Analyse
                </Text>
                <Text className="text-red-300">{error}</Text>
                <AnimatedButton
                  onPress={runAnalysis}
                  className="mt-4 bg-red-500 rounded-lg p-3"
                >
                  <Text className="text-white text-center font-semibold">
                    Erneut versuchen
                  </Text>
                </AnimatedButton>
              </View>
            </BounceInView>
          )}

          {/* Vision Result - Animiert */}
          {selectedMatch && state !== 'analyzing' && state !== 'selecting' && (
            <FadeInView delay={100}>
              <View className="bg-background-card rounded-xl p-4 mb-4 border border-gray-800">
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="text-white text-xl font-bold flex-1">
                    {selectedMatch.productName}
                  </Text>
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 300 }}
                    className="bg-primary-500/20 px-3 py-1 rounded-lg"
                  >
                    <Text className="text-primary-400 font-bold">
                      {Math.round(selectedMatch.confidence * 100)}%
                    </Text>
                  </MotiView>
                </View>
                
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {[selectedMatch.category, selectedMatch.brand, selectedMatch.condition]
                    .filter(Boolean)
                    .map((tag, i) => (
                      <StaggeredItem key={i} index={i}>
                        <View className="bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600">
                          <Text className="text-gray-200 text-sm">{tag}</Text>
                        </View>
                      </StaggeredItem>
                    ))}
                </View>

                <Text className="text-gray-400 leading-5">{selectedMatch.description}</Text>
              </View>
            </FadeInView>
          )}

          {/* Market Result - Premium Design */}
          {marketResult && state === 'complete' && (
            <>
              {/* Hauptpreis - Hero Section */}
              <BounceInView delay={200}>
                <View className="bg-gradient-to-b from-primary-500/20 to-primary-500/5 border border-primary-500/30 rounded-2xl p-6 mb-4">
                  <Text className="text-gray-400 text-center text-sm mb-1">
                    Geschätzter Marktwert
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

              {/* Plattform-Vergleich - Cards */}
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

          {/* Action Buttons - Animiert */}
          {state === 'complete' && (
            <FadeInView delay={600} className="gap-3 mt-6">
              <AnimatedButton
                onPress={handleSaveToHistory}
                className="bg-primary-500 rounded-xl p-4"
              >
                <Text className="text-white text-center text-lg font-semibold">
                  ✓ Speichern
                </Text>
              </AnimatedButton>
              
              <AnimatedButton
                onPress={() => router.back()}
                className="bg-background-card border border-gray-700 rounded-xl p-4"
              >
                <Text className="text-gray-300 text-center text-lg font-semibold">
                  Neuen Scan starten
                </Text>
              </AnimatedButton>
            </FadeInView>
          )}
        </ScrollView>

        {/* Match Selection Sheet */}
        <MatchSelectionSheet
          visible={state === 'selecting'}
          matches={visionResult?.matches || []}
          onSelect={handleMatchSelect}
          onManualEntry={handleManualEntry}
        />
      </SafeAreaView>
    </>
  );
}
