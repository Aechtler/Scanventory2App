/**
 * Animated Components
 * Premium Micro-Interactions und Animationen
 */

import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import { MotiView, MotiText } from 'moti';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedButtonProps extends PressableProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}

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
      onPressIn={(e) => {
        pressed.value = withSpring(1, { damping: 15, stiffness: 400 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = withSpring(0, { damping: 15, stiffness: 400 });
        onPressOut?.(e);
      }}
      className={className}
    >
      {children}
    </AnimatedPressable>
  );
}

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  style?: ViewStyle;
}

/**
 * Fade-In Animation beim Mount
 */
export function FadeInView({ 
  children, 
  delay = 0, 
  duration = 400,
  className = '',
  style,
}: FadeInViewProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
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

/**
 * Stagger Animation für Listen
 */
export function StaggeredItem({ 
  children, 
  index,
  className = '',
}: { 
  children: React.ReactNode; 
  index: number;
  className?: string;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 200,
        delay: index * 80,
      }}
      className={className}
    >
      {children}
    </MotiView>
  );
}

/**
 * Pulse Animation für wichtige Elemente
 */
export function PulseView({ 
  children,
  className = '',
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MotiView
      from={{ scale: 1 }}
      animate={{ scale: 1.02 }}
      transition={{
        type: 'timing',
        duration: 1500,
        loop: true,
      }}
      className={className}
    >
      {children}
    </MotiView>
  );
}

/**
 * Bounce-In Animation
 */
export function BounceInView({ 
  children,
  delay = 0,
  className = '',
}: { 
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <MotiView
      from={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        damping: 12,
        stiffness: 200,
        delay,
      }}
      className={className}
    >
      {children}
    </MotiView>
  );
}

/**
 * Slide-Up Animation für Modals/Sheets
 */
export function SlideUpView({ 
  children,
  className = '',
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MotiView
      from={{ translateY: 100, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      exit={{ translateY: 100, opacity: 0 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
      className={className}
    >
      {children}
    </MotiView>
  );
}

/**
 * Animierter Counter für Zahlen
 */
export function AnimatedNumber({ 
  value,
  prefix = '',
  suffix = '',
  className = '',
}: { 
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <MotiText
      animate={{ opacity: 1 }}
      transition={{ type: 'timing', duration: 300 }}
      className={className}
    >
      {prefix}{value.toLocaleString('de-DE')}{suffix}
    </MotiText>
  );
}
