/**
 * Market Value Card Main
 * Hauptkarte mit Preisschätzung und Summary
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks';
import { MarketValueResult } from '@/features/market/services/perplexity';
import { confidenceColors } from '../../utils';

interface MarketValueCardMainProps {
  result: MarketValueResult;
  onPress: () => void;
}

export function MarketValueCardMain({
  result,
  onPress,
}: MarketValueCardMainProps) {
  const themeColors = useThemeColors();
  const colors = confidenceColors[result.confidence];

  return (
    <Pressable onPress={onPress}>
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-purple-900/20 rounded-xl p-4 mb-4 border border-purple-500/30"
      >
        {/* Header */}
        <View className="flex-row items-center mb-3">
          <Icons.AI size={24} color={themeColors.primaryLight} />
          <Text className="text-white font-semibold text-lg ml-2">
            KI-Marktwertanalyse
          </Text>
          <View className="ml-auto flex-row items-center gap-2">
            <View className="flex-row items-center">
              {result.confidence === 'hoch' ? (
                <Icons.Check size={14} color="#4ade80" />
              ) : result.confidence === 'niedrig' ? (
                <Icons.Help size={14} color="#f87171" />
              ) : null}
              <Text className={`${colors.text} text-xs font-bold ml-1 uppercase`}>
                {result.confidence}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Price */}
        <View className="items-center py-3">
          <Text className="text-purple-300 text-sm mb-1">
            Geschätzter Marktwert
          </Text>
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 100, damping: 20, stiffness: 300 }}
          >
            <Text className="text-white text-3xl font-bold">
              {result.estimatedPrice}
            </Text>
          </MotiView>
          {result.priceRange && (
            <Text className="text-purple-400 text-sm mt-1">
              Spanne: {result.priceRange}
            </Text>
          )}
        </View>

        {/* Summary Preview */}
        <View className="bg-background-elevated/50 rounded-lg p-3 mt-2">
          <Text className="text-foreground-secondary text-sm leading-5" numberOfLines={2}>
            {result.summary}
          </Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-purple-400 text-xs">Tippen für Details</Text>
            <View className="ml-1">
              <Icons.ChevronDown size={12} color={themeColors.primaryLight} />
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <Text className="text-foreground-secondary text-xs text-center mt-2">
          Powered by Perplexity AI • Keine Gewährleistung
        </Text>
      </MotiView>
    </Pressable>
  );
}
