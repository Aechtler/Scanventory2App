/**
 * Platform Quicklinks Component
 * Buttons zum Öffnen der Marktplatz-Suchergebnisse
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { PlatformLink, openPlatformLink } from '../services/quicklinks';
import { AnimatedButton } from '@/shared/components/Animated';

interface PlatformQuicklinksProps {
  links: PlatformLink[];
}

/**
 * Grid von Plattform-Buttons
 */
export function PlatformQuicklinks({ links }: PlatformQuicklinksProps) {
  return (
    <View className="gap-3">
      <Text className="text-white text-lg font-semibold mb-1">
        🔗 Jetzt vergleichen
      </Text>
      
      <View className="flex-row flex-wrap gap-3">
        {links.map((link, index) => (
          <MotiView
            key={link.platform}
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: index * 50, stiffness: 400 }}
            className="flex-1 min-w-[45%]"
          >
            <AnimatedButton
              onPress={() => openPlatformLink(link.url)}
              className="rounded-xl p-4 border border-gray-700"
              style={{ backgroundColor: link.color + '20' }}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-2xl mr-2">{link.icon}</Text>
                <Text className="text-white font-semibold">{link.name}</Text>
              </View>
              <Text className="text-gray-400 text-xs text-center mt-1">
                Suchergebnisse öffnen →
              </Text>
            </AnimatedButton>
          </MotiView>
        ))}
      </View>
    </View>
  );
}

/**
 * Kompakte horizontale Version
 */
export function PlatformQuicklinksCompact({ links }: PlatformQuicklinksProps) {
  return (
    <View className="flex-row gap-2">
      {links.map((link) => (
        <AnimatedButton
          key={link.platform}
          onPress={() => openPlatformLink(link.url)}
          className="flex-1 rounded-lg p-3 items-center"
          style={{ backgroundColor: link.color + '15' }}
        >
          <Text className="text-xl">{link.icon}</Text>
          <Text className="text-white text-xs mt-1 font-medium">{link.name}</Text>
        </AnimatedButton>
      ))}
    </View>
  );
}
