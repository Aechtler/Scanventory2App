/**
 * Platform Quicklinks Component
 * Buttons zum Öffnen der Marktplatz-Suchergebnisse
 */

import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { PlatformLink, openPlatformLink } from '@/features/market/services/quicklinks';
import { AnimatedButton } from '@/shared/components/Animated';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks';

interface PlatformQuicklinksProps {
  links: PlatformLink[];
}

type ActiveTab = 'compare' | 'sell';

const SELL_PLATFORMS = [
  { id: 'amazon', name: 'Amazon', icon: 'ShoppingCart', color: '#FF9900' },
  { id: 'ebay', name: 'eBay', icon: 'Tag', color: '#E53238' },
  { id: 'kleinanzeigen', name: 'Kleinanzeigen', icon: 'MessageCircle', color: '#BBDE14' },
] as const;

/**
 * Grid von Plattform-Buttons mit Tab-Navigation
 */
export function PlatformQuicklinks({ links }: PlatformQuicklinksProps) {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<ActiveTab>('compare');

  return (
    <View className="gap-3">
      {/* Tab Navigation */}
      <View className="flex-row rounded-xl overflow-hidden border border-border">
        <Pressable
          onPress={() => setActiveTab('compare')}
          className="flex-1 flex-row items-center justify-center gap-2 py-3"
          style={{ backgroundColor: activeTab === 'compare' ? colors.primary + '30' : 'transparent' }}
        >
          <Icons.Globe size={16} color={activeTab === 'compare' ? '#60a5fa' : colors.textSecondary} />
          <Text
            className="font-semibold text-sm"
            style={{ color: activeTab === 'compare' ? '#60a5fa' : colors.textSecondary }}
          >
            Jetzt vergleichen
          </Text>
        </Pressable>

        <View className="w-px bg-border" />

        <Pressable
          onPress={() => setActiveTab('sell')}
          className="flex-1 flex-row items-center justify-center gap-2 py-3"
          style={{ backgroundColor: activeTab === 'sell' ? '#22c55e30' : 'transparent' }}
        >
          <Icons.Tag size={16} color={activeTab === 'sell' ? '#22c55e' : colors.textSecondary} />
          <Text
            className="font-semibold text-sm"
            style={{ color: activeTab === 'sell' ? '#22c55e' : colors.textSecondary }}
          >
            Jetzt verkaufen
          </Text>
        </Pressable>
      </View>

      {/* Tab Content */}
      {activeTab === 'compare' ? (
        <View className="flex-row flex-wrap gap-3">
          {links.map((link) => (
            <View key={link.platform} className="flex-1 min-w-[45%]">
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
      ) : (
        <View className="flex-row flex-wrap gap-3">
          {SELL_PLATFORMS.map((platform) => (
            <View key={platform.id} className="flex-1 min-w-[45%]">
              <AnimatedButton
                onPress={() => {}}
                className="rounded-xl p-4 border border-border"
                style={{ backgroundColor: platform.color + '20' }}
              >
                <View className="flex-row items-center justify-center">
                  {React.createElement((Icons as any)[platform.icon] || Icons.ExternalLink, { size: 24, color: colors.textPrimary })}
                  <Text className="text-white font-semibold ml-2">{platform.name}</Text>
                </View>
                <View className="flex-row items-center justify-center mt-1 pt-1 border-t border-white/10">
                  <Text className="text-foreground-secondary text-xs">Inserat erstellen</Text>
                  <View className="ml-1">
                    <Icons.ChevronRight size={14} color={colors.textSecondary} />
                  </View>
                </View>
              </AnimatedButton>
            </View>
          ))}

          {/* Plus Button für Shop-Verwaltung */}
          <View className="flex-1 min-w-[45%]">
            <AnimatedButton
              onPress={() => {}}
              className="rounded-xl p-4 border border-dashed border-border items-center justify-center"
              style={{ backgroundColor: 'transparent', minHeight: 80 }}
            >
              <Icons.Plus size={24} color={colors.textSecondary} />
              <Text className="text-foreground-secondary text-xs mt-1">Shop hinzufügen</Text>
            </AnimatedButton>
          </View>
        </View>
      )}
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
