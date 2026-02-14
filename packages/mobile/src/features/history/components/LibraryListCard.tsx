/**
 * LibraryListCard - Kompakte horizontale Card für die List-View
 * Bild links, Infos rechts mit Preis, Tags, Preisspanne, Datum
 */

import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StaggeredItem } from '@/shared/components/Animated';
import { SwipeableLibraryItem } from './SwipeableLibraryItem';
import { HistoryItem } from '@/features/history/store/historyStore';
import { formatPrice } from '@/features/market/services/ebay';

interface LibraryListCardProps {
  item: HistoryItem;
  index: number;
  onDelete: () => void;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
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
  const displayPrice = hasFinal ? item.finalPrice! : item.priceStats?.avgPrice;
  const hasRange = item.priceStats?.minPrice > 0 && item.priceStats?.maxPrice > 0
    && item.priceStats.minPrice !== item.priceStats.maxPrice;

  if (!displayPrice || displayPrice === 0) {
    return (
      <Text className="text-foreground-secondary text-xs italic">Kein Preis</Text>
    );
  }

  return (
    <View className="items-end">
      <View className={`px-2.5 py-1 rounded-lg ${hasFinal ? 'bg-emerald-500/15' : 'bg-primary-500/10'}`}>
        <Text className={`font-bold text-[15px] ${hasFinal ? 'text-emerald-500' : 'text-primary-400'}`}>
          {formatPrice(displayPrice)}
        </Text>
      </View>
      {!hasFinal && hasRange && (
        <Text className="text-foreground-secondary text-[10px] mt-1">
          {formatPrice(item.priceStats.minPrice)}–{formatPrice(item.priceStats.maxPrice)}
        </Text>
      )}
      {hasFinal && item.priceStats?.avgPrice > 0 && (
        <Text className="text-foreground-secondary text-[10px] mt-1">
          Ø {formatPrice(item.priceStats.avgPrice)}
        </Text>
      )}
    </View>
  );
}

export function LibraryListCard({ item, index, onDelete }: LibraryListCardProps) {
  const listingCount = item.priceStats?.totalListings ?? 0;

  return (
    <StaggeredItem index={index}>
      <SwipeableLibraryItem itemName={item.productName} onDelete={onDelete}>
        <Pressable
          className="bg-background-card rounded-2xl mb-3 overflow-hidden border border-border active:opacity-70"
          style={styles.card}
          onPress={() => router.push(`/history/${item.id}`)}
        >
          <View className="flex-row">
            {/* Bild links */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.cachedImageUri || item.imageUri }}
                style={styles.image}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)']}
                style={styles.imageGradient}
              />
              {listingCount > 0 && (
                <View className="absolute bottom-1.5 left-1.5 bg-black/50 px-1.5 py-0.5 rounded">
                  <Text className="text-white/70 text-[9px] font-medium">
                    {listingCount} Angebote
                  </Text>
                </View>
              )}
            </View>

            {/* Infos rechts */}
            <View className="flex-1 py-3 pr-3.5 pl-3 justify-between">
              {/* Oberer Bereich: Name + Preis */}
              <View>
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
              </View>

              {/* Unterer Bereich: Tags + Datum */}
              <View className="flex-row items-center justify-between mt-2.5">
                <View className="flex-row flex-wrap gap-1.5 flex-1">
                  {item.category ? <TagPill label={item.category} accent /> : null}
                  {item.condition ? <TagPill label={item.condition} /> : null}
                </View>
                <Text className="text-foreground-secondary/60 text-[11px] ml-2">
                  {formatDate(item.scannedAt)}
                </Text>
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
    width: 120,
    height: 120,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
});
