import { useEffect, useRef } from 'react';
import { View, Text, FlatList, Pressable, Alert, Image, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCampaignStore } from '../../features/campaigns/store/campaignStore';
import { useHistoryStore } from '../../features/history/store/historyStore';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import { useTabBarPadding } from '../../shared/hooks/useTabBarPadding';
import { Icons } from '../../shared/components/Icons';
import type { Campaign } from '../../features/campaigns/types/campaign.types';
import type { HistoryItem } from '../../features/history/store/types';

function formatDateRange(startsAt: string | null, endsAt: string | null): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
  if (startsAt && endsAt) return `${fmt(startsAt)} – ${fmt(endsAt)}`;
  if (startsAt) return `ab ${fmt(startsAt)}`;
  if (endsAt) return `bis ${fmt(endsAt)}`;
  return 'Zeitraum offen';
}

function isActive(startsAt: string | null, endsAt: string | null): boolean {
  const now = Date.now();
  const start = startsAt ? new Date(startsAt).getTime() : -Infinity;
  const end = endsAt ? new Date(endsAt).getTime() : Infinity;
  return now >= start && now <= end;
}

/** 2x2 Thumbnail-Mosaic als kompaktes quadratisches Vorschaubild */
function ItemThumbnail({ items }: { items: HistoryItem[] }) {
  const colors = useThemeColors();
  const preview = items.slice(0, 4);

  if (preview.length === 0) {
    return (
      <View style={styles.thumbnail} className="bg-background-elevated rounded-xl items-center justify-center">
        <Icons.Package size={22} color={colors.textSecondary} />
      </View>
    );
  }

  if (preview.length === 1) {
    return (
      <View style={styles.thumbnail} className="rounded-xl overflow-hidden">
        <Image source={{ uri: preview[0].cachedImageUri || preview[0].imageUri }} style={{ flex: 1 }} resizeMode="cover" />
      </View>
    );
  }

  if (preview.length === 2) {
    return (
      <View style={[styles.thumbnail, { gap: 2, flexDirection: 'row' }]} className="rounded-xl overflow-hidden">
        {preview.map((item) => (
          <Image key={item.id} source={{ uri: item.cachedImageUri || item.imageUri }} style={{ flex: 1, height: '100%' }} resizeMode="cover" />
        ))}
      </View>
    );
  }

  if (preview.length === 3) {
    return (
      <View style={[styles.thumbnail, { flexDirection: 'row', gap: 2 }]} className="rounded-xl overflow-hidden">
        <Image source={{ uri: preview[0].cachedImageUri || preview[0].imageUri }} style={{ flex: 1, height: '100%' }} resizeMode="cover" />
        <View style={{ flex: 1, gap: 2 }}>
          <Image source={{ uri: preview[1].cachedImageUri || preview[1].imageUri }} style={{ flex: 1 }} resizeMode="cover" />
          <Image source={{ uri: preview[2].cachedImageUri || preview[2].imageUri }} style={{ flex: 1 }} resizeMode="cover" />
        </View>
      </View>
    );
  }

  const rest = items.length - 4;
  return (
    <View style={[styles.thumbnail, { gap: 2 }]} className="rounded-xl overflow-hidden">
      <View style={{ flex: 1, flexDirection: 'row', gap: 2 }}>
        <Image source={{ uri: preview[0].cachedImageUri || preview[0].imageUri }} style={{ flex: 1 }} resizeMode="cover" />
        <Image source={{ uri: preview[1].cachedImageUri || preview[1].imageUri }} style={{ flex: 1 }} resizeMode="cover" />
      </View>
      <View style={{ flex: 1, flexDirection: 'row', gap: 2 }}>
        <Image source={{ uri: preview[2].cachedImageUri || preview[2].imageUri }} style={{ flex: 1 }} resizeMode="cover" />
        <View style={{ flex: 1, position: 'relative' }}>
          <Image source={{ uri: preview[3].cachedImageUri || preview[3].imageUri }} style={{ flex: 1 }} resizeMode="cover" />
          {rest > 0 && (
            <View style={StyleSheet.absoluteFill} className="bg-black/55 items-center justify-center">
              <Text className="text-white font-bold text-[12px]">+{rest}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function CampaignCard({
  campaign,
  items,
}: {
  campaign: Campaign;
  items: HistoryItem[];
}) {
  const colors = useThemeColors();
  const active = isActive(campaign.startsAt, campaign.endsAt);

  return (
    <Pressable
      onPress={() => router.push(`/campaigns/${campaign.id}`)}
      className="bg-background-card rounded-2xl mb-3 border border-border active:opacity-80"
      style={styles.card}
    >
      <View className="flex-row items-center p-3 gap-3">
        {/* Thumbnail */}
        <ItemThumbnail items={items} />

        {/* Info */}
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-foreground font-semibold text-[15px] flex-1" numberOfLines={1}>
              {campaign.name}
            </Text>
            {active && (
              <View className="flex-row items-center gap-1 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <Text className="text-emerald-500 text-[11px] font-semibold">Aktiv</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center gap-1">
            <Icons.History size={11} color={colors.textSecondary} />
            <Text className="text-foreground-secondary text-[12px]" numberOfLines={1}>
              {formatDateRange(campaign.startsAt, campaign.endsAt)}
            </Text>
          </View>

          <View className="flex-row items-center gap-1 mt-0.5">
            <Icons.Package size={11} color={colors.primary} />
            <Text className="text-primary-400 text-[12px] font-medium">
              {campaign.itemIds.length} {campaign.itemIds.length === 1 ? 'Item' : 'Items'}
            </Text>
          </View>
        </View>

        <Icons.ChevronRight size={16} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

function renderRightActions(
  _progress: Animated.AnimatedInterpolation<number>,
  dragX: Animated.AnimatedInterpolation<number>,
) {
  const scale = dragX.interpolate({ inputRange: [-100, 0], outputRange: [1, 0.5], extrapolate: 'clamp' });
  const opacity = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  return (
    <View style={styles.swipeAction}>
      <Animated.View style={[styles.swipeDeleteButton, { transform: [{ scale }], opacity }]}>
        <Icons.Close size={26} color="#ef4444" />
      </Animated.View>
    </View>
  );
}

function SwipeableCampaignCard({
  campaign,
  items,
  onDelete,
}: {
  campaign: Campaign;
  items: HistoryItem[];
  onDelete: (id: string) => void;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleSwipeOpen = () => {
    Alert.alert(
      'Kampagne löschen',
      `"${campaign.name}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel', onPress: () => swipeableRef.current?.close() },
        { text: 'Löschen', style: 'destructive', onPress: () => onDelete(campaign.id) },
      ],
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeOpen}
      overshootRight={false}
      rightThreshold={70}
    >
      <CampaignCard campaign={campaign} items={items} />
    </Swipeable>
  );
}

export default function CampaignsScreen() {
  const campaigns = useCampaignStore((state) => state.campaigns);
  const deleteCampaign = useCampaignStore((state) => state.deleteCampaign);
  const fetchCampaigns = useCampaignStore((state) => state.fetchCampaigns);
  const historyItems = useHistoryStore((state) => state.items);
  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const getItemsForCampaign = (campaign: Campaign): HistoryItem[] =>
    campaign.itemIds
      .map((id) => historyItems.find((item) => item.id === id))
      .filter((item): item is HistoryItem => item !== undefined);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-5 pb-1 flex-row items-center justify-between">
        <Text className="text-foreground text-2xl font-bold">Kampagnen</Text>
        <Pressable
          onPress={() => {}}
          hitSlop={8}
          className="flex-row items-center gap-1.5 bg-primary-500 px-3.5 py-2 rounded-full active:opacity-75"
          style={styles.newButton}
        >
          <Icons.Plus size={14} color="#fff" />
          <Text className="text-white text-[13px] font-semibold">Neu</Text>
        </Pressable>
      </View>

      {campaigns.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-3xl bg-primary-500/10 items-center justify-center mb-5" style={styles.emptyIcon}>
            <Icons.Flag size={32} color={colors.primary} />
          </View>
          <Text className="text-foreground text-xl font-bold text-center mb-2">
            Noch keine Kampagnen
          </Text>
          <Text className="text-foreground-secondary text-sm text-center leading-relaxed">
            Gruppiere Items für Events, Verkaufsaktionen oder Themen-Sets – und behalte den Überblick.
          </Text>
          <Pressable
            onPress={() => {}}
            className="mt-7 bg-primary-500 px-7 py-3.5 rounded-2xl active:opacity-80 flex-row items-center gap-2"
            style={styles.emptyButton}
          >
            <Icons.Plus size={16} color="#fff" />
            <Text className="text-white font-bold text-[15px]">Erste Kampagne erstellen</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: tabBarPadding,
          }}
          renderItem={({ item }) => (
            <SwipeableCampaignCard
              campaign={item}
              items={getItemsForCampaign(item)}
              onDelete={deleteCampaign}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: 72,
    height: 72,
  },
  newButton: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyIcon: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  emptyButton: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    width: 88,
    marginBottom: 16,
  },
  swipeDeleteButton: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
});
