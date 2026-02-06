/**
 * Kleinanzeigen Slide - Kleinanzeigen Stats + Top 3 Listings
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { formatPrice } from '@/features/market/services/ebay';
import { Top3Listings } from '@/features/market/components/PriceEstimate/components/Top3Listings';
import { PlatformSlideProps } from '../types';

export function KleinanzeigenSlide({
  priceStats,
  listings,
  isLoading,
  onPress,
}: PlatformSlideProps) {
  const top3 = useMemo(() => listings.slice(0, 3), [listings]);

  return (
    <Pressable onPress={onPress}>
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-green-900/20 rounded-xl p-4 border border-green-500/30"
      >
        {/* Header */}
        <View className="flex-row items-center mb-3">
          <Icons.Tag size={20} color="#22c55e" />
          <Text className="text-white font-semibold text-base ml-2">Kleinanzeigen</Text>
          <Text className="ml-auto text-xs">📦</Text>
        </View>

        {isLoading ? (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color="#22c55e" />
            <Text className="text-gray-400 text-sm mt-2">Suche Angebote...</Text>
          </View>
        ) : priceStats ? (
          <>
            {/* Main Price */}
            <View className="items-center py-2">
              <Text className="text-gray-400 text-xs mb-1">
                Durchschnitt ({listings.length} Angebote)
              </Text>
              <Text className="text-white text-3xl font-bold">
                {formatPrice(priceStats.avgPrice)}
              </Text>
            </View>

            {/* Price Range */}
            <View className="flex-row justify-between bg-gray-800/50 rounded-lg p-2.5 mt-2">
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-xs">Von</Text>
                <Text className="text-green-400 font-semibold text-sm">
                  {formatPrice(priceStats.minPrice)}
                </Text>
              </View>
              <View className="w-px bg-gray-700" />
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-xs">Bis</Text>
                <Text className="text-red-400 font-semibold text-sm">
                  {formatPrice(priceStats.maxPrice)}
                </Text>
              </View>
              <View className="w-px bg-gray-700" />
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-xs">Angebote</Text>
                <Text className="text-white font-semibold text-sm">
                  {priceStats.totalListings}
                </Text>
              </View>
            </View>

            {/* Top 3 */}
            <Top3Listings listings={top3} />

            {/* Footer */}
            <View className="flex-row items-center justify-center mt-3">
              <Text className="text-gray-500 text-xs">Tippen fuer alle Angebote</Text>
              <Icons.ChevronDown size={12} color="#6b7280" />
            </View>
          </>
        ) : (
          <View className="items-center py-6">
            <Text className="text-gray-500 text-sm">Keine Kleinanzeigen-Daten</Text>
          </View>
        )}
      </MotiView>
    </Pressable>
  );
}
