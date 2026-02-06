/**
 * Summary Slide - Perplexity AI-Preis + eBay/Kleinanzeigen Ranges
 */

import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { formatPrice } from '@/features/market/services/ebay';
import { confidenceColors } from '@/features/market/components/MarketValue/utils';
import { SummarySlideProps } from '../types';

export function SummarySlide({
  marketValue,
  marketValueLoading,
  ebayPriceStats,
  ebayLoading,
  kleinanzeigenPriceStats,
  kleinanzeigenLoading,
  onPress,
}: SummarySlideProps) {
  return (
    <Pressable onPress={onPress}>
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/30"
      >
        {/* Header */}
        <View className="flex-row items-center mb-3">
          <Icons.AI size={20} color="#a78bfa" />
          <Text className="text-white font-semibold text-base ml-2">
            Marktwert
          </Text>
          {marketValue && (
            <View className="ml-auto flex-row items-center">
              <Text className={`${confidenceColors[marketValue.confidence].text} text-xs font-bold uppercase`}>
                {marketValue.confidence}
              </Text>
            </View>
          )}
        </View>

        {/* AI Price */}
        <View className="items-center py-2">
          {marketValueLoading ? (
            <ActivityIndicator size="small" color="#a78bfa" />
          ) : marketValue ? (
            <>
              <Text className="text-purple-300 text-xs mb-1">KI-Schaetzung</Text>
              <Text className="text-white text-3xl font-bold">
                {marketValue.estimatedPrice}
              </Text>
              {marketValue.priceRange && (
                <Text className="text-purple-400 text-xs mt-0.5">
                  {marketValue.priceRange}
                </Text>
              )}
            </>
          ) : (
            <Text className="text-gray-500 text-sm">Keine KI-Analyse</Text>
          )}
        </View>

        {/* Platform Ranges */}
        <View className="flex-row gap-2 mt-3">
          {/* eBay Range */}
          <View className="flex-1 bg-gray-800/50 rounded-lg p-2.5">
            <Text className="text-gray-400 text-xs mb-1">eBay</Text>
            {ebayLoading ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : ebayPriceStats ? (
              <>
                <Text className="text-white font-semibold text-sm">
                  {formatPrice(ebayPriceStats.avgPrice)}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {formatPrice(ebayPriceStats.minPrice)} - {formatPrice(ebayPriceStats.maxPrice)}
                </Text>
              </>
            ) : (
              <Text className="text-gray-600 text-xs">--</Text>
            )}
          </View>

          {/* Kleinanzeigen Range */}
          <View className="flex-1 bg-gray-800/50 rounded-lg p-2.5">
            <Text className="text-gray-400 text-xs mb-1">Kleinanzeigen</Text>
            {kleinanzeigenLoading ? (
              <ActivityIndicator size="small" color="#22c55e" />
            ) : kleinanzeigenPriceStats ? (
              <>
                <Text className="text-white font-semibold text-sm">
                  {formatPrice(kleinanzeigenPriceStats.avgPrice)}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {formatPrice(kleinanzeigenPriceStats.minPrice)} - {formatPrice(kleinanzeigenPriceStats.maxPrice)}
                </Text>
              </>
            ) : (
              <Text className="text-gray-600 text-xs">--</Text>
            )}
          </View>
        </View>

        {/* Swipe hint */}
        <View className="flex-row items-center justify-center mt-3">
          <Text className="text-gray-500 text-xs">Wischen fuer Details</Text>
          <Icons.ChevronRight size={12} color="#6b7280" />
        </View>
      </MotiView>
    </Pressable>
  );
}
