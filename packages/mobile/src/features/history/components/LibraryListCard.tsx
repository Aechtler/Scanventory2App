/**
 * LibraryListCard - Kompakte horizontale Card für die List-View
 */

import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { StaggeredItem } from '@/shared/components/Animated';
import { SwipeableLibraryItem } from './SwipeableLibraryItem';
import { HistoryItem } from '@/features/history/store/historyStore';
import { formatPrice } from '@/features/market/services/ebay';
import { getLibraryDisplayPrice, hasLibraryDisplayPrice } from '@/features/history/utils/historyPricing';
import { classifyProduct } from '@/features/history/utils/productClassification';
import { Icons } from '@/shared/components/Icons';

interface LibraryListCardProps {
  item: HistoryItem;
  index: number;
  onDelete: () => void;
  onShare?: () => void;
}

function ProductTypeBadge({ item }: { item: HistoryItem }) {
  const type = classifyProduct(item);
  if (type === 'fast_seller') {
    return (
      <View className="flex-row items-center gap-1 bg-amber-500/15 px-2 py-0.5 rounded-full">
        <Icons.TrendingUp size={10} color="#f59e0b" />
        <Text className="text-[10px] font-semibold text-amber-400">Schnellverkäufer</Text>
      </View>
    );
  }
  if (type === 'high_value') {
    return (
      <View className="flex-row items-center gap-1 bg-violet-500/15 px-2 py-0.5 rounded-full">
        <Icons.Star size={10} color="#a78bfa" />
        <Text className="text-[10px] font-semibold text-violet-400">High Value</Text>
      </View>
    );
  }
  return null;
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

function PriceSection({ item }: { item: HistoryItem }) {
  const hasFinal = item.finalPrice != null;
  const displayPrice = getLibraryDisplayPrice(item);

  if (!hasLibraryDisplayPrice(item)) {
    return <Text className="text-foreground-secondary text-xs italic">Kein Preis</Text>;
  }

  return (
    <View className={`px-2.5 py-1 rounded-lg ${hasFinal ? 'bg-emerald-500/15' : 'bg-primary-500/10'}`}>
      <Text className={`font-bold text-[15px] ${hasFinal ? 'text-emerald-500' : 'text-primary-400'}`}>
        {formatPrice(displayPrice!)}
      </Text>
    </View>
  );
}

export function LibraryListCard({ item, index, onDelete, onShare }: LibraryListCardProps) {
  return (
    <StaggeredItem index={index}>
      <SwipeableLibraryItem itemName={item.productName} onDelete={onDelete}>
        <Pressable
          className="bg-background-card rounded-2xl mb-3 overflow-hidden border border-border active:opacity-70"
          style={styles.card}
          onPress={() => router.push(`/history/${item.id}`)}
          onLongPress={onShare}
        >
          <View className="flex-row">
            {/* Bild links */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.cachedImageUri || item.imageUri }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            {/* Infos rechts */}
            <View className="flex-1 py-3 pr-3.5 pl-3 justify-between">
              {/* Oberer Bereich: Name + Preis */}
              <View className="flex-row justify-between items-start gap-2">
                <View className="flex-1 shrink">
                  <Text className="text-foreground font-semibold text-[15px] leading-[20px]" numberOfLines={2}>
                    {item.productName}
                  </Text>
                  {item.brand && (
                    <Text className="text-foreground-secondary text-[12px] mt-0.5">
                      {item.brand}
                    </Text>
                  )}
                </View>
                <PriceSection item={item} />
              </View>

              {/* Unterer Bereich: Badges + Tags */}
              <View className="flex-row flex-wrap gap-1.5 mt-2.5">
                <ProductTypeBadge item={item} />
                {item.category ? <TagPill label={item.category} accent /> : null}
                {item.condition ? <TagPill label={item.condition} /> : null}
              </View>
            </View>
          </View>
        </Pressable>
      </SwipeableLibraryItem>
    </StaggeredItem>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
