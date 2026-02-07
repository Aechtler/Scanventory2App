/**
 * AnalyzingState Component
 * 
 * Loading state shown while image is being analyzed
 */

import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { FadeInView } from '@/shared/components/Animated';
import { AnalysisResultSkeleton } from '@/shared/components/Skeleton';
import { Icons } from '@/shared/components/Icons';

export function AnalyzingState() {
  return (
    <FadeInView delay={100}>
      <View className="bg-background-card rounded-xl p-6 items-center mb-4">
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 200 }}
        >
          <Icons.Search size={48} color="#a78bfa" />
        </MotiView>
        <Text className="text-white mt-4 text-lg font-semibold">
          Analysiere Bild...
        </Text>
        <Text className="text-gray-400 mt-2 text-center">
          KI erkennt den Gegenstand
        </Text>
        
        {/* Loading Bar */}
        <View className="w-full h-1 bg-gray-700 rounded-full mt-4 overflow-hidden">
          <MotiView
            from={{ translateX: -200 }}
            animate={{ translateX: 200 }}
            transition={{ type: 'timing', duration: 1000, loop: true }}
            className="w-20 h-full bg-primary-500 rounded-full"
          />
        </View>
      </View>
      <AnalysisResultSkeleton />
    </FadeInView>
  );
}
