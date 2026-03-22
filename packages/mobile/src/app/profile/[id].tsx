import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../features/auth/store/authStore';
import { usePublicProfile } from '../../features/social/hooks/usePublicProfile';
import { ProfileHeader } from '../../features/social/components/ProfileHeader';
import { FollowButton } from '../../features/social/components/FollowButton';
import { Icons } from '../../shared/components/Icons';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import { FadeInView } from '../../shared/components/Animated';
import { useTabBarPadding } from '../../shared/hooks/useTabBarPadding';

/**
 * Öffentliches Profil eines anderen Users
 * Route: /profile/:id
 */
export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();
  const { profile, loading, error } = usePublicProfile(id ?? '');

  const isOwnProfile = profile?.id === user?.id;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Icons.User size={48} color={colors.textSecondary} />
        <Text className="text-foreground text-lg font-semibold mt-4 text-center">
          Profil nicht gefunden
        </Text>
        <Text className="text-foreground-secondary text-sm mt-2 text-center">
          Dieser User existiert nicht oder hat ein privates Profil.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 bg-primary rounded-xl px-6 py-3 active:opacity-80"
        >
          <Text className="text-white font-semibold">Zurück</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Back-Button */}
      <View className="flex-row items-center px-4 py-2">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 active:opacity-60">
          <Icons.ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: tabBarPadding + 16 }}
      >
        {/* Profil-Header */}
        <FadeInView delay={0}>
          <ProfileHeader
            profile={profile}
            onFollowersPress={() => {/* Phase 3: Follower-Liste als Sheet */}}
            onFollowingPress={() => {/* Phase 3: Following-Liste als Sheet */}}
          />
        </FadeInView>

        {/* Follow-Button (nicht für eigenes Profil) */}
        {!isOwnProfile && (
          <FadeInView delay={80}>
            <View className="flex-row gap-3 mb-6">
              <FollowButton
                userId={profile.id}
                isFollowing={profile.isFollowing ?? false}
              />
            </View>
          </FadeInView>
        )}

        {/* Geteilte Bibliothek — Placeholder für Batch 4 */}
        <FadeInView delay={120}>
          <View className="bg-background-card rounded-2xl p-5 border border-border items-center">
            <Icons.BookOpen size={28} color={colors.textSecondary} />
            <Text className="text-foreground-secondary text-sm mt-3 text-center">
              {isOwnProfile
                ? 'Deine geteilten Items erscheinen hier.'
                : `Geteilte Items von ${profile.displayName ?? profile.username ?? 'diesem User'} erscheinen hier.`}
            </Text>
          </View>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}
