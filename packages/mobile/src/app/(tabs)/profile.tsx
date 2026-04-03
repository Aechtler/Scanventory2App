import { useState, useMemo } from 'react';
import { View, Text, Pressable, Alert, Modal, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useHistoryStore } from '../../features/history/store/historyStore';
import { formatPrice } from '../../features/market/services/ebay';
import { calculateTotalValue } from '../../features/history/services/exportService';
import { FadeInView } from '../../shared/components/Animated';
import { Icons } from '../../shared/components/Icons';
import { ThemeSelector } from '../../shared/components/ThemeSelector';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import { useTabBarPadding } from '../../shared/hooks/useTabBarPadding';
import { ProfileHeader, ProfileForm } from '../../features/social';
import { usePublicProfile } from '../../features/social/hooks/usePublicProfile';
import { useFollowers, useFollowing } from '../../features/social/hooks/useFollowList';
import { UserCard } from '../../features/social/components/UserCard';
import type { PublicProfile } from '../../features/social';
import Constants from 'expo-constants';

type FollowSheet = 'followers' | 'following' | null;

/**
 * Profil Tab — User-Info, Portfolio-Stats, Theme, Logout
 * Phase 1: + öffentliches Profil (Avatar, Bio, @handle, Follower-Stats)
 */
export default function ProfileTab() {
  const { user, logout } = useAuthStore();
  const items = useHistoryStore((state) => state.items);
  const totalValue = useMemo(() => calculateTotalValue(items), [items]);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();

  const [editVisible, setEditVisible] = useState(false);
  const [followSheet, setFollowSheet] = useState<FollowSheet>(null);

  const { profile: fetchedProfile, refetch: refetchProfile } = usePublicProfile(user?.id ?? '');
  const { users: followers, loading: followersLoading } = useFollowers(user?.id ?? '');
  const { users: following, loading: followingLoading, refetch: refetchFollowing } = useFollowing(user?.id ?? '');

  // Aktuelles Profil aus dem User-State zusammenbauen, Counts vom Backend
  const currentProfile: PublicProfile = {
    id: user?.id ?? '',
    username: user?.username ?? null,
    displayName: user?.displayName ?? user?.name ?? null,
    avatarUrl: user?.avatarUrl ?? null,
    bio: user?.bio ?? null,
    isPublic: user?.isPublic ?? true,
    followerCount: fetchedProfile?.followerCount ?? 0,
    followingCount: fetchedProfile?.followingCount ?? 0,
  };

  const handleLogout = () => {
    Alert.alert('Abmelden', 'Möchtest du dich wirklich abmelden?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Abmelden',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header-Buttons: Suche links, Bearbeiten rechts */}
        <FadeInView delay={0}>
          <View className="flex-row justify-between items-center mb-2">
            <Pressable
              onPress={() => router.push('/(tabs)/social')}
              className="p-2 rounded-xl bg-background-card border border-border active:opacity-70"
              accessibilityLabel="Nutzer suchen"
            >
              <Icons.Search size={18} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => setEditVisible(true)}
              className="flex-row items-center gap-1.5 py-1.5 px-3 rounded-xl bg-background-card border border-border active:opacity-70"
            >
              <Icons.Pencil size={14} color={colors.textSecondary} />
              <Text className="text-foreground-secondary text-sm">Bearbeiten</Text>
            </Pressable>
          </View>
        </FadeInView>

        {/* Öffentliches Profil */}
        <FadeInView delay={50}>
          <ProfileHeader
            profile={currentProfile}
            itemCount={items.length}
            onFollowersPress={() => setFollowSheet('followers')}
            onFollowingPress={() => setFollowSheet('following')}
          />
        </FadeInView>

        {/* E-Mail (privat, nur für den eigenen User sichtbar) */}
        <FadeInView delay={80}>
          <View className="bg-background-card rounded-2xl px-4 py-3 border border-border mb-6 flex-row items-center">
            <Icons.Mail size={16} color={colors.textSecondary} />
            <Text className="text-foreground-secondary text-sm ml-2">{user?.email}</Text>
          </View>
        </FadeInView>

        {/* Portfolio Stats */}
        <FadeInView delay={100}>
          <View className="bg-background-card rounded-2xl p-5 border border-border mb-6">
            <Text className="text-foreground-secondary text-sm mb-4">Dein Portfolio</Text>
            <View className="flex-row">
              <View className="flex-1 items-center">
                <Text className="text-foreground text-2xl font-bold">{items.length}</Text>
                <Text className="text-foreground-secondary text-xs mt-1">Gegenstände</Text>
              </View>
              <View className="w-px bg-border" />
              <View className="flex-1 items-center">
                <Text className="text-primary text-2xl font-bold">
                  {formatPrice(totalValue)}
                </Text>
                <Text className="text-foreground-secondary text-xs mt-1">Gesamtwert</Text>
              </View>
            </View>
          </View>
        </FadeInView>

        {/* Theme Selector */}
        <FadeInView delay={150}>
          <View className="bg-background-card rounded-2xl p-5 border border-border mb-6">
            <Text className="text-foreground-secondary text-sm mb-3">Erscheinungsbild</Text>
            <ThemeSelector />
          </View>
        </FadeInView>

        {/* Logout */}
        <FadeInView delay={200}>
          <Pressable
            onPress={handleLogout}
            className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20 flex-row items-center active:bg-red-500/20"
          >
            <Icons.LogOut size={20} color="#ef4444" />
            <Text className="text-red-400 font-semibold ml-3">Abmelden</Text>
          </Pressable>
        </FadeInView>

        {/* App Version */}
        <View className="items-center" style={{ paddingBottom: tabBarPadding + 16, marginTop: 24 }}>
          <Text className="text-foreground-secondary/50 text-xs">Scandirwas v{appVersion}</Text>
        </View>
      </ScrollView>

      {/* Follower / Following Sheet */}
      <Modal
        visible={followSheet !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFollowSheet(null)}
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
            <Text className="text-foreground text-lg font-semibold">
              {followSheet === 'followers' ? 'Follower' : 'Folge ich'}
            </Text>
            <Pressable onPress={() => setFollowSheet(null)} className="p-2 active:opacity-60">
              <Icons.Close size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
          {(() => {
            const isFollowers = followSheet === 'followers';
            const users = isFollowers ? followers : following;
            const loading = isFollowers ? followersLoading : followingLoading;

            if (loading) {
              return (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              );
            }

            if (users.length === 0) {
              return (
                <View className="flex-1 items-center justify-center px-8">
                  <Icons.User size={40} color={colors.textSecondary} />
                  <Text className="text-foreground text-base font-semibold mt-3 text-center">
                    {isFollowers ? 'Noch keine Follower' : 'Du folgst noch niemandem'}
                  </Text>
                </View>
              );
            }

            return (
              <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <UserCard
                    profile={item}
                    ownUserId={user?.id}
                    showFollowButton
                    onFollowToggled={() => { refetchFollowing(); refetchProfile(); }}
                  />
                )}
                showsVerticalScrollIndicator={false}
              />
            );
          })()}
        </SafeAreaView>
      </Modal>

      {/* Profil bearbeiten — Modal */}
      <Modal
        visible={editVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
            <Text className="text-foreground text-lg font-semibold">Profil bearbeiten</Text>
          </View>
          <ProfileForm
            currentProfile={currentProfile}
            currentUsername={user?.username}
            onSaved={() => setEditVisible(false)}
            onCancel={() => setEditVisible(false)}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
