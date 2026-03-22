import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useUsernameCheck } from '../hooks/useUsernameCheck';

interface UsernameInputProps {
  value: string;
  onChangeText: (text: string) => void;
  currentUsername?: string | null;
}

/**
 * Username-Eingabefeld mit Live-Verfügbarkeitscheck.
 * Zeigt ✓ (verfügbar) / ✗ (vergeben) / Spinner (prüft).
 */
export function UsernameInput({ value, onChangeText, currentUsername }: UsernameInputProps) {
  const colors = useThemeColors();
  const { state, reason } = useUsernameCheck(value, currentUsername);

  const statusColor =
    state === 'available'
      ? '#22c55e'
      : state === 'taken' || state === 'invalid'
        ? '#ef4444'
        : colors.textSecondary;

  const statusLabel =
    state === 'available'
      ? '✓ Verfügbar'
      : state === 'taken'
        ? `✗ ${reason ?? 'Vergeben'}`
        : state === 'invalid'
          ? `✗ ${reason}`
          : '';

  return (
    <View className="mb-4">
      <Text className="text-foreground-secondary text-xs mb-1 font-medium">USERNAME</Text>
      <View className="flex-row items-center bg-background-card border border-border rounded-xl px-4 py-3">
        <Text className="text-foreground-secondary text-base">@</Text>
        <TextInput
          value={value}
          onChangeText={(t) => onChangeText(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          placeholder="dein_username"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 text-foreground text-base ml-1"
          maxLength={30}
        />
        {state === 'checking' && (
          <ActivityIndicator size="small" color={colors.primary} />
        )}
      </View>
      {statusLabel ? (
        <Text className="text-xs mt-1 ml-1" style={{ color: statusColor }}>
          {statusLabel}
        </Text>
      ) : null}
    </View>
  );
}
