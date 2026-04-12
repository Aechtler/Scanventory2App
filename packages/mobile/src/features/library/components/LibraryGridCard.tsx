/**
 * LibraryGridCard - Kompakte Karten-Darstellung für die Grid-View
 * Bild mit Floating-Price-Badge, Produktname, Kategorie-Pill
 */

import { memo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StaggeredItem } from '@/shared/components/Animated';
import type { LibraryItem as HistoryItem } from '@/features/library/utils/libraryRows';
import { formatPrice } from '@/features/market/services/ebay';
import { getLibraryDisplayPrice, hasLibraryDisplayPrice } from '@/features/history/utils/historyPricing';
import { classifyProduct } from '@/features/history/utils/productClassification';
import { Icons } from '@/shared/components/Icons';

interface LibraryGridCardProps {
  item: HistoryItem;
  index: number;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onPress?: () => void;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
}

export const LibraryGridCard = memo(function LibraryGridCard({ item, index, selectable, selected, onSelect, onPress }: LibraryGridCardProps) {
  const isLeft = index % 2 === 0;
  const hasFinal = item.finalPrice != null;
  const price = getLibraryDisplayPrice(item);
  const hasPrice = hasLibraryDisplayPrice(item);
  const productType = classifyProduct(item);

  const handlePress = selectable
    ? () => onSelect?.(item.id)
    : () => onPress ? onPress() : router.push(`/history/${item.id}`);

  return (
    <StaggeredItem index={index}>
      <Pressable
        className={`flex-1 bg-background-card rounded-2xl mb-3.5 overflow-hidden border active:opacity-70 ${
          isLeft ? 'mr-1.5' : 'ml-1.5'
        } ${selected ? 'border-primary-500' : 'border-border'}`}
        onPress={handlePress}
      >
        {/* Bild mit Gradient und Price-Badge */}
        <View className="relative">
          <Image
            source={{ uri: item.cachedImageUri || item.imageUri }}
            className="w-full aspect-square"
            resizeMode="cover"
          />

          {/* Selektions-Badge */}
          {selectable && (
            <View className="absolute bottom-2 right-2">
              {selected ? (
                <View className="w-7 h-7 rounded-full bg-primary-500 items-center justify-center" style={gridBadgeStyles.checkSelected}>
                  <Icons.Check size={16} color="#fff" strokeWidth={3} />
                </View>
              ) : (
                <View className="w-7 h-7 rounded-full bg-white/90 border-2 border-white/60" style={gridBadgeStyles.checkUnselected} />
              )}
            </View>
          )}

          {/* Custom Badges top-left */}
          {!selectable && productType === 'high_value' && (
            <View className="absolute top-2 left-2 w-8 h-8 rounded-full items-center justify-center bg-violet-600/95 border border-violet-400/40" style={gridBadgeStyles.highValue}>
              <Icons.Star size={16} color="#fff" />
            </View>
          )}
          {!selectable && productType === 'fast_seller' && (
            <View className="absolute top-2 left-2 w-8 h-8 rounded-full items-center justify-center bg-amber-500 border border-amber-400/40" style={gridBadgeStyles.fastSeller}>
              <Icons.TrendingUp size={16} color="#fff" />
            </View>
          )}
          {!selectable && productType === 'normal' && (
            <View className="absolute top-2 left-2 w-8 h-8 rounded-full items-center justify-center bg-sky-500/80 border border-sky-400/40" style={gridBadgeStyles.normal}>
              <Icons.Tag size={15} color="#fff" />
            </View>
          )}

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '35%' }}
          />

          {/* Floating Price Badge */}
          {hasPrice && (
            <View
              className={`absolute top-2 right-2 px-2 py-1 rounded-lg ${
                hasFinal ? 'bg-emerald-500/90' : 'bg-black/50 border border-white/20'
              }`}
            >
              <Text className="text-white font-bold text-xs">
                {formatPrice(price!)}
              </Text>
            </View>
          )}
        </View>

        {/* Info unter dem Bild */}
        <View className="px-3 pt-2 pb-2.5">
          <Text className="text-foreground font-semibold text-[14px] leading-[19px]" numberOfLines={2}>
            {item.productName}
          </Text>

          <View className="flex-row items-center mt-1.5 gap-2">
            {item.category ? (
              <View className="bg-primary-500/10 px-2 py-0.5 rounded-full">
                <Text className="text-primary-400 text-[11px] font-medium">{item.category}</Text>
              </View>
            ) : null}
            <Text className="text-foreground-secondary text-[11px] ml-auto">
              {formatDate(item.scannedAt)}
            </Text>
          </View>
        </View>
      </Pressable>
    </StaggeredItem>
  );
});

const gridBadgeStyles = StyleSheet.create({
  highValue:       { shadowColor: '#a78bfa', shadowRadius: 8, shadowOpacity: 0.6 },
  fastSeller:      { shadowColor: '#f59e0b', shadowRadius: 8, shadowOpacity: 0.6 },
  normal:          { shadowColor: '#38bdf8', shadowRadius: 8, shadowOpacity: 0.4 },
  checkSelected:   { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4 },
  checkUnselected: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 3 },
});
