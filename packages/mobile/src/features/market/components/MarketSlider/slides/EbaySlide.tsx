/**
 * eBay Slide - eBay Stats + Top 3 Listings
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { PriceStats, MarketListing, formatPrice, MARKETPLACE_NAMES } from '@/features/market/services/ebay';
import { Top3Listings } from '@/features/market/components/PriceEstimate/components/Top3Listings';
import { PlatformSlideProps } from '../types';

export function EbaySlide({
  priceStats,
  listings,
  isLoading,
  onPress,
}: PlatformSlideProps) {
  // Get top 3 listings - prioritize German results
  const top3 = useMemo(() => {
    return [...listings]
      .sort((a, b) => {
        if (a.marketplace === 'EBAY_DE' && b.marketplace !== 'EBAY_DE') return -1;
        if (a.marketplace !== 'EBAY_DE' && b.marketplace === 'EBAY_DE') return 1;
        return 0;
      })
      .slice(0, 3);
  }, [listings]);

  // Count unique marketplaces
  const marketplaces = useMemo(() => {
    const set = new Set(listings.map(l => l.marketplace).filter(Boolean));
    return Array.from(set);
  }, [listings]);

  return (
    <Pressable onPress={onPress}>
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-gradient-to-r from-primary-600/20 to-primary-500/10 rounded-xl p-4 border border-primary-500/30"
      >
        {/* Header */}
        <View className="flex-row items-center mb-3">
          <Icons.Money size={20} color="#a78bfa" />
          <Text className="text-white font-semibold text-base ml-2">eBay</Text>
          <View className="ml-auto flex-row gap-1">
            {marketplaces.slice(0, 3).map((mp) => (
              <Text key={mp} className="text-xs">
                {MARKETPLACE_NAMES[mp]?.split(' ')[0] || '🌍'}
              </Text>
            ))}
            {marketplaces.length > 3 && (
              <Text className="text-gray-400 text-xs">+{marketplaces.length - 3}</Text>
            )}
          </View>
        </View>

        {isLoading ? (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color="#a78bfa" />
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
                <Text className="text-gray-400 text-xs">Laender</Text>
                <Text className="text-white font-semibold text-sm">
                  {marketplaces.length}
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
            <Text className="text-gray-500 text-sm">Keine eBay-Daten</Text>
          </View>
        )}
      </MotiView>
    </Pressable>
  );
}
