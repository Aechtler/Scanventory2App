import { View, ActivityIndicator, Text } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

/**
 * LoadingSpinner - Zeigt Ladeindikator mit optionaler Nachricht
 *
 * @example
 * <LoadingSpinner message="Analysiere Bild..." />
 */
export function LoadingSpinner({
  message,
  size = 'large',
}: LoadingSpinnerProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-1 items-center justify-center p-6">
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text className="text-foreground-secondary mt-4 text-center">{message}</Text>
      )}
    </View>
  );
}
