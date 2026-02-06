/**
 * eBay Slide - eBay Stats + Top 3 Listings
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { formatPrice, MARKETPLACE_NAMES } from '@/features/market/services/ebay';
import { Top3Listings } from '@/features/market/components/PriceEstimate/components/Top3Listings';
import { PlatformSlideProps } from '../types';
import { SLIDE_MIN_HEIGHT } from '../constants';

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
    const set = new Set<string>();
    listings.forEach(l => { if (l.marketplace) set.add(l.marketplace); });
    return Array.from(set);
  }, [listings]);

  return (
    <Pressable onPress={onPress}>
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{ minHeight: SLIDE_MIN_HEIGHT }}
        className="bg-indigo-900/20 rounded-xl p-4 border border-indigo-500/30 justify-between"
      >
        {/* Header */}
        <View className="flex-row items-center mb-2">
          <Icons.Money size={20} color="#818cf8" />
          <Text className="text-white font-semibold text-base ml-2">eBay</Text>
          <View className="ml-auto flex-row items-center gap-1">
            {marketplaces.slice(0, 4).map((mp) => (
              <Text key={mp} className="text-xs">
                {MARKETPLACE_NAMES[mp]?.split(' ')[0] || '🌍'}
              </Text>
            ))}
            {marketplaces.length > 4 && (
              <Text className="text-gray-400 text-xs ml-0.5">+{marketplaces.length - 4}</Text>
            )}
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <MotiView
              from={{ rotate: '0deg' }}
              animate={{ rotate: '360deg' }}
              transition={{ type: 'timing', duration: 1500, loop: true }}
            >
              <Icons.Refresh size={32} color="#818cf8" />
            </MotiView>
            <Text className="text-gray-400 text-sm mt-3">Suche eBay-Angebote...</Text>
            <Text className="text-gray-600 text-xs mt-1">
              {marketplaces.length > 0 ? `${marketplaces.length} Laender` : '6 Laender werden durchsucht'}
            </Text>
          </View>
        ) : priceStats ? (
          <View className="flex-1 justify-between">
            {/* Main Price */}
            <View className="items-center py-2">
              <Text className="text-gray-400 text-xs mb-1">
                Durchschnittspreis
              </Text>
              <MotiView
                from={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 100, damping: 20, stiffness: 300 }}
              >
                <Text className="text-white text-4xl font-bold">
                  {formatPrice(priceStats.avgPrice)}
                </Text>
              </MotiView>
              <Text className="text-indigo-400 text-xs mt-1">
                aus {listings.length} Angeboten in {marketplaces.length} {marketplaces.length === 1 ? 'Land' : 'Laendern'}
              </Text>
            </View>

            {/* Price Range Bar */}
            <View className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
              <View className="flex-row justify-between mb-2">
                <View className="items-center flex-1">
                  <Text className="text-gray-500 text-xs">Guenstigster</Text>
                  <Text className="text-green-400 font-bold text-sm">
                    {formatPrice(priceStats.minPrice)}
                  </Text>
                </View>
                <View className="w-px bg-gray-700" />
                <View className="items-center flex-1">
                  <Text className="text-gray-500 text-xs">Median</Text>
                  <Text className="text-white font-bold text-sm">
                    {formatPrice(priceStats.medianPrice)}
                  </Text>
                </View>
                <View className="w-px bg-gray-700" />
                <View className="items-center flex-1">
                  <Text className="text-gray-500 text-xs">Teuerster</Text>
                  <Text className="text-red-400 font-bold text-sm">
                    {formatPrice(priceStats.maxPrice)}
                  </Text>
                </View>
              </View>
              {/* Visual range bar */}
              <View className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <View className="h-full bg-indigo-500/60 rounded-full" style={{ width: '100%' }} />
              </View>
            </View>

            {/* Top 3 */}
            <Top3Listings listings={top3} />

            {/* Footer */}
            <View className="flex-row items-center justify-center mt-2">
              <Text className="text-gray-500 text-xs">Tippen fuer alle Angebote</Text>
              <Icons.ChevronDown size={12} color="#6b7280" />
            </View>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Icons.Package size={32} color="#4b5563" />
            <Text className="text-gray-500 text-sm mt-2">Keine eBay-Daten verfuegbar</Text>
          </View>
        )}
      </MotiView>
    </Pressable>
  );
}
