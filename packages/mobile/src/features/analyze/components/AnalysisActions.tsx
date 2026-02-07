/**
 * AnalysisActions Component
 * 
 * Save and retry action buttons for completed analysis
 */

import { View, Text } from 'react-native';
import { FadeInView, AnimatedButton } from '@/shared/components/Animated';
import { Icons } from '@/shared/components/Icons';

interface AnalysisActionsProps {
  onSave: () => void;
  onNewScan: () => void;
}

export function AnalysisActions({ onSave, onNewScan }: AnalysisActionsProps) {
  return (
    <FadeInView delay={250} className="gap-3 mt-6">
      <AnimatedButton
        onPress={onSave}
        className="bg-primary-500 rounded-xl p-4"
      >
        <View className="flex-row items-center justify-center">
          <Icons.Check size={20} color="#ffffff" />
          <Text className="text-white text-center text-lg font-semibold ml-2">
            Im Verlauf speichern
          </Text>
        </View>
      </AnimatedButton>
      
      <AnimatedButton
        onPress={onNewScan}
        className="bg-background-card border border-gray-700 rounded-xl p-4"
      >
        <Text className="text-gray-300 text-center text-lg font-semibold">
          Neuen Scan starten
        </Text>
      </AnimatedButton>
    </FadeInView>
  );
}
