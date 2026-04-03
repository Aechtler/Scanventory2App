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
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <Icons.AI size={16} color={themeColors.primaryLight} />
            <Text className="text-foreground-secondary text-xs font-medium">KI-Schätzung</Text>
          </View>
          <View className={`px-2 py-0.5 rounded-full ${colors.bg}`}>
            <Text className={`text-[10px] font-bold uppercase ${colors.text}`}>
              {result.confidence}
            </Text>
          </View>
        </View>

        {/* Price */}
        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 100, damping: 20, stiffness: 300 }}
        >
          <Text className="text-white text-3xl font-bold">{result.estimatedPrice}</Text>
        </MotiView>
        {result.priceRange && (
          <Text className="text-foreground-secondary text-xs mt-1">{result.priceRange}</Text>
        )}

        {/* Tap hint */}
        <View className="flex-row items-center mt-3 gap-1 opacity-50">
          <Icons.ChevronRight size={11} color={themeColors.textSecondary} />
          <Text className="text-foreground-secondary text-[11px]">Details</Text>
        </View>
      </MotiView>
    </Pressable>
  );
}
