/**
 * Market Value Loading State
 * Zeigt animierten Ladebalken während KI recherchiert
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';

export function MarketValueLoading() {
  return (
    <View className="bg-purple-900/20 rounded-xl p-4 mb-4 border border-purple-500/30">
      <View className="flex-row items-center">
        <MotiView
          from={{ rotate: '0deg' }}
          animate={{ rotate: '360deg' }}
          transition={{ type: 'timing', duration: 1200, loop: true }}
        >
          <Icons.AI size={24} color="#a78bfa" />
        </MotiView>
        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold">
            KI recherchiert Marktwert...
          </Text>
          <Text className="text-purple-300 text-sm mt-1">
            Durchsuche eBay, Amazon, Idealo...
          </Text>
        </View>
      </View>
    </View>
  );
}
