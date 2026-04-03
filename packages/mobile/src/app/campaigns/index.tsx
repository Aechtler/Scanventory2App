import { useEffect } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCampaignStore } from '../../features/campaigns/store/campaignStore';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import { useTabBarPadding } from '../../shared/hooks/useTabBarPadding';
import { Icons } from '../../shared/components/Icons';
import type { Campaign } from '../../features/campaigns/types/campaign.types';

function formatDateRange(startsAt: string | null, endsAt: string | null): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
  if (startsAt && endsAt) return `${fmt(startsAt)} – ${fmt(endsAt)}`;
  if (startsAt) return `ab ${fmt(startsAt)}`;
  if (endsAt) return `bis ${fmt(endsAt)}`;
  return 'Kein Zeitraum';
}

function CampaignCard({ campaign, onDelete }: { campaign: Campaign; onDelete: (id: string) => void }) {
  const colors = useThemeColors();

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
    <View className="bg-background-card rounded-2xl mb-3 border border-border px-5 py-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-foreground font-semibold text-[16px] leading-snug" numberOfLines={2}>
            {campaign.name}
          </Text>
          <Text className="text-foreground-secondary text-[12px] mt-1">
            {formatDateRange(campaign.startsAt, campaign.endsAt)}
          </Text>
        </View>
        <Pressable onPress={handleDelete} hitSlop={8} className="active:opacity-60">
          <Icons.Close size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View className="flex-row items-center gap-1.5 mt-3">
        <View className="flex-row items-center gap-1 bg-primary-500/10 px-2.5 py-1 rounded-full">
          <Icons.Package size={12} color={colors.primary} />
          <Text className="text-primary-400 text-[12px] font-medium">
            {campaign.itemIds.length} {campaign.itemIds.length === 1 ? 'Item' : 'Items'}
          </Text>
        </View>
        <Text className="text-foreground-secondary text-[11px] ml-auto">
          {new Date(campaign.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Text>
      </View>
    </View>
  );
}

export default function CampaignsScreen() {
  const campaigns = useCampaignStore((state) => state.campaigns);
  const deleteCampaign = useCampaignStore((state) => state.deleteCampaign);
  const fetchCampaigns = useCampaignStore((state) => state.fetchCampaigns);
  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-5 pb-1 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-60">
            <Icons.ArrowLeft size={22} color={colors.textPrimary} />
          </Pressable>
          <Text className="text-foreground text-2xl font-bold">Kampagnen</Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-1.5 bg-primary-500/15 px-3 py-1.5 rounded-full active:opacity-60"
        >
          <Icons.Plus size={14} color={colors.primary} />
          <Text className="text-primary-400 text-[13px] font-semibold">Neu</Text>
        </Pressable>
      </View>

      {campaigns.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-background-elevated/60 items-center justify-center mb-4">
            <Icons.Flag size={28} color={colors.textSecondary} />
          </View>
          <Text className="text-foreground text-lg font-semibold text-center mb-2">
            Noch keine Kampagnen
          </Text>
          <Text className="text-foreground-secondary text-sm text-center leading-relaxed">
            Erstelle eine Kampagne, um Items für Events oder Verkaufsaktionen zu gruppieren.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 bg-primary-500 px-6 py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-white font-semibold text-[15px]">Erste Kampagne erstellen</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: tabBarPadding }}
          renderItem={({ item }) => (
            <CampaignCard campaign={item} onDelete={deleteCampaign} />
          )}
        />
      )}
    </SafeAreaView>
  );
}
