/**
 * Compact Price Estimate
 * Kompakte Version für Listen-Darstellung
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { PriceStats, formatPrice, formatPriceRange } from '@/features/market/services/ebay';

interface PriceEstimateCompactProps {
  priceStats: PriceStats | null;
  isLoading: boolean;
}

export function PriceEstimateCompact({
  priceStats,
  isLoading,
}: PriceEstimateCompactProps) {
  if (isLoading) {
    return (
      <View className="flex-row items-center py-2">
        <MotiView
          from={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500, loop: true }}
          className="h-4 w-20 bg-background-elevated rounded"
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
      <Text className="text-foreground-secondary text-sm">
        ({formatPriceRange(priceStats.minPrice, priceStats.maxPrice)})
      </Text>
    </View>
  );
}
