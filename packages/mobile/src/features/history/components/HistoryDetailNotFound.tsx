import { Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/shared/components/Animated';

export function HistoryDetailNotFound() {
  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center">
      <Text className="text-foreground text-lg">Item nicht gefunden</Text>
      <AnimatedButton onPress={() => router.back()} className="mt-4 bg-primary-500 px-6 py-3 rounded-xl">
        <Text className="text-foreground font-semibold">Zurück</Text>
      </AnimatedButton>
    </SafeAreaView>
  );
}
