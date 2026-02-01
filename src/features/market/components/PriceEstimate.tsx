/**
 * Price Estimate Component
 * Zeigt die Preisschätzung von eBay an
 */

import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal, Linking, Image } from 'react-native';
import { MotiView } from 'moti';
import { PriceStats, formatPrice, formatPriceRange, MarketListing } from '../services/ebay';

interface PriceEstimateProps {
  priceStats: PriceStats | null;
  listings?: MarketListing[];
  isLoading: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

/**
 * Zeigt Preisschätzung mit Loading/Error States
 */
export function PriceEstimate({ priceStats, listings, isLoading, error, onRefresh }: PriceEstimateProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Loading State
  if (isLoading) {
    return (
      <View className="bg-background-card rounded-xl p-4 mb-4 border border-gray-800">
        <View className="flex-row items-center">
          <MotiView
            from={{ rotate: '0deg' }}
            animate={{ rotate: '360deg' }}
            transition={{ type: 'timing', duration: 1000, loop: true }}
          >
            <Text className="text-2xl mr-3">💰</Text>
          </MotiView>
          <View className="flex-1">
            <Text className="text-white font-semibold">Lade Preisdaten...</Text>
            <View className="h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <MotiView
                from={{ translateX: -100 }}
                animate={{ translateX: 100 }}
                transition={{ type: 'timing', duration: 800, loop: true }}
                className="w-16 h-full bg-primary-500 rounded-full"
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Error or no data - don't show anything (graceful degradation)
  if (error || !priceStats) {
    return null;
  }

  return (
    <>
      <Pressable onPress={() => setShowDetails(true)}>
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 400 }}
          className="bg-gradient-to-r from-primary-600/20 to-primary-500/10 rounded-xl p-4 mb-4 border border-primary-500/30"
        >
          {/* Header */}
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-2">💰</Text>
            <Text className="text-white font-semibold text-lg">Preisschätzung</Text>
            <View className="ml-auto bg-primary-500/20 px-2 py-1 rounded">
              <Text className="text-primary-300 text-xs">eBay</Text>
            </View>
          </View>

          {/* Main Price */}
          <View className="items-center py-3">
            <Text className="text-gray-400 text-sm mb-1">Durchschnittspreis</Text>
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 100, stiffness: 400 }}
            >
              <Text className="text-white text-4xl font-bold">
                {formatPrice(priceStats.avgPrice)}
              </Text>
            </MotiView>
          </View>

          {/* Price Range */}
          <View className="flex-row justify-between bg-gray-800/50 rounded-lg p-3 mt-2">
            <View className="items-center flex-1">
              <Text className="text-gray-400 text-xs">Von</Text>
              <Text className="text-green-400 font-semibold">
                {formatPrice(priceStats.minPrice)}
              </Text>
            </View>
            <View className="w-px bg-gray-700" />
            <View className="items-center flex-1">
              <Text className="text-gray-400 text-xs">Bis</Text>
              <Text className="text-red-400 font-semibold">
                {formatPrice(priceStats.maxPrice)}
              </Text>
            </View>
            <View className="w-px bg-gray-700" />
            <View className="items-center flex-1">
              <Text className="text-gray-400 text-xs">Angebote</Text>
              <Text className="text-white font-semibold">{priceStats.totalListings}</Text>
            </View>
          </View>

          {/* Hint */}
          <Text className="text-gray-500 text-xs text-center mt-3">
            Tippen für Details ▼
          </Text>
        </MotiView>
      </Pressable>

      {/* Detail Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetails(false)}
      >
        <View className="flex-1 bg-gray-900">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">💰</Text>
              <Text className="text-white font-bold text-lg">Preisanalyse Details</Text>
            </View>
            <Pressable 
              onPress={() => setShowDetails(false)}
              className="bg-gray-800 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Schließen</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Price Summary */}
            <View className="bg-primary-900/30 rounded-xl p-4 mb-4 border border-primary-500/30">
              <Text className="text-primary-300 text-sm mb-2">Durchschnittspreis</Text>
              <Text className="text-white text-4xl font-bold text-center">
                {formatPrice(priceStats.avgPrice)}
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                {formatPriceRange(priceStats.minPrice, priceStats.maxPrice)}
              </Text>
            </View>

