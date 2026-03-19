import React from 'react';
import { MotiView } from 'moti';

import { ANIMATION_PRESETS } from '../../constants';
import { AnimatedChildProps } from './shared';

/**
 * Slide-Up Animation für Modals/Sheets
 */
export function SlideUpView({ children, className = '' }: AnimatedChildProps) {
  return (
    <MotiView
      from={{ translateY: ANIMATION_PRESETS.slideUp.translateY, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      exit={{ translateY: ANIMATION_PRESETS.slideUp.translateY, opacity: 0 }}
      transition={{
        type: 'spring',
        damping: ANIMATION_PRESETS.slideUp.damping,
        stiffness: ANIMATION_PRESETS.slideUp.stiffness,
      }}
      className={className}
    >
      {children}
    </MotiView>
  );
}
