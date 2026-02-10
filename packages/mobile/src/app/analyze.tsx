import { useEffect, useRef } from 'react';
import { ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
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
 */
export default function AnalyzeScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const addItem = useHistoryStore((state) => state.addItem);
  const isSaving = useRef(false);

  const {
    state,
    visionResult,
    selectedMatch,
    error,
    runAnalysis,
    handleMatchSelect,
    handleManualSearch,
  } = useAnalysis();

  // Run analysis when image changes
  useEffect(() => {
    if (imageUri) {
      runAnalysis(imageUri);
    }
  }, [imageUri]);

  // Auto-save and navigate to edit page when match is selected
  useEffect(() => {
    if (selectedMatch && state === 'complete' && imageUri && !isSaving.current) {
      isSaving.current = true;
      addItem({
        imageUri: decodeURIComponent(imageUri),
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
          {/* Image Header */}
          <AnalysisImageHeader imageUri={imageUri || null} />

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
