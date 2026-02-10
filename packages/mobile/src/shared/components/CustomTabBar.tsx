/**
 * Custom Floating Tab Bar
 * Premium blur-glass design mit animierten Icons
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Icons } from './Icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useResolvedColorScheme } from '../store/themeStore';

const INACTIVE_COLOR_LIGHT = '#9ca3af';
const INACTIVE_COLOR_DARK = '#6b7280';

interface TabConfig {
  icon: (props: { size: number; color: string }) => React.ReactNode;
  label: string;
}

const TAB_CONFIG: Record<string, TabConfig> = {
  index: { icon: (p) => <Icons.Camera {...p} />, label: 'Scan' },
  library: { icon: (p) => <Icons.BookOpen {...p} />, label: 'Bibliothek' },
  profile: { icon: (p) => <Icons.User {...p} />, label: 'Profil' },
};

function TabItem({
  route,
  isFocused,
  onPress,
  onLongPress,
  activeColor,
  inactiveColor,
}: {
  route: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  activeColor: string;
  inactiveColor: string;
}) {
  const config = TAB_CONFIG[route];
  if (!config) return null;

  const color = isFocused ? activeColor : inactiveColor;

  const animatedDot = useAnimatedStyle(() => ({
    opacity: withSpring(isFocused ? 1 : 0, { damping: 20, stiffness: 300 }),
    transform: [
      { scale: withSpring(isFocused ? 1 : 0.5, { damping: 20, stiffness: 300 }) },
    ],
  }));

  const animatedIcon = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(isFocused ? 1.1 : 1, { damping: 20, stiffness: 300 }) },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={config.label}
    >
      <Animated.View style={animatedIcon}>
        {config.icon({ size: 22, color })}
      </Animated.View>
      <Text
        style={[
          styles.label,
          { color, fontWeight: isFocused ? '600' : '400' },
        ]}
      >
        {config.label}
      </Text>
      <Animated.View style={[styles.dot, { backgroundColor: activeColor }, animatedDot]} />
    </Pressable>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const scheme = useResolvedColorScheme();
  const bottomPadding = Math.max(insets.bottom - 8, 8);
  const inactiveColor = scheme === 'dark' ? INACTIVE_COLOR_DARK : INACTIVE_COLOR_LIGHT;

  return (
    <View
      style={[
        styles.container,
        {
          bottom: bottomPadding,
          shadowColor: colors.primary,
          borderColor: scheme === 'dark'
            ? 'rgba(99, 102, 241, 0.1)'
            : 'rgba(99, 102, 241, 0.15)',
        },
      ]}
    >
      <BlurView intensity={60} tint={scheme} style={styles.blur}>
        <View style={[styles.inner, { backgroundColor: colors.tabBarBackground }]}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <TabItem
                key={route.key}
                route={route.name}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                activeColor={colors.primary}
                inactiveColor={inactiveColor}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
  },
  blur: {
    flex: 1,
  },
  inner: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