            {/* Statistics */}
            <View className="bg-gray-800/50 rounded-xl p-4 mb-4">
              <Text className="text-white font-semibold mb-3">📊 Statistiken</Text>
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Minimum</Text>
                  <Text className="text-green-400 font-semibold">{formatPrice(priceStats.minPrice)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Maximum</Text>
                  <Text className="text-red-400 font-semibold">{formatPrice(priceStats.maxPrice)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Durchschnitt</Text>
                  <Text className="text-white font-semibold">{formatPrice(priceStats.avgPrice)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Median</Text>
                  <Text className="text-white font-semibold">{formatPrice(priceStats.medianPrice)}</Text>
                </View>
                <View className="w-full h-px bg-gray-700 my-1" />
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Angebote gesamt</Text>
                  <Text className="text-white font-semibold">{priceStats.totalListings}</Text>
                </View>
                {priceStats.soldListings > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Davon verkauft</Text>
                    <Text className="text-white font-semibold">{priceStats.soldListings}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Listings */}
            {listings && listings.length > 0 && (
              <View className="bg-gray-800/50 rounded-xl p-4 mb-4">
                <Text className="text-white font-semibold mb-3">
                  🛒 Gefundene Angebote ({listings.length})
                </Text>
                {listings.slice(0, 15).map((listing, i) => (
                  <Pressable
                    key={listing.id || i}
                    onPress={() => {
                      if (listing.itemUrl) {
                        Linking.openURL(listing.itemUrl);
                      }
                    }}
                    className="bg-gray-700/50 rounded-lg p-3 mb-2 flex-row"
                  >
                    {/* Product Image */}
                    {listing.imageUrl ? (
                      <Image 
                        source={{ uri: listing.imageUrl }}
                        style={{ width: 64, height: 64, borderRadius: 8 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View 
                        style={{ width: 64, height: 64, borderRadius: 8 }}
                        className="bg-gray-600 items-center justify-center"
                      >
                        <Text className="text-2xl">📦</Text>
                      </View>
                    )}
                    
                    {/* Listing Info */}
                    <View className="flex-1 ml-3">
                      <Text 
                        className="text-gray-200 text-sm font-medium mb-1"
                        numberOfLines={2}
                      >
                        {listing.title}
                      </Text>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-primary-400 font-bold text-lg">
                          {formatPrice(listing.price)}
                        </Text>
                        <View className="flex-row items-center gap-1">
                          {listing.condition && (
                            <View className="bg-gray-600/50 px-2 py-0.5 rounded">
                              <Text className="text-gray-300 text-xs">{listing.condition}</Text>
                            </View>
                          )}
                          {listing.sold && (
                            <View className="bg-red-500/20 px-2 py-0.5 rounded">
                              <Text className="text-red-400 text-xs">Verkauft</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Text className="text-primary-500 text-xs mt-1">
                        Tippen zum Öffnen →
                      </Text>
                    </View>
                  </Pressable>
                ))}
                {listings.length > 15 && (
                  <Text className="text-gray-500 text-center mt-2">
                    + {listings.length - 15} weitere Angebote
                  </Text>
                )}
              </View>
            )}

            {/* No listings fallback */}
            {(!listings || listings.length === 0) && (
              <View className="bg-gray-800/50 rounded-xl p-4 mb-4">
                <Text className="text-gray-400 text-center">
                  Keine detaillierten Angebote verfügbar.
                  {'\n'}Bitte "Neu laden" drücken um Angebote zu laden.
                </Text>
              </View>
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <Pressable 
                onPress={() => {
                  onRefresh();
                  setShowDetails(false);
                }}
                className="bg-primary-600 py-4 px-6 rounded-xl items-center mb-6"
              >
                <Text className="text-white font-semibold">🔄 Neu laden</Text>
              </Pressable>
            )}

            {/* Source info */}
            <Text className="text-gray-600 text-xs text-center mb-4">
              Datenquelle: eBay Browse API • Preise können variieren
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

/**
 * Kompakte Version für Listen
 */
export function PriceEstimateCompact({ priceStats, isLoading }: PriceEstimateProps) {
  if (isLoading) {
    return (
      <View className="flex-row items-center py-2">
        <MotiView
          from={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500, loop: true }}
          className="h-4 w-20 bg-gray-700 rounded"
        />
      </View>
    );
  }

  if (!priceStats) {
    return null;
  }

  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-primary-400 font-bold">
        ~{formatPrice(priceStats.avgPrice)}
      </Text>
      <Text className="text-gray-500 text-sm">
        ({formatPriceRange(priceStats.minPrice, priceStats.maxPrice)})
      </Text>
    </View>
  );
}
