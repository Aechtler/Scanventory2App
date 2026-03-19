/**
 * HistoryDetailHeader Component
 *
 * Hero-Bild mit Gradient, Produktinfos unten, Preis-Badge oben rechts.
 * Tap auf Bild → Edit-Seite, Tap auf Preis-Badge → PriceEditSheet
 */

import { View, Text, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { FadeInView } from '@/shared/components/Animated';
import { Icons } from '@/shared/components/Icons';
import { HistoryItem } from '@/features/history/store/historyStore';
import { isManualSearchResult } from '@/shared/utils/analysisSource';

interface HistoryDetailHeaderProps {
  item: HistoryItem;
  onPriceBadgePress: () => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function HistoryDetailHeader({ item, onPriceBadgePress }: HistoryDetailHeaderProps) {
  const hasPrice = item.finalPrice !== undefined && item.finalPrice !== null;

  return (
    <FadeInView delay={0}>
      <MotiView
        from={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="rounded-2xl overflow-hidden mb-6 relative"
      >
        {/* Bild — Tap öffnet Edit-Seite */}
        <Pressable onPress={() => router.push(`/history/edit/${item.id}`)}>
          <View style={{ width: '100%', aspectRatio: 4 / 3, overflow: 'hidden' }}>
            <Image
              source={{ uri: item.cachedImageUri || item.imageUri }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '200%' }}
              resizeMode="cover"
            />
          </View>

          {/* Gradient Overlay von unten */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(17,24,39,0.95)', '#111827']}
            locations={[0, 0.4, 0.75, 1]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '70%' }}
          />

          {/* Produktinfos über dem Gradient */}
          <View className="absolute bottom-0 left-0 right-0 p-4">
            <Text className="text-white text-2xl font-bold mb-2" numberOfLines={2}>
              {item.productName}
            </Text>

            <View className="flex-row flex-wrap gap-2 mb-2">
              <View className="bg-white/10 px-3 py-1.5 rounded-full">
                <Text className="text-white/90 text-sm">{item.category}</Text>
              </View>
              {item.brand && (
                <View className="bg-white/10 px-3 py-1.5 rounded-full">
                  <Text className="text-white/90 text-sm">{item.brand}</Text>
                </View>
              )}
              <View className="bg-white/10 px-3 py-1.5 rounded-full">
                <Text className="text-white/90 text-sm">{item.condition}</Text>
              </View>
              <View className="bg-primary-500/30 px-3 py-1.5 rounded-full">
                <Text className="text-primary-300 text-sm font-semibold">
                  {isManual ? 'Manuelle Suche' : `${Math.round(item.confidence * 100)}%`}
                </Text>
              </View>
            </View>

            {item.gtin && (
              <Text className="text-white/50 text-xs font-mono">{item.gtin}</Text>
            )}
          </View>

          {/* Edit-Hint oben links */}
          <View className="absolute top-3 left-3 bg-black/40 px-3 py-2 rounded-full flex-row items-center gap-1.5">
            <Icons.Pencil size={12} color="rgba(255,255,255,0.8)" />
            <Text className="text-white/80 text-xs">Bearbeiten</Text>
          </View>
        </Pressable>

        {/* Preis-Badge oben rechts — eigener Pressable, stoppt Event-Bubbling */}
        <Pressable
          onPress={onPriceBadgePress}
          className="absolute top-3 right-3"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View
            className={`flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-2xl ${
              hasPrice
                ? 'bg-emerald-500/90'
                : 'bg-black/50 border border-white/20'
            }`}
          >
            {hasPrice ? (
              <>
                <Text className="text-white text-base font-bold">
                  {formatPrice(item.finalPrice!)}€
                </Text>
              </>
            ) : (
              <>
                <Icons.Coins size={14} color="rgba(255,255,255,0.7)" />
                <Text className="text-white/70 text-xs font-medium">Preis</Text>
              </>
            )}
          </View>
        </Pressable>
      </MotiView>
    </FadeInView>
  );
}
iew>
  );
}
