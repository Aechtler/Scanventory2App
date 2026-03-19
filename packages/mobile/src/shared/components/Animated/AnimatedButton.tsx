import React from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import { ANIMATION_PRESETS } from '../../constants';
import { AnimatedButtonProps, AnimatedPressable } from './shared';

/**
 * Button mit Scale-Animation beim Drücken
 */
export function AnimatedButton({
  children,
  className = '',
  scale = 0.97,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedButtonProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pressed.value, [0, 1], [1, scale], Extrapolate.CLAMP) },
    ],
  }));

  return (
    <AnimatedPressable
      {...props}
      style={animatedStyle}
      onPressIn={(event) => {
        pressed.value = withSpring(1, ANIMATION_PRESETS.spring);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = withSpring(0, ANIMATION_PRESETS.spring);
        onPressOut?.(event);
      }}
      className={className}
    >
      {children}
    </AnimatedPressable>
  );
}
