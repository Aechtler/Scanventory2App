/**
 * AnalysisImageHeader Component
 * 
 * Animated image display for analysis screen
 */

import { Image } from 'react-native';
import { MotiView } from 'moti';
import { FadeInView } from '@/shared/components/Animated';
import { ImageSkeleton } from '@/shared/components/Skeleton';

interface AnalysisImageHeaderProps {
  imageUri: string | null;
}

export function AnalysisImageHeader({ imageUri }: AnalysisImageHeaderProps) {
  return (
    <FadeInView delay={0}>
      {imageUri ? (
        <MotiView
          from={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="rounded-2xl overflow-hidden mb-6 shadow-lg"
        >
          <Image
            source={{ uri: decodeURIComponent(imageUri) }}
            style={{ width: '100%', aspectRatio: 4 / 3 }}
            resizeMode="cover"
          />
        </MotiView>
      ) : (
        <ImageSkeleton />
      )}
    </FadeInView>
  );
}
