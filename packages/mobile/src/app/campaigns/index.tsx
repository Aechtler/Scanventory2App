import { useEffect } from 'react';
import { View, Text, FlatList, Pressable, Alert, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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

/** Zeigt bis zu 4 Item-Thumbnails als Mosaic-Vorschau */
function ItemMosaic({ items }: { items: HistoryItem[] }) {
  const colors = useThemeColors();
  const preview = items.slice(0, 4);
  const rest = items.length - 4;

  if (preview.length === 0) {
    return (
      <View style={styles.mosaicEmpty} className="bg-background-elevated/50 rounded-xl items-center justify-center">
        <Icons.Package size={26} color={colors.textSecondary} />
        <Text className="text-foreground-secondary text-[11px] mt-1.5">Keine Items</Text>
      </View>
    );
  }

  if (preview.length === 1) {
    return (
      <View style={styles.mosaicSingle} className="rounded-xl overflow-hidden">
        <Image
          source={{ uri: preview[0].cachedImageUri || preview[0].imageUri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (preview.length === 2) {
    return (
      <View style={[styles.mosaicContainer, { gap: 2 }]} className="rounded-xl overflow-hidden flex-row">
        {preview.map((item) => (
          <Image
            key={item.id}
            source={{ uri: item.cachedImageUri || item.imageUri }}
            style={{ flex: 1, height: '100%' }}
            resizeMode="cover"
          />
        ))}
      </View>
    );
  }

  if (preview.length === 3) {
    return (
      <View style={styles.mosaicContainer} className="rounded-xl overflow-hidden flex-row">
        <Image
          source={{ uri: preview[0].cachedImageUri || preview[0].imageUri }}
          style={{ flex: 1, height: '100%', marginRight: 2 }}
          resizeMode="cover"
        />
        <View style={{ flex: 1, gap: 2 }}>
          <Image
            source={{ uri: preview[1].cachedImageUri || preview[1].imageUri }}
            style={{ flex: 1 }}
            resizeMode="cover"
          />
          <Image
            source={{ uri: preview[2].cachedImageUri || preview[2].imageUri }}
            style={{ flex: 1 }}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  }

  // 4 items (2x2)
  return (
    <View style={styles.mosaicContainer} className="rounded-xl overflow-hidden">
      <View style={{ flex: 1, gap: 2, marginRight: 2 }}>
        <Image
          source={{ uri: preview[0].cachedImageUri || preview[0].imageUri }}
          style={{ flex: 1 }}
          resizeMode="cover"
        />
        <Image
          source={{ uri: preview[2].cachedImageUri || preview[2].imageUri }}
          style={{ flex: 1 }}
          resizeMode="cover"
        />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Image
          source={{ uri: preview[1].cachedImageUri || preview[1].imageUri }}
          style={{ flex: 1 }}
          resizeMode="cover"
        />
        <View style={{ flex: 1, position: 'relative' }}>
          <Image
            source={{ uri: preview[3].cachedImageUri || preview[3].imageUri }}
            style={{ flex: 1 }}
            resizeMode="cover"
          />
          {rest > 0 && (
            <View style={StyleSheet.absoluteFill} className="bg-black/60 items-center justify-center">
              <Text className="text-white font-bold text-[15px]">+{rest}</Text>
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
  onDelete,
}: {
  campaign: Campaign;
  items: HistoryItem[];
  onDelete: (id: string) => void;
}) {
  const colors = useThemeColors();
  const active = isActive(campaign.startsAt, campaign.endsAt);

  const handleDelete = () => {
    Alert.alert(
      'Kampagne löschen',
      `"${campaign.name}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Löschen', style: 'destructive', onPress: () => onDelete(campaign.id) },
      ]
    );
  };

  return (
    <Pressable
      className="bg-background-card rounded-2xl mb-4 overflow-hidden border border-border active:opacity-80"
      style={styles.card}
    >
      {/* Mosaic-Vorschau oben */}
      <View className="relative">
        <ItemMosaic items={items} />
        {/* Aktiv-Badge */}
        {active && (
          <View className="absolute top-2.5 left-2.5 flex-row items-center gap-1 bg-emerald-500/90 px-2.5 py-1 rounded-full">
            <View className="w-1.5 h-1.5 rounded-full bg-white" />
            <Text className="text-white text-[11px] font-semibold">Aktiv</Text>
          </View>
        )}
        {/* Löschen-Button */}
        <Pressable
          onPress={handleDelete}
          hitSlop={8}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 items-center justify-center active:opacity-60"
        >
          <Icons.Close size={14} color="#fff" />
        </Pressable>
        {/* Gradient overlay unten */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.25)']}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 40 }}
        />
      </View>

      {/* Info-Bereich */}
      <View className="px-4 pt-3 pb-4">
        <Text className="text-foreground font-bold text-[16px] leading-snug" numberOfLines={2}>
          {campaign.name}
        </Text>

        <View className="flex-row items-center gap-2 mt-2.5">
          {/* Datum */}
          <View className="flex-row items-center gap-1 flex-1">
            <Icons.History size={12} color={colors.textSecondary} />
            <Text className="text-foreground-secondary text-[12px]" numberOfLines={1}>
              {formatDateRange(campaign.startsAt, campaign.endsAt)}
            </Text>
          </View>

          {/* Item-Count */}
          <View className="flex-row items-center gap-1 bg-primary-500/10 px-2.5 py-1 rounded-full">
            <Icons.Package size={11} color={colors.primary} />
            <Text className="text-primary-400 text-[12px] font-semibold">
              {campaign.itemIds.length} {campaign.itemIds.length === 1 ? 'Item' : 'Items'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
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
            <CampaignCard
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

const MOSAIC_HEIGHT = 200;

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mosaicContainer: {
    height: MOSAIC_HEIGHT,
    flexDirection: 'row',
  },
  mosaicSingle: {
    height: MOSAIC_HEIGHT,
  },
  mosaicEmpty: {
    height: MOSAIC_HEIGHT,
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
});
