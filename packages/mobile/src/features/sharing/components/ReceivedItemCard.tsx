import { View, Text, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ReceivedItem } from '../types/sharing.types';

interface ReceivedItemCardProps {
  item: ReceivedItem;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
}

/**
 * Card-Darstellung eines mit mir geteilten Items (Für-mich Tab).
 */
export function ReceivedItemCard({ item }: ReceivedItemCardProps) {
  const colors = useThemeColors();
  const senderName = item.sharedByDisplayName ?? item.sharedByUsername ?? 'Unbekannt';
  // imageUrl kommt direkt vom Backend als Supabase Storage CDN URL
  const imageUri = item.imageUrl;

  return (
    <Pressable
      className="bg-background-card rounded-2xl mb-3 overflow-hidden border border-border active:opacity-70 flex-row"
      onPress={() => router.push(`/history/${item.itemId}`)}
    >
      {/* Bild */}
      <View className="w-[110px] h-[110px] overflow-hidden">
        <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
      </View>

      {/* Infos */}
      <View className="flex-1 py-3 px-3 justify-between">
        <View>
          <Text className="text-foreground font-semibold text-[14px] leading-[19px]" numberOfLines={2}>
            {item.productName}
          </Text>
          {item.brand ? (
            <Text className="text-foreground-secondary text-[11px] mt-0.5">{item.brand}</Text>
          ) : null}
        </View>

        {/* Sender + Datum */}
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-1.5 flex-1">
            <Icons.User size={12} color={colors.textSecondary} />
            <Text className="text-foreground-secondary text-xs" numberOfLines={1}>
              {senderName}
            </Text>
          </View>
          <Text className="text-foreground-secondary/60 text-[11px] ml-2">
            {formatDate(item.sharedAt)}
          </Text>
        </View>

        {/* Category pill */}
        {item.category ? (
          <View className="mt-1.5 self-start px-2 py-0.5 rounded-full bg-primary/10">
            <Text className="text-primary text-[11px] font-medium">{item.category}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
