import React from 'react';
import { MotiView } from 'moti';

import { ANIMATION_PRESETS } from '../../constants';
import { IndexedAnimatedChildProps } from './shared';

/**
 * Stagger Animation für Listen
 */
export function StaggeredItem({
  children,
  index,
  className = '',
}: IndexedAnimatedChildProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: ANIMATION_PRESETS.staggeredItem.translateX }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: 'timing',
        duration: ANIMATION_PRESETS.staggeredItem.duration,
        delay: index * ANIMATION_PRESETS.staggeredItem.delayStep,
      }}
      className={className}
    >
      {children}
    </MotiView>
  );
}
