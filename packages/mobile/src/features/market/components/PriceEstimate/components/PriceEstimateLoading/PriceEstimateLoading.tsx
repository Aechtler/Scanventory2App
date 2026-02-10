/**
 * Price Estimate Loading State
 * Zeigt animierten Ladebalken während Preisdaten geladen werden
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks';

export function PriceEstimateLoading() {
  const colors = useThemeColors();
  return (
    <View className="bg-background-card rounded-xl p-4 mb-4 border border-border">
      <View className="flex-row items-center">
        <MotiView
          from={{ rotate: '0deg' }}
          animate={{ rotate: '360deg' }}
          transition={{ type: 'timing', duration: 1000, loop: true }}
        >
          <Icons.Money size={24} color={colors.primaryLight} />
        </MotiView>
        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold">Lade Preisdaten...</Text>
          <Text className="text-foreground-secondary text-xs mt-1">
            Durchsuche 5 Marktplätze parallel...
          </Text>
          <View className="h-1 bg-border rounded-full mt-2 overflow-hidden">
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
