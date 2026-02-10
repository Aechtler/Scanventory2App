/**
 * Market Value Loading State
 * Zeigt animierten Ladebalken während KI recherchiert
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export function MarketValueLoading() {
  const colors = useThemeColors();
  return (
    <View className="bg-primary-500/20 rounded-xl p-4 mb-4 border border-primary-500/30">
      <View className="flex-row items-center">
        <MotiView
          from={{ rotate: '0deg' }}
          animate={{ rotate: '360deg' }}
          transition={{ type: 'timing', duration: 1200, loop: true }}
        >
          <Icons.AI size={24} color={colors.primaryLight} />
        </MotiView>
        <View className="flex-1 ml-3">
          <Text className="text-foreground font-semibold">
            KI recherchiert Marktwert...
          </Text>
          <Text className="text-primary-400 text-sm mt-1">
            Durchsuche eBay, Amazon, Idealo...
          </Text>
        </View>
      </View>
    </View>
  );
}
