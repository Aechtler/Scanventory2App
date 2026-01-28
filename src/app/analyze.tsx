import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyzeImage, analyzeImageMock, VisionResult, VisionMatch } from '../features/scan/services/visionService';
import { searchAllMarkets, formatPrice, AggregatedMarketResult } from '../features/market/services/marketAggregator';
import { useHistoryStore } from '../features/history/store/historyStore';
import { MatchSelectionSheet } from '../features/scan/components/MatchSelectionSheet';

type AnalysisState = 'analyzing' | 'selecting' | 'searching' | 'complete' | 'error';

/**
 * Analyse Screen - Zeigt Bildanalyse und Marktdaten
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

      // 1. Bildanalyse mit Gemini
      const hasApiKey = !!process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      const vision = hasApiKey 
        ? await analyzeImage(decodeURIComponent(imageUri!))
        : await analyzeImageMock(decodeURIComponent(imageUri!));
      
      setVisionResult(vision);

      // Wenn nur ein Treffer mit hoher Konfidenz, automatisch auswählen
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
      // 2. Marktsuche auf allen Plattformen
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

  const handleSaveToHistory = () => {
    if (selectedMatch && marketResult) {
      addItem({
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
                  : 'Suche auf eBay, Kleinanzeigen & Amazon'}
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
          {selectedMatch && state !== 'analyzing' && state !== 'selecting' && (
            <View className="bg-background-card rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-start mb-3">
                <Text className="text-white text-xl font-bold flex-1">
                  {selectedMatch.productName}
                </Text>
                <View className="bg-primary-500/20 px-2 py-1 rounded">
                  <Text className="text-primary-400 text-sm">
                    {Math.round(selectedMatch.confidence * 100)}%
                  </Text>
                </View>
              </View>
              
              <View className="flex-row flex-wrap gap-2 mb-3">
                <View className="bg-gray-700 px-3 py-1 rounded-full">
                  <Text className="text-gray-300 text-sm">{selectedMatch.category}</Text>
                </View>
                {selectedMatch.brand && (
                  <View className="bg-gray-700 px-3 py-1 rounded-full">
                    <Text className="text-gray-300 text-sm">{selectedMatch.brand}</Text>
                  </View>
                )}
                <View className="bg-gray-700 px-3 py-1 rounded-full">
                  <Text className="text-gray-300 text-sm">{selectedMatch.condition}</Text>
                </View>
              </View>

              <Text className="text-gray-400">{selectedMatch.description}</Text>
            </View>
          )}

          {/* Market Result - Platform Comparison */}
          {marketResult && state === 'complete' && (
            <>
              {/* Gesamt-Übersicht */}
              <View className="bg-background-card rounded-xl p-4 mb-4">
                <Text className="text-white text-lg font-semibold mb-4">
                  💰 Geschätzter Marktwert
                </Text>

                <View className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 mb-4">
                  <Text className="text-gray-400 text-center text-sm">Durchschnitt</Text>
                  <Text className="text-white text-3xl font-bold text-center">
                    {formatPrice(marketResult.combined.avgPrice)}
                  </Text>
                  <Text className="text-gray-400 text-center text-sm mt-1">
                    {formatPrice(marketResult.combined.minPrice)} - {formatPrice(marketResult.combined.maxPrice)}
                  </Text>
                </View>

                {/* Statistiken */}
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-background rounded-lg p-3 items-center">
                    <Text className="text-2xl font-bold text-white">
                      {marketResult.combined.totalListings}
                    </Text>
                    <Text className="text-gray-400 text-sm">Angebote</Text>
                  </View>
                  <View className="flex-1 bg-background rounded-lg p-3 items-center">
                    <Text className="text-2xl font-bold text-green-400">
                      {marketResult.combined.soldListings}
                    </Text>
                    <Text className="text-gray-400 text-sm">Verkauft</Text>
                  </View>
                  <View className="flex-1 bg-background rounded-lg p-3 items-center">
                    <Text className="text-2xl font-bold text-primary-400">
                      {formatPrice(marketResult.combined.medianPrice)}
                    </Text>
                    <Text className="text-gray-400 text-sm">Median</Text>
                  </View>
                </View>
              </View>

              {/* Plattform-Vergleich */}
              <View className="bg-background-card rounded-xl p-4 mb-4">
                <Text className="text-white text-lg font-semibold mb-4">
                  📊 Plattform-Vergleich
                </Text>

                {marketResult.platforms.map((platform) => (
                  <View 
                    key={platform.platform} 
                    className="flex-row items-center justify-between py-3 border-b border-gray-800 last:border-b-0"
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">
                        {platform.platform === 'ebay' && '🛒'}
                        {platform.platform === 'kleinanzeigen' && '📦'}
                        {platform.platform === 'amazon' && '📱'}
                      </Text>
                      <View>
                        <Text className="text-white font-medium capitalize">
                          {platform.platform}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          {platform.priceStats.totalListings} Angebote
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-white font-bold">
                        {formatPrice(platform.priceStats.avgPrice)}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        ⌀ Preis
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
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
