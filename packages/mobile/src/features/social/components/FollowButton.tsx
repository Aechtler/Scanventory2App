import { Pressable, Text, ActivityIndicator } from 'react-native';
import { useFollow } from '../hooks/useFollow';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  /** Kompakte Variante für Listen */
  compact?: boolean;
}

/**
 * Follow/Unfollow-Button mit optimistischem Update.
 * Gefolgt → ausgefüllter Button / Nicht gefolgt → Outline-Button.
 */
export function FollowButton({ userId, isFollowing: initial, compact = false }: FollowButtonProps) {
  const { isFollowing, loading, toggle } = useFollow(userId, initial);

  const followed = isFollowing;

  if (compact) {
    return (
      <Pressable
        onPress={toggle}
        disabled={loading}
        className={`rounded-lg px-3 py-1.5 border active:opacity-70 ${
          followed
            ? 'bg-transparent border-border'
            : 'bg-primary border-primary'
        }`}
      >
        {loading ? (
          <ActivityIndicator size="small" color={followed ? '#9ca3af' : '#fff'} />
        ) : (
          <Text
            className={`text-xs font-semibold ${followed ? 'text-foreground-secondary' : 'text-white'}`}
          >
            {followed ? 'Gefolgt' : 'Folgen'}
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={toggle}
      disabled={loading}
      className={`flex-1 rounded-xl py-2.5 items-center justify-center border active:opacity-70 ${
        followed
          ? 'bg-transparent border-border'
          : 'bg-primary border-primary'
      }`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={followed ? '#9ca3af' : '#fff'} />
      ) : (
        <Text
          className={`font-semibold text-sm ${followed ? 'text-foreground-secondary' : 'text-white'}`}
        >
          {followed ? 'Gefolgt' : 'Folgen'}
        </Text>
      )}
    </Pressable>
  );
}
