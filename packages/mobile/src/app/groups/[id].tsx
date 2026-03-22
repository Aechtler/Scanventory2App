import { useState } from 'react';
import {
  View, Text, Pressable, Alert, ScrollView,
  ActivityIndicator, Share, FlatList,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useGroup } from '../../features/groups/hooks/useGroup';
import { MemberListItem } from '../../features/groups/components/MemberListItem';
import { groupService } from '../../features/groups/services/groupService';
import { Icons } from '../../shared/components/Icons';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import { FadeInView } from '../../shared/components/Animated';
import { useTabBarPadding } from '../../shared/hooks/useTabBarPadding';
import { API_CONFIG } from '../../shared/constants';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();
  const { group, members, loading, error, refetch } = useGroup(id ?? '');
  const [leaving, setLeaving] = useState(false);

  const myRole = group?.myRole;
  const isMember = !!myRole;
  const canManage = myRole === 'OWNER' || myRole === 'ADMIN';

  function shareInviteLink() {
    if (!group) return;
    const link = `${API_CONFIG.BASE_URL}/invite/${group.inviteCode}`;
    Share.share({ message: `Tritt meiner Gruppe "${group.name}" bei: ${link}` });
  }

  async function handleLeave() {
    if (!group) return;
    Alert.alert('Gruppe verlassen', `Möchtest du "${group.name}" wirklich verlassen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Verlassen',
        style: 'destructive',
        onPress: async () => {
          setLeaving(true);
          try {
            await groupService.leave(group.id);
            router.back();
          } catch (e) {
            Alert.alert('Fehler', e instanceof Error ? e.message : 'Verlassen fehlgeschlagen');
          } finally {
            setLeaving(false);
          }
        },
      },
    ]);
  }

  async function handleRemoveMember(userId: string) {
    if (!group) return;
    Alert.alert('Mitglied entfernen', 'Möchtest du dieses Mitglied entfernen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Entfernen',
        style: 'destructive',
        onPress: async () => {
          try {
            await groupService.removeMember(group.id, userId);
            refetch();
          } catch (e) {
            Alert.alert('Fehler', e instanceof Error ? e.message : 'Entfernen fehlgeschlagen');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !group) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Icons.Warning size={48} color={colors.textSecondary} />
        <Text className="text-foreground text-lg font-semibold mt-4 text-center">Gruppe nicht gefunden</Text>
        <Pressable onPress={() => router.back()} className="mt-6 bg-primary rounded-xl px-6 py-3">
          <Text className="text-white font-semibold">Zurück</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-2">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 active:opacity-60">
          <Icons.ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text className="text-foreground font-bold text-lg ml-2 flex-1" numberOfLines={1}>
          {group.name}
        </Text>
        {isMember && (
          <Pressable onPress={shareInviteLink} className="p-2 active:opacity-60">
            <Icons.Share size={20} color={colors.primary} />
          </Pressable>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarPadding + 16 }}
      >
        {/* Gruppen-Info */}
        <FadeInView delay={0}>
          <View className="px-4 pb-4">
            {group.description ? (
              <Text className="text-foreground-secondary text-sm leading-5 mb-3">
                {group.description}
              </Text>
            ) : null}

            <View className="flex-row gap-2 flex-wrap">
              <View className="bg-background-card border border-border rounded-xl px-3 py-1.5 flex-row items-center gap-1.5">
                <Icons.User size={14} color={colors.textSecondary} />
                <Text className="text-foreground-secondary text-xs">
                  {group.memberCount} {group.memberCount === 1 ? 'Mitglied' : 'Mitglieder'}
                </Text>
              </View>
              {group.isPublic && (
                <View className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5">
                  <Text className="text-primary text-xs">Öffentlich</Text>
                </View>
              )}
              {myRole && (
                <View className="bg-background-card border border-border rounded-xl px-3 py-1.5">
                  <Text className="text-foreground-secondary text-xs">
                    {myRole === 'OWNER' ? 'Ersteller' : myRole === 'ADMIN' ? 'Admin' : 'Mitglied'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </FadeInView>

        {/* Invite-Link (für Mitglieder) */}
        {isMember && (
          <FadeInView delay={60}>
            <View className="mx-4 mb-4 bg-background-card border border-border rounded-2xl p-4">
              <Text className="text-foreground-secondary text-xs font-semibold mb-2">EINLADEN</Text>
              <View className="flex-row items-center gap-3">
                <View className="flex-1 bg-background border border-border rounded-xl px-3 py-2">
                  <Text className="text-foreground-secondary text-xs font-mono" numberOfLines={1}>
                    Code: {group.inviteCode}
                  </Text>
                </View>
                <Pressable
                  onPress={shareInviteLink}
                  className="bg-primary rounded-xl px-4 py-2 active:opacity-80"
                >
                  <Text className="text-white text-sm font-semibold">Teilen</Text>
                </Pressable>
              </View>
            </View>
          </FadeInView>
        )}

        {/* Geteilte Library — Placeholder für Batch 4 */}
        <FadeInView delay={80}>
          <View className="mx-4 mb-4 bg-background-card border border-border rounded-2xl p-5 items-center">
            <Icons.BookOpen size={28} color={colors.textSecondary} />
            <Text className="text-foreground-secondary text-sm mt-2 text-center">
              Geteilte Items der Gruppe erscheinen hier.
            </Text>
          </View>
        </FadeInView>

        {/* Mitglieder */}
        <FadeInView delay={100}>
          <Text className="text-foreground-secondary text-xs font-semibold px-4 pb-2 uppercase tracking-wide">
            Mitglieder ({members.length})
          </Text>
          {members.map((m) => (
            <MemberListItem
              key={m.userId}
              member={m}
              canRemove={canManage && m.userId !== user?.id}
              onRemove={handleRemoveMember}
            />
          ))}
        </FadeInView>

        {/* Gruppe verlassen (nicht für Owner) */}
        {isMember && myRole !== 'OWNER' && (
          <FadeInView delay={120}>
            <Pressable
              onPress={handleLeave}
              disabled={leaving}
              className="mx-4 mt-4 bg-red-500/10 rounded-2xl p-4 border border-red-500/20 flex-row items-center active:opacity-80"
            >
              {leaving ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <>
                  <Icons.LogOut size={18} color="#ef4444" />
                  <Text className="text-red-400 font-semibold ml-3">Gruppe verlassen</Text>
                </>
              )}
            </Pressable>
          </FadeInView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
