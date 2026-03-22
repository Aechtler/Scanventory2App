import { useEffect, useRef } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Icons } from '../shared/components/Icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore } from '../features/history/store/historyStore';
import {
  useAnalysis,
  AnalyzingState,
  AnalysisErrorState,
  AnalysisImageHeader,
} from '../features/analyze';
import { MatchSelectionSheet } from '../features/scan/components/MatchSelectionSheet';

/**
 * Analyse Screen - Bilderkennung, automatisches Speichern, Weiterleitung zur Edit-Seite
 * Unterstützt sowohl Bild-Analyse (imageUri) als auch direkten QR/Barcode-Flow (searchQuery)
 */
export default function AnalyzeScreen() {
  const { imageUri, searchQuery, gtin } = useLocalSearchParams<{
    imageUri?: string;
    searchQuery?: string;
    gtin?: string;
  }>();
  const addItem = useHistoryStore((state) => state.addItem);
  const isSaving = useRef(false);

  const {
    state,
    visionResult,
    selectedMatch,
    error,
    runAnalysis,
    runManualAnalysis,
    handleMatchSelect,
    handleManualSearch,
  } = useAnalysis();

  // Bild-Analyse oder QR/Barcode-Flow starten
  useEffect(() => {
    if (imageUri) {
      runAnalysis(imageUri);
    } else if (searchQuery) {
      // QR/Barcode: direkt manuelle Analyse ohne Bild
      runManualAnalysis(
        decodeURIComponent(searchQuery),
        gtin && gtin.length > 0 ? gtin : undefined,
      );
    }
  }, [imageUri, searchQuery]);

  // Auto-save and navigate to edit page when match is selected
  useEffect(() => {
    if (selectedMatch && state === 'complete' && !isSaving.current) {
      isSaving.current = true;
      addItem({
        imageUri: imageUri ? decodeURIComponent(imageUri) : '',
        productName: selectedMatch.productName,
        category: selectedMatch.category,
        brand: selectedMatch.brand,
        condition: selectedMatch.condition,
        confidence: selectedMatch.confidence,
        searchQuery: selectedMatch.searchQuery,
        searchQueries: selectedMatch.searchQueries,
        gtin: selectedMatch.gtin,
        ebayListings: [],
        priceStats: {
          minPrice: 0,
          maxPrice: 0,
          avgPrice: 0,
          medianPrice: 0,
          totalListings: 0,
          soldListings: 0,
        },
      }).then((newId) => {
        router.replace(`/history/edit/${newId}`);
      });
    }
  }, [selectedMatch, state]);

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
          {/* Image Header – nur bei Bild-Analyse anzeigen */}
          {imageUri ? (
            <AnalysisImageHeader imageUri={imageUri} />
          ) : searchQuery ? (
            // QR/Barcode-Flow: Icon-Badge statt Bild
            <View className="items-center justify-center mb-6 py-8 bg-background-card rounded-2xl border border-border">
              <Icons.QrCode size={56} color="#6366f1" />
              <Text className="text-foreground text-base font-semibold mt-3">
                {decodeURIComponent(searchQuery)}
              </Text>
              <Text className="text-foreground-secondary text-xs mt-1">
                {gtin ? `EAN/GTIN: ${gtin}` : 'QR-Code gescannt'}
              </Text>
            </View>
          ) : null}

          {/* Loading State */}
          {(state === 'analyzing' || (state === 'complete' && selectedMatch)) && (
            <AnalyzingState />
          )}

          {/* Error State */}
          {state === 'error' && error && (
            <AnalysisErrorState
              error={error}
              onRetry={() => imageUri && runAnalysis(imageUri)}
            />
          )}
        </ScrollView>

        {/* Match Selection Sheet */}
        <MatchSelectionSheet
          visible={state === 'selecting'}
          matches={visionResult?.matches || []}
          onSelect={handleMatchSelect}
          onManualSearch={handleManualSearch}
        />
      </SafeAreaView>
    </>
  );
}
