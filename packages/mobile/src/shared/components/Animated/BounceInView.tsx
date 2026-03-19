import React from 'react';
import { MotiView } from 'moti';

import { ANIMATION_PRESETS } from '../../constants';
import { DelayedAnimatedChildProps } from './shared';

/**
 * Bounce-In Animation
 */
export function BounceInView({
  children,
  delay = 0,
  className = '',
}: DelayedAnimatedChildProps) {
  return (
    <MotiView
      from={{ scale: ANIMATION_PRESETS.bounceIn.initialScale, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        damping: ANIMATION_PRESETS.bounceIn.damping,
        stiffness: ANIMATION_PRESETS.bounceIn.stiffness,
        delay,
      }}
      className={className}
    >
      {children}
    </MotiView>
  );
}
