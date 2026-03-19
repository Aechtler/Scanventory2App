import React from 'react';
import { MotiText } from 'moti';

import { ANIMATION_PRESETS } from '../../constants';
import { AnimatedNumberProps } from './shared';

/**
 * Animierter Counter für Zahlen
 */
export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedNumberProps) {
  return (
    <MotiText
      animate={{ opacity: 1 }}
      transition={{ type: 'timing', duration: ANIMATION_PRESETS.animatedNumber.duration }}
      className={className}
    >
      {prefix}{value.toLocaleString('de-DE')}{suffix}
    </MotiText>
  );
}
