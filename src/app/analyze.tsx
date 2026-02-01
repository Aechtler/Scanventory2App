import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyzeImage, analyzeImageMock, VisionResult, VisionMatch } from '../features/scan/services/visionService';
import { generatePlatformLinks, PlatformLink } from '../features/market/services/quicklinks';
import { searchMarket, PriceStats } from '../features/market/services/ebay';
import { getMarketValue, MarketValueResult } from '../features/market/services/perplexity';
import { useHistoryStore } from '../features/history/store/historyStore';
import { MatchSelectionSheet } from '../features/scan/components/MatchSelectionSheet';
import { PlatformQuicklinks } from '../features/market/components/PlatformQuicklinks';
import { PriceEstimate } from '../features/market/components/PriceEstimate';
import { MarketValueCard } from '../features/market/components/MarketValueCard';
import { Icons } from '../shared/components/Icons';
import { FadeInView, BounceInView, AnimatedButton, StaggeredItem } from '../shared/components/Animated';
import { ImageSkeleton, AnalysisResultSkeleton } from '../shared/components/Skeleton';
import { MotiView } from 'moti';

type AnalysisState = 'analyzing' | 'selecting' | 'complete' | 'error';

/**
 * Analyse Screen - Bilderkennung + KI-Marktwert + Preisschätzung + Quicklinks
 */
export default function AnalyzeScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const addItem = useHistoryStore((state) => state.addItem);
  
  const [state, setState] = useState<AnalysisState>('analyzing');
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<VisionMatch | null>(null);
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([]);
  const [priceStats, setPriceStats] = useState<PriceStats | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [marketValue, setMarketValue] = useState<MarketValueResult | null>(null);
  const [marketValueLoading, setMarketValueLoading] = useState(false);
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

    // Generate quicklinks - use platform-specific queries if available
    const ebayQuery = match.searchQueries?.ebay || match.searchQuery;
    const links = generatePlatformLinks(ebayQuery);
    setPlatformLinks(links);

    setState('complete');

    // Load data in parallel (non-blocking)
    // Use generic/shorter query for better search results (too specific = no hits)
    const searchQuery = match.searchQueries?.generic || match.productName;
    loadPriceData(searchQuery);
    loadMarketValue(match.productName, match.category);
  };

  const loadPriceData = async (searchQuery: string) => {
    setPriceLoading(true);
    setPriceStats(null);

    try {
      console.log('[AnalyzeScreen] Loading price data with query:', searchQuery);
      const result = await searchMarket(searchQuery);
      if (result) {
        setPriceStats(result.priceStats);
      }
    } catch (err) {
      console.error('Price loading error:', err);
    } finally {
      setPriceLoading(false);
    }
  };

  const loadMarketValue = async (productName: string, category?: string) => {
    setMarketValueLoading(true);
    setMarketValue(null);
    
    try {
      const result = await getMarketValue(productName, category);
      setMarketValue(result);
    } catch (err) {
      console.error('Market value loading error:', err);
    } finally {
      setMarketValueLoading(false);
    }
  };

  const handleRefreshMarketValue = () => {
    if (selectedMatch) {
      loadMarketValue(selectedMatch.productName, selectedMatch.category);
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
    if (selectedMatch) {
      await addItem({
        imageUri: decodeURIComponent(imageUri!),
        productName: selectedMatch.productName,
        category: selectedMatch.category,
        brand: selectedMatch.brand,
        condition: selectedMatch.condition,
        confidence: selectedMatch.confidence,
        searchQuery: selectedMatch.searchQuery,
        searchQueries: selectedMatch.searchQueries,
        priceStats: priceStats || {
          minPrice: 0,
          maxPrice: 0,
          avgPrice: 0,
          medianPrice: 0,
          totalListings: 0,
          soldListings: 0,
        },
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
                transition={{ type: 'spring', damping: 15, stiffness: 400 }}
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

          {/* Loading State */}
          {state === 'analyzing' && (
            <FadeInView delay={100}>
              <View className="bg-background-card rounded-xl p-6 items-center mb-4">
                <MotiView
                  from={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', delay: 200 }}
                >
                  <Icons.Search size={48} color="#a78bfa" />
                </MotiView>
                <Text className="text-white mt-4 text-lg font-semibold">
                  Analysiere Bild...
                </Text>
                <Text className="text-gray-400 mt-2 text-center">
                  KI erkennt den Gegenstand
                </Text>
                
                {/* Loading Bar */}
                <View className="w-full h-1 bg-gray-700 rounded-full mt-4 overflow-hidden">
                  <MotiView
                    from={{ translateX: -200 }}
                    animate={{ translateX: 200 }}
                    transition={{ type: 'timing', duration: 1000, loop: true }}
                    className="w-20 h-full bg-primary-500 rounded-full"
                  />
                </View>
              </View>
              <AnalysisResultSkeleton />
            </FadeInView>
          )}

          {/* Error State */}
          {state === 'error' && (
            <BounceInView>
              <View className="bg-red-900/30 border border-red-500 rounded-xl p-6">
                <View className="flex-row items-center mb-2">
                  <Icons.Warning size={24} color="#f87171" />
                  <Text className="text-red-400 text-lg font-semibold ml-2">
                    Fehler bei der Analyse
                  </Text>
                </View>
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

          {/* Vision Result */}
          {selectedMatch && state === 'complete' && (
            <>
              <FadeInView delay={50}>
                <View className="bg-background-card rounded-xl p-4 mb-4 border border-gray-800">
                  <View className="flex-row justify-between items-start mb-3">
                    <Text className="text-white text-xl font-bold flex-1">
                      {selectedMatch.productName}
                    </Text>
                    <MotiView
                      from={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 150, stiffness: 400 }}
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

                  <Text className="text-gray-400 leading-5">
                    {selectedMatch.description}
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
                  isLoading={priceLoading}
                />
              </FadeInView>

              {/* Platform Quicklinks */}
              <FadeInView delay={150}>
                <PlatformQuicklinks links={platformLinks} />
              </FadeInView>
            </>
          )}

          {/* Action Buttons */}
          {state === 'complete' && (
            <FadeInView delay={250} className="gap-3 mt-6">
              <AnimatedButton
                onPress={handleSaveToHistory}
                className="bg-primary-500 rounded-xl p-4"
              >
                <View className="flex-row items-center justify-center">
                  <Icons.Check size={20} color="#ffffff" />
                  <Text className="text-white text-center text-lg font-semibold ml-2">
                    Im Verlauf speichern
                  </Text>
                </View>
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
