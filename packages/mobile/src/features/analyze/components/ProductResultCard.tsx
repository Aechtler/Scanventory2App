/**
 * ProductResultCard Component
 * 
 * Displays the recognized product with name, confidence, tags, and description
 */

import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { FadeInView, StaggeredItem } from '@/shared/components/Animated';
import { Icons } from '@/shared/components/Icons';
import { VisionMatch } from '@/features/scan/services/visionService';
import { useThemeColors } from '@/shared/hooks';

interface ProductResultCardProps {
  match: VisionMatch;
}

export function ProductResultCard({ match }: ProductResultCardProps) {
  const colors = useThemeColors();
  return (
    <FadeInView delay={50}>
      <View className="bg-background-card rounded-xl p-4 mb-4 border border-border">
        <View className="flex-row justify-between items-start mb-3">
          <Text className="text-foreground text-xl font-bold flex-1">
            {match.productName}
          </Text>
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 150, damping: 20, stiffness: 300 }}
            className="bg-primary-500/20 px-3 py-1 rounded-lg"
          >
            <Text className="text-primary-400 font-bold">
              {Math.round(match.confidence * 100)}%
            </Text>
          </MotiView>
        </View>

        {match.gtin && (
          <View className="flex-row items-center mb-3 bg-background-elevated/40 self-start px-2 py-1 rounded border border-border">
            <Icons.Tag size={12} color={colors.textSecondary} />
            <Text className="text-foreground-secondary text-xs ml-1 font-mono">
              ID: {match.gtin}
            </Text>
          </View>
        )}
        
        <View className="flex-row flex-wrap gap-2 mb-3">
          {[match.category, match.brand, match.condition]
            .filter(Boolean)
            .map((tag, i) => (
              <StaggeredItem key={i} index={i}>
                <View className="bg-background-elevated/50 px-3 py-1.5 rounded-full border border-border">
                  <Text className="text-foreground text-sm">{tag}</Text>
                </View>
              </StaggeredItem>
            ))}
        </View>

        <Text className="text-foreground-secondary leading-5">
          {match.description}
        </Text>
      </View>
    </FadeInView>
  );
}
