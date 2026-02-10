/**
 * Platform Quicklinks Component
 * Buttons zum Öffnen der Marktplatz-Suchergebnisse
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { PlatformLink, openPlatformLink } from '@/features/market/services/quicklinks';
import { AnimatedButton } from '@/shared/components/Animated';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks';

interface PlatformQuicklinksProps {
  links: PlatformLink[];
}

/**
 * Grid von Plattform-Buttons
 */
export function PlatformQuicklinks({ links }: PlatformQuicklinksProps) {
  const colors = useThemeColors();
  return (
    <View className="gap-3">
      <View className="flex-row items-center mb-1">
        <Icons.Globe size={20} color="#60a5fa" />
        <Text className="text-white text-lg font-semibold ml-2">
          Jetzt vergleichen
        </Text>
      </View>
      
      <View className="flex-row flex-wrap gap-3">
        {links.map((link, index) => (
          <View
            key={link.platform}
            className="flex-1 min-w-[45%]"
          >
            <AnimatedButton
              onPress={() => openPlatformLink(link.url)}
              className="rounded-xl p-4 border border-border"
              style={{ backgroundColor: link.color + '20' }}
            >
              <View className="flex-row items-center justify-center">
                {React.createElement((Icons as any)[link.icon] || Icons.ExternalLink, { size: 24, color: colors.textPrimary })}
                <Text className="text-white font-semibold ml-2">{link.name}</Text>
              </View>
              <View className="flex-row items-center justify-center mt-1 pt-1 border-t border-white/10">
                <Text className="text-foreground-secondary text-xs">Ergebnisse öffnen</Text>
                <View className="ml-1">
                  <Icons.ChevronRight size={14} color={colors.textSecondary} />
                </View>
              </View>
            </AnimatedButton>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Kompakte horizontale Version
 */
export function PlatformQuicklinksCompact({ links }: PlatformQuicklinksProps) {
  const colors = useThemeColors();
  return (
    <View className="flex-row gap-2">
      {links.map((link) => (
        <AnimatedButton
          key={link.platform}
          onPress={() => openPlatformLink(link.url)}
          className="flex-1 rounded-lg p-3 items-center justify-center"
          style={{ backgroundColor: link.color + '15' }}
        >
          {React.createElement((Icons as any)[link.icon] || Icons.ExternalLink, { size: 20, color: colors.textPrimary })}
          <Text className="text-white text-xs mt-1 font-medium">{link.name}</Text>
        </AnimatedButton>
      ))}
    </View>
  );
}
