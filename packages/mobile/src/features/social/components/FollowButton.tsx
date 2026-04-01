import { Pressable, Text, ActivityIndicator } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useFollow } from '../hooks/useFollow';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  /** Kompakte Variante für Listen */
  compact?: boolean;
  /** Callback nach erfolgreichem Follow/Unfollow */
  onToggled?: () => void;
}

/**
 * Follow/Unfollow-Button mit optimistischem Update.
 * Gefolgt → ausgefüllter Button / Nicht gefolgt → Outline-Button.
 */
export function FollowButton({ userId, isFollowing: initial, compact = false, onToggled }: FollowButtonProps) {
  const { isFollowing, loading, toggle } = useFollow(userId, initial, onToggled);

  const followed = isFollowing;

  if (compact) {
    return (
      <Pressable
        onPress={toggle}
        disabled={loading}
        className={`rounded-lg px-3 py-1.5 border active:opacity-70 items-center justify-center ${
          followed
            ? 'bg-transparent border-border'
            : 'bg-primary border-primary'
        }`}
      >
        {loading ? (
          <ActivityIndicator size="small" color={followed ? '#9ca3af' : '#fff'} />
        ) : followed ? (
          <Icons.Check size={14} color="#9ca3af" />
        ) : (
          <Text className="text-xs font-semibold text-white">
            Folgen
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
