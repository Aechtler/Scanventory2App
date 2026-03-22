import { View, Text, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { FollowButton } from './FollowButton';
import type { PublicProfile } from '../types/profile.types';

interface UserCardProps {
  profile: PublicProfile;
  /** Eigener User-ID — kein Follow-Button für sich selbst */
  ownUserId?: string;
  showFollowButton?: boolean;
}

/**
 * Kompakte User-Karte für Listen (Suche, Follower, Following).
 * Tippen navigiert zum öffentlichen Profil.
 */
export function UserCard({ profile, ownUserId, showFollowButton = true }: UserCardProps) {
  const colors = useThemeColors();
  const isOwnProfile = profile.id === ownUserId;

  const displayName = profile.displayName || profile.username || 'Benutzer';
  const handle = profile.username ? `@${profile.username}` : null;

  return (
    <Pressable
      onPress={() => router.push(`/profile/${profile.id}`)}
      className="flex-row items-center py-3 px-4 active:bg-background-card/50"
    >
      {/* Avatar */}
      <View className="w-11 h-11 rounded-full bg-primary/20 border border-primary/20 items-center justify-center overflow-hidden mr-3">
        {profile.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} className="w-11 h-11" resizeMode="cover" />
        ) : (
          <Icons.User size={20} color={colors.primary} />
        )}
      </View>

      {/* Name + Handle */}
      <View className="flex-1 mr-3">
        <Text className="text-foreground font-semibold text-sm" numberOfLines={1}>
          {displayName}
        </Text>
        {handle && (
          <Text className="text-foreground-secondary text-xs mt-0.5" numberOfLines={1}>
            {handle}
          </Text>
        )}
        {profile.bio ? (
          <Text className="text-foreground-secondary/70 text-xs mt-0.5" numberOfLines={1}>
            {profile.bio}
          </Text>
        ) : null}
      </View>

      {/* Follow-Button (nicht für eigenes Profil) */}
      {showFollowButton && !isOwnProfile && (
        <FollowButton
          userId={profile.id}
          isFollowing={profile.isFollowing ?? false}
          compact
        />
      )}
    </Pressable>
  );
}
