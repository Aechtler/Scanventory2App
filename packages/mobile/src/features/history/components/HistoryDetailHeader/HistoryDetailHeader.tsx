/**
 * HistoryDetailHeader Component
 *
 * Hero-Bild mit Gradient, Produktinfos unten, Edit-Button oben rechts.
 * Tap auf Bild → Edit-Seite.
 */

import { View, Text, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { FadeInView } from '@/shared/components/Animated';
import { Icons } from '@/shared/components/Icons';
import { HistoryItem } from '@/features/history/store/historyStore';
import { classifyProduct } from '@/features/history/utils/productClassification';

interface HistoryDetailHeaderProps {
  item: HistoryItem;
}

function ProductTypeBadge({ item }: { item: HistoryItem }) {
  const type = classifyProduct(item);
  if (type === 'high_value') {
    return (
      <View
        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-violet-600/90 border border-violet-400/30 items-center justify-center"
        style={{ shadowColor: '#a78bfa', shadowRadius: 8, shadowOpacity: 0.5 }}
      >
        <Icons.Star size={14} color="#fff" />
      </View>
    );
  }
  if (type === 'fast_seller') {
    return (
      <View
        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-amber-500/90 border border-amber-400/30 items-center justify-center"
        style={{ shadowColor: '#f59e0b', shadowRadius: 8, shadowOpacity: 0.5 }}
      >
        <Icons.TrendingUp size={14} color="#fff" />
      </View>
    );
  }
  return null;
}

export function HistoryDetailHeader({ item }: HistoryDetailHeaderProps) {

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
          <View style={{ width: '100%', aspectRatio: 4 / 3, overflow: 'hidden', backgroundColor: '#0d1117' }}>
            <Image
              source={{ uri: item.cachedImageUri || item.imageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
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
                <Text className="text-white/90 text-sm">
                  {item.brand ? `${item.brand} → ${item.category}` : item.category}
                </Text>
              </View>
              <View className="bg-white/10 px-3 py-1.5 rounded-full">
                <Text className="text-white/90 text-sm">{item.condition}</Text>
              </View>
            </View>

            {item.gtin && (
              <Text className="text-white/50 text-xs font-mono">{item.gtin}</Text>
            )}
          </View>

          {/* Produkt-Typ-Badge oben links */}
          <ProductTypeBadge item={item} />

          {/* Edit-Button oben rechts */}
          <View className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 border border-white/15 items-center justify-center">
            <Icons.Pencil size={15} color="rgba(255,255,255,0.85)" />
          </View>
        </Pressable>
      </MotiView>
    </FadeInView>
  );
}
