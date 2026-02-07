/**
 * AnalysisErrorState Component
 * 
 * Error state with retry button
 */

import { View, Text } from 'react-native';
import { BounceInView, AnimatedButton } from '@/shared/components/Animated';
import { Icons } from '@/shared/components/Icons';

interface AnalysisErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function AnalysisErrorState({ error, onRetry }: AnalysisErrorStateProps) {
  return (
    <BounceInView>
      <View className="bg-red-900/30 border border-red-500 rounded-xl p-6">
        <View className="flex-row items-center mb-2">
          <Icons.Warning size={24} color="#f87171" />
          <Text className="text-red-400 text-lg font-semibold ml-2">
            Fehler bei der Analyse
          </Text>
        </View>
        <Text className="text-red-300">{error}</Text>
        <AnimatedButton
          onPress={onRetry}
          className="mt-4 bg-red-500 rounded-lg p-3"
        >
          <Text className="text-white text-center font-semibold">
            Erneut versuchen
          </Text>
        </AnimatedButton>
      </View>
    </BounceInView>
  );
}
