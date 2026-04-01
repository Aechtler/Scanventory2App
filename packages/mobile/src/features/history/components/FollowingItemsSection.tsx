import { View, Text, Image, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatPrice } from '@/features/market/services/ebay';
import type { FollowingItem } from '../hooks/useFollowingItems';

interface Props {
  items: FollowingItem[];
  loading: boolean;
}

function FollowingCard({ item }: { item: FollowingItem }) {
  const colors = useThemeColors();
  const ownerName = item.owner.displayName || item.owner.username || 'Unbekannt';
  const price = item.priceStats?.avgPrice ?? item.priceStats?.medianPrice ?? null;

  return (
    <Pressable
      className="bg-background-card border border-border rounded-2xl mr-3 overflow-hidden active:opacity-80"
      style={{ width: 160 }}
    >
      {/* Produktbild */}
      <View className="h-28 bg-background items-center justify-center">
        <Image
          source={{ uri: item.imageUri }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Info */}
      <View className="p-3">
        <Text className="text-foreground text-xs font-semibold" numberOfLines={2}>
          {item.productName}
        </Text>
        <Text className="text-foreground-secondary text-xs mt-0.5" numberOfLines={1}>
          {item.category}
        </Text>
        {price != null && (
          <Text className="text-primary text-xs font-bold mt-1">
            {formatPrice(price)}
          </Text>
        )}

        {/* Owner */}
        <View className="flex-row items-center mt-2 gap-1">
          <Icons.User size={10} color={colors.textSecondary} />
          <Text className="text-foreground-secondary/70 text-[10px]" numberOfLines={1}>
            {ownerName}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function FollowingItemsSection({ items, loading }: Props) {
  const colors = useThemeColors();

  if (!loading && items.length === 0) return null;

  return (
    <View className="mb-4">
      <View className="flex-row items-center px-5 mb-2">
        <Icons.User size={14} color={colors.textSecondary} />
        <Text className="text-foreground-secondary text-xs font-semibold uppercase tracking-wide ml-1.5">
          Von Gefolgte
        </Text>
      </View>

      {loading ? (
        <View className="items-center py-4">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          horizontal
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <FollowingCard item={item} />}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          showsHorizontalScrollIndicator={false}
        />
      )}

      <View className="h-px bg-border mx-5 mt-4" />
    </View>
  );
}
