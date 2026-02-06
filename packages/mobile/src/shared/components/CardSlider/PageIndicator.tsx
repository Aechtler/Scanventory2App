/**
 * Page Indicator - Animierte Dots fuer den CardSlider
 */

import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { PageIndicatorProps } from './types';

export function PageIndicator({ total, current }: PageIndicatorProps) {
  if (total <= 1) return null;

  return (
    <View className="flex-row justify-center items-center gap-2 mt-3">
      {Array.from({ length: total }).map((_, i) => (
        <MotiView
          key={i}
          animate={{
            width: i === current ? 20 : 8,
            opacity: i === current ? 1 : 0.4,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="h-2 rounded-full bg-primary-500"
        />
      ))}
    </View>
  );
}
