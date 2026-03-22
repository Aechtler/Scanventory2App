import { View, Text, Image } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { PublicProfile } from '../types/profile.types';

interface ProfileHeaderProps {
  profile: PublicProfile;
  /** Zeigt Follower/Following-Zahlen als tippbare Elemente */
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
}

/**
 * Zeigt Avatar, Display-Name, @username, Bio und Follower/Following-Stats.
 * Wird sowohl auf dem eigenen als auch auf fremden Profil verwendet.
 */
export function ProfileHeader({ profile, onFollowersPress, onFollowingPress }: ProfileHeaderProps) {
  const colors = useThemeColors();

  const displayName = profile.displayName || profile.username || 'Benutzer';
  const handle = profile.username ? `@${profile.username}` : null;

  return (
    <View className="items-center pb-6">
      {/* Avatar */}
      <View className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/40 items-center justify-center overflow-hidden mb-4">
        {profile.avatarUrl ? (
          <Image
            source={{ uri: profile.avatarUrl }}
            className="w-24 h-24"
            resizeMode="cover"
          />
        ) : (
          <Icons.User size={40} color={colors.primary} />
        )}
      </View>

      {/* Name & Handle */}
      <Text className="text-foreground text-2xl font-bold">{displayName}</Text>
      {handle && (
        <Text className="text-foreground-secondary text-sm mt-0.5">{handle}</Text>
      )}

      {/* Bio */}
      {profile.bio ? (
        <Text className="text-foreground-secondary text-sm mt-3 text-center px-6 leading-5">
          {profile.bio}
        </Text>
      ) : null}

      {/* Follower / Following Stats */}
      <View className="flex-row mt-5 gap-8">
        <View
          className="items-center active:opacity-70"
          onStartShouldSetResponder={() => !!onFollowersPress}
          onResponderRelease={onFollowersPress}
        >
          <Text className="text-foreground text-xl font-bold">{profile.followerCount}</Text>
          <Text className="text-foreground-secondary text-xs mt-0.5">Follower</Text>
        </View>
        <View className="w-px bg-border" />
        <View
          className="items-center active:opacity-70"
          onStartShouldSetResponder={() => !!onFollowingPress}
          onResponderRelease={onFollowingPress}
        >
          <Text className="text-foreground text-xl font-bold">{profile.followingCount}</Text>
          <Text className="text-foreground-secondary text-xs mt-0.5">Folge ich</Text>
        </View>
      </View>
    </View>
  );
}
