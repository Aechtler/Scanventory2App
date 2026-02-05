import { View, ActivityIndicator, Text } from 'react-native';

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
  return (
    <View className="flex-1 items-center justify-center p-6">
      <ActivityIndicator size={size} color="#6366f1" />
      {message && (
        <Text className="text-gray-400 mt-4 text-center">{message}</Text>
      )}
    </View>
  );
}
