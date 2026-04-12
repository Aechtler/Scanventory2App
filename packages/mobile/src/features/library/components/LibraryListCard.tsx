/**
 * LibraryListCard - Kompakte horizontale Card für die List-View
 */

import { memo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { StaggeredItem } from '@/shared/components/Animated';
import { SwipeableLibraryItem } from './SwipeableLibraryItem';
import { formatPrice } from '@/features/market/services/ebay';
import { getLibraryDisplayPrice, hasLibraryDisplayPrice } from '@/features/history/utils/historyPricing';
import { classifyProduct, type ProductType } from '@/features/history/utils/productClassification';
import { Icons } from '@/shared/components/Icons';
import type { LibraryItem } from '@/features/library/utils/libraryRows';

interface LibraryListCardProps {
  item: LibraryItem;
  index: number;
  onDelete?: () => void;
  onShare?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onPress?: () => void;
}

function TagPill({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <View className={`px-2 py-0.5 rounded-full ${accent ? 'bg-primary-500/15' : 'bg-background-elevated/80'}`}>
      <Text className={`text-[11px] font-medium ${accent ? 'text-primary-400' : 'text-foreground-secondary'}`}>
        {label}
      </Text>
    </View>
  );
}

function PriceSection({ item }: { item: LibraryItem }) {
  const hasFinal = item.finalPrice != null;
  if (!hasLibraryDisplayPrice(item)) {
    return <Text className="text-foreground-secondary text-xs italic">Kein Preis</Text>;
  }
  return (
    <View className={`px-2.5 py-1 rounded-lg ${hasFinal ? 'bg-emerald-500/15' : 'bg-primary-500/10'}`}>
      <Text className={`font-bold text-[15px] ${hasFinal ? 'text-emerald-500' : 'text-primary-400'}`}>
        {formatPrice(getLibraryDisplayPrice(item)!)}
      </Text>
    </View>
  );
}

function TypeBadge({ type }: { type: ProductType }) {
  if (type === 'high_value') {
    return (
      <View className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full items-center justify-center bg-violet-600/90 border border-violet-400/40" style={badgeStyles.highValue}>
        <Icons.Star size={14} color="#fff" />
      </View>
    );
  }
  if (type === 'fast_seller') {
    return (
      <View className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full items-center justify-center bg-amber-500/90 border border-amber-400/40" style={badgeStyles.fastSeller}>
        <Icons.TrendingUp size={14} color="#fff" />
      </View>
    );
  }
  return (
    <View className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full items-center justify-center bg-sky-500/80 border border-sky-400/40" style={badgeStyles.normal}>
      <Icons.Tag size={13} color="#fff" />
    </View>
  );
}

export const LibraryListCard = memo(function LibraryListCard({
  item, index, onDelete, onShare, selectable, selected, onSelect, onPress,
}: LibraryListCardProps) {
  const productType = classifyProduct(item);
  const ownerName = item.owner
    ? (item.owner.username ? `@${item.owner.username}` : item.owner.displayName ?? null)
    : null;

  const handlePress = selectable
    ? () => onSelect?.(item.id)
    : () => onPress ? onPress() : router.push(`/history/${item.id}`);

  const card = (
    <Pressable
      className={`bg-background-card rounded-2xl mb-3 overflow-hidden border active:opacity-70 ${
        selected ? 'border-primary-500' : 'border-border'
      }`}
      style={[styles.card, selected && styles.selectedCard]}
      onPress={handlePress}
      onLongPress={selectable ? undefined : onShare}
    >
      <View className="flex-row">
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.cachedImageUri || item.imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          {selectable ? (
            <View className="absolute bottom-2 right-2">
              {selected ? (
                <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center" style={badgeStyles.checkSelected}>
                  <Icons.Check size={14} color="#fff" strokeWidth={3} />
                </View>
              ) : (
                <View className="w-6 h-6 rounded-full bg-white/90 border-2 border-white/60" style={badgeStyles.checkUnselected} />
              )}
            </View>
          ) : (
            <TypeBadge type={productType} />
          )}
        </View>

        <View className="flex-1 py-3 pr-3.5 pl-3 justify-between">
          <View className="flex-row justify-between items-start gap-2">
            <View className="flex-1 shrink">
              <Text className="text-foreground font-semibold text-[15px] leading-[20px]" numberOfLines={2}>
                {item.productName}
              </Text>
              {item.brand && (
                <Text className="text-foreground-secondary text-[12px] mt-0.5">{item.brand}</Text>
              )}
            </View>
            <PriceSection item={item} />
          </View>

          <View className="flex-row flex-wrap gap-1.5 mt-2.5">
            {item.category ? <TagPill label={item.category} accent /> : null}
            {item.condition ? <TagPill label={item.condition} /> : null}
            {ownerName ? (
              <View className="flex-row items-center gap-1 bg-background-elevated/80 px-2 py-0.5 rounded-full">
                <Icons.User size={9} color="#6b7280" />
                <Text className="text-[11px] text-foreground-secondary">{ownerName}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <StaggeredItem index={index}>
      {!selectable && onDelete ? (
        <SwipeableLibraryItem itemName={item.productName} onDelete={onDelete}>
          {card}
        </SwipeableLibraryItem>
      ) : card}
    </StaggeredItem>
  );
});

const badgeStyles = StyleSheet.create({
  highValue:    { shadowColor: '#a78bfa', shadowRadius: 4, shadowOpacity: 0.5 },
  fastSeller:   { shadowColor: '#f59e0b', shadowRadius: 4, shadowOpacity: 0.5 },
  normal:       { shadowColor: '#38bdf8', shadowRadius: 4, shadowOpacity: 0.4 },
  checkSelected:   { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4 },
  checkUnselected: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 3 },
});

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedCard: {
    shadowColor: '#6366f1',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  imageContainer: {
    width: 110,
    height: 110,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
