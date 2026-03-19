import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AnimatedButtonProps extends PressableProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}

export interface AnimatedChildProps {
  children: React.ReactNode;
  className?: string;
}

export interface FadeInViewProps extends AnimatedChildProps {
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export interface IndexedAnimatedChildProps extends AnimatedChildProps {
  index: number;
}

export interface DelayedAnimatedChildProps extends AnimatedChildProps {
  delay?: number;
}

export interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}
