import { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoryStore } from '../features/history/store/historyStore';
import { useMarketData } from '../features/market/hooks';
import { 
  useAnalysis, 
  AnalyzingState, 
  AnalysisErrorState, 
  ProductResultCard, 
  AnalysisActions,
  AnalysisImageHeader,
} from '../features/analyze';
import { MatchSelectionSheet } from '../features/scan/components/MatchSelectionSheet';
import { PlatformQuicklinks } from '../features/market/components/PlatformQuicklinks';
import { MarketSlider } from '../features/market/components/MarketSlider';
import { FadeInView } from '../shared/components/Animated';

/**
 * Analyse Screen - Bilderkennung + KI-Marktwert + Preisschätzung + Quicklinks
 */
export default function AnalyzeScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const addItem = useHistoryStore((state) => state.addItem);

  // Analysis hook for vision workflow
  const {
    state,
    visionResult,
    selectedMatch,
    platformLinks,
    error,
    runAnalysis,
    handleMatchSelect,
    handleManualSearch,
  } = useAnalysis();

  // Market data hook
  const {
    ebayPriceStats,
    ebayListings,
    ebayLoading,
    kleinanzeigenPriceStats,
    kleinanzeigenListings,
    kleinanzeigenLoading,
    marketValue,
    marketValueLoading,
    loadEbayData,
    loadKleinanzeigenData,
    loadMarketValue,
  } = useMarketData();

  // Run analysis when image changes
  useEffect(() => {
    if (imageUri) {
      runAnalysis(imageUri);
    }
  }, [imageUri]);

  // Load market data when match is selected
  useEffect(() => {
    if (selectedMatch && state === 'complete') {
      const searchQuery = selectedMatch.searchQueries?.generic || selectedMatch.productName;
      loadEbayData(searchQuery, selectedMatch.gtin || undefined);
      loadMarketValue(selectedMatch.productName, selectedMatch.category);
      loadKleinanzeigenData(
        selectedMatch.searchQueries?.kleinanzeigen || searchQuery, 
        selectedMatch.category
      );
    }
  }, [selectedMatch, state]);

  const handleRefreshMarketValue = () => {
    if (selectedMatch) {
      loadMarketValue(selectedMatch.productName, selectedMatch.category, true);
    }
  };

  const handleSaveToHistory = async () => {
    if (selectedMatch && imageUri) {
      await addItem({
        imageUri: decodeURIComponent(imageUri),
        productName: selectedMatch.productName,
        category: selectedMatch.category,
        brand: selectedMatch.brand,
        condition: selectedMatch.condition,
        confidence: selectedMatch.confidence,
        searchQuery: selectedMatch.searchQuery,
        searchQueries: selectedMatch.searchQueries,
        gtin: selectedMatch.gtin,
        ebayListings: ebayListings,
        ebayListingsFetchedAt: new Date().toISOString(),
        kleinanzeigenListings: kleinanzeigenListings,
        kleinanzeigenListingsFetchedAt: kleinanzeigenListings.length > 0 ? new Date().toISOString() : undefined,
        marketValue: marketValue ?? undefined,
        marketValueFetchedAt: marketValue ? new Date().toISOString() : undefined,
        priceStats: ebayPriceStats || {
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
          {/* Image Header */}
          <AnalysisImageHeader imageUri={imageUri || null} />

          {/* Loading State */}
          {state === 'analyzing' && <AnalyzingState />}

          {/* Error State */}
          {state === 'error' && error && (
            <AnalysisErrorState 
              error={error} 
              onRetry={() => imageUri && runAnalysis(imageUri)} 
            />
          )}

          {/* Vision Result */}
          {selectedMatch && state === 'complete' && (
            <>
              <ProductResultCard match={selectedMatch} />

              {/* Market Slider */}
              <FadeInView delay={75} className="mb-4">
                <MarketSlider
                  marketValue={marketValue}
                  marketValueLoading={marketValueLoading}
                  onRefreshMarketValue={handleRefreshMarketValue}
                  ebayPriceStats={ebayPriceStats}
                  ebayListings={ebayListings}
                  ebayLoading={ebayLoading}
                  onRefreshEbay={() => {
                    const searchQuery = selectedMatch.searchQueries?.generic || selectedMatch.productName;
                    loadEbayData(searchQuery, selectedMatch.gtin || undefined);
                  }}
                  kleinanzeigenPriceStats={kleinanzeigenPriceStats}
                  kleinanzeigenListings={kleinanzeigenListings}
                  kleinanzeigenLoading={kleinanzeigenLoading}
                  onRefreshKleinanzeigen={() => {
                    const searchQuery = selectedMatch.searchQueries?.kleinanzeigen || selectedMatch.searchQueries?.generic || selectedMatch.productName;
                    loadKleinanzeigenData(searchQuery, selectedMatch.category);
                  }}
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
            <AnalysisActions 
              onSave={handleSaveToHistory} 
              onNewScan={() => router.back()} 
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
