/**
 * Summary Slide - Perplexity AI-Preis + eBay Range
 */

import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks';
import { formatPrice } from '@/features/market/services/ebay';
import { confidenceColors } from '@/features/market/components/MarketValue/utils';
import { SummarySlideProps } from '../types';
import { SLIDE_MIN_HEIGHT } from '../constants';

export function SummarySlide({
  marketValue,
  marketValueLoading,
  ebayPriceStats,
  ebayLoading,
  onPress,
}: SummarySlideProps) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onPress}>
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{ minHeight: SLIDE_MIN_HEIGHT }}
        className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/30 justify-between"
      >
        {/* Header */}
        <View className="flex-row items-center mb-2">
          <Icons.AI size={20} color={colors.primaryLight} />
          <Text className="text-white font-semibold text-base ml-2">
            Marktwert-Uebersicht
          </Text>
          {marketValue && (
            <View className={`ml-auto px-2 py-0.5 rounded-full ${confidenceColors[marketValue.confidence].bg}`}>
              <Text className={`${confidenceColors[marketValue.confidence].text} text-xs font-bold uppercase`}>
                {marketValue.confidence}
              </Text>
            </View>
          )}
        </View>

        {/* AI Price - Main */}
        <View className="items-center py-3">
          {marketValueLoading ? (
            <View className="items-center">
              <ActivityIndicator size="large" color={colors.primaryLight} />
              <Text className="text-foreground-secondary text-sm mt-2">KI analysiert...</Text>
            </View>
          ) : marketValue ? (
            <>
              <Text className="text-purple-300 text-xs mb-1">KI-Schaetzung (Perplexity)</Text>
              <MotiView
                from={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 100, damping: 20, stiffness: 300 }}
              >
                <Text className="text-white text-4xl font-bold">
                  {marketValue.estimatedPrice}
                </Text>
              </MotiView>
              {marketValue.priceRange && (
                <Text className="text-purple-400 text-sm mt-1">
                  Spanne: {marketValue.priceRange}
                </Text>
              )}
            </>
          ) : (
            <View className="items-center py-2">
              <Icons.Help size={28} color={colors.textSecondary} />
              <Text className="text-foreground-secondary text-sm mt-1">Keine KI-Analyse verfuegbar</Text>
            </View>
          )}
        </View>

        {/* Summary Preview */}
        {marketValue?.summary && (
          <View className="bg-background-elevated/40 rounded-lg p-3 mb-3">
            <Text className="text-foreground-secondary text-xs leading-4" numberOfLines={2}>
              {marketValue.summary}
            </Text>
          </View>
        )}

        {/* eBay Range */}
        <View className="bg-background-elevated/50 rounded-lg p-3 border border-border/50">
          <View className="flex-row items-center mb-1.5">
            <Icons.Money size={14} color={colors.primaryLight} />
            <Text className="text-foreground-secondary text-xs font-semibold ml-1">eBay</Text>
          </View>
          {ebayLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : ebayPriceStats ? (
            <>
              <Text className="text-white font-bold text-base">
                {formatPrice(ebayPriceStats.avgPrice)}
              </Text>
              <Text className="text-foreground-secondary text-xs mt-0.5">
                {formatPrice(ebayPriceStats.minPrice)} – {formatPrice(ebayPriceStats.maxPrice)}
              </Text>
              <Text className="text-foreground-secondary text-xs mt-0.5">
                {ebayPriceStats.totalListings} Angebote
              </Text>
            </>
          ) : (
            <Text className="text-foreground-secondary text-xs">Keine Daten</Text>
          )}
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-center mt-3">
          <Text className="text-purple-400/60 text-xs">Tippen fuer KI-Details</Text>
          <Text className="text-foreground-secondary/40 mx-2">·</Text>
          <Text className="text-foreground-secondary text-xs">Wischen fuer Plattformen</Text>
          <Icons.ChevronRight size={12} color={colors.textSecondary} />
        </View>
      </MotiView>
    </Pressable>
  );
}
