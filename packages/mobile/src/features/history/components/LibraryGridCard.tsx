/**
 * LibraryGridCard - Kompakte Karten-Darstellung für die Grid-View
 * Bild mit Floating-Price-Badge, Produktname, Kategorie-Pill
 */

import { View, Text, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StaggeredItem } from '@/shared/components/Animated';
import { HistoryItem } from '@/features/history/store/historyStore';
import { formatPrice } from '@/features/market/services/ebay';
import { getLibraryDisplayPrice, hasLibraryDisplayPrice } from '@/features/history/utils/historyPricing';
import { classifyProduct } from '@/features/history/utils/productClassification';
import { Icons } from '@/shared/components/Icons';

interface LibraryGridCardProps {
  item: HistoryItem;
  index: number;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
}

export function LibraryGridCard({ item, index }: LibraryGridCardProps) {
  const isLeft = index % 2 === 0;
  const hasFinal = item.finalPrice != null;
  const price = getLibraryDisplayPrice(item);
  const hasPrice = hasLibraryDisplayPrice(item);
  const productType = classifyProduct(item);

  return (
    <StaggeredItem index={index}>
      <Pressable
        className={`flex-1 bg-background-card rounded-2xl mb-3.5 overflow-hidden border border-border active:opacity-70 ${
          isLeft ? 'mr-1.5' : 'ml-1.5'
        }`}
        onPress={() => router.push(`/history/${item.id}`)}
      >
        {/* Bild mit Gradient und Price-Badge */}
        <View className="relative">
          <Image
            source={{ uri: item.cachedImageUri || item.imageUri }}
            className="w-full aspect-square"
            resizeMode="cover"
          />
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

          {/* Produkttyp-Badge unten links */}
          {productType === 'fast_seller' && (
            <View className="absolute bottom-2 left-2 flex-row items-center gap-1 bg-amber-500/80 px-1.5 py-0.5 rounded-md">
              <Icons.TrendingUp size={9} color="#fff" />
              <Text className="text-white text-[9px] font-semibold">Schnell</Text>
            </View>
          )}
          {productType === 'high_value' && (
            <View className="absolute bottom-2 left-2 flex-row items-center gap-1 bg-violet-500/80 px-1.5 py-0.5 rounded-md">
              <Icons.Star size={9} color="#fff" />
              <Text className="text-white text-[9px] font-semibold">High Value</Text>
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
}
