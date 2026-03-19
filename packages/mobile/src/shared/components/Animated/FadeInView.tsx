import React from 'react';
import { MotiView } from 'moti';

import { ANIMATION_PRESETS } from '../../constants';
import { FadeInViewProps } from './shared';

/**
 * Fade-In Animation beim Mount
 */
export function FadeInView({
  children,
  delay = 0,
  duration = ANIMATION_PRESETS.fadeIn.duration,
  className = '',
  style,
}: FadeInViewProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: ANIMATION_PRESETS.fadeIn.translateY }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration,
        delay,
      }}
      className={className}
      style={style}
    >
      {children}
    </MotiView>
  );
}
