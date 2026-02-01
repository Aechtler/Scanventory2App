/**
 * Price Estimate Component
 * Zeigt die Preisschätzung von eBay an
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { PriceStats, formatPrice, formatPriceRange } from '../services/ebayService';

interface PriceEstimateProps {
  priceStats: PriceStats | null;
  isLoading: boolean;
  error?: string | null;
}

/**
 * Zeigt Preisschätzung mit Loading/Error States
 */
export function PriceEstimate({ priceStats, isLoading, error }: PriceEstimateProps) {
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
        Basierend auf {priceStats.totalListings} aktiven eBay-Angeboten
      </Text>
    </MotiView>
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
