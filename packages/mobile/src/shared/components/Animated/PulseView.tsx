import React from 'react';
import { MotiView } from 'moti';

import { ANIMATION_PRESETS } from '../../constants';
import { AnimatedChildProps } from './shared';

/**
 * Pulse Animation für wichtige Elemente
 */
export function PulseView({ children, className = '' }: AnimatedChildProps) {
  return (
    <MotiView
      from={{ scale: 1 }}
      animate={{ scale: ANIMATION_PRESETS.pulse.scale }}
      transition={{
        type: 'timing',
        duration: ANIMATION_PRESETS.pulse.duration,
        loop: true,
      }}
      className={className}
    >
      {children}
    </MotiView>
  );
}
